// 參考自 Reka Draggable/Sortable Tree
// https://reka-ui.com/docs/components/tree#draggable-sortable-tree
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'

export interface TreeItem {
  children?: TreeItem[]
  [key: string]: any
}

export type TreeAction<T extends TreeItem>
  = | {
    type: 'instruction'
    instruction: Instruction
    itemId: string
    targetId: string
    item: T
  }
  | {
    type: 'toggle'
    itemId: string
  }
  | {
    type: 'expand'
    itemId: string
  }
  | {
    type: 'collapse'
    itemId: string
  }
  | { type: 'modal-move', itemId: string, targetId: string, index: number }
  | { type: 'remove', itemId: string }

export const tree = {
  remove<T extends TreeItem>(data: T[], id: string, getKey: (item: T) => string): T[] {
    return data
      .filter(item => getKey(item) !== id)
      .map((item) => {
        if (tree.hasChildren(item)) {
          return {
            ...item,
            children: tree.remove(item.children as T[] ?? [], id, getKey),
          }
        }
        return item
      })
  },
  insertBefore<T extends TreeItem>(data: T[], targetId: string, newItem: T, getKey: (item: T) => string): T[] {
    return data.flatMap((item) => {
      if (getKey(item) === targetId)
        return [newItem, item]

      if (tree.hasChildren(item)) {
        return {
          ...item,
          children: tree.insertBefore(item.children as T[] ?? [], targetId, newItem, getKey),
        }
      }
      return item
    })
  },
  insertAfter<T extends TreeItem>(data: T[], targetId: string, newItem: T, getKey: (item: T) => string): T[] {
    return data.flatMap((item) => {
      if (getKey(item) === targetId)
        return [item, newItem]

      if (tree.hasChildren(item)) {
        return {
          ...item,
          children: tree.insertAfter(item.children as T[] ?? [], targetId, newItem, getKey),
        }
      }

      return item
    })
  },
  insertChild<T extends TreeItem>(data: T[], targetId: string, newItem: T, getKey: (item: T) => string): T[] {
    return data.flatMap((item) => {
      if (getKey(item) === targetId) {
        return {
          ...item,
          isOpen: true,
          children: [newItem, ...item.children ?? []],
        }
      }

      if (!tree.hasChildren(item))
        return item

      return {
        ...item,
        children: tree.insertChild(item.children as T[] ?? [], targetId, newItem, getKey),
      }
    })
  },
  find<T extends TreeItem>(data: T[], itemId: string, getKey: (item: T) => string): T | undefined {
    for (const item of data) {
      if (getKey(item) === itemId)
        return item

      if (tree.hasChildren(item)) {
        const result = tree.find(item.children as T[] ?? [], itemId, getKey)
        if (result)
          return result
      }
    }
  },
  getPathToItem<T extends TreeItem>({
    current,
    targetId,
    parentIds = [],
    getKey,
  }: {
    current: T[]
    targetId: string
    parentIds?: string[]
    getKey: (item: T) => string
  }): string[] | undefined {
    for (const item of current) {
      if (getKey(item) === targetId)
        return parentIds

      const nested = tree.getPathToItem({
        current: (item.children as T[] ?? []),
        targetId,
        parentIds: [...parentIds, getKey(item)],
        getKey,
      })
      if (nested)
        return nested
    }
  },
  hasChildren<T extends TreeItem>(item: T): boolean {
    return (item.children ?? []).length > 0
  },
}

export function updateTree<T extends TreeItem>(data: T[], action: TreeAction<T>, getKey: (item: T) => string) {
  if (action.type === 'remove')
    return tree.remove(data, action.itemId, getKey)

  const item = action.type === 'instruction' ? action.item : tree.find(data, action.itemId, getKey)
  if (!item)
    return data

  if (action.type === 'instruction') {
    const instruction = action.instruction

    if (instruction.type === 'reparent') {
      const path = tree.getPathToItem({
        current: data,
        targetId: action.targetId,
        getKey,
      })
      if (!path) {
        console.error(`missing ${path}`)
        return
      }

      const desiredId = path[instruction.desiredLevel]
      let result = tree.remove(data, action.itemId, getKey)
      result = tree.insertAfter(result, desiredId, item, getKey)
      return result
    }

    if (action.itemId === action.targetId)
      return data

    if (instruction.type === 'reorder-above') {
      let result = tree.remove(data, action.itemId, getKey)
      result = tree.insertBefore(result, action.targetId, item, getKey)
      return result
    }

    if (instruction.type === 'reorder-below') {
      let result = tree.remove(data, action.itemId, getKey)
      result = tree.insertAfter(result, action.targetId, item, getKey)
      return result
    }

    if (instruction.type === 'make-child') {
      let result = tree.remove(data, action.itemId, getKey)
      result = tree.insertChild(result, action.targetId, item, getKey)
      return result
    }

    console.warn('TODO: action not implemented', instruction)

    return data
  }

  if (action.type === 'modal-move') {
    let result = tree.remove(data, getKey(item), getKey)

    const siblingItems = getChildItems(result, action.targetId, getKey) ?? []

    if (siblingItems.length === 0) {
      if (action.targetId === '') {
        result = [item]
      }
      else {
        result = tree.insertChild(result, action.targetId, item, getKey)
      }
    }
    else if (action.index === siblingItems.length) {
      const relativeTo = siblingItems[siblingItems.length - 1]
      result = tree.insertAfter(result, getKey(relativeTo), item, getKey)
    }
    else {
      const relativeTo = siblingItems[action.index]
      result = tree.insertBefore(result, getKey(relativeTo), item, getKey)
    }

    return result
  }

  return data
}

function getChildItems<T extends TreeItem>(data: T[], targetId: string, getKey: (item: T) => string) {
  if (targetId === '')
    return data

  const targetItem = tree.find(data, targetId, getKey)
  if (!targetItem) {
    console.error(`missing ${targetItem}`)
    return
  }

  return targetItem.children as T[]
}
