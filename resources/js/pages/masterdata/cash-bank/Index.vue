<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
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
import BankSelect from '../components/BankSelect.vue';

interface CashBank {
    id: string;
    code: string;
    name: string;
    type: 'cash' | 'bank';
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
    is_active: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Kas Bank',
        href: '',
    },
];

// cash bank columns
const columns: ColumnDef<CashBank>[] = [
    createColumn({
        value: 'code',
        title: 'Kode',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.code;
        },
    }),

    createColumn({
        value: 'name',
        title: 'Nama Kas/Bank',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.name;
        },
    }),

    createColumn({
        value: 'type',
        title: 'Tipe',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const type = row.original.type;
            const typeLabel = type === 'cash' ? 'Kas' : 'Bank';
            const badgeClass = type === 'cash' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white';

            return h(
                Badge,
                {
                    variant: 'secondary',
                    class: `${badgeClass} text-white border-none`,
                },
                typeLabel,
            );
        },
    }),

    createColumn({
        value: 'bank_name',
        title: 'Nama Bank',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.bank_name || '-';
        },
    }),

    createColumn({
        value: 'account_number',
        title: 'No. Rekening',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const accountNumber = row.original.account_number || '-';
            const accountName = row.original.account_name;

            return h('div', { class: 'flex flex-col' }, [
                // Baris nomor rekening
                h(
                    'span',
                    { class: 'font-medium text-sm text-foreground' },
                    accountNumber,
                ),

                // Baris nama rekening dengan teks "A.n." jika data tersedia
                accountName
                    ? h(
                          'span',
                          { class: 'text-xs text-muted-foreground mt-0.5' },
                          `A.n. ${accountName}`,
                      )
                    : null,
            ]);
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
            onClick: (row: CashBank) => updateCashBank(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: CashBank) => deleteCashBank(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/cash-banks',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari cash/bank...',
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
const cashBankForm = reactive({
    id: '',
    code: '',
    name: '',
    type: '' as 'cash' | 'bank' | '',
    bank_name: '',
    account_number: '',
    account_name: '',
    is_active: true,
});

const cashBankToDelete = ref<CashBank | null>(null);

// reset form
const resetForm = () => {
    Object.assign(cashBankForm, {
        id: '',
        code: '',
        name: '',
        type: '' as 'cash' | 'bank' | '',
        bank_name: '',
        account_number: '',
        account_name: '',
        is_active: true,
    });
};

// init form data
const createCashBank = async () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateCashBank = async (cashBank: CashBank) => {
    Object.assign(cashBankForm, {
        id: cashBank.id,
        code: cashBank.code,
        name: cashBank.name,
        type: cashBank.type,
        bank_name: cashBank.bank_name || '',
        account_number: cashBank.account_number || '',
        account_name: cashBank.account_name || '',
        is_active: cashBank.is_active,
    });

    showEditDialog.value = true;
};

const deleteCashBank = (cashBank: CashBank) => {
    cashBankToDelete.value = cashBank;
    showDeleteDialog.value = true;
};

// validation
const isFormValid = computed(() => {
    const baseValid =
        cashBankForm.code.trim() !== '' &&
        cashBankForm.name.trim() !== '' &&
        cashBankForm.type !== '';

    // Additional validation for bank type
    if (cashBankForm.type === 'bank') {
        return (
            baseValid &&
            cashBankForm.bank_name !== '' &&
            cashBankForm.account_number.trim() !== '' &&
            cashBankForm.account_name.trim() !== ''
        );
    }

    return baseValid;
});

// handle create cash bank
const handleCreateCashBank = async () => {
    loading.value = true;
    try {
        const payload = {
            ...cashBankForm,
            bank_name:
                cashBankForm.type === 'bank' ? cashBankForm.bank_name : null,
            account_number:
                cashBankForm.type === 'bank'
                    ? cashBankForm.account_number
                    : null,
            account_name:
                cashBankForm.type === 'bank' ? cashBankForm.account_name : null,
        };

        await axios.post('/api/v1/cash-banks', payload);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error creating cash bank:', error);
    } finally {
        loading.value = false;
    }
};

// handle update cash bank
const handleUpdateCashBank = async () => {
    loading.value = true;
    try {
        const payload = {
            ...cashBankForm,
            bank_name:
                cashBankForm.type === 'bank' ? cashBankForm.bank_name : null,
            account_number:
                cashBankForm.type === 'bank'
                    ? cashBankForm.account_number
                    : null,
            account_name:
                cashBankForm.type === 'bank' ? cashBankForm.account_name : null,
        };

        await axios.put(`/api/v1/cash-banks/${cashBankForm.id}`, payload);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error updating cash bank:', error);
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteCashBank = async () => {
    if (!cashBankToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(`/api/v1/cash-banks/${cashBankToDelete.value.id}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showDeleteDialog.value = false;
        cashBankToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error deleting cash bank:', error);
    } finally {
        loading.value = false;
    }
};

// Watch for type changes
const handleTypeChange = (value: string) => {
    cashBankForm.type = value as 'cash' | 'bank';
};
</script>

<template>
    <Head title="Cash & Bank" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Kas Bank</h1>
                    <p class="text-muted-foreground">
                        Pengaturan data akun cash dan bank
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createCashBank">
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
                search-placeholder="Cari Cash/Bank"
                show-pagination
                show-page-info
                empty-message="Data cash/bank tidak ditemukan"
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

        <!-- Create Cash Bank Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="xl"
        >
            <FormDialog.Header
                title="Tambah Kas/Bank"
                description="Menambahkan informasi akun cash atau bank baru."
            />

            <FormDialog.Content spacing="md">
                <!-- Section 1: Informasi Utama -->
                <div class="space-y-6">
                    <div
                        class="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2"
                    >
                        <div class="space-y-2">
                            <Label for="create-code" class="text-sm font-medium"
                                >Kode Kas/Bank
                                <span class="text-red-500">*</span></Label
                            >
                            <Input
                                id="create-code"
                                v-model="cashBankForm.code"
                                placeholder="Isikan kode kas/bank"
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-name" class="text-sm font-medium"
                                >Nama Kas/Bank
                                <span class="text-red-500">*</span></Label
                            >
                            <Input
                                id="create-name"
                                v-model="cashBankForm.name"
                                placeholder="Isikan nama (Ex: Kas Kecil) "
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="create-type" class="text-sm font-medium"
                                >Tipe <span class="text-red-500">*</span></Label
                            >
                            <Select
                                :model-value="cashBankForm.type"
                                @update:model-value="handleTypeChange"
                            >
                                <SelectTrigger
                                    id="create-type"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih tipe akun"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Kas</SelectItem>
                                    <SelectItem value="bank">Bank</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Transition
                        enter-active-class="transition duration-200 ease-out"
                        enter-from-class="transform scale-95 opacity-0"
                        enter-to-class="transform scale-100 opacity-100"
                    >
                        <div
                            v-if="cashBankForm.type === 'bank'"
                            class="mt-8 border-t pt-6"
                        >
                            <div class="mb-6 flex items-center gap-2">
                                <h3 class="text-base font-bold text-foreground">
                                    Detail Rekening Bank
                                </h3>
                            </div>

                            <div
                                class="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2"
                            >
                                <div class="space-y-2">
                                    <Label
                                        for="create-bank_name"
                                        class="text-sm font-medium"
                                        >Nama Bank
                                        <span class="text-red-500"
                                            >*</span
                                        ></Label
                                    >
                                    <BankSelect
                                            v-model="cashBankForm.bank_name"
                                            :disabled="loading"
                                            :searchable="true"
                                        />
                                </div>

                                <div class="space-y-2">
                                    <Label
                                        for="create-account_number"
                                        class="text-sm font-medium"
                                        >Nomor Rekening
                                        <span class="text-red-500"
                                            >*</span
                                        ></Label
                                    >
                                    <Input
                                        id="create-account_number"
                                        v-model="cashBankForm.account_number"
                                        placeholder="Isikan nomor rekening"
                                        :disabled="loading"
                                    />
                                </div>

                                <div class="space-y-2 md:col-span-2">
                                    <Label
                                        for="create-account_name"
                                        class="text-sm font-medium"
                                        >Nama Pemilik Rekening
                                        <span class="text-red-500"
                                            >*</span
                                        ></Label
                                    >
                                    <Input
                                        id="create-account_name"
                                        v-model="cashBankForm.account_name"
                                        placeholder="Isikan nama pemilik rekening"
                                        :disabled="loading"
                                    />
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Simpan Kas/Bank Baru"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateCashBank"
            />
        </FormDialog>

        <!-- Edit Cash Bank Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="xl">
            <FormDialog.Header
                title="Update Cash/Bank"
                description="Memperbaharui informasi akun cash atau bank."
            />

            <FormDialog.Content spacing="xl" class="max-w-full">
                <!-- Section 1: Informasi Utama -->
                <div class="space-y-6">
                    <div
                        class="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2"
                    >
                        <div class="space-y-2">
                            <Label for="edit-code" class="text-sm font-medium"
                                >Kode Kas/Bank
                                <span class="text-red-500">*</span></Label
                            >
                            <Input
                                id="edit-code"
                                v-model="cashBankForm.code"
                                placeholder="Isikan kode kas/bank"
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-name" class="text-sm font-medium"
                                >Nama Kas/Bank
                                <span class="text-red-500">*</span></Label
                            >
                            <Input
                                id="edit-name"
                                v-model="cashBankForm.name"
                                placeholder="Isikan nama (Ex: Kas Kecil)"
                                :disabled="loading"
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="edit-type" class="text-sm font-medium"
                                >Tipe <span class="text-red-500">*</span></Label
                            >
                            <Select
                                :model-value="cashBankForm.type"
                                @update:model-value="handleTypeChange"
                            >
                                <SelectTrigger
                                    id="edit-type"
                                    :disabled="loading"
                                    class="w-full"
                                >
                                    <SelectValue
                                        placeholder="Pilih tipe akun"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Kas</SelectItem>
                                    <SelectItem value="bank">Bank</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <!-- Section 2: Informasi Bank (Hanya jika tipe bank) -->
                    <Transition
                        enter-active-class="transition duration-200 ease-out"
                        enter-from-class="transform scale-95 opacity-0"
                        enter-to-class="transform scale-100 opacity-100"
                    >
                        <div
                            v-if="cashBankForm.type === 'bank'"
                            class="mt-8 border-t pt-6"
                        >
                            <div class="mb-6 flex items-center gap-2">
                                <h3 class="text-base font-bold">
                                    Detail Rekening Bank
                                </h3>
                            </div>

                            <div
                                class="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2"
                            >
                                <div class="space-y-2">
                                    <Label
                                        for="edit-bank_name"
                                        class="text-sm font-medium"
                                        >Nama Bank
                                        <span class="text-red-500"
                                            >*</span
                                        ></Label
                                    >
                                    <Input
                                        id="edit-bank_name"
                                        v-model="cashBankForm.bank_name"
                                        placeholder="Isikan nama bank Ex: BCA, Mandiri, BRI"
                                        :disabled="loading"
                                    />
                                </div>

                                <div class="space-y-2">
                                    <Label
                                        for="edit-account_number"
                                        class="text-sm font-medium"
                                        >Nomor Rekening
                                        <span class="text-red-500"
                                            >*</span
                                        ></Label
                                    >
                                    <Input
                                        id="edit-account_number"
                                        v-model="cashBankForm.account_number"
                                        placeholder="Isikan nomor rekening"
                                        :disabled="loading"
                                    />
                                </div>

                                <div class="space-y-2 md:col-span-2">
                                    <Label
                                        for="edit-account_name"
                                        class="text-sm font-medium"
                                        >Nama Pemilik Rekening
                                        <span class="text-red-500"
                                            >*</span
                                        ></Label
                                    >
                                    <Input
                                        id="edit-account_name"
                                        v-model="cashBankForm.account_name"
                                        placeholder="Isikan name pemilik rekening"
                                        :disabled="loading"
                                    />
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Simpan Perubahan"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateCashBank"
            />
        </FormDialog>

        <!-- Delete Cash Bank Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            title="Hapus Cash/Bank"
            description="Proses ini tidak dapat dibatalkan. Data akan dihapus secara permanen."
            :loading="loading"
            submit-text="Hapus Kas/Bank"
            submit-variant="destructive"
            cancel-text="Batal"
            size="sm"
            @submit="handleDeleteCashBank"
        >
            <div class="rounded-md border border-red-200 bg-red-50 p-4">
                <p class="text-sm text-red-800">
                    Apakah kamu yakin akan menghapus akun:
                    <strong>{{ cashBankToDelete?.code }}</strong> -
                    {{ cashBankToDelete?.name }}
                    <span v-if="cashBankToDelete?.type === 'bank'">
                        ({{ cashBankToDelete?.bank_name }} -
                        {{ cashBankToDelete?.account_number }})
                    </span>
                </p>
            </div>
        </FormDialog>
    </AppLayout>
</template>
