<script setup lang="ts">
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export interface FormDialogHeaderProps {
  title?: string
  description?: string
}

const props = defineProps<FormDialogHeaderProps>()
</script>

<template>
  <div class="bg-muted rounded-t-lg px-4 py-3 -mx-6 -mt-6 mb-4">
    <DialogHeader>
      <DialogTitle v-if="title || $slots.title">
        <slot name="title">{{ title }}</slot>
      </DialogTitle>
      <DialogDescription v-if="description || $slots.description">
        <slot name="description">{{ description }}</slot>
      </DialogDescription>
    </DialogHeader>
  </div>
</template>