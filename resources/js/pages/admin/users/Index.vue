<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import UnitSelect from '@/pages/masterdata/components/UnitSelect.vue';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import { computed, h, onMounted, reactive, ref } from 'vue';
import { toast } from 'vue-sonner';

import { BreadcrumbItem, User } from '@/types';
import {
    EditIcon,
    Eye,
    EyeOff,
    FilterIcon,
    KeyIcon,
    PlusIcon,
    TrashIcon,
    XIcon,
} from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: 'dashboard',
    },
];

// Extend User type to include unit and position
interface UserWithUnit extends User {
    unit_id?: number;
    unit_name?: string;
    position?: string;
}

const showCreatePassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const showFilters = ref(false);

// State untuk filter
const filterRole = ref<string | null>(null);
const filterUnitId = ref<number | null>(null);

const columns: ColumnDef<UserWithUnit>[] = [
    createColumn({
        value: 'name',
        title: 'Nama',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h(
                    Avatar,
                    { class: 'h-8 w-8' },
                    {
                        default: () => [
                            h(
                                AvatarFallback,
                                {
                                    class: 'text-xs font-medium',
                                },
                                () =>
                                    row.original.name
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2),
                            ),
                        ],
                    },
                ),
                h('span', { class: 'font-medium' }, row.original.name),
            ]);
        },
    }),
    createColumn({
        value: 'username',
        title: 'Username',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.username;
        },
    }),
    createColumn({
        value: 'email',
        title: 'Email',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.email;
        },
    }),
    createColumn({
        value: 'unit_name',
        title: 'Unit/Organisasi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const unit = row.original.unit;
            return unit?.unit_name || '-';
        },
    }),
    createColumn({
        value: 'position',
        title: 'Jabatan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.position || '-';
        },
    }),
    createColumn({
        value: 'roleName',
        title: 'Role',
        sortable: true,
        render: ({ row }) => {
            const role = row.original.roleName || 'user';
            const variant =
                role === 'superadmin'
                    ? 'destructive'
                    : role === 'mitra'
                      ? 'default'
                      : 'secondary';
            return h(
                Badge,
                { variant, class: 'capitalize' },
                { default: () => role },
            );
        },
        except_roles: ['mitra'],
    }),

    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: UserWithUnit) => editUser(row),
        },
        {
            icon: KeyIcon,
            variant: 'outline',
            onClick: (row: UserWithUnit) => openChangePasswordDialog(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: UserWithUnit) => deleteUser(row),
        },
    ]),
];

// Initialize DataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/users',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari user pengguna...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
});

// Roles data and management
interface Role {
    id: string;
    name: string;
    display_name?: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
}

const roles = ref<Role[]>([]);
const rolesLoading = ref(false);
const rolesError = ref<string | null>(null);

const roleOptions = computed(() => {
    return roles.value.map((role) => ({
        value: role.name,
        label:
            role.display_name ||
            role.name
                .replace('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
});

// Role filter options
const roleFilterOptions = computed(() => {
    return [
        { value: null, label: 'Semua Role' },
        ...roleOptions.value.map((r) => ({ value: r.value, label: r.label })),
    ];
});

// Apply filters
const applyFilters = () => {
    const params: Record<string, any> = {};

    params.role = filterRole.value || null;
    params.unit_id = filterUnitId.value || null;

    console.log('params', params)
    dataTable.actions.filter(params);
};

// Reset filters
const resetFilters = () => {
    filterRole.value = null;
    filterUnitId.value = null;

    applyFilters();
    showFilters.value = false;
};

// Clear single filter
const clearFilterRole = () => {
    filterRole.value = null;
    applyFilters();
};

const clearFilterUnit = () => {
    filterUnitId.value = null;
    applyFilters();
};

// Check if any filter is active
const hasActiveFilters = computed(() => {
    return filterRole.value !== null || filterUnitId.value !== null;
});

const fetchRoles = async () => {
    if (roles.value.length > 0) {
        return roles.value;
    }

    rolesLoading.value = true;
    rolesError.value = null;

    try {
        const response = await axios.get('/api/v1/roles');

        if (response.data.success) {
            roles.value = response.data.data || [];
        } else {
            roles.value = response.data || [];
        }
    } catch (err: any) {
        rolesError.value =
            err.response?.data?.message || 'Failed to fetch roles';
        console.error('Error fetching roles:', err);
    } finally {
        rolesLoading.value = false;
    }
    return roles.value;
};

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showChangePasswordDialog = ref(false);
const loading = ref(false);
const errors = ref<Record<string, string[]>>({});

const userForm = reactive({
    id: '',
    name: '',
    username: '',
    email: '',
    password: '',
    role: '',
    unit_id: 0,
    position: '',
});

const passwordForm = reactive({
    userId: '',
    newPassword: '',
    confirmPassword: '',
});

const userToDelete = ref<UserWithUnit | null>(null);

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-z0-9._-]+$/;
    return usernameRegex.test(username);
};

const isStrongPassword = (password: string): boolean => {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

const emailValidationMessage = computed(() => {
    if (!userForm.email) return '';
    if (!isValidEmail(userForm.email)) {
        return 'Format email tidak valid';
    }
    return '';
});

const usernameValidationMessage = computed(() => {
    if (!userForm.username) return '';
    if (!isValidUsername(userForm.username)) {
        return 'Nama pengguna harus huruf kecil dan hanya boleh mengandung huruf, angka, titik, underscore, dan dash';
    }
    return '';
});

const passwordValidationMessage = computed(() => {
    if (!userForm.password) return '';
    if (userForm.password.length < 8)
        return 'Kata sandi harus minimal 8 karakter';
    if (!isStrongPassword(userForm.password)) {
        return 'Kata sandi harus mengandung huruf besar, huruf kecil, angka dan karakter khusus';
    }
    return '';
});

const changePasswordValidationMessage = computed(() => {
    if (!passwordForm.newPassword) return '';
    if (passwordForm.newPassword.length < 8)
        return 'Kata sandi harus minimal 8 karakter';
    if (!isStrongPassword(passwordForm.newPassword)) {
        return 'Kata sandi harus mengandung huruf besar, huruf kecil, angka dan karakter khusus';
    }
    return '';
});

const passwordsMatch = computed(() => {
    return passwordForm.newPassword === passwordForm.confirmPassword;
});

const isChangePasswordFormValid = computed(() => {
    return (
        passwordForm.newPassword.trim() !== '' &&
        passwordForm.confirmPassword.trim() !== '' &&
        isStrongPassword(passwordForm.newPassword) &&
        passwordsMatch.value
    );
});

const isFormValid = computed(() => {
    return (
        userForm.name.trim() !== '' &&
        userForm.username.trim() !== '' &&
        isValidUsername(userForm.username) &&
        userForm.email.trim() !== '' &&
        isValidEmail(userForm.email) &&
        userForm.role !== '' &&
        (showCreateDialog.value
            ? userForm.password.trim() !== '' &&
              isStrongPassword(userForm.password)
            : true)
    );
});

const resetForm = () => {
    Object.assign(userForm, {
        id: '',
        name: '',
        username: '',
        email: '',
        password: '',
        role: '',
        unit_id: 0,
        position: '',
    });
};

const editUser = (user: UserWithUnit) => {
    Object.assign(userForm, {
        id: user.id,
        name: user.name,
        username: user.username || '',
        email: user.email,
        password: '',
        role: user.roles?.[0]?.name || 'user',
        unit_id: user.unit_id || 0,
        position: user.position || '',
    });
    showEditDialog.value = true;
};

const deleteUser = (user: UserWithUnit) => {
    userToDelete.value = user;
    showDeleteDialog.value = true;
};

const createUser = () => {
    resetForm();
    showCreateDialog.value = true;
};

const handleCreateUser = async () => {
    loading.value = true;
    try {
        await axios.post('/api/v1/users', userForm);
        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
        toast.success('User Pengguna berhasil dibuat!');
    } catch (error: any) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
            toast.error('Please fix the validation errors');
        } else {
            console.error('Error creating user:', error);
            toast.error('Failed to create user');
        }
    } finally {
        loading.value = false;
    }
};

const handleUpdateUser = async () => {
    loading.value = true;
    errors.value = {};
    try {
        // Exclude password from update data
        const { password, ...updateData } = userForm;
        await axios.put(`/api/v1/users/${userForm.id}`, updateData);
        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
        toast.success('User Pengguna berhasil diperbarui!');
    } catch (error: any) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
            toast.error('Please fix the validation errors');
        } else {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    } finally {
        loading.value = false;
    }
};

const openChangePasswordDialog = (userId: string | UserWithUnit) => {
    showNewPassword.value = false;
    showConfirmPassword.value = false;

    if (typeof userId === 'string') {
        passwordForm.userId = userId;
    } else {
        passwordForm.userId = userId?.id?.toString() || '';
    }
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    showChangePasswordDialog.value = true;
};

const handleChangePassword = async () => {
    loading.value = true;
    errors.value = {};
    try {
        await axios.post(
            `/api/v1/users/${passwordForm.userId}/reset-password`,
            {
                password: passwordForm.newPassword,
                password_confirmation: passwordForm.confirmPassword,
            },
        );

        showChangePasswordDialog.value = false;
        passwordForm.userId = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        toast.success('Kata sandi berhasil diubah!');
        dataTable.actions.refresh();
    } catch (error: any) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
            toast.error('Mohon perbaiki kesalahan validasi data.');
        } else {
            console.error('Error changing password:', error);
            toast.error('Gagal mengubah kata sandi.');
        }
    } finally {
        loading.value = false;
    }
};

const handleDeleteUser = async () => {
    if (!userToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(`/api/v1/users/${userToDelete.value.id}`);
        showDeleteDialog.value = false;
        userToDelete.value = null;
        dataTable.actions.refresh();
        toast.success('User Pengguna berhasil dihapus!');
    } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await fetchRoles();
});
</script>

<template>
    <Head title="User Pengguna" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        User Pengguna
                    </h1>
                    <p class="text-muted-foreground">
                        Pengaturan user pengguna dan hak akses
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        @click="showFilters = !showFilters"
                        :class="{ 'ring-2 ring-primary': hasActiveFilters }"
                    >
                        <FilterIcon class="mr-2 h-4 w-4" />
                        Filter
                        <span
                            v-if="hasActiveFilters"
                            class="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                        >
                            !
                        </span>
                    </Button>
                    <Button @click="createUser">
                        <PlusIcon class="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>
            </div>

            <!-- Filter Panel -->
            <div
                v-if="showFilters"
                class="space-y-4 rounded-lg border bg-white p-4 dark:bg-gray-900"
            >
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold">Filter Data</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        @click="showFilters = false"
                    >
                        <XIcon class="h-4 w-4" />
                    </Button>
                </div>

                <div
                    class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                    <!-- Filter by Unit -->
                    <div class="space-y-2">
                        <Label for="filter-unit">Unit/Organisasi</Label>
                        <UnitSelect
                            id="filter-unit"
                            v-model="filterUnitId"
                            placeholder="Semua Unit"
                            :searchable="true"
                            @update:model-value="applyFilters"
                        />
                    </div>

                    <!-- Filter by Role -->
                    <div class="space-y-2">
                        <Label for="filter-role">Role</Label>
                        <Select
                            v-model="filterRole"
                            @update:model-value="applyFilters"
                        >
                            <SelectTrigger id="filter-role" class="w-full">
                                <SelectValue placeholder="Semua Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="option in roleFilterOptions"
                                    :key="option.value || 'all'"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <!-- Active Filters Display -->
                <div
                    v-if="hasActiveFilters"
                    class="flex flex-wrap items-center gap-2"
                >
                    <span class="text-xs text-gray-500">Filter aktif:</span>

                    <!-- Role Filter Badge -->
                    <Badge
                        v-if="filterRole"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    >
                        Role:
                        {{
                            roleOptions.find((r) => r.value === filterRole)
                                ?.label || filterRole
                        }}
                        <button
                            @click="clearFilterRole"
                            class="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Unit Filter Badge -->
                    <Badge
                        v-if="filterUnitId"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    >
                        Unit ID: {{ filterUnitId }}
                        <button
                            @click="clearFilterUnit"
                            class="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Reset All Filters -->
                    <Button
                        variant="ghost"
                        size="sm"
                        @click="resetFilters"
                        class="h-7 text-xs"
                    >
                        Reset Semua
                    </Button>
                </div>
            </div>

            <!-- DataTable -->
            <DataTable
                :columns="dataTable.columns"
                :data="dataTable.data.value"
                :loading="dataTable.loading.value"
                :actions="dataTable.actions"
                searchable
                search-placeholder="Cari Pengguna"
                show-pagination
                show-page-info
                empty-message="Data pengguna ditemukan"
                server-side
                :total-rows="dataTable.state.value.pagination.total"
                :current-page="dataTable.state.value.pagination.page"
                :total-pages="dataTable.state.value.pagination.totalPages"
                :current-page-size="dataTable.state.value.pagination.perPage"
                :exportable="true"
                @search="dataTable.actions.search"
                @page-change="dataTable.actions.goToPage"
                @page-size-change="dataTable.actions.changePageSize"
                @sort-change="
                    (sortBy, sortOrder) =>
                        dataTable.actions.sort(sortBy, sortOrder === 'desc')
                "
            />
        </div>

        <!-- Create User Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="lg"
        >
            <FormDialog.Header
                title="Buat User Pengguna Baru"
                description="Tambahkan user pengguna baru ke sistem."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-2">
                    <Label for="create-name">Nama Lengkap</Label>
                    <Input
                        id="create-name"
                        v-model="userForm.name"
                        placeholder="Isikan nama lengkap"
                        :disabled="loading"
                    />
                    <p v-if="errors.name" class="text-xs text-red-500">
                        {{ errors.name[0] }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-username">Nama User Pengguna</Label>
                    <Input
                        id="create-username"
                        v-model="userForm.username"
                        placeholder="Isikan nama pengguna (huruf kecil, angka, ., _, -)"
                        :disabled="loading"
                        @input="
                            userForm.username = userForm.username.toLowerCase()
                        "
                    />
                    <p
                        v-if="usernameValidationMessage"
                        class="text-xs text-red-500"
                    >
                        {{ usernameValidationMessage }}
                    </p>
                    <p v-if="errors.username" class="text-xs text-red-500">
                        {{ errors.username[0] }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-email">Alamat Email</Label>
                    <Input
                        id="create-email"
                        v-model="userForm.email"
                        type="email"
                        placeholder="Isikan alamat email"
                        :disabled="loading"
                    />
                    <p
                        v-if="emailValidationMessage"
                        class="text-xs text-red-500"
                    >
                        {{ emailValidationMessage }}
                    </p>
                    <p v-if="errors.email" class="text-xs text-red-500">
                        {{ errors.email[0] }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="create-password">Kata Sandi</Label>
                    <div class="relative">
                        <Input
                            id="create-password"
                            v-model="userForm.password"
                            :type="showCreatePassword ? 'text' : 'password'"
                            placeholder="Isikan kata sandi (min 8 karakter dengan huruf besar, kecil, angka, karakter khusus)"
                            :disabled="loading"
                            class="pr-10"
                        />
                        <button
                            type="button"
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                            @click="showCreatePassword = !showCreatePassword"
                            :disabled="loading"
                        >
                            <EyeOff v-if="showCreatePassword" class="h-4 w-4" />
                            <Eye v-else class="h-4 w-4" />
                        </button>
                    </div>
                    <p
                        v-if="passwordValidationMessage"
                        class="text-xs text-red-500"
                    >
                        {{ passwordValidationMessage }}
                    </p>
                    <p v-if="errors.password" class="text-xs text-red-500">
                        {{ errors.password[0] }}
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="create-unit">Unit/Organisasi</Label>
                        <UnitSelect
                            id="create-unit"
                            v-model="userForm.unit_id"
                            :disabled="loading"
                            placeholder="Pilih unit/organisasi"
                            :searchable="true"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-position">Jabatan</Label>
                        <Input
                            id="create-position"
                            v-model="userForm.position"
                            placeholder="Isikan jabatan"
                            :disabled="loading"
                        />
                        <p v-if="errors.position" class="text-xs text-red-500">
                            {{ errors.position[0] }}
                        </p>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="create-role">Role</Label>
                    <Select v-model="userForm.role" :disabled="loading">
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih peran" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="option in roleOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p v-if="errors.role" class="text-xs text-red-500">
                        {{ errors.role[0] }}
                    </p>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat User Pengguna"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateUser"
            />
        </FormDialog>

        <!-- Update User Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="lg">
            <FormDialog.Header
                title="Update User Pengguna"
                description="Perbarui informasi pengguna dan izin akses."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-2">
                    <Label for="edit-name">Nama Lengkap</Label>
                    <Input
                        id="edit-name"
                        v-model="userForm.name"
                        placeholder="Isikan nama lengkap"
                        :disabled="loading"
                    />
                    <p v-if="errors.name" class="text-xs text-red-500">
                        {{ errors.name[0] }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="edit-username">Nama User Pengguna</Label>
                    <Input
                        id="edit-username"
                        v-model="userForm.username"
                        placeholder="Isikan nama pengguna (huruf kecil, angka, ., _, -)"
                        :disabled="loading"
                        @input="
                            userForm.username = userForm.username.toLowerCase()
                        "
                    />
                    <p
                        v-if="usernameValidationMessage"
                        class="text-xs text-red-500"
                    >
                        {{ usernameValidationMessage }}
                    </p>
                    <p v-if="errors.username" class="text-xs text-red-500">
                        {{ errors.username[0] }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="edit-email">Alamat Email</Label>
                    <Input
                        id="edit-email"
                        v-model="userForm.email"
                        type="email"
                        placeholder="Isikan alamat email"
                        :disabled="loading"
                    />
                    <p
                        v-if="emailValidationMessage"
                        class="text-xs text-red-500"
                    >
                        {{ emailValidationMessage }}
                    </p>
                    <p v-if="errors.email" class="text-xs text-red-500">
                        {{ errors.email[0] }}
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="edit-unit">Unit/Organisasi</Label>
                        <UnitSelect
                            id="edit-unit"
                            v-model="userForm.unit_id"
                            :disabled="loading"
                            placeholder="Pilih unit/organisasi"
                            :searchable="true"
                        />
                        <p v-if="errors.unit_id" class="text-xs text-red-500">
                            {{ errors.unit_id[0] }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-position">Jabatan</Label>
                        <Input
                            id="edit-position"
                            v-model="userForm.position"
                            placeholder="Isikan jabatan"
                            :disabled="loading"
                        />
                        <p v-if="errors.position" class="text-xs text-red-500">
                            {{ errors.position[0] }}
                        </p>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label for="edit-role">Role</Label>
                    <Select v-model="userForm.role" :disabled="loading">
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih peran" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="option in roleOptions"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p v-if="errors.role" class="text-xs text-red-500">
                        {{ errors.role[0] }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label>Password</Label>
                    <Button
                        type="button"
                        variant="outline"
                        @click="openChangePasswordDialog(userForm.id)"
                        :disabled="loading"
                    >
                        Ubah Kata Sandi
                    </Button>
                    <p class="text-xs text-muted-foreground">
                        Klik untuk mengubah kata sandi pengguna
                    </p>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update User Pengguna"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateUser"
            />
        </FormDialog>

        <!-- Delete User Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            :loading="loading"
            size="sm"
        >
            <FormDialog.Header
                title="Hapus User Pengguna"
                description="Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun pengguna secara permanen."
            />

            <FormDialog.Content>
                <div class="rounded-md border border-red-200 bg-red-50 p-4">
                    <p class="text-sm text-red-800">
                        Anda akan menghapus pengguna:
                        <strong>{{ userToDelete?.name }}</strong> ({{
                            userToDelete?.email
                        }})
                    </p>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Hapus User Pengguna"
                submit-variant="destructive"
                cancel-text="Batal Hapus"
                :loading="loading"
                @submit="handleDeleteUser"
            />
        </FormDialog>

        <!-- Change Password Dialog -->
        <FormDialog
            v-model:open="showChangePasswordDialog"
            :loading="loading"
            size="md"
        >
            <FormDialog.Header
                title="Ubah Kata Sandi"
                description="Tetapkan kata sandi baru untuk pengguna ini."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-2">
                    <Label for="new-password">Kata Sandi Baru</Label>
                    <div class="relative">
                        <Input
                            id="new-password"
                            v-model="passwordForm.newPassword"
                            :type="showNewPassword ? 'text' : 'password'"
                            placeholder="Isikan kata sandi baru (min 8 karakter dengan huruf besar, kecil, angka, karakter khusus)"
                            :disabled="loading"
                            class="pr-10"
                        />
                        <button
                            type="button"
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                            @click="showNewPassword = !showNewPassword"
                        >
                            <EyeOff v-if="showNewPassword" class="h-4 w-4" />
                            <Eye v-else class="h-4 w-4" />
                        </button>
                    </div>
                    <p
                        v-if="changePasswordValidationMessage"
                        class="text-xs text-red-500"
                    >
                        {{ changePasswordValidationMessage }}
                    </p>
                    <p v-if="errors.password" class="text-xs text-red-500">
                        {{ errors.password[0] }}
                    </p>
                </div>

                <div class="space-y-2">
                    <Label for="confirm-password">Konfirmasi Kata Sandi</Label>
                    <div class="relative">
                        <Input
                            id="confirm-password"
                            v-model="passwordForm.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            placeholder="Konfirmasi kata sandi baru"
                            :disabled="loading"
                            class="pr-10"
                        />
                        <button
                            type="button"
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                            @click="showConfirmPassword = !showConfirmPassword"
                        >
                            <EyeOff
                                v-if="showConfirmPassword"
                                class="h-4 w-4"
                            />
                            <Eye v-else class="h-4 w-4" />
                        </button>
                    </div>
                    <p
                        v-if="passwordForm.confirmPassword && !passwordsMatch"
                        class="text-xs text-red-500"
                    >
                        Kata sandi tidak cocok
                    </p>
                    <p
                        v-if="errors.password_confirmation"
                        class="text-xs text-red-500"
                    >
                        {{ errors.password_confirmation[0] }}
                    </p>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Ubah Kata Sandi"
                cancel-text="Batal"
                :loading="loading"
                :valid="isChangePasswordFormValid"
                @submit="handleChangePassword"
            />
        </FormDialog>
    </AppLayout>
</template>
