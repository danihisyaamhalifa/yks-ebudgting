<script setup lang="ts">
import { ref, computed, provide, useSlots } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import FormDialogHeader from '@/components/compound/form-dialog/FormDialogHeader.vue'
import FormDialogContent from '@/components/compound/form-dialog/FormDialogContent.vue'
import FormDialogFooter from '@/components/compound/form-dialog/FormDialogFooter.vue'

export interface FormDialogProps {
  // Dialog props
  open?: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  // Form props
  loading?: boolean
  disabled?: boolean
  
  // Button props (for backward compatibility)
  submitText?: string
  cancelText?: string
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  hideCancel?: boolean
  hideSubmit?: boolean
  
  // Validation
  valid?: boolean
}

export interface FormDialogEmits {
  'update:open': [value: boolean]
  'submit': []
  'cancel': []
  'close': []
}

const props = withDefaults(defineProps<FormDialogProps>(), {
  open: false,
  size: 'md',
  loading: false,
  disabled: false,
  submitText: 'Save',
  cancelText: 'Cancel',
  submitVariant: 'default',
  cancelVariant: 'outline',
  hideCancel: false,
  hideSubmit: false,
  valid: true,
})

const emit = defineEmits<FormDialogEmits>()

// Computed properties
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  }
  return sizes[props.size]
})

const isSubmitDisabled = computed(() => {
  return props.loading || props.disabled || !props.valid
})

// Provide context for compound components
provide('formDialogContext', {
  loading: computed(() => props.loading),
  disabled: computed(() => props.disabled),
  valid: computed(() => props.valid),
  emit,
  closeModal: () => {
    isOpen.value = false
  }
})

// Event handlers
const handleSubmit = () => {
  if (!isSubmitDisabled.value) {
    emit('submit')
  }
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}

const handleClose = () => {
  emit('close')
  isOpen.value = false
}

const handleOpenChange = (open: boolean) => {
  isOpen.value = open
  if (!open) {
    emit('close')
  }
}

const slots = useSlots()

// Check if using compound components pattern
const isUsingCompoundPattern = computed(() => {
  return !!(props.title === undefined && (
    slots.header || 
    slots.content || 
    slots.footer ||
    slots.default?.().some((vnode: any) => 
      typeof vnode.type === 'object' && 
      (vnode.type === FormDialogHeader || 
       vnode.type === FormDialogContent || 
       vnode.type === FormDialogFooter)
    )
  ))
})
</script>

<template>
  <Dialog v-model:open="isOpen" @update:open="handleOpenChange">
    <DialogTrigger v-if="slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    
    <DialogContent :class="sizeClasses">
      <!-- Compound Components Pattern -->
      <template v-if="isUsingCompoundPattern">
        <slot />
      </template>
      
      <!-- Backward Compatibility Pattern -->
      <template v-else>
        <DialogHeader v-if="title || description">
          <DialogTitle v-if="title">{{ title }}</DialogTitle>
          <DialogDescription v-if="description">
            {{ description }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="py-4">
          <slot />
        </div>
        
        <DialogFooter v-if="!hideSubmit || !hideCancel" class="gap-2">
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
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>