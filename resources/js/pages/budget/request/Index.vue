<script setup lang="ts">
import DataTable from '@/components/compound/data-table/DataTable.vue';
import { FormDialog } from '@/components/compound/form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    createActionColumn,
    createColumn,
    useDataTable,
} from '@/composables/useDataTable';
import { useUser } from '@/composables/useUser';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { BudgetRequestHeader } from '@/types/budget';
import { Head, router } from '@inertiajs/vue3';
import type { ColumnDef } from '@tanstack/vue-table';
import axios from 'axios';
import {
    BadgeCheckIcon,
    BanknoteIcon,
    CalendarIcon,
    ClockIcon,
    EditIcon,
    EyeIcon,
    FileTextIcon,
    History,
    PlusIcon,
    TrashIcon,
    XCircleIcon,
    ArrowRightIcon
} from 'lucide-vue-next';
import { title } from 'process';
import { computed, h, ref } from 'vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Perencanaan Anggaran',
        href: '',
    },
];

const user = useUser();
const canCreate = computed(
    () => user.hasPermission('create perencanaan_anggaran') ?? false,
);

const loading = ref(false);
const showDeleteDialog = ref(false);
const budgetRequestToDelete = ref<BudgetRequestHeader | null>(null);

const showTimelineDialog = ref(false);
const timelineLoading = ref(false);
const approvalHistory = ref<any[]>([]);
const selectedBudgetRequest = ref<BudgetRequestHeader | null>(null);

// Status config untuk approval history
const approvalStatusConfig: Record<
    string,
    { bg: string; icon: any; text: string }
> = {
    draft: {
        bg: 'bg-gray-100 text-gray-800',
        icon: FileTextIcon,
        text: 'Draft',
    },
    submitted: {
        bg: 'bg-blue-100 text-blue-800',
        icon: ClockIcon,
        text: 'Diajukan, menunggu verifikasi',
    },
    verified: {
        bg: 'bg-yellow-100 text-yellow-800',
        icon: BadgeCheckIcon,
        text: 'Diverifikasi',
    },
    approved: {
        bg: 'bg-green-100 text-green-800',
        icon: BadgeCheckIcon,
        text: 'Disetujui',
    },
    rejected: {
        bg: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
        text: 'Ditolak',
    },
    returned: {
        bg: 'bg-orange-100 text-orange-800',
        icon: XCircleIcon,
        text: 'Dikembalikan',
    },
    paid: {
        bg: 'bg-teal-100 text-teal-800',
        icon: BanknoteIcon,
        text: 'Sudah Dibayar',
    },
    cancelled: {
        bg: 'bg-gray-100 text-gray-800',
        icon: XCircleIcon,
        text: 'Dibatalkan',
    },
};

// Helper function untuk format status change
const formatStatusChange = (fromStatus: string, toStatus: string) => {
    const from = approvalStatusConfig[fromStatus]?.text || fromStatus;
    const to = approvalStatusConfig[toStatus]?.text || toStatus;
    return { from, to };
};

// Format date helper
const formatDateTime = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const columns: ColumnDef<BudgetRequestHeader>[] = [
    createColumn({
        value: 'request_no',
        title: 'No. Perencanaan & Tgl',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h('div', { class: 'space-y-1' }, [
                h(
                    'div',
                    { class: 'font-medium text-sm' },
                    row.original.request_no,
                ),
                h('div', { class: 'flex items-center gap-1.5 text-xs' }, [
                    h(CalendarIcon, { class: 'w-3 h-3' }),
                    h(
                        'span',
                        { class: 'text-xs font-bold text-muted-foreground' },
                        new Date(row.original.request_date).toLocaleDateString(
                            'id-ID',
                            {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            },
                        ),
                    ),
                ]),
            ]);
        },
    }),

    createColumn({
        value: 'unit',
        title: 'Unit',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h(
                'div',
                { class: 'font-medium text-sm' },
                row.original.unit?.unit_name || '-',
            );
        },
    }),

    createColumn({
        value: 'budget_category',
        title: 'Kategori Anggaran',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h('div', { class: 'space-y-0.5' }, [
                h(
                    'div',
                    { class: 'text-xs font-bold ' },
                    `Tipe: ${
                        row.original.budget_type
                            ? row.original.budget_type
                                  .replace('_', ' ')
                                  .replace(/\b\w/g, (c) => c.toUpperCase())
                            : '-'
                    }`,
                ),
                h(
                    'div',
                    { class: 'text-xs font-bold text-muted-foreground' },
                    `Kat: ${row.original.budget_category?.name || '-'}`,
                ),
                h(
                    'div',
                    { class: 'text-xs font-bold text-muted-foreground' },
                    `Sub: ${row.original.sub_budget_category?.name || '-'}`,
                ),
            ]);
        },
    }),

    createColumn({
        value: 'notes',
        title: 'Deskripsi',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            return h(
                'div',
                { class: 'font-medium text-sm' },
                row.original.notes || '-',
            );
        },
    }),

    createColumn({
        value: 'total_amount',
        title: 'Total Anggaran',
        sortable: true,
        searchable: false,
        align: 'right',
        render: ({ row }) => {
            const amount = Number(row.original.total_amount || 0);
            const activityCount = row.original.request_activities?.length || 0;

            return h('div', { class: 'space-y-1' }, [
                h(
                    'div',
                    { class: 'font-medium' },
                    new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(amount),
                ),
                h(
                    'div',
                    { class: 'text-xs font-bold text-muted-foreground' },
                    `${activityCount} kegiatan`,
                ),
            ]);
        },
    }),

    createColumn({
        value: 'status',
        title: 'Status Proses',
        sortable: true,
        searchable: true,
        render: ({ row }) => {
            const status = row.original.status;
            const statusApproval = row.original.approval_status_label;
            const statusConfig: Record<
                string,
                { bg: string; icon: any; text: string }
            > = {
                draft: {
                    bg: 'bg-gray-100 text-gray-800',
                    icon: FileTextIcon,
                    text: 'Masih dalam penyusunan',
                },
                submitted: {
                    bg: 'bg-blue-100 text-blue-800',
                    icon: ClockIcon,
                    text: statusApproval,
                },
                verified: {
                    bg: 'bg-yellow-100 text-yellow-800',
                    icon: BadgeCheckIcon,
                    text: 'Diverifikasi',
                },
                approved: {
                    bg: 'bg-green-100 text-green-800',
                    icon: BadgeCheckIcon,
                    text: 'Telah disetujui',
                },
                rejected: {
                    bg: 'bg-red-100 text-red-800',
                    icon: XCircleIcon,
                    text: 'Ditolak',
                },
                returned: {
                    bg: 'bg-gray-100 text-gray-800',
                    icon: XCircleIcon,
                    text: 'Dikembalikan, perlu revisi',
                },
            };

            const config = statusConfig[status] || {
                bg: 'bg-gray-100',
                icon: FileTextIcon,
                text: status,
            };

            return h(
                Badge,
                {
                    variant: 'secondary',
                    class: `${config.bg} capitalize`,
                },
                [h(config.icon, { class: 'w-3 h-3 mr-1' }), config.text],
            );
        },
    }),

    createActionColumn([
        {
            icon: EyeIcon,
            variant: 'outline',
            show: (row: BudgetRequestHeader) =>
                ['submitted', 'approved', 'rejected'].includes(row.status),
            onClick: (row: BudgetRequestHeader) => editBudgetRequest(row),
        },
        {
            icon: EditIcon,
            variant: 'default',
            show: (row: BudgetRequestHeader) =>
                ['draft', 'returned'].includes(row.status),
            onClick: (row: BudgetRequestHeader) => editBudgetRequest(row),
        },
        {
            icon: TrashIcon,
            variant: 'destructive',
            // show: (row: BudgetRequestHeader) =>
            //     ['submitted', 'draft', 'rejected'].includes(row.status),
            permissions: ['delete perencanaan_anggaran'],
            onClick: (row: BudgetRequestHeader) => deleteBudgetRequest(row),
        },
        {
            icon: History,
            variant: 'default',
            permissions: ['view perencanaan_anggaran'],
            onClick: (row: BudgetRequestHeader) =>
                timelineBudgetDisbursement(row),
        },
    ]),
];

// init dataTable
const dataTable = useDataTable({
    endpoint: '/api/v1/budget-requests',
    columns,
    searchable: true,
    searchPlaceholder: 'Cari No. Perencanaan, Unit...',
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    refreshable: true,
    initialFilters: {
        context: 'input',
    },
});

// Action handlers
const viewBudgetRequest = (budgetRequest: BudgetRequestHeader) => {
    router.visit(`/perencanaan-anggaran/${budgetRequest.id}/view`);
};

const editBudgetRequest = (budgetRequest: BudgetRequestHeader) => {
    router.visit(`/perencanaan-anggaran/${budgetRequest.id}/edit`);
};

const deleteBudgetRequest = (budgetRequest: BudgetRequestHeader) => {
    budgetRequestToDelete.value = budgetRequest;
    showDeleteDialog.value = true;
};

const timelineBudgetDisbursement = async (
    budgetRequest: BudgetRequestHeader,
) => {
    selectedBudgetRequest.value = budgetRequest;
    showTimelineDialog.value = true;

    await fetchApprovalHistory(budgetRequest.id);
};

const goToCreatePage = () => {
    router.visit('/perencanaan-anggaran/input');
};

// handle delete data
const handleDeleteBudgetRequest = async () => {
    if (!budgetRequestToDelete.value) return;

    loading.value = true;
    try {
        await axios.delete(
            `api/v1/budget-requests/${budgetRequestToDelete.value.id}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));

        showDeleteDialog.value = false;
        budgetRequestToDelete.value = null;
        dataTable.actions.refresh();
    } catch (error) {
        console.error('Error deleting budget request:', error);
    } finally {
        loading.value = false;
    }
};

const fetchApprovalHistory = async (requestId: number) => {
    timelineLoading.value = true;
    try {
        const response = await axios.get(
            `/api/v1/budget-requests/${requestId}/approval-history`,
        );
        approvalHistory.value = response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching approval history:', error);
        approvalHistory.value = [];
    } finally {
        timelineLoading.value = false;
    }
};
</script>

<template>
    <Head title="Perencanaan Anggaran" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">
                        Perencanaan Anggaran
                    </h1>
                    <p class="text-muted-foreground">
                        Daftar perencanaan anggaran kegiatan
                    </p>
                </div>
                <div class="flex items-center space-x-2">
                    <Button v-if="canCreate" @click="goToCreatePage">
                        <PlusIcon />
                        Buat Perencanaan
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
                search-placeholder="Cari No. Perencanaan"
                show-pagination
                show-page-info
                empty-message="Data perencanaan anggaran tidak ditemukan"
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
    </AppLayout>

    <!-- Delete Budget Request Dialog -->
    <FormDialog
        v-model:open="showDeleteDialog"
        title="Hapus Perencanaan Anggaran"
        description="Proses ini tidak dapat dibatalkan. Perencanaan Anggaran akan dihapus secara permanen."
        :loading="loading"
        submit-text="Hapus Perencanaan Anggaran"
        submit-variant="destructive"
        cancel-text="Batal"
        size="sm"
        @submit="handleDeleteBudgetRequest"
    >
        <div class="rounded-md border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-800">
                Apakah kamu yakin akan menghapus perencanaan anggaran:
                <strong>{{ budgetRequestToDelete?.request_no }}</strong>
            </p>
        </div>
    </FormDialog>

    <Dialog v-model:open="showTimelineDialog">
        <DialogContent
            class="flex max-h-[85vh] w-[95vw] !max-w-6xl flex-col p-6"
        >
            <DialogHeader class="mb-4 flex-shrink-0">
                <DialogTitle
                    class="flex items-center gap-2 text-lg font-semibold"
                >
                    <History class="h-5 w-5 text-primary" />
                    Riwayat Approval
                </DialogTitle>
                <DialogDescription class="text-sm">
                    Pengajuan pencairan
                    <strong class="ml-1 font-semibold text-foreground">
                        {{ selectedBudgetRequest?.request_no }}
                    </strong>
                </DialogDescription>
            </DialogHeader>

            <div
                v-if="timelineLoading"
                class="flex flex-1 flex-col items-center justify-center py-12"
            >
                <div class="flex flex-col items-center gap-3">
                    <div
                        class="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"
                    ></div>
                    <p class="animate-pulse text-sm text-muted-foreground">
                        Memuat riwayat approval...
                    </p>
                </div>
            </div>

            <div
                v-else-if="approvalHistory.length === 0"
                class="flex flex-1 flex-col items-center justify-center py-12"
            >
                <div
                    class="flex max-w-[320px] flex-col items-center gap-3 text-center"
                >
                    <div
                        class="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
                    >
                        <History class="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <div>
                        <p class="text-sm font-semibold">Belum Ada Riwayat</p>
                        <p class="mt-1 text-xs text-muted-foreground">
                            Belum ada riwayat aktivitas approval untuk
                            perencanaan anggaran ini.
                        </p>
                    </div>
                </div>
            </div>

            <div
                v-else
                class="flex-1 overflow-auto rounded-md border border-muted/40 shadow-sm"
            >
                <div class="min-w-[900px]">
                    <Table>
                        <TableHeader
                            class="sticky top-0 z-10 border-b border-muted/40 bg-background/95 shadow-sm backdrop-blur-sm"
                        >
                            <TableRow class="border-b border-muted/30">
                                <TableHead class="w-[60px] pl-4 text-center"
                                    >No</TableHead
                                >
                                <TableHead class="w-[200px]">User</TableHead>
                                <TableHead class="w-[120px]">Role</TableHead>
                                <TableHead class="w-[320px]"
                                    >Perubahan Status</TableHead
                                >
                                <TableHead class="min-w-[200px]"
                                    >Catatan</TableHead
                                >
                                <TableHead class="w-[160px] pr-4 text-right"
                                    >Tanggal</TableHead
                                >
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow
                                v-for="(history, index) in approvalHistory"
                                :key="history.id"
                                class="border-b-[0.5px] border-muted/20 transition-colors hover:bg-muted/40"
                            >
                                <TableCell class="pl-4 text-center">
                                    {{ index + 1 }}
                                </TableCell>
                                <TableCell>
                                    <div
                                        class="flex max-w-[190px] items-center gap-2"
                                    >
                                        <!-- <div class="flex h-7 w-7 items-center justify-center rounded-full bg-muted flex-shrink-0">
                                <UserIcon class="w-3.5 h-3.5 text-muted-foreground" />
                            </div> -->
                                        <span
                                            class="truncate text-sm"
                                            :title="history.user_name"
                                        >
                                            {{ history.user_name }}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span class="truncate text-sm">
                                        {{ history.user_role }}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div
                                        class="flex flex-wrap items-center gap-1.5"
                                    >
                                        <Badge
                                            :class="[
                                                approvalStatusConfig[
                                                    history.from_status
                                                ]?.bg ||
                                                    'bg-gray-100 text-gray-800',
                                                'border-none px-2 py-0.5 text-[11px] whitespace-nowrap',
                                            ]"
                                            variant="outline"
                                        >
                                            <component
                                                :is="
                                                    approvalStatusConfig[
                                                        history.from_status
                                                    ]?.icon || FileTextIcon
                                                "
                                                class="mr-1 h-3 w-3 flex-shrink-0"
                                            />
                                            {{
                                                formatStatusChange(
                                                    history.from_status,
                                                    history.to_status,
                                                ).from
                                            }}
                                        </Badge>

                                        <ArrowRightIcon
                                            class="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50"
                                        />

                                        <Badge
                                            :class="[
                                                approvalStatusConfig[
                                                    history.to_status
                                                ]?.bg ||
                                                    'bg-gray-100 text-gray-800',
                                                'border-none px-2 py-0.5 text-[11px] whitespace-nowrap',
                                            ]"
                                            variant="outline"
                                        >
                                            <component
                                                :is="
                                                    approvalStatusConfig[
                                                        history.to_status
                                                    ]?.icon || FileTextIcon
                                                "
                                                class="mr-1 h-3 w-3 flex-shrink-0"
                                            />
                                            {{
                                                formatStatusChange(
                                                    history.from_status,
                                                    history.to_status,
                                                ).to
                                            }}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div class="max-w-[280px]">
                                        <p
                                            class="line-clamp-2 text-sm"
                                            :title="history.notes"
                                        >
                                            {{ history.notes || '-' }}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell class="pr-4 text-right">
                                    <div
                                        class="flex items-center justify-end gap-1.5 text-xs whitespace-nowrap"
                                    >
                                        <CalendarIcon
                                            class="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50"
                                        />
                                        {{ formatDateTime(history.action_at) }}
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div
                v-if="approvalHistory.length > 0"
                class="mt-2 flex flex-shrink-0 items-center justify-between border-t pt-4"
            >
                <p class="text-xs text-muted-foreground">
                    Total
                    <span class="font-semibold text-foreground">{{
                        approvalHistory.length
                    }}</span>
                    riwayat log approval ditemukan.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    @click="showTimelineDialog = false"
                    class="h-8 px-3"
                >
                    Tutup
                </Button>
            </div>
        </DialogContent>
    </Dialog>
</template>
