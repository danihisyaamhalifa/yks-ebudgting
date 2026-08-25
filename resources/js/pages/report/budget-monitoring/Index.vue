<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createColumn, useDataTable } from '@/composables/useDataTable';
import AppLayout from '@/layouts/AppLayout.vue';
import UnitSelect from '@/pages/masterdata/components/UnitSelect.vue';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    DollarSignIcon,
    DownloadIcon,
    FileTextIcon,
    FilterIcon,
    PrinterIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    XIcon,
} from 'lucide-vue-next';
import { computed, h, onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

// Types Definition
interface BudgetMonitoringItem {
    id: number;
    item_code: string;
    item_name: string;
    unit_name?: string;
    unit_id?: number;
    pagu_disetujui: string;
    diajukan: string;
    dicairkan: string;
    direalisasikan: string;
    sisa_pagu: string;
    selisih_realisasi_pengajuan: string;
    selisih_realisasi_pencairan: string;
    jumlah_selisih_realisasi: string;
}

interface TransactionSource {
    id: number;
    type: 'budget_request' | 'disbursement' | 'fund_release';
    title: string;
    date: string;
    amount: number;
    status: string;
    description?: string;
    reference_no?: string;
}

interface Unit {
    id: number;
    unit_name: string;
    unit_code: string;
}

interface SummaryData {
    total_pagu: string;
    total_diajukan: string;
    total_dicairkan: string;
    total_direalisasikan: string;
    total_sisa_pagu: string;
    total_selisih_dana_pengajuan: string;
    total_selisih_dana_pencairan: string;
    total_jumlah_selisih: string;
}


// Constants & Static Config
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: 'dashboard' },
    { title: 'Laporan Monitoring Anggaran', href: '' },
];


// Helper Utilities
const parseCurrencyToFloat = (value: string): number => {
    if (!value) return 0;
    // Membersihkan format titik (ribuan) dan mengubah koma menjadi titik desimal
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
};

const getStatusBadge = (selisih: string) => {
    const value = parseCurrencyToFloat(selisih);

    if (value > 0) {
        return {
            class: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
            icon: TrendingUpIcon,
            iconClass: 'text-green-600 dark:text-green-400',
            label: 'Selisih Positif',
        };
    } else if (value < 0) {
        return {
            class: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
            icon: TrendingDownIcon,
            iconClass: 'text-red-600 dark:text-red-400',
            label: 'Selisih Negatif',
        };
    } else {
        return {
            class: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
            icon: AlertCircleIcon,
            iconClass: 'text-gray-600 dark:text-gray-400',
            label: 'Tidak Ada Selisih',
        };
    }
};

const getTransactionTypeBadge = (type: string) => {
    switch (type) {
        case 'budget_request':
            return {
                class: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: FileTextIcon,
                label: 'Perencanaan Anggaran',
            };
        case 'disbursement':
            return {
                class: 'bg-orange-100 text-orange-700 border-orange-200',
                icon: DollarSignIcon,
                label: 'Pengajuan Pencairan',
            };
        case 'fund_release':
            return {
                class: 'bg-green-100 text-green-700 border-green-200',
                icon: CheckCircleIcon,
                label: 'Realisasi Pencairan',
            };
        default:
            return {
                class: 'bg-gray-100 text-gray-700 border-gray-200',
                icon: AlertCircleIcon,
                label: 'Unknown',
            };
    }
};


// Table Columns Definition

const columns: ColumnDef<BudgetMonitoringItem>[] = [
    createColumn({
        value: 'item_code',
        title: 'Kode Item',
        sortable: true,
        searchable: true,
        render: ({ row }: any) =>
            h('span', { class: 'font-medium' }, row.original.item_code),
    }),
    createColumn({
        value: 'item_name',
        title: 'Nama Item',
        sortable: true,
        searchable: true,
        render: ({ row }: any) => row.original.item_name,
    }),
    createColumn({
        value: 'pagu_disetujui',
        title: 'Pagu Disetujui',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) =>
            h(
                'span',
                { class: 'font-semibold text-blue-700 dark:text-blue-400' },
                `Rp ${row.original.pagu_disetujui}`,
            ),
    }),
    createColumn({
        value: 'diajukan',
        title: 'Diajukan',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) =>
            h(
                'span',
                { class: 'text-gray-700 dark:text-gray-300' },
                `Rp ${row.original.diajukan}`,
            ),
    }),
    createColumn({
        value: 'dicairkan',
        title: 'Dicairkan',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) =>
            h(
                'span',
                { class: 'text-gray-700 dark:text-gray-300' },
                `Rp ${row.original.dicairkan}`,
            ),
    }),
    createColumn({
        value: 'direalisasikan',
        title: 'Direalisasikan',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) =>
            h(
                'span',
                { class: 'font-medium text-green-700 dark:text-green-400' },
                `Rp ${row.original.direalisasikan}`,
            ),
    }),
    createColumn({
        value: 'sisa_pagu',
        title: 'Sisa Anggaran',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) => {
            const sisa_paguValue = parseCurrencyToFloat(row.original.sisa_pagu);
            return h(
                'span',
                {
                    class:
                        sisa_paguValue > 0
                            ? 'font-semibold text-amber-600 dark:text-amber-400'
                            : 'text-gray-400',
                },
                `Rp ${row.original.sisa_pagu}`,
            );
        },
    }),

    createColumn({
        value: 'selisih_realisasi_pengajuan',
        title: 'Selisih Realisasi Pengajuan',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) => {
            const value = parseCurrencyToFloat(
                row.original.selisih_realisasi_pengajuan,
            );
            return h(
                'span',
                {
                    class:
                        value > 0
                            ? 'font-semibold text-amber-600 dark:text-amber-400'
                            : 'text-gray-400',
                },
                `Rp ${row.original.selisih_realisasi_pengajuan}`,
            );
        },
    }),

    createColumn({
        value: 'selisih_realisasi_pencairan',
        title: 'Selisih Realisasi Pencairan',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) => {
            const value = parseCurrencyToFloat(
                row.original.selisih_realisasi_pencairan,
            );
            return h(
                'span',
                {
                    class:
                        value > 0
                            ? 'font-semibold text-amber-600 dark:text-amber-400'
                            : 'text-gray-400',
                },
                `Rp ${row.original.selisih_realisasi_pencairan}`,
            );
        },
    }),

    createColumn({
        value: 'jumlah_selisih_realisasi',
        title: 'Jumlah Selisih Realisasi',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }: any) => {
            const selisih = row.original.jumlah_selisih_realisasi;
            const badgeStyle = getStatusBadge(selisih);

            return h(
                Badge,
                { variant: 'secondary', class: badgeStyle.class },
                () => [
                    h(badgeStyle.icon, {
                        class: `w-3.5 h-3.5 mr-1 ${badgeStyle.iconClass}`,
                    }),
                    `Rp ${selisih}`,
                ],
            );
        },
    }),
    createColumn({
        value: 'actions',
        title: 'Aksi',
        sortable: false,
        searchable: false,
        render: ({ row }: any) => {
            return h('div', { class: 'flex items-center gap-2' }, [
                h(
                    DropdownMenu,
                    {},
                    {
                        default: () => [
                            h(
                                DropdownMenuTrigger,
                                {},
                                {
                                    default: () =>
                                        h(
                                            Button,
                                            {
                                                variant: 'outline',
                                                size: 'sm',
                                                class: 'gap-1',
                                            },
                                            {
                                                default: () => [
                                                    'Histori',
                                                    h(ChevronDownIcon, {
                                                        class: 'h-3 w-3',
                                                    }),
                                                ],
                                            },
                                        ),
                                },
                            ),
                            h(
                                DropdownMenuContent,
                                { align: 'end', class: 'w-64' },
                                {
                                    default: () => [
                                        h(
                                            DropdownMenuItem,
                                            {
                                                class: 'flex items-center gap-2 cursor-pointer hover:bg-gray-100',
                                                onClick: () =>
                                                    viewTransactionSource(
                                                        row.original,
                                                        'budget_request',
                                                    ),
                                            },
                                            {
                                                default: () => [
                                                    h(FileTextIcon, {
                                                        class: 'h-4 w-4 text-blue-600',
                                                    }),
                                                    h(
                                                        'span',
                                                        'Perencanaan Anggaran',
                                                    ),
                                                ],
                                            },
                                        ),
                                        h(
                                            DropdownMenuItem,
                                            {
                                                class: 'flex items-center gap-2 cursor-pointer hover:bg-gray-100',
                                                onClick: () =>
                                                    viewTransactionSource(
                                                        row.original,
                                                        'disbursement',
                                                    ),
                                            },
                                            {
                                                default: () => [
                                                    h(DollarSignIcon, {
                                                        class: 'h-4 w-4 text-orange-600',
                                                    }),
                                                    h(
                                                        'span',
                                                        'Pengajuan Pencairan',
                                                    ),
                                                ],
                                            },
                                        ),
                                        h(
                                            DropdownMenuItem,
                                            {
                                                class: 'flex items-center gap-2 cursor-pointer hover:bg-gray-100',
                                                onClick: () =>
                                                    viewTransactionSource(
                                                        row.original,
                                                        'fund_release',
                                                    ),
                                            },
                                            {
                                                default: () => [
                                                    h(CheckCircleIcon, {
                                                        class: 'h-4 w-4 text-green-600',
                                                    }),
                                                    h(
                                                        'span',
                                                        'Realisasi Pencairan',
                                                    ),
                                                ],
                                            },
                                        ),
                                    ],
                                },
                            ),
                        ],
                    },
                ),
            ]);
        },
    }),
];


// Data Table Hook Initialization

const dataTable = useDataTable({
    endpoint: '/api/v1/budget-monitoring/data',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari item anggaran...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: false,
    refreshable: true,
});


// Reactive States

// Dialog States
const showTransactionDialog = ref(false);
const selectedItem = ref<BudgetMonitoringItem | null>(null);
const selectedTransactionType = ref<string>('');
const transactions = ref<TransactionSource[]>([]);

// Loading States
const loadingTransactions = ref(false);
const loadingSummary = ref(false);
const loadingUnits = ref(false);

// General Data States
const summaryData = ref<SummaryData | null>(null);
const units = ref<Unit[]>([]);

// Filter Form States
const filterItemCode = ref<string>('');
const filterUnitId = ref<number | null>(null);
const filterMinSisa = ref<string>('');
const filterMaxSisa = ref<string>('');
const showFilters = ref(false);


// Computed Properties

const hasActiveFilters = computed(() => {
    return !!(
        filterItemCode.value ||
        filterUnitId.value ||
        filterMinSisa.value ||
        filterMaxSisa.value
    );
});

// Create dynamic payload filters helper
const activeFilterPayload = computed(() => {
    const params: Record<string, any> = {};
    if (filterItemCode.value) params.item_code = filterItemCode.value;
    if (filterUnitId.value) params.unit_id = filterUnitId.value;
    if (filterMinSisa.value) params.min_sisa = filterMinSisa.value;
    if (filterMaxSisa.value) params.max_sisa = filterMaxSisa.value;
    return params;
});


/**
 * Mendapatkan master data unit untuk dropdown pilihan filter
 */
const fetchUnits = async () => {
    loadingUnits.value = true;
    try {
        const response = await axios.get('/api/v1/select/units');
        units.value = response.data?.data || [];
    } catch (error: any) {
        console.error('Error fetching units:', error);
        toast.error(
            error.response?.data?.message || 'Gagal memuat data unit master',
        );
    } finally {
        loadingUnits.value = false;
    }
};

/**
 * Menampilkan detail riwayat transaksi berdasarkan tipe item yang dipilih
 */
const viewTransactionSource = async (
    item: BudgetMonitoringItem,
    type: string,
) => {
    selectedItem.value = item;
    selectedTransactionType.value = type;
    loadingTransactions.value = true;
    showTransactionDialog.value = true;
    transactions.value = []; // Reset state sebelumnya

    try {
        const response = await axios.get(
            `/api/v1/budget-monitoring/transactions/${item.id}`,
            {
                params: { type },
            },
        );
        transactions.value = response.data?.data || [];

        if (transactions.value.length === 0) {
            toast.info('Tidak ada data transaksi untuk sumber ini');
        }
    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        toast.error(
            error.response?.data?.message || 'Gagal memuat data transaksi',
        );
    } finally {
        loadingTransactions.value = false;
    }
};

/**
 * Mengambil ringkasan akumulasi dana (pagu, realisasi, sisa, dll)
 */
const fetchSummary = async () => {
    loadingSummary.value = true;
    try {
        const response = await axios.get('/api/v1/budget-monitoring/summary', {
            params: activeFilterPayload.value,
        });
        summaryData.value = response.data?.data || null;
    } catch (error: any) {
        console.error('Error fetching summary:', error);
        toast.error(
            error.response?.data?.message || 'Gagal memuat data ringkasan',
        );
    } finally {
        loadingSummary.value = false;
    }
};

/**
 * Menerapkan parameter filter ke list tabel data dan memperbarui ringkasan kartu widget
 */
const applyFilters = () => {
    dataTable.actions.filter(activeFilterPayload.value);
    fetchSummary();
};

/**
 * Mengosongkan seluruh parameter filter kembali ke kondisi semula
 */
const resetFilters = () => {
    filterItemCode.value = '';
    filterUnitId.value = null;
    filterMinSisa.value = '';
    filterMaxSisa.value = '';

    applyFilters();
    showFilters.value = false;
};

/**
 * Mengosongkan filter unit spesifik
 */
const clearFilterUnit = () => {
    filterUnitId.value = null;
    applyFilters();
};

/**
 * Melakukan cetak laporan berbasis layar (print-view window CSS)
 */
const printReport = () => {
    // window.print();
};

/**
 * Mengunduh dokumen ekspor Excel dari backend server
 */
const exportReport = async () => {
    try {
        toast.promise(
            axios.get('/api/v1/budget-monitoring/export', {
                params: activeFilterPayload.value,
                responseType: 'blob',
            }),
            {
                loading: 'Mempersiapkan berkas ekspor...',
                success: (response) => {
                    const url = window.URL.createObjectURL(
                        new Blob([response.data]),
                    );
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute(
                        'download',
                        `laporan_monitoring_anggaran_${new Date().toISOString().split('T')[0]}.xlsx`,
                    );
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    return 'Laporan berhasil diunduh';
                },
                error: 'Gagal mengunduh berkas laporan',
            },
        );
    } catch (error) {
        console.error('Error exporting report:', error);
    }
};


// Lifecycle Hooks

onMounted(() => {
    fetchUnits();
    fetchSummary();
});
</script>

<template>
    <Head title="Laporan Monitoring Anggaran" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Laporan Monitoring Anggaran
                    </h1>
                    <p class="text-muted-foreground">
                        Monitoring dan evaluasi realisasi anggaran per item
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
                    <Button variant="outline" @click="printReport">
                        <PrinterIcon class="mr-2 h-4 w-4" />
                        Cetak
                    </Button>
                    <Button @click="exportReport">
                        <DownloadIcon class="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">Total Pagu</p>
                    <p class="mt-2 text-lg font-bold text-blue-700">
                        Rp {{ summaryData?.total_pagu || '0' }}
                    </p>
                </div>
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">
                        Total Diajukan
                    </p>
                    <p class="mt-2 text-lg font-bold text-gray-700">
                        Rp {{ summaryData?.total_diajukan || '0' }}
                    </p>
                </div>
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">
                        Total Dicairkan
                    </p>
                    <p class="mt-2 text-lg font-bold text-gray-700">
                        Rp {{ summaryData?.total_dicairkan || '0' }}
                    </p>
                </div>
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">
                        Total Realisasi
                    </p>
                    <p class="mt-2 text-lg font-bold text-green-700">
                        Rp {{ summaryData?.total_direalisasikan || '0' }}
                    </p>
                </div>
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">
                        Total Sisa Anggaran
                    </p>
                    <p class="mt-2 text-lg font-bold text-amber-600">
                        Rp {{ summaryData?.total_sisa_pagu || '0' }}
                    </p>
                </div>
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">
                        Total Selisih Realisasi Pengajuan
                    </p>
                    <p class="mt-2 text-lg font-bold text-amber-600">
                        Rp {{ summaryData?.total_selisih_dana_pengajuan || '0' }}
                    </p>
                </div>
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">
                        Total Selisih Realisasi Pencairan
                    </p>
                    <p class="mt-2 text-lg font-bold text-amber-600">
                        Rp {{ summaryData?.total_selisih_dana_pencairan || '0' }}
                    </p>
                </div>
                <div class="rounded-lg border bg-white p-4 shadow-sm">
                    <p class="text-xs font-medium text-gray-500">
                        Total Jml. Selisih Realisasi
                    </p>
                    <p
                        class="mt-2 text-lg font-bold"
                        :class="
                            parseFloat(
                                (summaryData?.total_jumlah_selisih || '0')
                                    .replace(/\./g, '')
                                    .replace(',', '.'),
                            ) > 0
                                ? 'text-green-700'
                                : 'text-red-700'
                        "
                    >
                        Rp {{ summaryData?.total_jumlah_selisih || '0' }}
                    </p>
                </div>
            </div>

            <!-- Filter Panel -->
            <div
                v-if="showFilters"
                class="space-y-4 rounded-lg border bg-white p-4"
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
                    class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                >
                    <!-- Filter by Item Code -->
                    <div class="space-y-2">
                        <Label for="filter-item-code">Kode Item</Label>
                        <Input
                            id="filter-item-code"
                            v-model="filterItemCode"
                            placeholder="Cari kode item..."
                            @input="applyFilters"
                        />
                    </div>

                    <!-- Filter by Unit -->
                    <div class="space-y-2">
                        <Label for="filter-unit">Unit</Label>
                        <UnitSelect
                            v-model="filterUnitId"
                            @update:model-value="applyFilters"
                            placeholder="Pilih unit/organisasi"
                            :searchable="true"
                        />
                    </div>

                    <!-- Filter by Min Sisa -->
                    <div class="space-y-2">
                        <Label for="filter-min-sisa"
                            >Sisa Anggaran Minimum</Label
                        >
                        <div class="relative">
                            <span
                                class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-500"
                            >
                                Rp
                            </span>
                            <Input
                                id="filter-min-sisa"
                                v-model="filterMinSisa"
                                type="number"
                                placeholder="0"
                                class="pl-10"
                                @input="applyFilters"
                            />
                        </div>
                    </div>

                    <!-- Filter by Max Sisa -->
                    <div class="space-y-2">
                        <Label for="filter-max-sisa"
                            >Sisa Anggaran Maksimum</Label
                        >
                        <div class="relative">
                            <span
                                class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-500"
                            >
                                Rp
                            </span>
                            <Input
                                id="filter-max-sisa"
                                v-model="filterMaxSisa"
                                type="number"
                                placeholder="0"
                                class="pl-10"
                                @input="applyFilters"
                            />
                        </div>
                    </div>
                </div>

                <!-- Active Filters Display -->
                <div
                    v-if="hasActiveFilters"
                    class="flex flex-wrap items-center gap-2"
                >
                    <span class="text-xs text-gray-500">Filter aktif:</span>

                    <!-- Item Code Filter Badge -->
                    <Badge
                        v-if="filterItemCode"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700"
                    >
                        Kode: {{ filterItemCode }}
                        <button
                            @click="
                                filterItemCode = '';
                                applyFilters();
                            "
                            class="ml-1 hover:text-blue-900"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Unit Filter Badge -->
                    <Badge
                        v-if="filterUnitId"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700"
                    >
                        Unit:
                        {{
                            units.find((u) => u.id === filterUnitId)
                                ?.unit_name || 'Unit'
                        }}
                        <button
                            @click="clearFilterUnit"
                            class="ml-1 hover:text-blue-900"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Min Sisa Filter Badge -->
                    <Badge
                        v-if="filterMinSisa"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700"
                    >
                        Min Sisa: Rp {{ filterMinSisa }}
                        <button
                            @click="
                                filterMinSisa = '';
                                applyFilters();
                            "
                            class="ml-1 hover:text-blue-900"
                        >
                            <XIcon class="h-3 w-3" />
                        </button>
                    </Badge>

                    <!-- Max Sisa Filter Badge -->
                    <Badge
                        v-if="filterMaxSisa"
                        variant="secondary"
                        class="gap-1 border-blue-200 bg-blue-50 text-blue-700"
                    >
                        Max Sisa: Rp {{ filterMaxSisa }}
                        <button
                            @click="
                                filterMaxSisa = '';
                                applyFilters();
                            "
                            class="ml-1 hover:text-blue-900"
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
                search-placeholder="Cari item anggaran..."
                show-pagination
                show-page-info
                empty-message="Data anggaran tidak ditemukan"
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

        <!-- Transaction Source Dialog -->
        <div
            v-if="showTransactionDialog && selectedItem"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            @click.self="showTransactionDialog = false"
        >
            <div
                class="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-white p-6 shadow-xl"
            >
                <div class="flex items-center justify-between border-b pb-4">
                    <div>
                        <h2 class="text-xl font-bold">
                            Histori Sumber Transaksi
                        </h2>
                        <p class="text-sm text-gray-500">
                            {{ selectedItem.item_code }} -
                            {{ selectedItem.item_name }}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        @click="showTransactionDialog = false"
                    >
                        <XIcon class="h-5 w-5" />
                    </Button>
                </div>

                <div class="flex-1 overflow-y-auto py-4">
                    <!-- Transaction Type Header -->
                    <div class="mb-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <Badge
                                variant="secondary"
                                :class="
                                    getTransactionTypeBadge(
                                        selectedTransactionType,
                                    ).class
                                "
                                class="flex items-center gap-2 px-3 py-1.5"
                            >
                                <component
                                    :is="
                                        getTransactionTypeBadge(
                                            selectedTransactionType,
                                        ).icon
                                    "
                                    class="h-4 w-4"
                                />
                                {{
                                    getTransactionTypeBadge(
                                        selectedTransactionType,
                                    ).label
                                }}
                            </Badge>
                            <span class="text-sm text-gray-500">
                                Total: {{ transactions.length }} transaksi
                            </span>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div
                        v-if="loadingTransactions"
                        class="flex justify-center py-8"
                    >
                        <div class="flex items-center gap-2 text-gray-500">
                            <div
                                class="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"
                            ></div>
                            <span>Memuat data transaksi...</span>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div
                        v-else-if="transactions.length === 0"
                        class="py-8 text-center"
                    >
                        <AlertCircleIcon
                            class="mx-auto h-12 w-12 text-gray-400"
                        />
                        <p class="mt-2 text-gray-500">
                            Tidak ada data transaksi
                        </p>
                    </div>

                    <!-- Transactions Table -->
                    <div v-else class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead
                                class="bg-gray-50 text-xs text-gray-700 uppercase"
                            >
                                <tr>
                                    <th class="px-4 py-3 text-left">No.</th>
                                    <th class="px-4 py-3 text-left">
                                        Referensi
                                    </th>
                                    <th class="px-4 py-3 text-left">Tanggal</th>
                                    <th class="px-4 py-3 text-right">Volume</th>
                                    <th class="px-4 py-3 text-right">
                                        Harga Satuan
                                    </th>
                                    <th class="px-4 py-3 text-right">Total</th>
                                    <th class="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(transaction, index) in transactions"
                                    :key="transaction.id"
                                    class="border-b hover:bg-gray-50"
                                >
                                    <td
                                        class="px-4 py-3 text-center font-medium"
                                    >
                                        {{ index + 1 }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex flex-col">
                                            <span
                                                class="font-medium text-gray-900"
                                            >
                                                {{
                                                    transaction.reference_no ||
                                                    '-'
                                                }}
                                            </span>
                                            <span
                                                v-if="transaction.request_no"
                                                class="text-xs text-gray-500"
                                            >
                                                Pengajuan:
                                                {{ transaction.request_no }}
                                            </span>
                                            <span
                                                v-if="
                                                    transaction.disbursement_no
                                                "
                                                class="text-xs text-gray-500"
                                            >
                                                Pencairan:
                                                {{
                                                    transaction.disbursement_no
                                                }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        {{
                                            new Date(
                                                transaction.date,
                                            ).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })
                                        }}
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        {{ transaction.quantity || 0 }}
                                    </td>
                                    <td
                                        class="px-4 py-3 text-right whitespace-nowrap"
                                    >
                                        Rp
                                        {{
                                            new Intl.NumberFormat('id-ID', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(transaction.price || 0)
                                        }}
                                    </td>
                                    <td
                                        class="px-4 py-3 text-right font-semibold whitespace-nowrap text-blue-600"
                                    >
                                        Rp
                                        {{
                                            new Intl.NumberFormat('id-ID', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(transaction.amount || 0)
                                        }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            :class="{
                                                'border-green-200 bg-green-100 text-green-700':
                                                    [
                                                        'approved',
                                                        'released',
                                                        'completed',
                                                    ].includes(
                                                        transaction.status,
                                                    ),
                                                'border-yellow-200 bg-yellow-100 text-yellow-700':
                                                    [
                                                        'pending',
                                                        'submitted',
                                                    ].includes(
                                                        transaction.status,
                                                    ),
                                                'border-red-200 bg-red-100 text-red-700':
                                                    [
                                                        'rejected',
                                                        'cancelled',
                                                    ].includes(
                                                        transaction.status,
                                                    ),
                                                'border-blue-200 bg-blue-100 text-blue-700':
                                                    ['draft'].includes(
                                                        transaction.status,
                                                    ),
                                            }"
                                        >
                                            {{ transaction.status || 'draft' }}
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                            <!-- Table Footer dengan Total -->
                            <tfoot class="bg-gray-50 font-semibold">
                                <tr>
                                    <td
                                        colspan="5"
                                        class="px-4 py-3 text-right"
                                    >
                                        Total Keseluruhan:
                                    </td>
                                    <td
                                        class="px-4 py-3 text-right text-blue-700"
                                    >
                                        Rp
                                        {{
                                            new Intl.NumberFormat('id-ID', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(
                                                transactions.reduce(
                                                    (sum, t) =>
                                                        sum + (t.amount || 0),
                                                    0,
                                                ),
                                            )
                                        }}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div class="flex justify-end border-t pt-4">
                    <Button @click="showTransactionDialog = false"
                        >Tutup</Button
                    >
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
@media print {
    .no-print {
        display: none !important;
    }
}
</style>
