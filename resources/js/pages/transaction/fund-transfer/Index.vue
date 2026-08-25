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
import axios, { AxiosError } from 'axios';
import {
    AlertCircleIcon,
    BanIcon,
    CheckCircleIcon,
    ClockIcon,
    EditIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-vue-next';
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

// Types
interface FundSource {
    id: number;
    code: string;
    name: string;
}

interface FundTransfer {
    id: number;
    transfer_no: string;
    transfer_date: string;
    from_fund_source_id: number;
    to_fund_source_id: number;
    transfer_type: string;
    amount: number;
    source_type: string;
    source_id: number;
    status: string;
    completed_at: string;
    reference_no: string;
    notes: string;
    from_fund_source?: FundSource;
    to_fund_source?: FundSource;
    created_by: number;
    updated_by: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Transfer Dana',
        href: '',
    },
];

// Enum untuk transfer type
const transferTypes = [
    { value: 'disbursement', label: 'Pengajuan Pencairan' },
    { value: 'withdrawal', label: 'Tarik Tunai' },
    { value: 'deposit', label: 'Setoran' },
    { value: 'adjustment', label: 'Penyesuaian' },
] as const;

// Enum untuk status
const statusTypes = [
    { value: 'draft', label: 'Dibuat' },
    { value: 'completed', label: 'Dibayarkan' },
] as const;

// Status badge helper
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'completed':
            return {
                variant: 'secondary',
                class: 'bg-green-500 text-white gap-1',
                icon: CheckCircleIcon,
                label: 'Dibayarkan',
            };
        case 'draft':
            return {
                variant: 'secondary',
                class: 'bg-yellow-500 text-white gap-1',
                icon: ClockIcon,
                label: 'Dibuat',
            };
        default:
            return {
                variant: 'secondary',
                class: 'bg-gray-500 text-white gap-1',
                icon: BanIcon,
                label: status,
            };
    }
};

// Transfer Type badge helper
const getTransferTypeBadge = (type: string) => {
    switch (type) {
        case 'disbursement':
            return { class: 'bg-blue-100 text-blue-700 border-blue-200' };
        case 'withdrawal':
            return { class: 'bg-red-100 text-red-700 border-red-200' };
        case 'deposit':
            return { class: 'bg-green-100 text-green-700 border-green-200' };
        case 'adjustment':
            return { class: 'bg-purple-100 text-purple-700 border-purple-200' };
        default:
            return { class: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
};

// fund transfer columns
const columns: ColumnDef<FundTransfer>[] = [
    createColumn({
        value: 'transfer_no',
        title: 'No. Transfer',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => {
            return row.original.transfer_no;
        },
    }),
    createColumn({
        value: 'transfer_date',
        title: 'Tanggal',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const dateValue = row.original.transfer_date;
            if (!dateValue) return '-';

            return new Date(dateValue).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        },
    }),
    createColumn({
        value: 'transfer_type',
        title: 'Tipe Transfer',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const type = row.original.transfer_type;
            const matchedType = transferTypes.find((t) => t.value === type);
            const badgeClass = getTransferTypeBadge(type);

            return h(
                Badge,
                {
                    variant: 'secondary',
                    class: badgeClass.class,
                },
                matchedType ? matchedType.label : type,
            );
        },
    }),
    createColumn({
        value: 'from_fund_source_id',
        title: 'Dari',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.from_fund_source?.name || '-';
        },
    }),
    createColumn({
        value: 'to_fund_source_id',
        title: 'Ke',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return row.original.to_fund_source?.name || '-';
        },
    }),
    createColumn({
        value: 'amount',
        title: 'Jumlah',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(row.original.amount || 0);
        },
    }),
    createColumn({
        value: 'status',
        title: 'Status',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const status = row.original.status;
            const badge = getStatusBadge(status);

            return h(
                Badge,
                {
                    variant: 'secondary',
                    class: badge.class,
                },
                [h(badge.icon, { class: 'w-4 h-4' }), badge.label],
            );
        },
    }),

    createActionColumn([
        {
            icon: EditIcon,
            variant: 'default',
            onClick: (row: FundTransfer) => updateFundTransfer(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            onClick: (row: FundTransfer) => deleteFundTransfer(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/fund-transfers',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari transfer dana...',
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

// Fund sources data
const fundSources = ref<FundSource[]>([]);
const loadingFundSources = ref(false);

// form data
const fundTransferForm = reactive({
    id: '',
    transfer_no: '',
    transfer_date: new Date().toISOString().split('T')[0],
    from_fund_source_id: null as number | null,
    to_fund_source_id: null as number | null,
    transfer_type: '' as string,
    amount: 0,
    reference_no: '',
    notes: '',
    status: 'draft' as string,
});

const fundTransferToDelete = ref<FundTransfer | null>(null);

// Individual field errors
const fieldErrors = reactive({
    transfer_date: [] as string[],
    transfer_type: [] as string[],
    from_fund_source_id: [] as string[],
    to_fund_source_id: [] as string[],
    amount: [] as string[],
    reference_no: [] as string[],
    notes: [] as string[],
    status: [] as string[],
    general: [] as string[],
});

const showValidationErrors = ref(false);

// Fetch fund sources
const fetchFundSources = async () => {
    loadingFundSources.value = true;
    try {
        const { data } = await axios.get('/api/v1/select/fund-sources');
        fundSources.value = data.data || [];
    } catch (error) {
        console.error('Error fetching fund sources:', error);
        toast.error('Gagal memuat data sumber dana');
    } finally {
        loadingFundSources.value = false;
    }
};

// Reset validation
const resetValidation = () => {
    fieldErrors.transfer_date = [];
    fieldErrors.transfer_type = [];
    fieldErrors.from_fund_source_id = [];
    fieldErrors.to_fund_source_id = [];
    fieldErrors.amount = [];
    fieldErrors.reference_no = [];
    fieldErrors.notes = [];
    fieldErrors.status = [];
    fieldErrors.general = [];
    showValidationErrors.value = false;
};

// Validation function
const validateForm = (): boolean => {
    // Reset errors
    resetValidation();

    // Transfer Date validation
    if (
        !fundTransferForm.transfer_date ||
        fundTransferForm.transfer_date.trim() === ''
    ) {
        fieldErrors.transfer_date.push('Tanggal transfer wajib diisi');
    } else {
        const transferDate = new Date(fundTransferForm.transfer_date);
        if (isNaN(transferDate.getTime())) {
            fieldErrors.transfer_date.push('Format tanggal tidak valid');
        }
    }

    // Transfer Type validation
    if (
        !fundTransferForm.transfer_type ||
        fundTransferForm.transfer_type.trim() === ''
    ) {
        fieldErrors.transfer_type.push('Tipe transfer wajib dipilih');
    } else if (
        !transferTypes.some((t) => t.value === fundTransferForm.transfer_type)
    ) {
        fieldErrors.transfer_type.push('Tipe transfer tidak valid');
    }

    // From Fund Source validation
    if (!fundTransferForm.from_fund_source_id) {
        fieldErrors.from_fund_source_id.push('Sumber dana asal wajib dipilih');
    }

    // To Fund Source validation
    if (!fundTransferForm.to_fund_source_id) {
        fieldErrors.to_fund_source_id.push('Sumber dana tujuan wajib dipilih');
    }

    // Check if same fund source
    if (
        fundTransferForm.from_fund_source_id &&
        fundTransferForm.to_fund_source_id &&
        fundTransferForm.from_fund_source_id ===
            fundTransferForm.to_fund_source_id
    ) {
        fieldErrors.from_fund_source_id.push(
            'Sumber dana tidak boleh sama dengan tujuan',
        );
        fieldErrors.to_fund_source_id.push(
            'Sumber dana tidak boleh sama dengan asal',
        );
    }

    // Amount validation
    if (!fundTransferForm.amount || fundTransferForm.amount <= 0) {
        fieldErrors.amount.push(
            'Jumlah transfer wajib diisi dan harus lebih dari 0',
        );
    } else if (fundTransferForm.amount > 999999999999) {
        fieldErrors.amount.push('Jumlah transfer terlalu besar');
    }

    // Reference No validation - wajib diisi jika status completed
    if (fundTransferForm.status === 'completed') {
        if (
            !fundTransferForm.reference_no ||
            fundTransferForm.reference_no.trim() === ''
        ) {
            fieldErrors.reference_no.push(
                'Nomor referensi wajib diisi untuk status Dibayarkan',
            );
        }
    }

    // Additional validation for reference_no when filled
    if (
        fundTransferForm.reference_no &&
        fundTransferForm.reference_no.trim() !== ''
    ) {
        if (fundTransferForm.reference_no.trim().length > 50) {
            fieldErrors.reference_no.push(
                'Nomor referensi maksimal 50 karakter',
            );
        }
    }

    // Notes validation (optional, but validate if filled)
    if (fundTransferForm.notes && fundTransferForm.notes.trim() !== '') {
        if (fundTransferForm.notes.trim().length > 500) {
            fieldErrors.notes.push('Catatan maksimal 500 karakter');
        }
    }

    // Status validation
    if (!fundTransferForm.status || fundTransferForm.status.trim() === '') {
        fieldErrors.status.push('Status wajib dipilih');
    } else if (!statusTypes.some((s) => s.value === fundTransferForm.status)) {
        fieldErrors.status.push('Status tidak valid');
    }

    showValidationErrors.value = true;

    const hasErrors =
        fieldErrors.transfer_date.length > 0 ||
        fieldErrors.transfer_type.length > 0 ||
        fieldErrors.from_fund_source_id.length > 0 ||
        fieldErrors.to_fund_source_id.length > 0 ||
        fieldErrors.amount.length > 0 ||
        fieldErrors.reference_no.length > 0 ||
        fieldErrors.notes.length > 0 ||
        fieldErrors.status.length > 0 ||
        fieldErrors.general.length > 0;

    return !hasErrors;
};

// Computed property for form validity
const isFormValid = computed(() => {
    if (!showValidationErrors.value) return true;

    return (
        fieldErrors.transfer_date.length === 0 &&
        fieldErrors.transfer_type.length === 0 &&
        fieldErrors.from_fund_source_id.length === 0 &&
        fieldErrors.to_fund_source_id.length === 0 &&
        fieldErrors.amount.length === 0 &&
        fieldErrors.reference_no.length === 0 &&
        fieldErrors.notes.length === 0 &&
        fieldErrors.status.length === 0 &&
        fieldErrors.general.length === 0
    );
});

// Watch form changes to clear errors
watch(
    () => fundTransferForm.transfer_date,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.transfer_date = [];
        }
    },
);

watch(
    () => fundTransferForm.transfer_type,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.transfer_type = [];
        }
    },
);

watch(
    () => fundTransferForm.from_fund_source_id,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.from_fund_source_id = [];
            fieldErrors.to_fund_source_id = [];
            fieldErrors.general = [];
        }
    },
);

watch(
    () => fundTransferForm.to_fund_source_id,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.from_fund_source_id = [];
            fieldErrors.to_fund_source_id = [];
            fieldErrors.general = [];
        }
    },
);

watch(
    () => fundTransferForm.amount,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.amount = [];
        }
    },
);

watch(
    () => fundTransferForm.reference_no,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.reference_no = [];
        }
    },
);

watch(
    () => fundTransferForm.notes,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.notes = [];
        }
    },
);

// Watch status changes to validate reference_no
watch(
    () => fundTransferForm.status,
    () => {
        if (showValidationErrors.value) {
            fieldErrors.status = [];
            // Trigger reference_no validation when status changes
            if (fundTransferForm.status === 'completed') {
                if (
                    !fundTransferForm.reference_no ||
                    fundTransferForm.reference_no.trim() === ''
                ) {
                    fieldErrors.reference_no = [
                        'Nomor referensi wajib diisi untuk status Dibayarkan',
                    ];
                } else {
                    fieldErrors.reference_no = [];
                }
            } else {
                fieldErrors.reference_no = [];
            }
        }
    },
);

// Handle server errors
const handleServerErrors = (errors: Record<string, string[]>) => {
    resetValidation();

    if (errors.transfer_date) {
        fieldErrors.transfer_date = Array.isArray(errors.transfer_date)
            ? errors.transfer_date
            : [errors.transfer_date];
    }
    if (errors.transfer_type) {
        fieldErrors.transfer_type = Array.isArray(errors.transfer_type)
            ? errors.transfer_type
            : [errors.transfer_type];
    }
    if (errors.from_fund_source_id) {
        fieldErrors.from_fund_source_id = Array.isArray(
            errors.from_fund_source_id,
        )
            ? errors.from_fund_source_id
            : [errors.from_fund_source_id];
    }
    if (errors.to_fund_source_id) {
        fieldErrors.to_fund_source_id = Array.isArray(errors.to_fund_source_id)
            ? errors.to_fund_source_id
            : [errors.to_fund_source_id];
    }
    if (errors.amount) {
        fieldErrors.amount = Array.isArray(errors.amount)
            ? errors.amount
            : [errors.amount];
    }
    if (errors.reference_no) {
        fieldErrors.reference_no = Array.isArray(errors.reference_no)
            ? errors.reference_no
            : [errors.reference_no];
    }
    if (errors.notes) {
        fieldErrors.notes = Array.isArray(errors.notes)
            ? errors.notes
            : [errors.notes];
    }
    if (errors.status) {
        fieldErrors.status = Array.isArray(errors.status)
            ? errors.status
            : [errors.status];
    }

    showValidationErrors.value = true;
};

const handleApiError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{
            message: string;
            errors?: Record<string, string[]>;
        }>;
        const statusCode = axiosError.response?.status;
        const errorMessage =
            axiosError.response?.data?.message || axiosError.message;

        switch (statusCode) {
            case 422:
                if (axiosError.response?.data?.errors) {
                    handleServerErrors(axiosError.response.data.errors);
                }
                toast.error(errorMessage || 'Data tidak valid.');
                break;
            case 404:
                toast.error(errorMessage || 'Data tidak ditemukan.');
                break;
            case 409:
                toast.error(errorMessage || 'Terjadi konflik data.');
                break;
            case 500:
                toast.error('Terjadi kesalahan pada server.');
                break;
            default:
                toast.error(defaultMessage);
        }
    } else {
        toast.error(defaultMessage);
    }
};

// reset form
const resetForm = () => {
    Object.assign(fundTransferForm, {
        id: '',
        transfer_no: '',
        transfer_date: new Date().toISOString().split('T')[0],
        from_fund_source_id: null as number | null,
        to_fund_source_id: null as number | null,
        transfer_type: '' as string,
        amount: 0,
        reference_no: '',
        notes: '',
        status: 'draft' as string,
    });
    resetValidation();
};

// init form data
const createFundTransfer = async () => {
    resetForm();
    showCreateDialog.value = true;
};

const updateFundTransfer = async (fundTransfer: FundTransfer) => {
    resetForm();
    Object.assign(fundTransferForm, {
        id: fundTransfer.id,
        transfer_no: fundTransfer.transfer_no,
        transfer_date:
            fundTransfer.transfer_date?.split('T')[0] ||
            new Date().toISOString().split('T')[0],
        from_fund_source_id: fundTransfer.from_fund_source_id,
        to_fund_source_id: fundTransfer.to_fund_source_id,
        transfer_type: fundTransfer.transfer_type,
        amount: fundTransfer.amount,
        reference_no: fundTransfer.reference_no || '',
        notes: fundTransfer.notes || '',
        status: fundTransfer.status,
    });
    showEditDialog.value = true;
};

const deleteFundTransfer = (fundTransfer: FundTransfer) => {
    fundTransferToDelete.value = fundTransfer;
    showDeleteDialog.value = true;
};

// handle create fund transfer
const handleCreateFundTransfer = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.post('/api/v1/fund-transfers', fundTransferForm);

        toast.success('Transfer dana berhasil ditambahkan!', {
            description: `Transfer ${fundTransferForm.transfer_no || 'baru'} telah dibuat.`,
        });

        showCreateDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal menambahkan transfer dana. Silakan coba lagi.',
        );
    } finally {
        loading.value = false;
    }
};

// handle update fund transfer
const handleUpdateFundTransfer = async () => {
    if (!validateForm()) {
        toast.warning(
            'Mohon lengkapi semua field yang wajib diisi dengan benar.',
        );
        return;
    }

    loading.value = true;
    try {
        await axios.put(
            `/api/v1/fund-transfers/${fundTransferForm.id}`,
            fundTransferForm,
        );

        toast.success('Transfer dana berhasil diperbarui!', {
            description: `Transfer ${fundTransferForm.transfer_no} telah diperbarui.`,
        });

        showEditDialog.value = false;
        resetForm();
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal memperbarui transfer dana. Silakan coba lagi.',
        );
    } finally {
        loading.value = false;
    }
};

// handle delete data
const handleDeleteFundTransfer = async () => {
    if (!fundTransferToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `/api/v1/fund-transfers/${fundTransferToDelete.value.id}`,
        );

        toast.success('Transfer dana berhasil dihapus!', {
            description: `Transfer ${fundTransferToDelete.value.transfer_no} telah dihapus permanen.`,
        });

        showDeleteDialog.value = false;
        fundTransferToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        handleApiError(
            error,
            'Gagal menghapus transfer dana. Silakan coba lagi.',
        );
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

// Load fund sources on mount
onMounted(() => {
    fetchFundSources();
});
</script>

<template>
    <Head title="Transfer Dana" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Transfer Dana
                    </h1>
                    <p class="text-muted-foreground">
                        Pengelolaan data transfer dana
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button @click="createFundTransfer">
                        <PlusIcon class="mr-2 h-4 w-4" />
                        Transfer Dana
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
                search-placeholder="Cari Transfer Dana"
                show-pagination
                show-page-info
                empty-message="Data transfer dana tidak ditemukan"
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

        <!-- Create Fund Transfer Dialog -->
        <FormDialog
            v-model:open="showCreateDialog"
            :loading="loading"
            size="lg"
        >
            <FormDialog.Header
                title="Tambah Transfer Dana"
                description="Menambahkan data transfer dana baru."
            />

            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div
                    v-if="fieldErrors.general.length > 0"
                    class="rounded-md border border-amber-200 bg-amber-50 p-3"
                >
                    <div class="flex items-start gap-2">
                        <AlertCircleIcon
                            class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                        />
                        <div>
                            <p
                                v-for="(error, index) in fieldErrors.general"
                                :key="index"
                                class="text-sm text-amber-700"
                            >
                                {{ error }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Transfer Date -->
                    <div class="space-y-2">
                        <Label for="create-transfer-date">
                            Tanggal Transfer <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            id="create-transfer-date"
                            type="date"
                            v-model="fundTransferForm.transfer_date"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.transfer_date.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.transfer_date"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- Reference No -->
                    <div class="space-y-2">
                        <Label for="create-reference-no">
                            Nomor Referensi
                            <span
                                v-if="fundTransferForm.status === 'completed'"
                                class="text-red-500"
                                >*</span
                            >
                        </Label>
                        <Input
                            id="create-reference-no"
                            v-model="fundTransferForm.reference_no"
                            placeholder="Isikan nomor referensi"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.reference_no.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.reference_no"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <!-- <p
                            v-if="
                                fundTransferForm.status === 'completed' &&
                                fieldErrors.reference_no.length === 0
                            "
                            class="text-xs text-gray-500"
                        >
                            Wajib diisi untuk transfer dengan status Dibayarkan
                        </p> -->
                    </div>
                </div>

                <!-- Transfer Type -->
                <div class="space-y-2">
                    <Label for="create-transfer-type">
                        Tipe Transfer <span class="text-red-500">*</span>
                    </Label>
                    <Select
                        v-model="fundTransferForm.transfer_type"
                        :disabled="loading"
                    >
                        <SelectTrigger
                            id="create-transfer-type"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.transfer_type.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih tipe transfer" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="type in transferTypes"
                                :key="type.value"
                                :value="type.value"
                            >
                                {{ type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p
                        v-for="(error, index) in fieldErrors.transfer_type"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- From Fund Source -->
                    <div class="space-y-2">
                        <Label for="create-from-fund-source">
                            Dari Sumber Dana <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="fundTransferForm.from_fund_source_id"
                            :disabled="loading"
                        >
                            <SelectTrigger
                                id="create-from-fund-source"
                                class="w-full"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.from_fund_source_id.length >
                                        0,
                                }"
                            >
                                <SelectValue
                                    placeholder="Pilih sumber dana asal"
                                />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem
                                    v-for="fundSource in fundSources"
                                    :key="fundSource.id"
                                    :value="fundSource.id"
                                >
                                    {{ fundSource.code }} -
                                    {{ fundSource.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p
                            v-for="(
                                error, index
                            ) in fieldErrors.from_fund_source_id"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- To Fund Source -->
                    <div class="space-y-2">
                        <Label for="create-to-fund-source">
                            Ke Sumber Dana <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="fundTransferForm.to_fund_source_id"
                            :disabled="loading"
                        >
                            <SelectTrigger
                                id="create-to-fund-source"
                                class="w-full"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.to_fund_source_id.length >
                                        0,
                                }"
                            >
                                <SelectValue
                                    placeholder="Pilih sumber dana tujuan"
                                />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem
                                    v-for="fundSource in fundSources"
                                    :key="fundSource.id"
                                    :value="fundSource.id"
                                >
                                    {{ fundSource.code }} -
                                    {{ fundSource.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p
                            v-for="(
                                error, index
                            ) in fieldErrors.to_fund_source_id"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Amount -->
                    <div class="space-y-2">
                        <Label for="create-amount">
                            Jumlah <span class="text-red-500">*</span>
                        </Label>
                        <div class="relative">
                            <span
                                class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-700"
                            >
                                Rp
                            </span>
                            <Input
                                id="create-amount"
                                v-model="fundTransferForm.amount"
                                type="text"
                                @input="
                                    fundTransferForm.amount =
                                        Number(
                                            $event.target.value.replace(
                                                /[^0-9.]/g,
                                                '',
                                            ),
                                        ) || 0
                                "
                                class="w-full pl-10 text-sm"
                                :disabled="loading"
                                placeholder="0"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.amount.length > 0,
                                }"
                            />
                        </div>
                        <p
                            v-for="(error, index) in fieldErrors.amount"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- Status -->
                    <div class="space-y-2">
                        <Label for="create-status">
                            Status <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="fundTransferForm.status"
                            :disabled="loading"
                        >
                            <SelectTrigger
                                id="create-status"
                                class="w-full"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.status.length > 0,
                                }"
                            >
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem
                                    v-for="status in statusTypes"
                                    :key="status.value"
                                    :value="status.value"
                                >
                                    {{ status.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p
                            v-for="(error, index) in fieldErrors.status"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>

                <!-- Notes -->
                <div class="space-y-2">
                    <Label for="create-notes">Catatan</Label>
                    <Textarea
                        id="create-notes"
                        v-model="fundTransferForm.notes"
                        placeholder="Tambahkan catatan transfer (opsional)"
                        class="min-h-[80px] w-full resize-none"
                        :maxlength="500"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.notes.length > 0,
                        }"
                    />
                    <div class="flex justify-between">
                        <p
                            v-for="(error, index) in fieldErrors.notes"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ fundTransferForm.notes?.length || 0 }}/500
                        </p>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Buat Transfer Dana"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleCreateFundTransfer"
                @cancel="handleCancelCreate"
            />
        </FormDialog>

        <!-- Edit Fund Transfer Dialog -->
        <FormDialog v-model:open="showEditDialog" :loading="loading" size="lg">
            <FormDialog.Header
                title="Update Transfer Dana"
                description="Memperbaharui data transfer dana."
            />

            <FormDialog.Content spacing="md">
                <!-- General Errors -->
                <div
                    v-if="fieldErrors.general.length > 0"
                    class="rounded-md border border-amber-200 bg-amber-50 p-3"
                >
                    <div class="flex items-start gap-2">
                        <AlertCircleIcon
                            class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                        />
                        <div>
                            <p
                                v-for="(error, index) in fieldErrors.general"
                                :key="index"
                                class="text-sm text-amber-700"
                            >
                                {{ error }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Transfer Date -->
                    <div class="space-y-2">
                        <Label for="edit-transfer-date">
                            Tanggal Transfer <span class="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-transfer-date"
                            type="date"
                            v-model="fundTransferForm.transfer_date"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.transfer_date.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.transfer_date"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- Reference No -->
                    <div class="space-y-2">
                        <Label for="edit-reference-no">
                            Nomor Referensi
                            <span
                                v-if="fundTransferForm.status === 'completed'"
                                class="text-red-500"
                                >*</span
                            >
                        </Label>
                        <Input
                            id="edit-reference-no"
                            v-model="fundTransferForm.reference_no"
                            placeholder="Isikan nomor referensi"
                            :disabled="loading"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.reference_no.length > 0,
                            }"
                        />
                        <p
                            v-for="(error, index) in fieldErrors.reference_no"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <!-- <p
                            v-if="
                                fundTransferForm.status === 'completed' &&
                                fieldErrors.reference_no.length === 0
                            "
                            class="text-xs text-gray-500"
                        >
                            Wajib diisi untuk transfer dengan status Dibayarkan
                        </p> -->
                    </div>
                </div>

                <!-- Transfer Type -->
                <div class="space-y-2">
                    <Label for="edit-transfer-type">
                        Tipe Transfer <span class="text-red-500">*</span>
                    </Label>
                    <Select
                        v-model="fundTransferForm.transfer_type"
                        :disabled="loading"
                    >
                        <SelectTrigger
                            id="edit-transfer-type"
                            class="w-full"
                            :class="{
                                'border-red-500 focus:ring-red-500':
                                    fieldErrors.transfer_type.length > 0,
                            }"
                        >
                            <SelectValue placeholder="Pilih tipe transfer" />
                        </SelectTrigger>
                        <SelectContent class="max-h-[200px] overflow-y-auto">
                            <SelectItem
                                v-for="type in transferTypes"
                                :key="type.value"
                                :value="type.value"
                            >
                                {{ type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p
                        v-for="(error, index) in fieldErrors.transfer_type"
                        :key="index"
                        class="text-xs text-red-500"
                    >
                        {{ error }}
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- From Fund Source -->
                    <div class="space-y-2">
                        <Label for="edit-from-fund-source">
                            Dari Sumber Dana <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="fundTransferForm.from_fund_source_id"
                            :disabled="loading"
                        >
                            <SelectTrigger
                                id="edit-from-fund-source"
                                class="w-full"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.from_fund_source_id.length >
                                        0,
                                }"
                            >
                                <SelectValue
                                    placeholder="Pilih sumber dana asal"
                                />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem
                                    v-for="fundSource in fundSources"
                                    :key="fundSource.id"
                                    :value="fundSource.id"
                                >
                                    {{ fundSource.code }} -
                                    {{ fundSource.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p
                            v-for="(
                                error, index
                            ) in fieldErrors.from_fund_source_id"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- To Fund Source -->
                    <div class="space-y-2">
                        <Label for="edit-to-fund-source">
                            Ke Sumber Dana <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="fundTransferForm.to_fund_source_id"
                            :disabled="loading"
                        >
                            <SelectTrigger
                                id="edit-to-fund-source"
                                class="w-full"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.to_fund_source_id.length >
                                        0,
                                }"
                            >
                                <SelectValue
                                    placeholder="Pilih sumber dana tujuan"
                                />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem
                                    v-for="fundSource in fundSources"
                                    :key="fundSource.id"
                                    :value="fundSource.id"
                                >
                                    {{ fundSource.code }} -
                                    {{ fundSource.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p
                            v-for="(
                                error, index
                            ) in fieldErrors.to_fund_source_id"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Amount -->
                    <div class="space-y-2">
                        <Label for="edit-amount">
                            Jumlah <span class="text-red-500">*</span>
                        </Label>
                        <div class="relative">
                            <span
                                class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-700"
                            >
                                Rp
                            </span>
                            <Input
                                id="edit-amount"
                                v-model="fundTransferForm.amount"
                                type="text"
                                @input="
                                    fundTransferForm.amount =
                                        Number(
                                            $event.target.value.replace(
                                                /[^0-9.]/g,
                                                '',
                                            ),
                                        ) || 0
                                "
                                class="w-full pl-10 text-sm"
                                :disabled="loading"
                                placeholder="0"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.amount.length > 0,
                                }"
                            />
                        </div>
                        <p
                            v-for="(error, index) in fieldErrors.amount"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>

                    <!-- Status -->
                    <div class="space-y-2">
                        <Label for="edit-status">
                            Status <span class="text-red-500">*</span>
                        </Label>
                        <Select
                            v-model="fundTransferForm.status"
                            :disabled="loading"
                        >
                            <SelectTrigger
                                id="edit-status"
                                class="w-full"
                                :class="{
                                    'border-red-500 focus:ring-red-500':
                                        fieldErrors.status.length > 0,
                                }"
                            >
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent
                                class="max-h-[200px] overflow-y-auto"
                            >
                                <SelectItem
                                    v-for="status in statusTypes"
                                    :key="status.value"
                                    :value="status.value"
                                >
                                    {{ status.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p
                            v-for="(error, index) in fieldErrors.status"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                    </div>
                </div>

                <!-- Notes -->
                <div class="space-y-2">
                    <Label for="edit-notes">Catatan</Label>
                    <Textarea
                        id="edit-notes"
                        v-model="fundTransferForm.notes"
                        placeholder="Tambahkan catatan transfer (opsional)"
                        class="min-h-[80px] w-full resize-none"
                        :maxlength="500"
                        :disabled="loading"
                        :class="{
                            'border-red-500 focus:ring-red-500':
                                fieldErrors.notes.length > 0,
                        }"
                    />
                    <div class="flex justify-between">
                        <p
                            v-for="(error, index) in fieldErrors.notes"
                            :key="index"
                            class="text-xs text-red-500"
                        >
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400">
                            {{ fundTransferForm.notes?.length || 0 }}/500
                        </p>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Update Transfer Dana"
                cancel-text="Batal"
                :loading="loading"
                :valid="isFormValid"
                @submit="handleUpdateFundTransfer"
                @cancel="handleCancelEdit"
            />
        </FormDialog>

        <!-- Delete Fund Transfer Dialog -->
        <FormDialog
            v-model:open="showDeleteDialog"
            :loading="loading"
            size="sm"
        >
            <FormDialog.Header
                title="Hapus Transfer Dana"
                description="Proses ini tidak dapat dibatalkan. Transfer dana akan dihapus secara permanen."
            />

            <FormDialog.Content>
                <div class="rounded-md border border-red-200 bg-red-50 p-4">
                    <div class="flex items-start gap-3">
                        <AlertCircleIcon
                            class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                        />
                        <div>
                            <p class="text-sm font-medium text-red-800">
                                Konfirmasi Penghapusan
                            </p>
                            <p class="mt-1 text-sm text-red-700">
                                Apakah Anda yakin akan menghapus transfer dana:
                            </p>
                            <p class="mt-2 text-sm font-semibold text-red-800">
                                {{ fundTransferToDelete?.transfer_no }} -
                                {{
                                    new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                    }).format(fundTransferToDelete?.amount || 0)
                                }}
                            </p>
                            <p class="mt-2 text-xs text-red-600">
                                Semua data yang terkait dengan transfer ini akan
                                ikut terhapus.
                            </p>
                        </div>
                    </div>
                </div>
            </FormDialog.Content>

            <FormDialog.Footer
                submit-text="Hapus Transfer Dana"
                submit-variant="destructive"
                cancel-text="Batal"
                :loading="loading"
                @submit="handleDeleteFundTransfer"
            />
        </FormDialog>
    </AppLayout>
</template>
