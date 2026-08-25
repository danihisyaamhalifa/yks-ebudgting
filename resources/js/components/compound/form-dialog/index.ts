// @ts-ignore
import FormDialogComponent from './FormDialog.vue'
// @ts-ignore
import FormDialogHeaderComponent from './FormDialogHeader.vue'
// @ts-ignore
import FormDialogContentComponent from './FormDialogContent.vue'
// @ts-ignore
import FormDialogFooterComponent from './FormDialogFooter.vue'

// Create a new component that includes the compound components as static properties
const FormDialog = FormDialogComponent as any

// Attach the compound components as static properties
FormDialog.Header = FormDialogHeaderComponent
FormDialog.Content = FormDialogContentComponent
FormDialog.Footer = FormDialogFooterComponent

export { FormDialog }

// Also export individual components for direct import if needed
export { 
  FormDialogHeaderComponent as FormDialogHeader,
  FormDialogContentComponent as FormDialogContent,
  FormDialogFooterComponent as FormDialogFooter
}

// Export types
export type { FormDialogProps, FormDialogEmits } from './FormDialog.vue'