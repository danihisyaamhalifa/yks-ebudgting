<script setup lang="ts">
import { ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types'
// import { useRouter } from '@/composables/useRouter';
import { PlusIcon, PackageIcon, ShieldCheckIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

// Import partial components
import PermissionsContent from './partials/PermissionsContent.vue';
import RolesContent from './partials/RolesContent.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Role',
        href: '',
    },
];

// Active tab state
const activeTab = ref('roles')

const rolesContentRef = ref<InstanceType<typeof RolesContent> | null>(null)
const permissionsContentRef = ref<InstanceType<typeof PermissionsContent> | null>(null)

const createPermission = () => {
  permissionsContentRef.value?.createPermission()
}

const createRole = () => {
  rolesContentRef.value?.createRole()
}

</script>

<template>
    <Head title="Pengaturan Role & Hak Akses" />

    <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ activeTab === 'roles' ? 'Role' : 'Hak Akses' }}</h1>
          <p class="text-muted-foreground">
            {{ activeTab === 'roles' ? 'Pengaturan role dan hak akses' : 'Pengaturan hak akses' }}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button @click="createRole" v-if="activeTab === 'roles'">
            <PlusIcon/>
            Tambah Role
          </Button>
          <Button @click="createPermission" v-if="activeTab === 'permissions'">
            <PlusIcon/>
            Tambah Hak Akses
          </Button>
        </div>
      </div>

      <!-- Sidebar Layout with Vertical Tabs -->
      <div class="flex gap-6">
        <!-- Vertical Tab Navigation (Sidebar) -->
        <div class="w-64 flex-shrink-0">
          <div class="space-y-2 rounded-lg bg-muted p-3">
            <Button
              :variant="activeTab === 'roles' ? 'default' : 'ghost'"
              class="w-full justify-start"
              @click="activeTab = 'roles'"
            >
              <PackageIcon class="mr-3 h-4 w-4" />
              Role
            </Button>
            <Button
              :variant="activeTab === 'permissions' ? 'default' : 'ghost'"
              class="w-full justify-start"
              @click="activeTab = 'permissions'"
            >
              <ShieldCheckIcon class="mr-3 h-4 w-4" />
              Hak Akses
            </Button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 min-w-0">
          <!-- Roles Tab -->
          <RolesContent ref="rolesContentRef" v-if="activeTab === 'roles'" />

          <!-- Permissions Tab -->
          <PermissionsContent ref="permissionsContentRef" v-if="activeTab === 'permissions'" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
