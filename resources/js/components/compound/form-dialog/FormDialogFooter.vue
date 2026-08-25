<script setup lang="ts">
import { computed, inject, getCurrentInstance } from 'vue'
import { DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'

export interface FormDialogFooterProps {
  // Button props
  submitText?: string
  cancelText?: string
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  hideCancel?: boolean
  hideSubmit?: boolean
  
  // State props
  loading?: boolean
  disabled?: boolean
  valid?: boolean
  
  // Layout props
  class?: string
  justify?: 'start' | 'center' | 'end' | 'between'
}

export interface FormDialogFooterEmits {
  'submit': []
  'cancel': []
}

const props = withDefaults(defineProps<FormDialogFooterProps>(), {
  submitText: 'Save',
  cancelText: 'Cancel',
  submitVariant: 'default',
  cancelVariant: 'outline',
  hideCancel: false,
  hideSubmit: false,
  loading: false,
  disabled: false,
  valid: true,
  justify: 'end'
})

const emit = defineEmits<FormDialogFooterEmits>()

// Inject FormDialog context
const formDialogContext = inject<{
  loading: any
  disabled: any
  valid: any
  emit: any
  closeModal: () => void
} | null>('formDialogContext', null)

// Get current instance to check for event listeners
const instance = getCurrentInstance()

const isSubmitDisabled = computed(() => {
  return props.loading || props.disabled || !props.valid
})

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between'
}

const handleSubmit = () => {
  if (!isSubmitDisabled.value) {
    emit('submit')
  }
}

const handleCancel = () => {
  // Check if there are any listeners for the 'cancel' event
  const hasCustomCancelHandler = instance?.vnode.props?.onCancel || 
                                 instance?.attrs?.onCancel ||
                                 (instance?.vnode.props && 'onCancel' in instance.vnode.props)
  
  // Always emit the cancel event first
  emit('cancel')
  
  // If no custom cancel handler is provided, automatically close the modal
  if (!hasCustomCancelHandler && formDialogContext?.closeModal) {
    formDialogContext.closeModal()
  }
}
</script>

<template>
  <DialogFooter :class="[justifyClasses[justify], 'gap-2', props.class]">
    <slot>
      <Button
        v-if="!hideCancel"
        :variant="cancelVariant"
        :disabled="loading"
        @click="handleCancel"
      >
        {{ cancelText }}
      </Button>
      
      <Button
        v-if="!hideSubmit"
        :variant="submitVariant"
        :disabled="isSubmitDisabled"
        @click="handleSubmit"
      >
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ submitText }}
      </Button>
    </slot>
  </DialogFooter>
</template>