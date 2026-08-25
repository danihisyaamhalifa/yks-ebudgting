<script setup lang="ts">
import { ref, onMounted, h, reactive, computed } from 'vue'
import DataTable from '@/components/compound/data-table/DataTable.vue'
import { FormDialog } from '@/components/compound/form-dialog'
import PermissionTable from './components/PermissionTable.vue'
import { useDataTable, createColumn, createActionColumn } from '@/composables/useDataTable'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner';
import { formatPermissionLabel } from '@/utils/permissions';

import { Role } from '@/types'
import { EditIcon, TrashIcon } from 'lucide-vue-next';
import axios from 'axios';

const roleForm = reactive({
  id: '',
  name: '',
  guard_name: 'web',
  permissions: [] as string[],
});

const columns: ColumnDef<Role>[] = [
  createColumn({
    value: 'name',
    title: 'Nama',
    sortable: true,
    searchable: true,
    render: ({ row }: any) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('span', { class: 'font-medium' }, row.original.name)
      ])
    }
  }),
  createColumn({
    value: 'permissions',
    title: 'Total Hak Akses',
    sortable: true,
    render: ({ row }: any) => {
      const count = row.original.permissions?.length || 0;
      return h('div', { class: 'flex items-center justify-center' }, [
        h('span', {
          class: 'inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
        }, `${count} hak akses`),

      ])
    }
  }),
  createActionColumn([
    {
      icon: EditIcon,
      variant: 'default',
      onClick: (row: Role) => editRole(row),
      // permissions: ['edit roles'],
    },
    {
      icon: TrashIcon,
      variant: 'destructive',
      onClick: (row: Role) => deleteRole(row),
      // permissions: ['delete roles'],
    },
  ]),
]

const dataTable = useDataTable({
  endpoint: '/api/v1/roles',
  columns,
  searchable: true,
  searchPlaceholder: 'Cari role...',
  sortable: true,
  filterable: true,
  exportable: true,
  selectable: true,
  refreshable: true,
})

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const loading = ref(false)

interface PermissionGroup {
  baseName: string;
  displayName: string;
  permissions: {
    create?: Permission | null;
    view?: Permission | null;
    edit?: Permission | null;
    delete?: Permission | null;
    approve?: Permission | null;
  };
}

const allPermissions = ref<PermissionGroup[]>([]);

interface Permission {
  name: string;
  checked: boolean;
}
const permissionTableKey = ref(0);

const fetchPermissions = async (rolePermissions: string[] = []) => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/permissions?view_all=1');
    const permissionGroups = new Map();

    response.data.data.forEach((group: any) => {
      const baseName = group.base_name;
      const permissionTypes = group.permissions || {};

      if (!permissionGroups.has(baseName)) {
        permissionGroups.set(baseName, {
          baseName,
          displayName: formatPermissionLabel(baseName),
          permissions: {
            create: null,
            view: null,
            edit: null,
            delete: null,
            approve: null
          }
        });
      }

      Object.entries(permissionTypes).forEach(([type, perm]: [string, any]) => {
        const normalizedType = type.toLowerCase();
        if (['create', 'view', 'edit', 'delete', 'approve'].includes(normalizedType)) {
          const isChecked = roleForm.permissions.includes(perm.name) ||
                          roleForm.permissions.includes(`${type} ${baseName}`) ||
                          roleForm.permissions.includes(`${type}_${baseName}`);

          const permissionGroup = permissionGroups.get(baseName);
          if (permissionGroup) {
            permissionGroup.permissions[normalizedType as keyof typeof permissionGroup.permissions] = {
              name: perm.name,
              checked: isChecked
            };
          }
        }
      });
    });

    allPermissions.value = Array.from(permissionGroups.values());

  } catch (error) {
    console.error('Error fetching permissions:', error);
    toast.error('Gagal memuat role');
  } finally {
    loading.value = false;
  }
};

const updatePermissionStates = () => {
  if (!allPermissions.value) return;

  allPermissions.value = allPermissions.value.map(group => {
    const updatedPermissions = { ...group.permissions };

    (Object.keys(updatedPermissions) as Array<keyof typeof updatedPermissions>).forEach(permType => {
      const perm = updatedPermissions[permType];
      if (perm) {
        perm.checked = roleForm.permissions.includes(perm.name);
      }
    });

    return {
      ...group,
      permissions: updatedPermissions
    };
  });
};

const roleToDelete = ref<Role | null>(null)

const isFormValid = computed(() => {
  return roleForm.name.trim() !== ''
})

const resetForm = () => {
  Object.assign(roleForm, {
    id: '',
    name: '',
    guard_name: 'web',
    permissions: [] as string[],
  })
}

const editRole = async (role: Role) => {
  resetForm();
  const rolePermissions = role.permissions ? role.permissions.map(p => p.name) : [];

  Object.assign(roleForm, {
    id: role.id,
    name: role.name,
    guard_name: role.guard_name || 'web',
    permissions: [...rolePermissions]
  });

  allPermissions.value = [];
  await fetchPermissions(rolePermissions);

  showEditDialog.value = true;
}

const deleteRole = (role: Role) => {
  roleToDelete.value = role
  showDeleteDialog.value = true
}

const createRole = async () => {
  resetForm();
  await fetchPermissions();
  showCreateDialog.value = true;
}

const handlePermissionChange = (permissionName: string, checked: boolean) => {
  const index = roleForm.permissions.indexOf(permissionName);

  if (checked && index === -1) {
    roleForm.permissions = [...roleForm.permissions, permissionName];
  } else if (!checked && index > -1) {
    const newPermissions = [...roleForm.permissions];
    newPermissions.splice(index, 1);
    roleForm.permissions = newPermissions;
  }

  updatePermissionStates();
}

// Handler untuk pilih semua permissions
const handleSelectAll = () => {
  const allPermissionNames = new Set<string>();
  
  allPermissions.value.forEach(group => {
    Object.values(group.permissions).forEach(perm => {
      if (perm?.name) {
        allPermissionNames.add(perm.name);
      }
    });
  });
  
  roleForm.permissions = Array.from(allPermissionNames);
  updatePermissionStates();
}

// Handler untuk hapus semua permissions
const handleDeselectAll = () => {
  roleForm.permissions = [];
  updatePermissionStates();
}

const handleCreateRole = async () => {
  loading.value = true
  try {
    await axios.post('/api/v1/roles', {
      name: roleForm.name,
      guard_name: roleForm.guard_name,
      permissions: roleForm.permissions,
    })

    showCreateDialog.value = false;
    resetForm();
    dataTable.actions.refresh();
    toast.success('Role berhasil disimpan');

  } catch (error: any) {
    console.error('Error creating role:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan sistem';
    toast.error(`Role gagal disimpan: ${errorMessage}`);
} finally {
    loading.value = false
  }
}

const handleUpdateRole = async () => {
  loading.value = true;
  try {
    await axios.put(`/api/v1/roles/${roleForm.id}`, {
      name: roleForm.name,
      guard_name: roleForm.guard_name,
      permissions: roleForm.permissions,
    });

    showEditDialog.value = false;
    resetForm();
    dataTable.actions.refresh();

    toast.success('Role berhasil diperbaharui');

  } catch (error: any) {
    console.error('Error creating role:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan sistem';
    toast.error(`Role gagal diperbaharui: ${errorMessage}`);
} finally {
    loading.value = false;
  }
}

const handleDeleteRole = async () => {
  if (!roleToDelete.value) return

  loading.value = true
  try {
    await axios.delete(`/api/v1/roles/${roleToDelete.value.id}`)
    showDeleteDialog.value = false
    roleToDelete.value = null
    dataTable.actions.refresh()
  } catch (error) {
    console.error('Error deleting role:', error)
  } finally {
    loading.value = false
  }
}

const handleCancelEdit = () => {
  resetForm()
}

defineExpose({
  createRole
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
            search-placeholder="Cari role..."
            show-pagination
            show-page-info
            empty-message="Tidak ada role yang ditemukan"
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

    <!-- Create Role Dialog - Using Compound Components Pattern -->
    <FormDialog
      v-model:open="showCreateDialog"
      :loading="loading"
      size="md"
    >
      <FormDialog.Header
        title="Buat Role Baru"
        description="Tambahkan role baru. Semua bidang wajib diisi."
      />

      <FormDialog.Content spacing="md">
        <div class="space-y-2">
          <Label for="create-name">Nama Role</Label>
          <Input
            id="create-name"
            v-model="roleForm.name"
            placeholder="Isikan nama role"
            :disabled="loading"
          />
        </div>

        <PermissionTable
          :permissions="allPermissions"
          :loading="loading"
          @update:permission="handlePermissionChange"
          @select-all="handleSelectAll"
          @deselect-all="handleDeselectAll"
          :key="permissionTableKey"
        />
      </FormDialog.Content>

      <FormDialog.Footer
        submit-text="Buat Role"
        cancel-text="Batal"
        :loading="loading"
        :valid="isFormValid"
        @submit="handleCreateRole"
      />
    </FormDialog>

    <!-- Edit Role Dialog -->
    <FormDialog
      v-model:open="showEditDialog"
      title="Edit Role"
      description="Perbarui informasi role. Semua bidang wajib diisi."
      :loading="loading"
      :valid="isFormValid"
      submit-text="Perbarui Role"
      cancel-text="Batal"
      @submit="handleUpdateRole"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="edit-name">Nama Role</Label>
          <Input
            id="edit-name"
            v-model="roleForm.name"
            placeholder="Isikan nama role"
            :disabled="loading"
          />
        </div>
        <PermissionTable
          :permissions="allPermissions"
          :loading="loading"
          id-prefix="edit-"
          @update:permission="handlePermissionChange"
          @select-all="handleSelectAll"
          @deselect-all="handleDeselectAll"
        />
      </div>
      <template #footer>
        <Button variant="outline" @click="handleCancelEdit">Batal</Button>
        <Button
          type="submit"
          :disabled="!isFormValid || loading"
          @click="handleUpdateRole"
        >
          {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </Button>
      </template>
    </FormDialog>

    <!-- Delete Role Dialog -->
    <FormDialog
      v-model:open="showDeleteDialog"
      title="Hapus Role"
      description="Tindakan ini tidak dapat dibatalkan. Role akan dihapus secara permanen dan semua izin terkait akan dicabut dari pengguna."
      :loading="loading"
      submit-text="Hapus Role"
      submit-variant="destructive"
      cancel-text="Batal Hapus"
      size="sm"
      @submit="handleDeleteRole"
    >
      <div class="p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-800">
          Anda akan menghapus role:
          <strong>{{ roleToDelete?.name }}</strong>
        </p>
      </div>
    </FormDialog>
</template>