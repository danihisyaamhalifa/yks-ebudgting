<template>
    <div class="budget-disbursement-picker">
        <!-- Input dengan append button -->
        <div class="flex gap-2">
            <Input
                :value="displayValue"
                readonly
                :disabled="disabled"
                :class="[
                    'flex-1 cursor-default bg-muted',
                    disabled ? 'opacity-50' : '',
                ]"
                :placeholder="placeholder"
            />
            <Button
                type="button"
                variant="default"
                size="icon"
                @click="openDialog"
                :disabled="disabled"
                class="shrink-0"
            >
                <MoreHorizontal class="h-4 w-4" />
            </Button>
        </div>

        <!-- Dialog -->
        <Dialog v-model:open="dialogOpen">
            <DialogContent
                class="flex h-[90vh] max-h-[90vh] w-[95vw] max-w-6xl flex-col lg:max-w-6xl"
                @interact-outside="(e: Event) => e.preventDefault()"
            >
                <DialogHeader>
                    <DialogTitle>Pengajuan Pencairan</DialogTitle>
                </DialogHeader>

                <div class="flex-1 overflow-hidden">
                    <div
                        class="flex h-full flex-col overflow-hidden rounded-lg border"
                    >
                        <!-- Search Input -->
                        <div class="border-b p-3">
                            <div class="relative">
                                <Search
                                    class="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground"
                                />
                                <Input
                                    v-model="searchQuery"
                                    placeholder="Cari Data Pengajuan..."
                                    class="max-w-xs pl-8"
                                />
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead class="w-[50px]"
                                            >Pilih</TableHead
                                        >
                                        <TableHead>Unit</TableHead>
                                        <TableHead>No. Pengajuan</TableHead>
                                        <TableHead>Tanggal Pengajuan</TableHead>
                                        <TableHead>Kegiatan</TableHead>
                                        <TableHead class="text-right"
                                            >Nilai Diajukan</TableHead
                                        >
                                        <TableHead class="text-right"
                                            >Sudah Dicairkan</TableHead
                                        >
                                        <TableHead class="text-right"
                                            >Sisa</TableHead
                                        >
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <template
                                        v-if="paginatedDisbursements.length > 0"
                                    >
                                        <TableRow
                                            v-for="disbursement in paginatedDisbursements"
                                            :key="disbursement.id"
                                            :class="[
                                                'cursor-pointer hover:bg-muted/50',
                                                String(tempSelectedId) ===
                                                    String(disbursement.id) &&
                                                    'bg-muted',
                                            ]"
                                            @click="
                                                selectDisbursement(disbursement)
                                            "
                                        >
                                            <TableCell @click.stop>
                                                <RadioGroup
                                                    :model-value="
                                                        String(
                                                            tempSelectedId ||
                                                                '',
                                                        )
                                                    "
                                                    @update:model-value="
                                                        () =>
                                                            selectDisbursement(
                                                                disbursement,
                                                            )
                                                    "
                                                >
                                                    <RadioGroupItem
                                                        :value="
                                                            String(
                                                                disbursement.id,
                                                            )
                                                        "
                                                        :id="`disbursement-${disbursement.id}`"
                                                    />
                                                </RadioGroup>
                                            </TableCell>
                                            <TableCell>
                                                {{
                                                    disbursement.unit
                                                        ?.unit_name ||
                                                    disbursement.request_header
                                                        ?.unit?.unit_name ||
                                                    '-'
                                                }}
                                            </TableCell>
                                            <TableCell class="font-medium">
                                                {{
                                                    disbursement.disbursement_no
                                                }}
                                            </TableCell>
                                            <TableCell>
                                                {{
                                                    formatDate(
                                                        disbursement.disbursement_date,
                                                    )
                                                }}
                                            </TableCell>
                                            <TableCell>
                                                <div class="flex flex-col">
                                                    <span>{{
                                                        disbursement
                                                            .request_activity
                                                            ?.description || '-'
                                                    }}</span>
                                                    <span
                                                        v-if="
                                                            disbursement.notes
                                                        "
                                                        class="text-xs text-muted-foreground"
                                                    >
                                                        {{ disbursement.notes }}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                class="text-right font-medium"
                                            >
                                                {{
                                                    formatCurrency(
                                                        disbursement.total_amount,
                                                    )
                                                }}
                                            </TableCell>
                                            <TableCell
                                                class="text-right font-medium"
                                            >
                                                {{
                                                    formatCurrency(
                                                        disbursement.released_amount?? 0,
                                                    )
                                                }}
                                            </TableCell>
                                            <TableCell
                                                class="text-right font-medium"
                                            >
                                                {{
                                                    formatCurrency(
                                                        disbursement.remaining_amount?? 0,
                                                    )
                                                }}
                                            </TableCell>
                                        </TableRow>
                                    </template>
                                    <TableRow v-else>
                                        <TableCell
                                            colspan="7"
                                            class="py-8 text-center text-muted-foreground"
                                        >
                                            <div
                                                class="flex flex-col items-center gap-2"
                                            >
                                                <Inbox class="h-8 w-8" />
                                                <span>
                                                    {{
                                                        searchQuery
                                                            ? 'Tidak ada data yang sesuai dengan pencarian'
                                                            : 'Belum ada pengajuan pencairan'
                                                    }}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalItems > 0" class="border-t p-3">
                            <div class="flex items-center justify-between">
                                <div class="text-sm text-muted-foreground">
                                    Menampilkan {{ startIndex }} -
                                    {{ endIndex }} dari {{ totalItems }} data
                                </div>
                                <div class="flex items-center space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        :disabled="currentPage === 1"
                                        @click="currentPage--"
                                    >
                                        <ChevronLeft class="h-4 w-4" />
                                        Sebelumnya
                                    </Button>
                                    <div class="flex items-center gap-1">
                                        <Button
                                            v-for="page in visiblePages"
                                            :key="page"
                                            type="button"
                                            :variant="
                                                page === currentPage
                                                    ? 'default'
                                                    : 'outline'
                                            "
                                            size="sm"
                                            class="h-9 w-9 p-0"
                                            @click="currentPage = page"
                                        >
                                            {{ page }}
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        :disabled="currentPage === totalPages"
                                        @click="currentPage++"
                                    >
                                        Selanjutnya
                                        <ChevronRight class="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        @click="dialogOpen = false"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        @click="confirmSelection"
                        :disabled="!tempSelectedId"
                    >
                        Pilih
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BudgetDisbursementHeader } from '@/types/disburse';
import {
    AlertCircleIcon,
    CheckCircleIcon,
    ChevronLeft,
    ChevronRight,
    ClockIcon,
    FileTextIcon,
    Inbox,
    MoreHorizontal,
    Search,
    XCircleIcon,
} from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

interface Props {
    modelValue?: string | number | null;
    disabled?: boolean;
    placeholder?: string;
    approvedDisbursements?: BudgetDisbursementHeader[];
    filterStatus?: string[]; // Optional: ['approved', 'paid']
}

interface Emits {
    (e: 'update:modelValue', value: string | number | null): void;
    (e: 'select', disbursement: BudgetDisbursementHeader): void;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    disabled: false,
    placeholder: 'Pilih Pengajuan Pencairan',
    approvedDisbursements: () => [],
    filterStatus: () => [],
});

const emit = defineEmits<Emits>();

// State
const dialogOpen = ref(false);
const searchQuery = ref('');
const tempSelectedId = ref<string | null>(
    props.modelValue ? String(props.modelValue) : null,
);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Status Config for Disbursement
const getStatusConfig = (status: string) => {
    const statusConfig: Record<
        string,
        { bg: string; icon: any; text: string }
    > = {
        draft: {
            bg: 'bg-gray-100 text-gray-800',
            icon: FileTextIcon,
            text: 'Draf',
        },
        submitted: {
            bg: 'bg-blue-100 text-blue-800',
            icon: ClockIcon,
            text: 'Diajukan',
        },
        verified: {
            bg: 'bg-yellow-100 text-yellow-800',
            icon: AlertCircleIcon,
            text: 'Diverifikasi',
        },
        approved: {
            bg: 'bg-green-100 text-green-800',
            icon: CheckCircleIcon,
            text: 'Disetujui',
        },
        paid: {
            bg: 'bg-purple-100 text-purple-800',
            icon: CheckCircleIcon,
            text: 'Dibayarkan',
        },
        rejected: {
            bg: 'bg-red-100 text-red-800',
            icon: XCircleIcon,
            text: 'Ditolak',
        },
        cancelled: {
            bg: 'bg-gray-100 text-gray-800',
            icon: XCircleIcon,
            text: 'Dibatalkan',
        },
    };
    return (
        statusConfig[status] || {
            bg: 'bg-gray-100',
            icon: FileTextIcon,
            text: status,
        }
    );
};

// Filter disbursements
const filteredDisbursements = computed(() => {
    let data = props.approvedDisbursements;

    // Apply status filter if provided
    if (props.filterStatus && props.filterStatus.length > 0) {
        data = data.filter((item) => props.filterStatus.includes(item.status));
    }

    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        data = data.filter(
            (disbursement) =>
                disbursement.disbursement_no?.toLowerCase().includes(query) ||
                disbursement.request_header?.request_no
                    ?.toLowerCase()
                    .includes(query) ||
                disbursement.unit?.unit_name?.toLowerCase().includes(query) ||
                disbursement.request_header?.unit?.unit_name
                    ?.toLowerCase()
                    .includes(query),
        );
    }

    return data;
});

// Pagination
const totalItems = computed(() => filteredDisbursements.value.length);
const totalPages = computed(() =>
    Math.ceil(totalItems.value / itemsPerPage.value),
);

const paginatedDisbursements = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredDisbursements.value.slice(start, end);
});

const startIndex = computed(() => {
    if (totalItems.value === 0) return 0;
    return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endIndex = computed(() => {
    return Math.min(currentPage.value * itemsPerPage.value, totalItems.value);
});

const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
});

// Selected disbursement
const selectedDisbursement = computed(() => {
    if (!props.modelValue) return null;
    return props.approvedDisbursements.find(
        (d) => String(d.id) === String(props.modelValue),
    );
});

const displayValue = computed(() => {
    if (!selectedDisbursement.value) return '';
    const unitName =
        selectedDisbursement.value.unit?.unit_name ||
        selectedDisbursement.value.request_header?.unit?.unit_name ||
        '';
    return `${selectedDisbursement.value.disbursement_no} - ${unitName}`;
});

// Methods
const openDialog = () => {
    tempSelectedId.value = props.modelValue ? String(props.modelValue) : null;
    searchQuery.value = '';
    currentPage.value = 1;
    dialogOpen.value = true;
};

const selectDisbursement = (disbursement: BudgetDisbursementHeader) => {
    tempSelectedId.value = String(disbursement.id);
};

const confirmSelection = () => {
    if (tempSelectedId.value) {
        const stringId = String(tempSelectedId.value);
        emit('update:modelValue', stringId);

        const selectedDisbursementData = props.approvedDisbursements.find(
            (d) => String(d.id) === stringId,
        );

        if (selectedDisbursementData) {
            emit('select', selectedDisbursementData);
        }
    }
    dialogOpen.value = false;
};

// Format helpers
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Watch search to reset page
watch(searchQuery, () => {
    currentPage.value = 1;
});
</script>
