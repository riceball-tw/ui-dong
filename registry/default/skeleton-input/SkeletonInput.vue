
<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <Skeleton style="width: 100px; height: 14px;" class="rounded-full" />
    <Skeleton class="w-full h-9 rounded-md" />
  </div>
</template>