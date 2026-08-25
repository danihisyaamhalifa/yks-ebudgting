<script setup lang="ts">
export interface FormDialogContentProps {
  class?: string
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<FormDialogContentProps>(), {
  spacing: 'md'
})

const spacingClasses = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6'
}
</script>

<template>
  <div :class="[spacingClasses[spacing], props.class, 'h-auto max-h-full overflow-y-auto']">
    <slot />
  </div>
</template>