<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ParentAccount {
  id: string | number
  account_code: string
  account_name: string
  account_type?: string   
  normal_balance?: string
}

interface Props {
  modelValue?: string | number | null
  parentAccounts: ParentAccount[]
  label?: string
  placeholder?: string
  helperText?: string
  emptyOptionText?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Sub Akun Dari',
  placeholder: 'Pilih akun induk (opsional)',
  helperText: 'Kosongkan jika kode akun merupakan kode akun utama',
  emptyOptionText: '-',
  disabled: false,
  id: 'parent-account-select'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'change': [account: ParentAccount | null] 
}>()

const handleSelect = (id: string | number | null) => {
  emit('update:modelValue', id)
  
  const selectedAccount = props.parentAccounts.find(p => p.id == id) || null
  emit('change', selectedAccount)
}
</script>

<template>
  <div class="space-y-2">
    <Label :for="id">{{ label }}</Label>
    <Select 
      :model-value="modelValue?.toString()" 
      @update:model-value="handleSelect"
      :disabled="disabled"
    >
      <SelectTrigger class="w-full" :id="id">
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem :value="null">
          {{ emptyOptionText }}
        </SelectItem>
        <SelectItem 
          v-for="parent in parentAccounts" 
          :key="parent.id" 
          :value="parent.id.toString()"
        >
          {{ parent.account_code }} - {{ parent.account_name }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
