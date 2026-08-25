<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/vue3';
import axios from 'axios';
import {
    ArrowLeft,
    Calendar,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Download,
    FileText,
    Info,
    Target,
    Upload,
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

// Interface
interface BudgetRequestDetail {
    id: number;
    description: string;
    activity_item_id: number | null;
    quantity: number;
    unit_measure_id?: number | null;
    unit_price: number;
    total_price: number;
    unit_measure_name?: string;
}

interface BudgetActivity {
    id: number;
    activity_id: number;
    description: string;
    activity_code?: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    showItems: boolean;
    request_items: BudgetRequestDetail[];
    files: UploadedFile[];
    output_indicator: string;
}

interface UploadedFile {
    id?: number;
    name: string;
    file?: File;
    size?: number;
    type?: string;
    url?: string;
    isExisting?: boolean;
    status?: string;
}

interface BudgetRequestHeader {
    id?: number;
    request_no: string;
    request_date: string;
    fiscal_year_id: number;
    fiscal_year_name?: string;
    academic_period_id: number;
    academic_period_name?: string;
    unit_id: number;
    unit_name?: string;
    budget_type: string;
    budget_type_display?: string;
    budget_category_id: number;
    budget_category_name?: string;
    sub_budget_category_id: number;
    sub_budget_category_name?: string;
    description: string;
    status: string;
    status_display: string;
    total_amount: number;
}

// Props
const props = defineProps<{
    id: number | string;
}>();

// State
const isLoading = ref(false);
const formData = ref<BudgetRequestHeader>({
    request_no: '',
    request_date: '',
    fiscal_year_id: 0,
    fiscal_year_name: '',
    academic_period_id: 0,
    academic_period_name: '',
    unit_id: 0,
    unit_name: '',
    budget_type: '',
    budget_type_display: '',
    budget_category_id: 0,
    budget_category_name: '',
    sub_budget_category_id: 0,
    sub_budget_category_name: '',
    description: '',
    status: '',
    status_display: '',
    total_amount: 0,
});

const budgetActivities = ref<BudgetActivity[]>([]);

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Perencanaan Anggaran',
        href: '/perencanaan-anggaran',
    },
    {
        title: 'Detail Perencanaan Anggaran',
        href: '',
    },
];

// Format currency
const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID').format(num || 0);
};

// Format date
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Format file size
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Status color
const statusVariant = computed(() => {
    const status = formData.value.status?.toUpperCase();
    switch (status) {
        case 'DRAFT':
            return 'bg-gray-100 text-gray-700 border-gray-300';
        case 'SUBMITTED':
            return 'bg-blue-100 text-blue-700 border-blue-300';
        case 'APPROVED':
            return 'bg-green-100 text-green-700 border-green-300';
        case 'RETURNED':
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'REJECTED':
            return 'bg-red-100 text-red-700 border-red-300';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-300';
    }
});

// Status description
const statusDescription = computed(() => {
    const status = (formData.value.status ?? 'DRAFT').toUpperCase();
    switch (status) {
        case 'DRAFT':
            return 'Masih dalam penyusunan';
        case 'SUBMITTED':
            return 'Menunggu persetujuan';
        case 'APPROVED':
            return 'Telah disetujui';
        case 'RETURNED':
            return 'Dikembalikan, perlu revisi';
        case 'REJECTED':
            return 'Ditolak';
        default:
            return '';
    }
});

// Budget type label
const budgetTypeLabel = computed(() => {
    return formData.value.budget_type === 'budgeter' ? 'Budgeter' : 'Non Budgeter';
});

// Total budget
const totalBudget = computed(() => {
    const total = budgetActivities.value.reduce((sum, activity) => {
        return sum + (activity.total_amount || 0);
    }, 0);
    return total;
});

// Load data
const loadBudgetRequest = async () => {
    isLoading.value = true;

    try {
        const response = await axios.get(`/api/v1/budget-requests/${props.id}`);
        const data = response.data.data;

        // Transform header
        formData.value = {
            id: data.id,
            request_no: data.request_no,
            request_date: data.request_date,
            fiscal_year_id: data.fiscal_year_id,
            fiscal_year_name: data.fiscal_year?.year || '',
            academic_period_id: data.academic_period_id,
            academic_period_name: data.academic_period?.display_name || '',
            unit_id: data.unit_id,
            unit_name: data.unit?.unit_name || '',
            budget_type: data.budget_type,
            budget_type_display: data.budget_type === 'budgeter' ? 'Budgeter' : 'Non Budgeter',
            budget_category_id: data.budget_category_id,
            budget_category_name: data.budget_category?.name || '',
            sub_budget_category_id: data.sub_budget_category_id,
            sub_budget_category_name: data.sub_budget_category?.name || '',
            description: data.notes || '',
            status: data.status,
            status_display: data.status_display,
            total_amount: data.total_amount,
        };

        // Transform activities - default showItems = true
        budgetActivities.value = (data.request_activities || []).map((activity: any) => ({
            id: activity.id,
            activity_id: activity.activity_id,
            description: activity.activity?.name || activity.description || '',
            activity_code: activity.activity?.code || '',
            start_date: activity.start_date ? activity.start_date.split('T')[0] : '',
            end_date: activity.end_date ? activity.end_date.split('T')[0] : '',
            total_amount: activity.total_amount || 0,
            showItems: true, // Default expand
            request_items: (activity.request_items || []).map((detail: any) => ({
                id: detail.id,
                activity_item_id: detail.activity_item_id,
                description: detail.activity_item?.item_name || detail.description || '',
                quantity: detail.volume || 0,
                unit_measure_id: detail.unit_measure_id || 0,
                unit_measure_name: detail.unit_measure?.name || '',
                unit_price: detail.unit_price || 0,
                total_price: detail.total_amount || 0,
            })),
            files: (activity.documents || []).map((doc: any) => ({
                id: doc.id,
                name: doc.document_name,
                size: doc.file_size,
                type: doc.file_type,
                url: doc.file_path,
                isExisting: true,
                status: 'success',
            })),
            output_indicator: activity.output_indicator || '',
        }));
    } catch (error) {
        console.error('Failed to load budget request:', error);
        toast.error('Gagal memuat data perencanaan anggaran');
        router.visit('/perencanaan-anggaran');
    } finally {
        isLoading.value = false;
    }
};

// Toggle activity detail
const toggleActivityDetail = (index: number) => {
    budgetActivities.value[index].showItems = !budgetActivities.value[index].showItems;
};

// Download file
const downloadFile = (file: UploadedFile) => {
    if (file.url) {
        window.open(file.url, '_blank');
    }
};

// Go back
const goBack = () => {
    router.visit('/perencanaan-anggaran');
};

onMounted(() => {
    loadBudgetRequest();
});
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="rounded-lg border bg-background p-6 shadow-sm">
            <!-- Loading Indicator -->
            <div
                v-if="isLoading"
                class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
            >
                <div
                    class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <span class="text-sm font-medium">Mengambil data...</span>
            </div>

            <!-- Header -->
            <div class="mb-6 border-b pb-4">
                <div class="flex items-start justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-foreground">
                            Detail Perencanaan Anggaran
                        </h1>
                        <p class="mt-1 text-sm text-muted-foreground">
                            Informasi lengkap perencanaan anggaran
                        </p>
                    </div>
                </div>

                <!-- Info Bar -->
                <div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <div v-if="formData.request_no" class="flex items-center gap-2">
                        <CalendarDays class="h-4 w-4 text-muted-foreground" />
                        <span class="font-semibold text-foreground">No Perencanaan:</span>
                        <span class="text-foreground">{{ formData.request_no }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-muted-foreground" />
                        <span class="font-semibold text-foreground">Tanggal:</span>
                        <span class="text-foreground">{{ formatDate(formData.request_date) }}</span>
                    </div>
                    <div class="ml-auto flex items-center gap-2">
                        <Info class="h-4 w-4 text-blue-500" />
                        <span class="font-semibold text-foreground">Status:</span>
                        <span class="font-medium text-foreground">{{ statusDescription }}</span>
                    </div>
                </div>
            </div>

            <!-- Detail Informasi -->
            <div class="space-y-6">
                <!-- Header Info Grid -->
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <!-- Kolom Kiri -->
                    <div class="space-y-4">
                        <div>
                            <Label class="text-xs font-medium text-muted-foreground uppercase">Unit</Label>
                            <p class="mt-1 text-sm font-medium text-foreground">
                                {{ formData.unit_name || '-' }}
                            </p>
                        </div>
                        <div>
                            <Label class="text-xs font-medium text-muted-foreground uppercase">Tahun Anggaran</Label>
                            <p class="mt-1 text-sm font-medium text-foreground">
                                {{ formData.fiscal_year_name || '-' }}
                            </p>
                        </div>
                        <div>
                            <Label class="text-xs font-medium text-muted-foreground uppercase">Periode Akademik</Label>
                            <p class="mt-1 text-sm font-medium text-foreground">
                                {{ formData.academic_period_name || '-' }}
                            </p>
                        </div>
                    </div>

                    <!-- Kolom Kanan -->
                    <div class="space-y-4">
                        <div>
                            <Label class="text-xs font-medium text-muted-foreground uppercase">Tipe Anggaran</Label>
                            <p class="mt-1 text-sm font-medium text-foreground">
                                {{ budgetTypeLabel || '-' }}
                            </p>
                        </div>
                        <div>
                            <Label class="text-xs font-medium text-muted-foreground uppercase">Kategori Anggaran</Label>
                            <p class="mt-1 text-sm font-medium text-foreground">
                                {{ formData.budget_category_name || '-' }}
                            </p>
                        </div>
                        <div>
                            <Label class="text-xs font-medium text-muted-foreground uppercase">Sub Kategori Anggaran</Label>
                            <p class="mt-1 text-sm font-medium text-foreground">
                                {{ formData.sub_budget_category_name || '-' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Deskripsi -->
                <div class="border-t pt-4">
                    <Label class="text-xs font-medium text-muted-foreground uppercase">Deskripsi / Tujuan</Label>
                    <p class="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {{ formData.description || '-' }}
                    </p>
                </div>

                <!-- Rincian Kegiatan -->
                <div class="border-t pt-6">
                    <div class="mb-4">
                        <h3 class="text-lg font-semibold text-foreground">Rincian Kegiatan</h3>
                        <p class="text-sm text-muted-foreground">
                            {{ budgetActivities.length }} kegiatan dianggarkan
                        </p>
                    </div>

                    <!-- Loading State -->
                    <div
                        v-if="isLoading"
                        class="flex items-center justify-center py-12"
                    >
                        <div class="text-center">
                            <div
                                class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                            ></div>
                            <p class="text-sm text-muted-foreground">Memuat data kegiatan...</p>
                        </div>
                    </div>

                    <!-- Activities List -->
                    <div v-else class="space-y-4">
                        <div
                            v-for="(activity, index) in budgetActivities"
                            :key="activity.id"
                            class="rounded-lg border bg-card"
                        >
                            <!-- Activity Header - Clickable -->
                            <div
                                class="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                @click="toggleActivityDetail(index)"
                            >
                                <div class="flex items-center gap-3">
                                    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
    {{ index + 1 }}
</span>
                                    <div>
                                        <h4 class="font-semibold text-foreground">
                                            {{ activity.activity_code ? `[${activity.activity_code}] ` : '' }}{{ activity.description || 'Tanpa Nama Kegiatan' }}
                                        </h4>
                                        <div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar class="h-3 w-3" />
                                            <span>{{ formatDate(activity.start_date) }} - {{ formatDate(activity.end_date) }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="text-right">
                                        <p class="text-xs text-muted-foreground">Total</p>
                                        <p class="text-sm font-bold text-primary">
                                            Rp {{ formatCurrency(activity.total_amount) }}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        class="h-8 w-8 p-0"
                                        :title="activity.showItems ? 'Sembunyikan detail' : 'Lihat detail'"
                                    >
                                        <ChevronUp v-if="activity.showItems" class="h-5 w-5" />
                                        <ChevronDown v-else class="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <!-- Activity Detail (Collapsible) -->
                            <div v-if="activity.showItems" class="border-t px-4 py-4 space-y-4">
                                <!-- Items Table -->
                                <div>
                                    <h5 class="mb-2 text-sm font-medium text-foreground">Rincian Item</h5>
                                    <div class="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead class="w-12">No</TableHead>
                                                    <TableHead>Item Anggaran</TableHead>
                                                    <TableHead class="w-28 text-right">Volume</TableHead>
                                                    <TableHead class="w-40">Satuan</TableHead>
                                                    <TableHead class="w-44 text-right">Biaya Diajukan</TableHead>
                                                    <TableHead class="w-44 text-right">Total Biaya</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow
                                                    v-for="(item, itemIndex) in activity.request_items"
                                                    :key="item.id"
                                                >
                                                    <TableCell class="font-medium">
                                                        {{ itemIndex + 1 }}
                                                    </TableCell>
                                                    <TableCell>{{ item.description || '-' }}</TableCell>
                                                    <TableCell class="text-right">{{ Number(item.quantity).toFixed(0) }}</TableCell>
                                                    <TableCell>{{ item.unit_measure_name || '-' }}</TableCell>
                                                    <TableCell class="text-right">
                                                        Rp {{ formatCurrency(item.unit_price) }}
                                                    </TableCell>
                                                    <TableCell class="text-right font-medium">
                                                        Rp {{ formatCurrency(item.total_price) }}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow v-if="activity.request_items.length === 0">
                                                    <TableCell colspan="6" class="py-4 text-center text-muted-foreground">
                                                        Tidak ada item
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <!-- Subtotal -->
                                <div class="flex justify-end">
                                    <div class="w-64 space-y-1 rounded border bg-muted p-3 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-muted-foreground">Jumlah Item:</span>
                                            <span class="font-medium">{{ activity.request_items.length }}</span>
                                        </div>
                                        <div class="flex justify-between border-t pt-1">
                                            <span class="font-medium text-foreground">Subtotal Kegiatan:</span>
                                            <span class="font-bold text-primary">
                                                Rp {{ formatCurrency(activity.total_amount) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Output Indicator -->
                                <div class="border-t pt-4">
                                    <div class="mb-2 flex items-center gap-2">
                                        <Target class="h-4 w-4 text-muted-foreground" />
                                        <h5 class="text-sm font-medium text-foreground">Indikator Output</h5>
                                    </div>
                                    <p class="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                        {{ activity.output_indicator || 'Tidak ada indikator output' }}
                                    </p>
                                </div>

                                <!-- Attachments -->
                                <div class="border-t pt-4">
                                    <div class="mb-3 flex items-center gap-2">
                                        <Upload class="h-4 w-4" />
                                        <h5 class="text-sm font-medium text-foreground">Lampiran Dokumen Perencanaan</h5>
                                        <span class="text-xs text-muted-foreground">
                                            ({{ activity.files?.length || 0 }} file)
                                        </span>
                                    </div>
                                    <div v-if="activity.files?.length > 0" class="space-y-2">
                                        <div
                                            v-for="(file, fileIndex) in activity.files"
                                            :key="fileIndex"
                                            class="flex items-center justify-between rounded-md border bg-background p-3"
                                        >
                                            <div class="flex items-center gap-3">
                                                <FileText class="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p class="text-sm font-medium text-foreground">{{ file.name }}</p>
                                                    <p class="text-xs text-muted-foreground">
                                                        {{ formatFileSize(file.size || 0) }}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                v-if="file.url"
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                @click="downloadFile(file)"
                                                title="Download file"
                                            >
                                                <Download class="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p v-else class="text-sm text-muted-foreground">
                                        Tidak ada lampiran
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div
                            v-if="budgetActivities.length === 0"
                            class="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground"
                        >
                            <FileText class="h-8 w-8" />
                            <p>Tidak ada kegiatan</p>
                        </div>
                    </div>
                </div>

                <!-- Total Summary -->
                <div class="flex justify-end border-t pt-4">
                    <div class="w-80 space-y-3 rounded-lg border bg-primary/5 p-4">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Jumlah Kegiatan:</span>
                            <span class="font-medium">{{ budgetActivities.length }}</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span class="text-lg font-medium text-foreground">Total Anggaran:</span>
                            <span class="text-lg font-bold text-primary">
                                Rp {{ formatCurrency(totalBudget) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-start border-t pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        @click="goBack"
                        class="gap-2"
                    >
                        <ArrowLeft class="h-4 w-4" />
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}
</style>