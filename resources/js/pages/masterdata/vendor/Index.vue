<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Vendor',
        href: '',
    },
];

interface Vendor {
    id: number;
    vendor_code: string;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    tax_number: string;
    is_active: boolean;
}

// vendor columns
const columns: ColumnDef<Vendor>[] = [
    createColumn({
        value: 'vendor_code',
        title: 'Kode Vendor',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.vendor_code;
        },
    }),
    createColumn({
        value: 'name',
        title: 'Nama Vendor',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.name;
        },
    }),
    createColumn({
        value: 'contact_person',
        title: 'Kontak Person',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.contact_person || '-';
        },
    }),
    createColumn({
        value: 'phone',
        title: 'Telepon',
        sortable: false,
        searchable: true,
        render: ({ row }) => {
            return row.original.phone || '-';
        },
    }),
    createColumn({
        value: 'email',
        title: 'Email',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.email || '-';
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
            onClick: (row: Vendor) => updateVendor(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: Vendor) => deleteVendor(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/vendors',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari vendor...',
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
const vendorForm = reactive({
    id: '',
    vendor_code: '',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    tax_number: '',
    is_active: true,
});

const vendorToDelete = ref<Vendor | null>(null);

// reset form
const resetForm = () => {
    Object.assign(vendorForm, {
        id: '',
        vendor_code: '',
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        tax_number: '',
        is_active: true,
    });
};

// init form data
const createVendor = async () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateVendor = async (vendor: Vendor) => {
    Object.assign(vendorForm, {
        id: vendor.id,
        vendor_code: vendor.vendor_code,
        name: vendor.name,
        contact_person: vendor.contact_person || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        address: vendor.address || '',
        bank_name: vendor.bank_name || '',
        bank_account_number: vendor.bank_account_number || '',
        bank_account_name: vendor.bank_account_name || '',
        tax_number: vendor.tax_number || '',
        is_active: vendor.is_active ?? true,
    });

    showEditDialog.value = true;
};

const deleteVendor = (vendor: Vendor) => {
    vendorToDelete.value = vendor;
    showDeleteDialog.value = true;
};

// validation
const isFormValid = computed(() => {
    return (
        vendorForm.vendor_code.trim() !== '' &&
        vendorForm.name.trim() !== ''
    );
});

// handle create vendor
const handleCreateVendor = async () => {
    loading.value = true;
    try {
        await axios.post('/api/v1/vendors', vendorForm);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error creating vendor:', error);
    } finally {
        loading.value = false;
    }
};

// handle update vendor
const handleUpdateVendor = async () => {
    loading.value = true;
    try {
        await axios.put(`/api/v1/vendors/${vendorForm.id}`, vendorForm);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error updating vendor:', error);
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteVendor = async () => {
    if (!vendorToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(`/api/v1/vendors/${vendorToDelete.value.id}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showDeleteDialog.value = false;
        vendorToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error deleting vendor:', error);
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
    <Head title="Vendor" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Vendor</h1>
                    <p class="text-muted-foreground">
                        Pengaturan data vendor
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createVendor">
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
                search-placeholder="Cari Vendor"
                show-pagination
                show-page-info
                empty-message="Data vendor tidak ditemukan"
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

        <!-- Create Vendor Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="lg"
            @close="handleCancelCreate"
        >
            <FormDialog.Header
                title="Tambah Vendor"
                description="Menambahkan informasi vendor baru."
            />

            <FormDialog.Content spacing="md">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                        <Label for="create-vendor-code">Kode Vendor</Label>
                        <Input
                            id="create-vendor-code"
                            v-model="vendorForm.vendor_code"
                            placeholder="Isikan kode vendor"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-name">Nama Vendor</Label>
                        <Input
                            id="create-name"
                            v-model="vendorForm.name"
                            placeholder="Isikan nama vendor"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-contact-person">Kontak Person</Label>
                        <Input
                            id="create-contact-person"
                            v-model="vendorForm.contact_person"
                            placeholder="Isikan nama kontak person"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-phone">Telepon</Label>
                        <Input
                            id="create-phone"
                            v-model="vendorForm.phone"
                            placeholder="Isikan nomor telepon"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-email">Email</Label>
                        <Input
                            id="create-email"
                            v-model="vendorForm.email"
                            type="email"
                            placeholder="Isikan alamat email"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-tax-number">NPWP</Label>
                        <Input
                            id="create-tax-number"
                            v-model="vendorForm.tax_number"
                            placeholder="Isikan nomor NPWP"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2 md:col-span-2">
                        <Label for="create-address">Alamat</Label>
                        <Textarea
                            id="create-address"
                            v-model="vendorForm.address"
                            placeholder="Isikan alamat lengkap"
                            class="min-h-[80px] resize-none"
                            :maxlength="500"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-bank-name">Nama Bank</Label>
                        <Input
                            id="create-bank-name"
                            v-model="vendorForm.bank_name"
                            placeholder="Isikan nama bank"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-bank-account-number">No. Rekening</Label>
                        <Input
                            id="create-bank-account-number"
                            v-model="vendorForm.bank_account_number"
                            placeholder="Isikan nomor rekening"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="create-bank-account-name">Nama Pemilik Rekening</Label>
                        <Input
                            id="create-bank-account-name"
                            v-model="vendorForm.bank_account_name"
                            placeholder="Isikan nama pemilik rekening"
                            :disabled="loading"
                        />
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Vendor"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateVendor"
            />
        </FormDialog>

        <!-- Edit Vendor Dialog -->
        <FormDialog
            v-model:open="showEditDialog"
            :loading="loading"
            size="lg"
            @close="handleCancelEdit"
        >
            <FormDialog.Header
                title="Update Vendor"
                description="Memperbaharui informasi vendor."
            />

            <FormDialog.Content spacing="md">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-2">
                        <Label for="edit-vendor-code">Kode Vendor</Label>
                        <Input
                            id="edit-vendor-code"
                            v-model="vendorForm.vendor_code"
                            placeholder="Isikan kode vendor"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-name">Nama Vendor</Label>
                        <Input
                            id="edit-name"
                            v-model="vendorForm.name"
                            placeholder="Isikan nama vendor"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-contact-person">Kontak Person</Label>
                        <Input
                            id="edit-contact-person"
                            v-model="vendorForm.contact_person"
                            placeholder="Isikan nama kontak person"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-phone">Telepon</Label>
                        <Input
                            id="edit-phone"
                            v-model="vendorForm.phone"
                            placeholder="Isikan nomor telepon"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-email">Email</Label>
                        <Input
                            id="edit-email"
                            v-model="vendorForm.email"
                            type="email"
                            placeholder="Isikan alamat email"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-tax-number">NPWP</Label>
                        <Input
                            id="edit-tax-number"
                            v-model="vendorForm.tax_number"
                            placeholder="Isikan nomor NPWP"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2 md:col-span-2">
                        <Label for="edit-address">Alamat</Label>
                        <Textarea
                            id="edit-address"
                            v-model="vendorForm.address"
                            placeholder="Isikan alamat lengkap"
                            class="min-h-[80px] resize-none"
                            :maxlength="500"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-bank-name">Nama Bank</Label>
                        <Input
                            id="edit-bank-name"
                            v-model="vendorForm.bank_name"
                            placeholder="Isikan nama bank"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-bank-account-number">No. Rekening</Label>
                        <Input
                            id="edit-bank-account-number"
                            v-model="vendorForm.bank_account_number"
                            placeholder="Isikan nomor rekening"
                            :disabled="loading"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-bank-account-name">Nama Pemilik Rekening</Label>
                        <Input
                            id="edit-bank-account-name"
                            v-model="vendorForm.bank_account_name"
                            placeholder="Isikan nama pemilik rekening"
                            :disabled="loading"
                        />
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Vendor"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateVendor"
            />
        </FormDialog>

        <!-- Delete Vendor Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            title="Hapus Vendor"
            description="Proses ini tidak dapat dibatalkan. Vendor akan dihapus secara permanen."
            :loading="loading"
            submit-text="Hapus Vendor"
            submit-variant="destructive"
            cancel-text="Batal"
            size="sm"
            @submit="handleDeleteVendor"
        >
            <div class="rounded-md border border-red-200 bg-red-50 p-4">
                <p class="text-sm text-red-800">
                    Apakah kamu yakin akan menghapus vendor:
                    <strong>{{ vendorToDelete?.vendor_code }}</strong> - {{
                        vendorToDelete?.name
                    }}
                </p>
            </div>
        </FormDialog>
    </AppLayout>
</template>