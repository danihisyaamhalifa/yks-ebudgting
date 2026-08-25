<script setup lang="ts">
import { ref, h, reactive, computed } from 'vue'
import DataTable from '@/components/compound/data-table/DataTable.vue'
import { FormDialog } from '@/components/compound/form-dialog'
import { useDataTable, createColumn, createActionColumn } from '@/composables/useDataTable'
import type { ColumnDef } from '@tanstack/vue-table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'vue-sonner'
import { EditIcon, TrashIcon } from 'lucide-vue-next'
import axios from 'axios'

import { Permission } from '@/types'

// Define permission types
type PermissionType = 'view' | 'create' | 'edit' | 'delete' | 'approve'
type Permissions = {
  [key in PermissionType]: boolean
}

interface PermissionForm {
  id: string
  base_name: string
  permissions: Permissions
}

// Permission types array for preview
const permissionTypes: PermissionType[] = ['view', 'create', 'edit', 'delete', 'approve']

// DataTable columns definition
const columns: ColumnDef<Permission>[] = [
  createColumn({
    value: 'base_name',
    title: 'Nama Modul',
    sortable: true,
    searchable: true,
    render: ({ row }: any) => {
      const baseName = row.original.base_name
      const displayName = baseName
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      return h('div', { class: 'flex items-center gap-3' }, [
        h('span', { class: 'font-medium' }, displayName)
      ])
    }
  }),

  createColumn({
    value: 'permissions',
    title: 'Hak Akses',
    render: ({ row }: any) => {
      const permissions = row.original.permissions || {}
      const permissionTypes = ['view', 'create', 'edit', 'delete', 'approve']

      return h('div', { class: 'flex items-center gap-4' },
        permissionTypes.map(type => {
          const hasPermission = permissions[type]
          const label = type.charAt(0).toUpperCase() + type.slice(1)

          return h('div', { class: 'flex items-center gap-2' }, [
            h('div', {
              class: [
                'w-4 h-4 rounded border',
                hasPermission ? 'bg-primary border-primary' : 'bg-background border-border'
              ]
            }),
            h('span', { class: 'text-sm' }, label)
          ])
        })
      )
    }
  }),
  createActionColumn([
    {
      icon: EditIcon,
      variant: 'default',
      onClick: (row: Permission) => editPermission(row),
    },
    {
      icon: TrashIcon,
      variant: 'destructive',
      onClick: (row: Permission) => deletePermission(row),
    },
  ]),
]

// Initialize data table
const dataTable = useDataTable({
  endpoint: '/api/v1/permissions',
  columns,
  searchable: true,
  searchPlaceholder: 'Cari izin...',
  sortable: true,
  filterable: true,
  exportable: true,
  selectable: true,
  refreshable: true,
})

// Dialog states
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const loading = ref(false)

// Form data
const permissionForm: PermissionForm = reactive({
  id: '',
  base_name: '',
  permissions: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    approve: true
  }
})

const permissionToDelete = ref<Permission | null>(null)

// Handle input formatting
const handleBaseNameInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // Only lowercase, preserve spaces for display
  permissionForm.base_name = target.value.toLowerCase()
}

// Form validation
const isFormValid = computed(() => {
  if (showCreateDialog.value) {
    // For create: only need base_name
    return permissionForm.base_name.trim() !== ''
  } else {
    // For edit: need base_name and at least one permission
    const hasBaseName = permissionForm.base_name.trim() !== ''
    const hasAtLeastOnePermission = Object.values(permissionForm.permissions).some(Boolean)
    return hasBaseName && hasAtLeastOnePermission
  }
})

// Reset form
const resetForm = () => {
  permissionForm.id = ''
  permissionForm.base_name = ''
  permissionForm.permissions = {
    view: true,
    create: true,
    edit: true,
    delete: true,
    approve: true
  }
}

// Edit permission
const editPermission = (permission: any) => {
  permissionForm.id = permission.id
  permissionForm.base_name = permission.base_name || ''
  
  // Set permissions based on existing data
  if (permission.permissions) {
    const updatedPermissions = { ...permissionForm.permissions }
    ;(Object.keys(updatedPermissions) as PermissionType[]).forEach(key => {
      updatedPermissions[key] = !!permission.permissions[key]
    })
    permissionForm.permissions = updatedPermissions
  }
  
  showEditDialog.value = true
}

// Delete permission
const deletePermission = (permission: Permission) => {
  permissionToDelete.value = permission
  showDeleteDialog.value = true
}

// Create permission
const createPermission = () => {
  resetForm()
  showCreateDialog.value = true
}

// Handle create permission
const handleCreatePermission = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    // Backend will create ALL permission types (view, create, edit, delete, approve)
    const payload = {
      name: permissionForm.base_name.trim().toLowerCase(),
      guard_name: 'web'
    }
    
    await axios.post('/api/v1/permissions', payload)

    showCreateDialog.value = false
    resetForm()
    dataTable.actions.refresh()

    toast.success('Hak akses berhasil dibuat', {
      description: 'Semua hak akses untuk resource ini telah ditambahkan.'
    })
  } catch (error: any) {
    console.error('Error creating permission:', error)

    toast.error('Gagal membuat izin', {
      description: error.response?.data?.message || 'Terjadi kesalahan saat membuat izin.'
    })
  } finally {
    loading.value = false
  }
}

// Handle update permission
const handleUpdatePermission = async () => {
  if (!permissionForm.id || !isFormValid.value) return

  loading.value = true
  try {
    const payload = {
      base_name: permissionForm.base_name.trim().toLowerCase(),
      permissions: permissionForm.permissions
    }
    
    await axios.put(`/api/v1/permissions/${permissionForm.id}`, payload)

    showEditDialog.value = false
    resetForm()
    dataTable.actions.refresh()

    toast.success('Hak akses berhasil diperbarui', {
      description: 'Perubahan pada hak akses telah disimpan.'
    })
  } catch (error: any) {
    console.error('Error updating permissions:', error)

    toast.error('Gagal memperbarui izin', {
      description: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui izin.'
    })
  } finally {
    loading.value = false
  }
}

// Handle delete permission
const handleDeletePermission = async () => {
  if (!permissionToDelete.value?.id) {
    toast.error('Gagal menghapus', {
      description: 'Hak akses tidak valid atau tidak ditemukan.'
    })
    return
  }

  loading.value = true
  try {
    await axios.delete(`/api/v1/permissions/${permissionToDelete.value.id}`)
    showDeleteDialog.value = false
    permissionToDelete.value = null
    dataTable.actions.refresh()

    toast.success('Hak akses berhasil dihapus', {
      description: 'Semua hak akses untuk resource ini telah dihapus dari sistem.'
    })
  } catch (error: any) {
    console.error('Error deleting permission:', error)

    toast.error('Gagal menghapus izin', {
      description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus izin.'
    })
  } finally {
    loading.value = false
  }
}

// Expose methods for parent component
defineExpose({
  createPermission
})
</script>

<template>
    <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto">
        <DataTable
            :columns="dataTable.columns"
            :data="dataTable.data.value"
            :loading="dataTable.loading.value"
            :actions="dataTable.actions"
            searchable
            search-placeholder="Cari izin..."
            show-pagination
            show-page-info
            empty-message="Tidak ada izin yang ditemukan"
            server-side
            :total-rows="dataTable.state.value.pagination.total"
            :current-page="dataTable.state.value.pagination.page"
            :total-pages="dataTable.state.value.pagination.totalPages"
            :current-page-size="dataTable.state.value.pagination.perPage"
            :exportable="true"
            @search="dataTable.actions.search"
            @page-change="dataTable.actions.goToPage"
            @page-size-change="dataTable.actions.changePageSize"
            @sort-change="(sortBy, sortOrder) => dataTable.actions.sort(sortBy, sortOrder === 'desc')"
        />
    </div>

    <!-- Create Permission Dialog -->
    <FormDialog
      v-model:open="showCreateDialog"
      :loading="loading"
      size="md"
    >
      <FormDialog.Header
        title="Buat Hak Akses Baru"
        description="Isikan nama modul. Sistem akan membuat semua hak akses (view, create, edit, delete, approve) secara otomatis."
      />

      <FormDialog.Content spacing="md" class="space-y-4">
        <div class="space-y-2">
          <Label for="create-base-name">Nama Modul</Label>
          <Input
            id="create-base-name"
            v-model="permissionForm.base_name"
            @input="handleBaseNameInput"
            placeholder="contoh: data warehouse"
            :disabled="loading"
          />
        </div>

        <!-- Preview permission yang akan dibuat -->
        <div v-if="permissionForm.base_name && permissionForm.base_name.trim()" class="space-y-2">
          <Label>Preview Hak Akses yang Akan Dibuat</Label>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div v-for="type in permissionTypes" :key="type" class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{{ type }} {{ permissionForm.base_name }}</span>
            </div>
          </div>
        </div>
      </FormDialog.Content>

      <FormDialog.Footer
        submit-text="Buat Hak akses"
        cancel-text="Batal"
        :loading="loading"
        :valid="isFormValid"
        @submit="handleCreatePermission"
      />
    </FormDialog>

    <!-- Edit Permission Dialog -->
    <FormDialog
      v-model:open="showEditDialog"
      :loading="loading"
      size="md"
    >
      <FormDialog.Header
        title="Edit Hak akses"
        description="Pilih hak akses yang diizinkan untuk resource ini."
      />

      <FormDialog.Content spacing="md" class="space-y-4">
        <div class="space-y-2">
          <Label for="edit-base-name">Nama Modul</Label>
          <Input
            id="edit-base-name"
            v-model="permissionForm.base_name"
            @input="handleBaseNameInput"
            placeholder="contoh: data warehouse"
            :disabled="loading"
          />
        </div>

        <div class="space-y-3">
          <Label>Hak Akses</Label>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(enabled, type) in permissionForm.permissions" :key="type" class="flex items-center space-x-2">
              <Checkbox
                :id="`edit-${type}`"
                v-model="permissionForm.permissions[type]"
                :disabled="loading"
              />
              <Label :for="`edit-${type}`" class="capitalize">
                {{ type }}
              </Label>
            </div>
          </div>
        </div>
      </FormDialog.Content>

      <FormDialog.Footer
        submit-text="Perbarui Hak akses"
        cancel-text="Batal"
        :loading="loading"
        :valid="isFormValid"
        @submit="handleUpdatePermission"
      />
    </FormDialog>

    <!-- Delete Permission Dialog -->
    <FormDialog
      v-model:open="showDeleteDialog"
      :loading="loading"
      size="sm"
    >
      <FormDialog.Header
        title="Hapus Hak akses"
        description="Tindakan ini tidak dapat dibatalkan. Hak akses akan dihapus secara permanen."
      />

      <FormDialog.Content spacing="md">
        <div class="p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-800">
            Anda akan menghapus semua hak akses untuk resource:
            <strong>{{ permissionToDelete?.base_name || permissionToDelete?.name }}</strong>
          </p>
          <p class="text-xs text-red-600 mt-2">
            Semua permission type (view, create, edit, delete, approve) untuk resource ini akan dihapus.
          </p>
        </div>
      </FormDialog.Content>

      <FormDialog.Footer
        submit-text="Hapus Hak akses"
        cancel-text="Batal"
        submit-variant="destructive"
        :loading="loading"
        @submit="handleDeletePermission"
      />
    </FormDialog>
</template>