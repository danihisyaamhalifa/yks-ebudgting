<!-- components/BudgetRequestPicker.vue -->
<template>
    <div class="budget-request-picker">
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
                variant="outline"
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
                class="flex h-[90vh] max-h-[90vh] w-[95vw] max-w-5xl flex-col lg:max-w-3xl"
            >
                <DialogHeader>
                    <DialogTitle>Daftar Perencanaan Anggaran</DialogTitle>
                    <DialogDescription>
                        Pilih salah satu perencanaan anggaran yang sudah
                        disetujui.
                    </DialogDescription>
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
                                    placeholder="Cari Perencanaan Anggaran"
                                    class="max-w-xs pl-8"
                                />
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="flex-1 overflow-auto">
                            <Table>
    <TableHeader>
        <TableRow>
            <TableHead class="w-[50px]">Pilih</TableHead>
            <TableHead>No. Perencanaan</TableHead>
            <TableHead>Tgl. Perencanaan</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead class="w-[120px] text-right">Total Diajukan</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        <template v-if="paginatedRequests.length > 0">
            <TableRow
                v-for="request in paginatedRequests"
                :key="request.id"
                :class="[
                    'cursor-pointer hover:bg-muted/50',
                    String(tempSelectedId) === String(request.id) && 'bg-muted',
                ]"
                @click="selectRequest(request)"
            >
                <TableCell @click.stop>
                    <RadioGroup
                        :model-value="String(tempSelectedId || '')"
                        @update:model-value="() => selectRequest(request)"
                    >
                        <RadioGroupItem
                            :value="String(request.id)"
                            :id="`request-${request.id}`"
                        />
                    </RadioGroup>
                </TableCell>
                
                <TableCell>
                    <div class="font-medium">
                        {{ request.request_no }}
                    </div>
                </TableCell>

                <TableCell class="text-sm">
                    {{ formatDate(request.request_date) }}
                </TableCell>

                 <TableCell class="align-top text-sm font-medium">
                    {{ request.unit?.unit_name || '-' }}
                </TableCell>
                
                <TableCell class="text-right text-sm font-medium">
                    {{ formatCurrency(request.total_amount) }}
                </TableCell>
            </TableRow>
        </template>
        <TableRow v-else>
            <!-- 5. Ubah colspan dari 5 menjadi 6 karena jumlah kolom bertambah -->
            <TableCell
                colspan="6"
                class="py-8 text-center text-muted-foreground"
            >
                <div class="flex flex-col items-center gap-2">
                    <Inbox class="h-8 w-8" />
                    <span>
                        {{
                            searchQuery
                                ? 'Tidak ada data yang sesuai dengan pencarian'
                                : 'Belum ada perencanaan anggaran yang disetujui'
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
                                    {{ startIndex }} - {{ endIndex }} dari
                                    {{ totalItems }}
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
                                            class="h-8 w-8 p-0 text-sm"
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { BudgetRequestHeader } from '@/types/budget';
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
    approvedBudgetRequests?: BudgetRequestHeader[];
}

interface Emits {
    (e: 'update:modelValue', value: string | number | null): void;
    (e: 'select', request: BudgetRequestHeader): void;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    disabled: false,
    placeholder: 'Pilih Perencanaan Anggaran yang Disetujui',
    approvedBudgetRequests: () => [],
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

// Status Config with short texts
const getStatusConfig = (status: string) => {
    const statusConfig: Record<
        string,
        { bg: string; icon: any; text: string; textShort: string }
    > = {
        draft: {
            bg: 'bg-gray-100 text-gray-800',
            icon: FileTextIcon,
            text: 'Disusun',
            textShort: 'Draft',
        },
        submitted: {
            bg: 'bg-blue-100 text-blue-800',
            icon: ClockIcon,
            text: 'Diajukan',
            textShort: 'Diajukan',
        },
        verified: {
            bg: 'bg-yellow-100 text-yellow-800',
            icon: AlertCircleIcon,
            text: 'Diverifikasi',
            textShort: 'Verif',
        },
        approved: {
            bg: 'bg-green-100 text-green-800',
            icon: CheckCircleIcon,
            text: 'Disetujui',
            textShort: 'Setuju',
        },
        rejected: {
            bg: 'bg-red-100 text-red-800',
            icon: XCircleIcon,
            text: 'Ditolak',
            textShort: 'Tolak',
        },
        cancelled: {
            bg: 'bg-gray-100 text-gray-800',
            icon: XCircleIcon,
            text: 'Dibatalkan',
            textShort: 'Batal',
        },
    };
    
    return (
        statusConfig[status] || {
            bg: 'bg-gray-100',
            icon: FileTextIcon,
            text: status,
            textShort: status.substring(0, 5),
        }
    );
};

// Filter only approved requests
const approvedOnly = computed(() => {
    return props.approvedBudgetRequests.filter(
        (item) => item.status === 'approved',
    );
});

// Filtered and searched data
const filteredRequests = computed(() => {
    let data = approvedOnly.value;

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        data = data.filter(
            (request) =>
                request.request_no?.toLowerCase().includes(query) ||
                request.unit?.unit_name?.toLowerCase().includes(query),
        );
    }

    return data;
});

// Pagination
const totalItems = computed(() => filteredRequests.value.length);
const totalPages = computed(() =>
    Math.ceil(totalItems.value / itemsPerPage.value),
);

const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredRequests.value.slice(start, end);
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

// Selected request
const selectedRequest = computed(() => {
    if (!props.modelValue) return null;
    return approvedOnly.value.find(
        (r) => String(r.id) === String(props.modelValue),
    );
});

const displayValue = computed(() => {
    if (!selectedRequest.value) return '';
    return `${selectedRequest.value.request_no} - ${selectedRequest.value.unit?.unit_name || ''}`;
});

// Methods
const openDialog = () => {
    tempSelectedId.value = props.modelValue ? String(props.modelValue) : null;
    searchQuery.value = '';
    currentPage.value = 1;
    dialogOpen.value = true;
};

const selectRequest = (request: BudgetRequestHeader) => {
    tempSelectedId.value = String(request.id);
};

const confirmSelection = () => {
    if (tempSelectedId.value) {
        const stringId = String(tempSelectedId.value);
        emit('update:modelValue', stringId);

        const selectedRequestData = approvedOnly.value.find(
            (r) => String(r.id) === stringId,
        );

        if (selectedRequestData) {
            emit('select', selectedRequestData);
        }
    }
    dialogOpen.value = false;
};

// Format helpers - more compact
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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
