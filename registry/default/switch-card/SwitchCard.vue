<script setup lang="ts">
import { computed } from 'vue'
import Label from '@/components/ui/label/Label.vue'
import Switch from '@/components/ui/switch/Switch.vue'

interface Props {
  modelValue: boolean
  label?: string
  sublabel?: string
  description?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Label',
  sublabel: '(Sublabel)',
  description: 'A short description goes here.',
  id: 'switch-card',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const checked = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})
</script>

<template>
  <div
    class="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-xs shadow-black/[.04] has-data-[state=checked]:border-ring"
  >
    <Switch
      :id="props.id"
      v-model="checked"
      class="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
      :aria-describedby="`${props.id}-description`"
    />
    <div class="grid grow gap-2">
      <Label :for="props.id">
        {{ props.label }}
        <span
          v-if="props.sublabel"
          class="text-xs font-normal leading-[inherit] text-muted-foreground"
        >
          {{ props.sublabel }}
        </span>
      </Label>
      <p
        v-if="props.description"
        :id="`${props.id}-description`"
        class="text-xs text-muted-foreground"
      >
        {{ props.description }}
      </p>
    </div>
  </div>
</template>
