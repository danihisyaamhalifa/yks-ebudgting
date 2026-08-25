<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { computed } from 'vue';

interface Permission {
  name: string;
  checked: boolean;
}

interface PermissionGroup {
  baseName: string;
  displayName: string;
  permissions: {
    view?: Permission | null;
    create?: Permission | null;
    edit?: Permission | null;
    delete?: Permission | null;
    approve?: Permission | null;
  };
}

const props = defineProps<{
  permissions: PermissionGroup[];
  loading?: boolean;
  idPrefix?: string;
}>();

const emit = defineEmits<{
  (e: 'update:permission', permissionName: string, checked: boolean): void;
  (e: 'select-all'): void;
  (e: 'deselect-all'): void;
}>();

const handlePermissionChange = (permissionName: string, checked: boolean) => {
  emit('update:permission', permissionName, checked);
};

const handleSelectAll = () => {
  emit('select-all');
};

const handleDeselectAll = () => {
  emit('deselect-all');
};

const allPermissionNames = computed(() => {
  const names: string[] = [];
  props.permissions.forEach(group => {
    Object.values(group.permissions).forEach(permission => {
      if (permission?.name) {
        names.push(permission.name);
      }
    });
  });
  return names;
});

const isAllSelected = computed(() => {
  if (allPermissionNames.value.length === 0) return false;
  return allPermissionNames.value.every(name => {
    for (const group of props.permissions) {
      for (const perm of Object.values(group.permissions)) {
        if (perm?.name === name) return perm.checked;
      }
    }
    return false;
  });
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Label class="text-base font-semibold">Hak Akses</Label>
      <div class="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          :disabled="loading || isAllSelected"
          @click="handleSelectAll"
        >
          Pilih Semua
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          :disabled="loading"
          @click="handleDeselectAll"
        >
          Hapus Semua
        </Button>
      </div>
    </div>
    
    <div class="border rounded-md overflow-hidden">
      <div class="max-h-[400px] overflow-x-hidden relative">
        <table class="w-full table-fixed border-collapse">
          <thead class="bg-muted sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            <tr>
              <th class="w-[35%] text-left p-3 font-medium text-sm text-muted-foreground truncate">Nama Modul</th>
              <th class="w-[13%] p-3 text-center font-medium text-sm text-muted-foreground">Create</th>
              <th class="w-[13%] p-3 text-center font-medium text-sm text-muted-foreground">View</th>
              <th class="w-[13%] p-3 text-center font-medium text-sm text-muted-foreground">Edit</th>
              <th class="w-[13%] p-3 text-center font-medium text-sm text-muted-foreground">Delete</th>
              <th class="w-[13%] p-3 text-center font-medium text-sm text-muted-foreground">Approve</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in permissions" :key="group.baseName" class="border-t hover:bg-muted/50 transition-colors">
              <td class="p-3 font-medium text-sm truncate" :title="group.displayName">
                {{ group.displayName }}
              </td>
              <td class="p-3 text-center">
                <Checkbox 
                  v-if="group.permissions.create"
                  :id="`${idPrefix}${group.baseName}-create`"
                  :model-value="group.permissions.create.checked"
                  :disabled="loading"
                  @update:model-value="(value) => handlePermissionChange(group.permissions.create!.name, value === true)" 
                />
              </td>
              <td class="p-3 text-center">
                <Checkbox 
                  v-if="group.permissions.view"
                  :id="`${idPrefix}${group.baseName}-view`"
                  :model-value="group.permissions.view.checked"
                  :disabled="loading"
                  @update:model-value="(value) => handlePermissionChange(group.permissions.view!.name, value === true)" 
                />
              </td>
              <td class="p-3 text-center">
                <Checkbox 
                  v-if="group.permissions.edit"
                  :id="`${idPrefix}${group.baseName}-edit`"
                  :model-value="group.permissions.edit.checked"
                  :disabled="loading"
                  @update:model-value="(value) => handlePermissionChange(group.permissions.edit!.name, value === true)" 
                />
              </td>
              <td class="p-3 text-center">
                <Checkbox 
                  v-if="group.permissions.delete"
                  :id="`${idPrefix}${group.baseName}-delete`"
                  :model-value="group.permissions.delete.checked"
                  :disabled="loading"
                  @update:model-value="(value) => handlePermissionChange(group.permissions.delete!.name, value === true)" 
                />
              </td>
              <td class="p-3 text-center">
                <Checkbox 
                  v-if="group.permissions.approve"
                  :id="`${idPrefix}${group.baseName}-approve`"
                  :model-value="group.permissions.approve.checked"
                  :disabled="loading"
                  @update:model-value="(value) => handlePermissionChange(group.permissions.approve!.name, value === true)" 
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>