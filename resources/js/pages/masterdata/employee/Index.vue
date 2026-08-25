<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import UnitSelect from '@/pages/masterdata/components/UnitSelect.vue';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import {
    BadgeCheckIcon,
    EditIcon,
    PlusIcon,
    TrashIcon,
    XCircleIcon,
} from 'lucide-vue-next';
import { computed, h, reactive, ref } from 'vue';
import ParameterSelect from '../components/ParameterSelect.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Pegawai',
        href: '',
    },
];

interface Employee {
    id: number;
    employee_no: string;
    nik: string;
    name: string;
    unit_id: number;
    employee_type_id: string;
    phone: string;
    email: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    is_active: boolean;
    unit?: {
        id: number;
        name: string;
    };
}

// employee columns
const columns: ColumnDef<Employee>[] = [
    createColumn({
        value: 'nik',
        title: 'NIK',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.nik || '-';
        },
    }),
    createColumn({
        value: 'name',
        title: 'Nama Pegawai',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.name;
        },
    }),
    createColumn({
        value: 'unit',
        title: 'Unit',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.unit?.unit_name || '-';
        },
    }),
    createColumn({
        value: 'employee_type_id',
        title: 'Jabatan',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.employee_type.name || '-';
        },
    }),
    createColumn({
        value: 'is_active',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const isActive = !!row.original.is_active;

            if (isActive) {
                return h(
                    Badge,
                    {
                        variant: 'secondary',
                        class: 'bg-blue-500 text-white',
                    },
                    [h(BadgeCheckIcon), 'Aktif'],
                );
            } else {
                return h(
                    Badge,
                    {
                        variant: 'destructive',
                    },
                    [h(XCircleIcon), 'Non Aktif'],
                );
            }
        },
    }),

    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: Employee) => updateEmployee(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: Employee) => deleteEmployee(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/employees',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari pegawai...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
});

// management states
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const loading = ref(false);

// form data
const employeeForm = reactive({
    id: '',
    employee_no: '',
    nik: '',
    name: '',
    unit_id: 0,
    employee_type_id: 0,
    phone: '',
    email: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    is_active: true,
});

const employeeToDelete = ref<Employee | null>(null);

// reset form
const resetForm = () => {
    Object.assign(employeeForm, {
        id: '',
        employee_no: '',
        nik: '',
        name: '',
        unit_id: '',
        employee_type_id: '',
        phone: '',
        email: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        is_active: true,
    });
};

// init form data
const createEmployee = async () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateEmployee = async (employee: Employee) => {
    Object.assign(employeeForm, {
        id: employee.id,
        employee_no: employee.employee_no,
        nik: employee.nik || '',
        name: employee.name,
        unit_id: employee.unit_id || '',
        employee_type_id: employee.employee_type_id || '',
        phone: employee.phone || '',
        email: employee.email || '',
        bank_name: employee.bank_name || '',
        bank_account_number: employee.bank_account_number || '',
        bank_account_name: employee.bank_account_name || '',
        is_active: employee.is_active ?? true,
    });

    showEditDialog.value = true;
};

const deleteEmployee = (employee: Employee) => {
    employeeToDelete.value = employee;
    showDeleteDialog.value = true;
};

// validation
const isFormValid = computed(() => {
    return employeeForm.nik.trim() !== '' && employeeForm.name.trim() !== '';
});

// handle create employee
const handleCreateEmployee = async () => {
    loading.value = true;
    try {
        await axios.post('/api/v1/employees', employeeForm);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error creating employee:', error);
    } finally {
        loading.value = false;
    }
};

// handle update employee
const handleUpdateEmployee = async () => {
    loading.value = true;
    try {
        await axios.put(`/api/v1/employees/${employeeForm.id}`, employeeForm);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error updating employee:', error);
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteEmployee = async () => {
    if (!employeeToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(`/api/v1/employees/${employeeToDelete.value.id}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showDeleteDialog.value = false;
        employeeToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error deleting employee:', error);
    } finally {
        loading.value = false;
    }
};

const handleCancelCreate = () => {
    resetForm();
    showCreateDialog.value = false;
};

const handleCancelEdit = () => {
    resetForm();
    showEditDialog.value = false;
};
</script>

<template>
    <Head title="Pegawai" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Pegawai</h1>
                    <p class="text-muted-foreground">Pengaturan data pegawai</p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createEmployee">
                        <PlusIcon />
                        Tambah
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
                search-placeholder="Cari Pegawai"
                show-pagination
                show-page-info
                empty-message="Data pegawai tidak ditemukan"
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

        <!-- Create Employee Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="lg"
            @close="handleCancelCreate"
        >
            <FormDialog.Header
                title="Tambah Pegawai"
                description="Menambahkan informasi pegawai baru."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div class="space-y-2">
                            <Label for="create-nik">NIK</Label>
                            <Input
                                id="create-nik"
                                v-model="employeeForm.nik"
                                placeholder="Isikan NIK"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-name">Nama Pegawai</Label>
                            <Input
                                id="create-name"
                                v-model="employeeForm.name"
                                placeholder="Isikan nama pegawai"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-unit">Unit</Label>
                            <UnitSelect
                                v-model="employeeForm.unit_id"
                                id="create-unit"
                                :disabled="loading"
                                :searchable="false"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-employee_type">Tipe Pegawai</Label>
                            <ParameterSelect id="create-employee_type"
                                group-code="EMPLOYEE_TYPE"
                                v-model="employeeForm.employee_type_id"
                                :disabled="loading"
                                placeholder="Pilih Tipe Pegawai"
                                :searchable="false"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-phone">Telepon</Label>
                            <Input
                                id="create-phone"
                                v-model="employeeForm.phone"
                                placeholder="Isikan nomor telepon"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-email">Email</Label>
                            <Input
                                id="create-email"
                                v-model="employeeForm.email"
                                type="email"
                                placeholder="Isikan alamat email"
                                :disabled="loading"
                            />
                        </div>
                    </div>
                </div>

                <!-- Informasi Bank -->
                <div class="space-y-4">
                    <h3
                        class="mb-3 text-sm font-semibold"
                    >
                        Informasi Rekening Bank
                    </h3>
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div class="space-y-2">
                            <Label for="create-bank-name">Nama Bank</Label>
                            <Input
                                id="create-bank-name"
                                v-model="employeeForm.bank_name"
                                placeholder="Isikan nama bank"
                                :disabled="loading"
                            />
                            <p class="text-xs text-gray-500">
                                Contoh: Bank Mandiri, BCA, BRI
                            </p>
                        </div>

                        <div class="space-y-2">
                            <Label for="create-bank-account-number"
                                >No. Rekening</Label
                            >
                            <Input
                                id="create-bank-account-number"
                                v-model="employeeForm.bank_account_number"
                                placeholder="Isikan nomor rekening"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-bank-account-name"
                                >Nama Pemilik Rekening</Label
                            >
                            <Input
                                id="create-bank-account-name"
                                v-model="employeeForm.bank_account_name"
                                placeholder="Isikan nama pemilik rekening"
                                :disabled="loading"
                            />
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Pegawai"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateEmployee"
            />
        </FormDialog>

        <!-- Edit Employee Dialog -->
        <FormDialog
            v-model:open="showEditDialog"
            :loading="loading"
            size="lg"
            @close="handleCancelEdit"
        >
            <FormDialog.Header
                title="Update Pegawai"
                description="Memperbaharui informasi pegawai."
            />

            <FormDialog.Content spacing="md">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div class="space-y-2">
                            <Label for="edit-nik">NIK</Label>
                            <Input
                                id="edit-nik"
                                v-model="employeeForm.nik"
                                placeholder="Isikan NIK"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-name">Nama Pegawai</Label>
                            <Input
                                id="edit-name"
                                v-model="employeeForm.name"
                                placeholder="Isikan nama pegawai"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-unit">Unit</Label>
                            <UnitSelect
                                v-model="employeeForm.unit_id"
                                id="create-unit"
                                :disabled="loading"
                                :searchable="false"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-employee_type">Jabatan</Label>
                            <ParameterSelect id="dit-employee_type"
                                group-code="EMPLOYEE_TYPE"
                                v-model="employeeForm.employee_type_id"
                                :disabled="loading"
                                placeholder="Pilih Tipe Pegawai"
                                :searchable="false"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-phone">Telepon</Label>
                            <Input
                                id="edit-phone"
                                v-model="employeeForm.phone"
                                placeholder="Isikan nomor telepon"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                v-model="employeeForm.email"
                                type="email"
                                placeholder="Isikan alamat email"
                                :disabled="loading"
                            />
                        </div>
                    </div>
                </div>

                <!-- Informasi Bank -->
                <div class="space-y-4">
                    <h3
                        class="mb-3 text-sm font-semibold"
                    >
                        Informasi Rekening Bank
                    </h3>
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div class="space-y-2">
                            <Label for="edit-bank-name">Nama Bank</Label>
                            <Input
                                id="edit-bank-name"
                                v-model="employeeForm.bank_name"
                                placeholder="Isikan nama bank"
                                :disabled="loading"
                            />
                            <p class="text-xs text-gray-500">
                                Contoh: Bank Mandiri, BCA, BRI
                            </p>
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-bank-account-number"
                                >No. Rekening</Label
                            >
                            <Input
                                id="edit-bank-account-number"
                                v-model="employeeForm.bank_account_number"
                                placeholder="Isikan nomor rekening"
                                :disabled="loading"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-bank-account-name"
                                >Nama Pemilik Rekening</Label
                            >
                            <Input
                                id="edit-bank-account-name"
                                v-model="employeeForm.bank_account_name"
                                placeholder="Isikan nama pemilik rekening"
                                :disabled="loading"
                            />
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Pegawai"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateEmployee"
            />
        </FormDialog>

        <!-- Delete Employee Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            title="Hapus Pegawai"
            description="Proses ini tidak dapat dibatalkan. Pegawai akan dihapus secara permanen."
            :loading="loading"
            submit-text="Hapus Pegawai"
            submit-variant="destructive"
            cancel-text="Batal"
            size="sm"
            @submit="handleDeleteEmployee"
        >
            <div class="rounded-md border border-red-200 bg-red-50 p-4">
                <p class="text-sm text-red-800">
                    Apakah kamu yakin akan menghapus pegawai:
                    <strong>{{ employeeToDelete?.nik }}</strong> -
                    {{ employeeToDelete?.name }}
                </p>
            </div>
        </FormDialog>
    </AppLayout>
</template>
