<script setup lang="ts">
import FileUpload from '@/components/file-upload/FileUpload.vue';
import { UploadedFile } from '@/components/file-upload/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/AppLayout.vue';
import BudgetDisbursementPicker from '@/pages/disbursement/components/BudgetDisbursementPicker.vue';
import BankSelect from '@/pages/masterdata/components/BankSelect.vue';
import { BreadcrumbItem } from '@/types';
import { BudgetDisbursementHeader } from '@/types/disburse';
import { Head, router } from '@inertiajs/vue3';
import axios from 'axios';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    Info,
    ListChecks,
    Printer,
    RotateCcw,
    Upload,
    User,
    Wallet,
} from 'lucide-vue-next';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

// =============================================================================
// INTERFACES
// =============================================================================

interface BudgetDisbursement extends BudgetDisbursementHeader {
    request_header?: {
        id: number;
        notes: string;
        activity_code?: string;
        total_amount: number;
        disbursed_amount: number;
        remaining_amount: number;
        unit?: {
            id?: number;
            unit_name?: string;
        };
    };
    request_activity?: {
        id: number;
        description: string;
    };
}

interface BudgetDisbursementItem {
    id: number;
    total_amount: number;
    released_amount: number;
    remaining_amount: number;
    request_item?: {
        id: number;
        description: string;
        volume: number;
        unit_price: number;
        total_amount: number;
        disbursed_amount: number;
    };
}

interface BudgetFundRelease {
    id?: number;
    fund_release_no: string;
    fund_release_date: string;
    budget_disbursement_header_id: number;
    notes?: string;
    status: string;
    total_amount: number;
    fund_source_id?: number | null ;
    payment_type: string;
    files: UploadedFile[];
    recipient_bank_name?: string;
    recipient_account_no?: string;
    recipient_account_name?: string;
    recipient_name: string;
    recipient_position: string;
    recipient_department: string;
}

interface SelectedReleaseItem {
    budget_disbursement_item_id: number;
    description: string;
    total_amount: number;
    is_selected: boolean;
    disbursed_amount: number;
    remaining_amount: number;
    initial_disbursed: number;
    release_amount: number;
    item_notes?: string;
}

interface FundSource {
    id: number;
    code: string;
    name: string;
    fund_source_type: string;
    description: string | null;
    is_active: boolean;
    type?: {
        id: string;
        name: string;
        value: string;
    };
}

interface InvoiceData {
    invoiceNo: string;
    date: string;
    recipientName: string;
    recipientPosition: string;
    recipientDepartment: string;
    activityName: string;
    unitName: string;
    items: SelectedReleaseItem[];
    totalAmount: number;
    notes: string;
    fundSourceName: string;
}

// =============================================================================
// PROPS
// =============================================================================

const props = defineProps<{
    id?: number | string;
    mode: string;
}>();

// =============================================================================
// CONSTANTS
// =============================================================================

const PAYMENT_TYPES = [
    { value: 'cash', label: 'Tunai' },
    { value: 'transfer', label: 'Transfer' },
] as const;

const ACCEPTED_FILE_TYPES = [
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
] as const;

const MAX_FILE_SIZE_MB = 10;
const MAX_NOTES_LENGTH = 500;
const MAX_RECIPIENT_NAME_LENGTH = 100;
const MAX_ACCOUNT_NO_LENGTH = 30;
const MAX_POSITION_LENGTH = 100;
const MAX_DEPARTMENT_LENGTH = 100;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getTodayDate = (): string => new Date().toISOString().split('T')[0];

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

const formatCurrencyWithRp = (amount: number): string => {
    return `Rp ${formatCurrency(amount)}`;
};

const formatDateIndonesian = (dateString: string): string => {
    const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTotalFileSize = (files: any[]): string => {
    if (!files || files.length === 0) return '0 KB';
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    return formatFileSize(totalSize);
};

const formatDateDisplay = (): string => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
};

const terbilang = (angka: number): string => {
    const bilangan = [
        '',
        'Satu',
        'Dua',
        'Tiga',
        'Empat',
        'Lima',
        'Enam',
        'Tujuh',
        'Delapan',
        'Sembilan',
        'Sepuluh',
        'Sebelas',
    ];

    if (angka < 12) return bilangan[angka];
    if (angka < 20) return terbilang(angka - 10) + ' Belas';
    if (angka < 100)
        return (
            terbilang(Math.floor(angka / 10)) +
            ' Puluh ' +
            terbilang(angka % 10)
        );
    if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
    if (angka < 1000)
        return (
            terbilang(Math.floor(angka / 100)) +
            ' Ratus ' +
            terbilang(angka % 100)
        );
    if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
    if (angka < 1000000)
        return (
            terbilang(Math.floor(angka / 1000)) +
            ' Ribu ' +
            terbilang(angka % 1000)
        );
    if (angka < 1000000000)
        return (
            terbilang(Math.floor(angka / 1000000)) +
            ' Juta ' +
            terbilang(angka % 1000000)
        );
    return (
        terbilang(Math.floor(angka / 1000000000)) +
        ' Milyar ' +
        terbilang(angka % 1000000000)
    );
};

const handleAmountUpdate = (value: string | number, item: any) => {
    const sanitized = String(value)
        .replace(/[^0-9.]/g, '')
        .slice(0, 15);
    let newAmount = Number(sanitized) || 0;

    const maxAllowed = (item.total_amount || 0) - (item.initial_disbursed || 0);

    if (newAmount > maxAllowed) {
        newAmount = maxAllowed;
    }

    item.disbursed_amount = newAmount;
    item.remaining_amount = maxAllowed - newAmount;
    item.release_amount = item.disbursed_amount;

    // Trik untuk memaksa input HTML memperbarui tampilannya secara presisi
    nextTick(() => {
        const temp = item.disbursed_amount;
        item.disbursed_amount = '';
        nextTick(() => {
            item.disbursed_amount = temp;
        });
    });
};

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

const mode = ref<'create' | 'edit' | 'view'>('create');
const isSubmitting = ref(false);
const showLoadingSkeleton = ref(true);
const isBackgroundProcessing = ref(false);
const showPrintDialog = ref(false);
const invoiceLayout = ref<'standard' | 'receipt'>('standard');

const selectedDisbursementId = ref<number | null>(null);
const selectedDisbursement = ref<BudgetDisbursement | null>(null);

const approvedDisbursements = ref<BudgetDisbursement[]>([]);
const selectedReleaseItems = ref<SelectedReleaseItem[]>([]);
const fundSources = ref<FundSource[]>([]);

const createInitialFormData = (): BudgetFundRelease => ({
    fund_release_no: '',
    fund_release_date: getTodayDate(),
    budget_disbursement_header_id: 0,
    notes: '',
    status: 'draft',
    total_amount: 0,
    files: [],
    fund_source_id: null,
    payment_type: '',
    recipient_bank_name: '',
    recipient_account_no: '',
    recipient_account_name: '',
    recipient_name: '',
    recipient_position: '',
    recipient_department: '',
});

const formData = ref<BudgetFundRelease>(createInitialFormData());

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    {
        title: 'Dashboard',
        href: 'dashboard',
    },
    {
        title: 'Realisasi Pencairan',
        href: '/realisasi-pencairan',
    },
    {
        title:
            mode.value === 'create'
                ? 'Pencatatan Realisasi Pencairan'
                : 'Detail Realisasi Pencairan',
        href: '',
    },
]);

const currentDate = computed(() => formatDateDisplay());

const isReadOnly = computed(() => {
    if (mode.value === 'create') return false;
    const currentStatus = formData.value.status?.toUpperCase();
    return currentStatus !== 'DRAFT';
});

const isDraftStatus = computed(() => {
    return formData.value.status?.toUpperCase() === 'DRAFT';
});

const isSubmittedStatus = computed(() => {
    return formData.value.status?.toUpperCase() === 'SUBMITTED';
});

const isTransferredStatus = computed(() => {
    return formData.value.status?.toUpperCase() === 'TRANSFERRED';
});

const statusDescription = computed(() => {
    const status = (formData.value.status ?? 'DRAFT').toUpperCase();
    const statusMap: Record<string, string> = {
        DRAFT: 'Masih dalam penyusunan',
        SUBMITTED: 'Menunggu pembayaran',
        TRANSFERRED: 'Sudah dibayarkan',
    };
    return statusMap[status] || '';
});

const statusColorClass = computed(() => {
    const status = formData.value.status?.toUpperCase();
    if (status === 'TRANSFERRED') return 'text-green-500';
    if (status === 'SUBMITTED') return 'text-blue-500';
    return 'text-yellow-500';
});

const statusTextColorClass = computed(() => {
    const status = formData.value.status?.toUpperCase();
    if (status === 'TRANSFERRED') return 'text-green-600';
    if (status === 'SUBMITTED') return 'text-blue-600';
    return 'text-yellow-600';
});

const statusBgColorClass = computed(() => {
    const status = formData.value.status?.toUpperCase();
    if (status === 'TRANSFERRED') return 'bg-green-50 border-green-300';
    if (status === 'SUBMITTED') return 'bg-blue-50 border-blue-300';
    return 'bg-yellow-50 border-yellow-300';
});

const showDocumentSection = computed(() => {
    return isTransferredStatus.value || isSubmittedStatus.value;
});

const documentLabel = computed(() => 'Lampiran Bukti Pembayaran');

const isDocumentRequired = computed(() => isSubmittedStatus.value);

const isDocumentDisabled = computed(() => {
    return !isSubmittedStatus.value;
});

const checkedItems = computed(() => {
    return selectedReleaseItems.value.filter((item) => item.is_selected);
});

const totalSelectedItems = computed(() => checkedItems.value.length);

const totalRelease = computed(() => {
    return checkedItems.value.reduce((sum, item) => {
        return sum + (Number(item.disbursed_amount) || 0);
    }, 0);
});

const totalDisbursedAmount = computed(() => {
    return checkedItems.value.reduce((sum, item) => {
        return sum + (Number(item.initial_disbursed) || 0);
    }, 0);
});

const totalRemainingAmount = computed(() => {
    return checkedItems.value.reduce((sum, item) => {
        return sum + (Number(item.remaining_amount) || 0);
    }, 0);
});

const isAllSelected = computed(() => {
    return (
        selectedReleaseItems.value.length > 0 &&
        selectedReleaseItems.value.every((item) => item.is_selected)
    );
});

const isIndeterminate = computed(() => {
    const selectedCount = checkedItems.value.length;
    return (
        selectedCount > 0 && selectedCount < selectedReleaseItems.value.length
    );
});

const hasNoItemsSelected = computed(() => {
    return (
        selectedReleaseItems.value.length > 0 &&
        checkedItems.value.length === 0 &&
        availableItemsCount.value > 0
    );
});

const isCashPayment = computed(() => formData.value.payment_type === 'cash');
const isNonCashPayment = computed(
    () => formData.value.payment_type === 'transfer',
);

const filteredFundSources = computed(() => {
    return fundSources.value;
});

const isItemFullyDisbursed = (item: SelectedReleaseItem): boolean => {
    return (
        item.remaining_amount <= 0 ||
        item.initial_disbursed >= item.total_amount
    );
};

const availableItemsCount = computed(() => {
    return selectedReleaseItems.value.filter(
        (item) => !isItemFullyDisbursed(item),
    ).length;
});

const canPrintInvoice = computed(() => {
    return (
        isCashPayment.value && !!selectedDisbursement.value && isSubmittedStatus.value
    );
});

const canPrintDispositionLetter = computed(() => {
    return !!selectedDisbursement.value && !isSubmittedStatus.value && !isTransferredStatus;
});

const selectedFundSourceName = computed(() => {
    const source = fundSources.value.find(
        (f) => f.id === formData.value.fund_source_id,
    );
    return source ? `${source.code} - ${source.name}` : '';
});

const invoiceData = computed<InvoiceData>(() => ({
    invoiceNo: formData.value.fund_release_no || '(Akan digenerate otomatis)',
    date: formData.value.fund_release_date,
    recipientName: formData.value.recipient_name,
    recipientPosition: formData.value.recipient_position,
    recipientDepartment: formData.value.recipient_department,
    activityName:
        selectedDisbursement.value?.request_activity?.description || '',
    unitName: selectedDisbursement.value?.request_header?.unit?.unit_name || '',
    items: checkedItems.value,
    totalAmount: totalRelease.value,
    notes: formData.value.notes || '',
    fundSourceName: selectedFundSourceName.value,
}));

// =============================================================================
// API METHODS
// =============================================================================

const loadApprovedDisbursements = async (
    filterReleaseStatus: string | null = null,
) => {
    try {
        const params: Record<string, any> = {
            status: ['approved'],
        };

        if (filterReleaseStatus) {
            params.release_status = filterReleaseStatus;
        }

        const { data } = await axios.get('/api/v1/budget-disbursements', {
            params,
        });
        approvedDisbursements.value = data.data || [];
    } catch (error) {
        console.error('Failed to load approved disbursements:', error);
        approvedDisbursements.value = [];
        toast.error('Gagal memuat data pengajuan pencairan');
    }
};

const loadFundSources = async () => {
    try {
        const { data } = await axios.get('/api/v1/select/fund-sources');
        fundSources.value = data.data || [];
    } catch (error) {
        console.error('Failed to load fund sources:', error);
        fundSources.value = [];
        toast.error('Gagal memuat data sumber dana');
    }
};

const loadDisbursementDetails = async () => {
    if (!selectedDisbursementId.value) {
        resetDisbursementSelection();
        return;
    }

    try {
        isBackgroundProcessing.value = true;
        const { data } = await axios.get(
            `/api/v1/budget-disbursements/${selectedDisbursementId.value}`,
        );

        selectedDisbursement.value = data.data;
        formData.value.budget_disbursement_header_id = data.data.id;

        transformItemsToSelectedItems(data.data.items);
    } catch (error) {
        console.error('Failed to load disbursement details:', error);
        toast.error('Gagal memuat detail pengajuan pencairan');
    } finally {
        isBackgroundProcessing.value = false;
    }
};

const loadBudgetFundRelease = async (id: number | string) => {
    try {
        const { data } = await axios.get(`/api/v1/budget-fund-releases/${id}`);
        const release = data.data;

        mapReleaseToFormData(release);

        if (release.disbursement_header) {
            mapReleaseToDisbursementData(release);
        }
    } catch (error) {
        console.error('Failed to load release:', error);
        toast.error('Gagal memuat data pencairan');
    }
};

// =============================================================================
// DATA TRANSFORMATION HELPERS
// =============================================================================

const transformItemsToSelectedItems = (items: BudgetDisbursementItem[]) => {
    if (!items || items.length === 0) {
        selectedReleaseItems.value = [];
        return;
    }

    selectedReleaseItems.value = items.map((item) => {
        const totalDisbursed = parseFloat(String(item.total_amount)); // nilai pengajuan pencairan
        const totalReleased = item.released_amount?? 0; // nilai yang sudah dicairkan
        const remainingAmount = totalDisbursed - totalReleased; // sisa = nilai pengajuan pencairan - nilai yang sudah dicairkan

        return {
            budget_disbursement_item_id: item.id,
            description: item.request_item?.description || '',
            total_amount: item.total_amount,
            is_selected: true,
            disbursed_amount: 0,
            remaining_amount: remainingAmount,
            initial_disbursed: totalReleased,
            release_amount: totalDisbursed,
            item_notes: '',
        };
    });
};

const mapReleaseToFormData = (release: any) => {
    formData.value = {
        id: release.id,
        fund_release_no: release.fund_release_no,
        fund_release_date: release.fund_release_date.split('T')[0],
        budget_disbursement_header_id: release.budget_disbursement_header_id,
        notes: release.notes,
        status: release.status,
        total_amount: parseFloat(release.total_amount),
        files:
            release.documents?.map((att: any) => ({
                id: att.id,
                name: att.document_name,
                file: att.file_path,
                size: att.file_size,
                type: att.file_type,
                url: att.file_path,
                isExisting: true,
                status: 'success',
            })) || [],
        fund_source_id: release.fund_source_id,
        payment_type: release.payment_type || '',
        recipient_bank_name: release.recipient_bank_name || '',
        recipient_account_no: release.recipient_account_no || '',
        recipient_account_name: release.recipient_account_name || '',
        recipient_name: release.recipient_name || '',
        recipient_position: release.recipient_position || '',
        recipient_department: release.recipient_department || '',
    };
};

const mapReleaseToDisbursementData = (release: any) => {
    selectedDisbursement.value = {
        id: release.disbursement_header.id,
        disbursement_no: release.disbursement_header.disbursement_no,
        disbursement_date: release.disbursement_header.disbursement_date,
        budget_request_header_id:
            release.disbursement_header.budget_request_header_id,
        budget_request_activity_id:
            release.disbursement_header.request_activity.id,
        total_amount: parseFloat(release.disbursement_header.total_amount),
        released_amount: parseFloat(release.disbursement_header.released_amount),
        remaining_amount: parseFloat(release.disbursement_header.remaining_amount),
        status: release.disbursement_header.status,
        request_header: release.disbursement_header.request_header,
        request_activity: release.disbursement_header.request_activity,
    };

    const releaseItemIds =
        release.items?.map((item: any) => item.budget_disbursement_item_id) ||
        [];

    selectedReleaseItems.value = release.disbursement_header.items.map(
        (item: any) => {
            const releaseItem = release.items?.find(
                (ri: any) => ri.budget_disbursement_item_id === item.id,
            );

            const totalDisbursed = parseFloat(String(item.total_amount));
            const totalReleased = item.request_item?.disbursed_amount
                ? parseFloat(String(item.request_item.disbursed_amount))
                : 0;
            const releaseAmount = releaseItem?.total_amount
                ? parseFloat(String(releaseItem.total_amount))
                : 0;
            const remainingAmount =
                totalDisbursed - totalReleased - releaseAmount;

            return {
                budget_disbursement_item_id: item.id,
                description: item.request_item?.description || '',
                total_amount: item.total_amount,
                is_selected: releaseItemIds.includes(item.id),
                disbursed_amount: releaseAmount,
                remaining_amount: remainingAmount,
                initial_disbursed: totalReleased,
                release_amount: releaseAmount,
                item_notes: releaseItem?.notes || '',
            };
        },
    );

    selectedDisbursementId.value = release.budget_disbursement_header_id;
};

const resetDisbursementSelection = () => {
    selectedDisbursement.value = null;
    formData.value.budget_disbursement_header_id = 0;
    selectedReleaseItems.value = [];
};

// =============================================================================
// ITEM SELECTION METHODS
// =============================================================================

const toggleSelectAll = () => {
    const newValue = !isAllSelected.value;
    selectedReleaseItems.value.forEach((item) => {
        item.is_selected = newValue;
    });
};

const toggleItemSelect = (itemId: number) => {
    const item = selectedReleaseItems.value.find(
        (item) => item.budget_disbursement_item_id === itemId,
    );
    if (item) {
        item.is_selected = !item.is_selected;
    }
};

// =============================================================================
// PRINT METHODS
// =============================================================================

const printDispositionLetter = () => {
    if (!selectedDisbursement.value) {
        toast.warning('Pilih pengajuan pencairan terlebih dahulu');
        return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
        toast.error('Pop-up diblokir. Mohon izinkan pop-up untuk mencetak.');
        return;
    }

    const content = generateDispositionLetterHTML();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Surat Disposisi Pencairan</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                .letter-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px; }
                .letter-header h1 { font-size: 18px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
                .letter-header .number { font-size: 14px; margin-top: 10px; }
                .letter-body { margin-bottom: 30px; }
                .letter-body p { margin-bottom: 10px; text-align: justify; }
                .info-table { width: 100%; margin: 20px 0; }
                .info-table td { padding: 5px 10px; vertical-align: top; }
                .info-table .label { width: 150px; font-weight: bold; }
                .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }
                .signature-box { width: 200px; text-align: center; }
                .signature-box .name { font-weight: bold; margin-top: 80px; margin-bottom: 5px; }
                @media print {
                    body { padding: 0; }
                    @page { margin: 2cm; }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
};

const generateDispositionLetterHTML = (): string => {
    const data = selectedDisbursement.value;
    if (!data) return '';

    return `
    <!-- Bagian Kop Surat (Disesuaikan dari Screenshot 2026-07-06 110258.jpg) -->
    <div class="disposition-container" style="font-family: Arial, sans-serif; border: 1px solid #000; padding: 15px; max-width: 800px; margin: auto;">
        
        <div class="kop-surat" style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; position: relative;">
            <!-- Jika ada logo instansi, bisa ditambahkan di sini secara absolut -->
            <div style="font-size: 14px; font-weight: bold; letter-spacing: 1px;">YAYASAN DHARMA HUSADA INSANI GARUT</div>
            <div style="font-size: 18px; font-weight: bold; margin: 3px 0;">INSTITUT KESEHATAN KARSA HUSADA</div>
            <div style="font-size: 10px; italic;">SK Menteri Pendidikan Tinggi, Sains, dan Teknologi No. : 25/B/O/2026</div>
            <div style="font-size: 9px; margin-top: 5px;">
                Kampus I : Jl. Subyadinata No. 07 Telp. 0262-235946 - Jawa Barat<br>
                Kampus II : Jl. Nusa Indah No. 24 Telp. 0262-4704803 / 235860 Garut Jawa Barat<br>
                Website : https://www.stikeskarsahusada.ac.id | e-mail : stikeskarsahusada@yahoo.com
            </div>
        </div>

        <!-- Judul Dokumen -->
        <div style="text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 10px; text-transform: uppercase;">
            SURAT DISPOSISI :
        </div>

        <!-- Tabel Bagian Atas -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: -1px;">
            <tr style="border: 1px solid #000;">
                <td style="width: 15%; padding: 6px; border-right: 1px solid #000;">No. Surat</td>
                <td style="padding: 6px;">: ${data.disbursement_no || '-'}</td>
            </tr>
            <tr style="border: 1px solid #000;">
                <td style="padding: 6px; border-right: 1px solid #000;">Dari</td>
                <td style="padding: 6px;">: ${data.request_header?.unit?.unit_name || '-'}</td>
            </tr>
            <tr style="border: 1px solid #000;">
                <td style="padding: 6px; border-right: 1px solid #000;">Perihal</td>
                <td style="padding: 6px;">: Disposisi Pencairan Dana - ${data.request_activity?.description || '-'}</td>
            </tr>
            <tr style="border: 1px solid #000;">
                <td style="padding: 6px; border-right: 1px solid #000;">Lampiran</td>
                <td style="padding: 6px;">: -</td>
            </tr>
            <tr style="border: 1px solid #000;">
                <td style="padding: 6px; border-right: 1px solid #000;">Tanggal</td>
                <td style="padding: 6px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 50%; padding: 0;">: ${formatDateIndonesian(data.disbursement_date || '')}</td>
                            <td style="width: 50%; padding: 0; text-align: right; padding-right: 40px;">Tgl. Masuk : ${formatDateIndonesian(getTodayDate())}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Bagian Informasi / Nilai Uang -->
        <div style="border: 1px solid #000; padding: 10px; margin-bottom: -1px; min-height: 80px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Informasi :</div>
            <div style="padding-left: 15px;">
                Kegiatan: ${data.request_activity?.description || '-'}<br>
                <span style="font-weight: bold; font-size: 15px; display: inline-block; margin-top: 5px;">
                    ${formatCurrencyWithRp(data.total_amount || 0)}
                </span>
            </div>
        </div>

        <!-- Bagian Disampaikan Kepada -->
        <div style="border: 1px solid #000; padding: 10px; min-height: 80px; margin-bottom: 15px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Disampaikan Kepada :</div>
            <div style="padding-left: 15px; font-style: italic;">
                Yth. Bendahara Mohon Realisasi
            </div>
        </div>

        <!-- Bagian Tanda Tangan (Sisi Kanan Sesuai Gambar) -->
        <div style="width: 100%; display: flex; justify-content: flex-end;">
            <div style="width: 250px; text-align: center; font-size: 13px;">
                <div>Garut, ${formatDateIndonesian(getTodayDate())}</div>
                <div style="height: 75px;"></div> <!-- Space untuk tanda tangan fisik -->
                <div style="font-weight: bold; text-decoration: underline;">...................................</div>
                <div style="font-size: 11px; color: #555;">Pejabat Berwenang / Petugas</div>
            </div>
        </div>

    </div>
`;
};

const validateInvoiceData = (): boolean => {
    if (!formData.value.recipient_name) {
        toast.warning('Mohon lengkapi nama penerima terlebih dahulu');
        return false;
    }
    if (!formData.value.recipient_position) {
        toast.warning('Mohon lengkapi jabatan penerima terlebih dahulu');
        return false;
    }
    if (!formData.value.recipient_department) {
        toast.warning(
            'Mohon lengkapi unit/prodi/biro penerima terlebih dahulu',
        );
        return false;
    }
    if (!formData.value.fund_source_id) {
        toast.warning('Mohon pilih sumber dana terlebih dahulu');
        return false;
    }
    if (checkedItems.value.length === 0) {
        toast.warning('Mohon pilih minimal satu item untuk dicairkan');
        return false;
    }
    return true;
};

const openPrintDialog = () => {
    if (!validateInvoiceData()) return;
    invoiceLayout.value = 'standard';
    showPrintDialog.value = true;
};

const openReceiptPrintDialog = () => {
    if (!validateInvoiceData()) return;
    invoiceLayout.value = 'receipt';
    showPrintDialog.value = true;
};

const closePrintDialog = () => {
    showPrintDialog.value = false;
};

const printInvoice = () => {
    if (invoiceLayout.value === 'receipt') {
        printReceiptInvoice();
    } else {
        printStandardInvoice();
    }
};

const printStandardInvoice = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
        toast.error(
            'Pop-up diblokir. Mohon izinkan pop-up untuk mencetak invoice.',
        );
        return;
    }

    const invoiceContent = generateStandardInvoiceHTML();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${invoiceData.value.invoiceNo}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .invoice-header h1 { font-size: 24px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
                .invoice-header .subtitle { font-size: 14px; color: #666; }
                .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                .info-section h3 { font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .info-section .info-row { display: flex; margin-bottom: 5px; font-size: 14px; }
                .info-section .info-label { font-weight: bold; width: 100px; }
                .info-section .info-value { flex: 1; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                table thead th { background-color: #f5f5f5; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; border: 1px solid #ddd; }
                table tbody td { padding: 10px; border: 1px solid #ddd; font-size: 14px; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .total-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
                .total-box { width: 300px; border: 1px solid #ddd; padding: 15px; }
                .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .total-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
                .terbilang { font-style: italic; margin-bottom: 30px; font-size: 13px; color: #666; }
                .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }
                .signature-box { width: 200px; text-align: center; }
                .signature-box .name { font-weight: bold; margin-top: 80px; margin-bottom: 5px; }
                .signature-box .position { font-size: 13px; color: #666; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #999; }
                @media print {
                    body { padding: 0; }
                    @page { margin: 2cm; }
                }
            </style>
        </head>
        <body>
            ${invoiceContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
};

const generateStandardInvoiceHTML = (): string => {
    const data = invoiceData.value;

    const itemsRows = data.items
        .map(
            (item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.description}</td>
            <td class="text-right">${formatCurrency(item.disbursed_amount)}</td>
        </tr>
    `,
        )
        .join('');

    return `
        <div class="invoice-header">
            <h1>Kwitansi / Bukti Pembayaran</h1>
            <div class="subtitle">No: ${data.invoiceNo}</div>
        </div>

        <div class="invoice-info">
            <div class="info-section">
                <h3>Informasi Penerima</h3>
                <div class="info-row"><span class="info-label">Nama</span><span class="info-value">: ${data.recipientName}</span></div>
                <div class="info-row"><span class="info-label">Jabatan</span><span class="info-value">: ${data.recipientPosition}</span></div>
                <div class="info-row"><span class="info-label">Unit</span><span class="info-value">: ${data.recipientDepartment}</span></div>
            </div>
            <div class="info-section">
                <h3>Informasi Pembayaran</h3>
                <div class="info-row"><span class="info-label">Tanggal</span><span class="info-value">: ${formatDateIndonesian(data.date)}</span></div>
                <div class="info-row"><span class="info-label">Sumber Dana</span><span class="info-value">: ${data.fundSourceName}</span></div>
                <div class="info-row"><span class="info-label">Kegiatan</span><span class="info-value">: ${data.activityName}</span></div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th width="50">No</th>
                    <th>Uraian</th>
                    <th width="150" class="text-right">Jumlah (Rp)</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-box">
                <div class="total-row total">
                    <span>Total</span>
                    <span>${formatCurrencyWithRp(data.totalAmount)}</span>
                </div>
            </div>
        </div>

        <div class="terbilang">
            Terbilang: ${terbilang(data.totalAmount)} Rupiah
        </div>

        ${data.notes ? `<div style="margin-bottom: 20px;"><strong>Catatan:</strong> ${data.notes}</div>` : ''}

        <div class="signature-section">
            <div class="signature-box">
                <div>Mengetahui,</div>
                <div class="name">...................</div>
                <div class="position">Pejabat Berwenang</div>
            </div>
            <div class="signature-box">
                <div>${data.unitName}, ${formatDateIndonesian(data.date)}</div>
                <div class="name">${data.recipientName}</div>
                <div class="position">${data.recipientPosition}</div>
            </div>
        </div>

        <div class="footer">
            Dokumen ini dicetak secara otomatis dari sistem pada ${formatDateIndonesian(getTodayDate())}
        </div>
    `;
};

const printReceiptInvoice = () => {
    // Ukuran window disesuaikan lebih mendekati proporsi struk memanjang
    const printWindow = window.open('', '_blank', 'width=450,height=700');
    if (!printWindow) {
        toast.error(
            'Pop-up diblokir. Mohon izinkan pop-up untuk mencetak invoice.',
        );
        return;
    }

    const receiptContent = generateReceiptHTML();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${invoiceData.value.invoiceNo}</title>
            <style>
                /* Setup khusus thermal printer ukuran standar 80mm */
                @page { 
                    size: 80mm auto; 
                    margin: 0; 
                }
                * { 
                    margin: 0; 
                    padding: 0; 
                    box-sizing: border-box; 
                }
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    font-size: 11px; 
                    width: 72mm; 
                    margin: 0 auto; 
                    padding: 4mm 2mm; 
                    color: #000; 
                    line-height: 1.2;
                    background-color: #fff;
                }
                
                /* Header ala Kasir */
                .receipt-header { 
                    text-align: center; 
                    margin-bottom: 2mm; 
                }
                .receipt-header .title { 
                    font-size: 13px; 
                    font-weight: bold; 
                    text-transform: uppercase;
                    margin-bottom: 0.5mm; 
                }
                .receipt-header .subtitle { 
                    font-size: 11px; 
                }
                
                /* Pembatas Garis Putus-putus Khas POS */
                .divider { 
                    border-top: 1px dashed #000; 
                    margin: 1.5mm 0; 
                }
                .divider-double { 
                    border-top: 1px double #000; /* Double line tipis lebih estetik di POS */
                    margin: 1.5mm 0; 
                }
                
                /* Metadata metadata */
                .info-table {
                    width: 100%;
                    margin-bottom: 1mm;
                }
                .info-table td {
                    font-size: 10.5px;
                    vertical-align: top;
                    padding-bottom: 0.5mm;
                }
                .info-table td.label {
                    width: 18mm;
                    font-weight: bold;
                }
                .info-table td.separator {
                    width: 2mm;
                }
                
                /* Tabel Item belanjaan POS */
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .items-table th {
                    font-size: 10.5px;
                    font-weight: bold;
                    text-align: left;
                    padding: 1mm 0;
                }
                .items-table th.amount {
                    text-align: right;
                }
                .items-table td {
                    font-size: 10.5px;
                    padding: 0.8mm 0;
                    vertical-align: top;
                    word-break: break-word; /* Mencegah text panjang merusak layout */
                }
                .items-table td.amount {
                    text-align: right;
                    white-space: nowrap; /* Nominal uang tidak boleh patah baris */
                    padding-left: 2mm;
                }
                
                /* Bagian Total */
                .total-section { 
                    margin-top: 1mm; 
                }
                .total-row { 
                    display: flex; 
                    justify-content: space-between; 
                    font-weight: bold; 
                    font-size: 12px; 
                    padding: 0.5mm 0;
                }
                .terbilang { 
                    font-size: 9.5px; 
                    font-style: italic; 
                    margin: 1.5mm 0;
                    line-height: 1.3;
                }
                
                /* Area Tanda Tangan */
                .signature-container {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 6mm;
                    page-break-inside: avoid;
                }
                .signature { 
                    text-align: center; 
                    font-size: 10.5px; 
                    width: 45mm;
                }
                .signature .name { 
                    font-weight: bold; 
                    margin-top: 12mm; /* Ruang tanda tangan fisik */
                    text-decoration: underline;
                }
                
                /* Footer Struk */
                .footer { 
                    text-align: center; 
                    margin-top: 6mm; 
                    font-size: 9px; 
                    line-height: 1.4;
                }

                /* Mengoptimalkan cetakan saat dialog print browser muncul */
                @media print {
                    body { 
                        width: 72mm; 
                        padding: 0mm 2mm;
                    }
                    /* Menyembunyikan header/footer bawaan browser Chrome/Firefox */
                    html, body {
                        background-color: #fff;
                    }
                }
            </style>
        </head>
        <body>
            ${receiptContent}
            <script>
                window.onload = function() {
                    // Beri sedikit jeda waktu agar browser selesai memuat engine font Courier
                    setTimeout(function() { 
                        window.print(); 
                        window.close();
                    }, 300);
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
};

const generateReceiptHTML = (): string => {
    const data = invoiceData.value;

    // Menggunakan elemen struktural table agar baris item & nominal sejajar sempurna di printer POS
    const itemsRows = data.items
        .map(
            (item) => `
        <tr>
            <td>${item.description}</td>
            <td class="amount">${formatCurrency(item.disbursed_amount)}</td>
        </tr>
    `,
        )
        .join('');

    return `
        <div class="receipt-header">
            <div class="title">Kwitansi Pembayaran</div>
            <div class="subtitle">No: ${data.invoiceNo}</div>
        </div>

        <div class="divider"></div>

        <table class="info-table">
            <tr>
                <td class="label">Tanggal</td>
                <td class="separator">:</td>
                <td>${formatDateIndonesian(data.date)}</td>
            </tr>
            <tr>
                <td class="label">Kepada</td>
                <td class="separator">:</td>
                <td>${data.recipientName}</td>
            </tr>
            <tr>
                <td class="label">Jabatan</td>
                <td class="separator">:</td>
                <td>${data.recipientPosition}</td>
            </tr>
            <tr>
                <td class="label">Unit</td>
                <td class="separator">:</td>
                <td>${data.recipientDepartment}</td>
            </tr>
        </table>

        <div class="divider"></div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>URAIAN</th>
                    <th class="amount">JUMLAH</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
            </tbody>
        </table>

        <div class="divider"></div>

        <div class="total-section">
            <div class="total-row">
                <span>TOTAL</span>
                <span>Rp ${formatCurrency(data.totalAmount)}</span>
            </div>
        </div>

        <div class="terbilang">Terbilang: ${terbilang(data.totalAmount)} Rupiah</div>

        <div class="divider-double"></div>

        ${data.notes ? `<div style="font-size: 9.5px; margin: 1mm 0; word-break: break-word;"><strong>Catatan:</strong> ${data.notes}</div><div class="divider"></div>` : ''}

        <div class="signature-container">
            <div class="signature">
                <div>${data.unitName || 'Jakarta'}, ${formatDateIndonesian(data.date)}</div>
                <div>Penerima,</div>
                <div class="name">${data.recipientName}</div>
                <div>${data.recipientPosition}</div>
            </div>
        </div>

        <div class="divider" style="margin-top: 5mm;"></div>

        <div class="footer">
            Dicetak: ${formatDateIndonesian(getTodayDate())}<br>
            <strong>Sistem Informasi Unggul Anggaran</strong>
        </div>
    `;
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const handleDisbursementSelect = (disbursement: any) => {
    console.log('Selected disbursement:', disbursement);
    loadDisbursementDetails();
};

const handleFileAdded = (file: UploadedFile) => {
    console.log(`File added to release:`, file.name);
};

const handleFileRemoved = (index: number) => {
    console.log(`File removed from release:`, index);
};

const handleFileError = (error: string) => {
    console.error('File upload error:', error);
    toast.error(error);
};

// =============================================================================
// FORM VALIDATION
// =============================================================================

const validateItemsAmount = (): boolean => {
    for (const item of checkedItems.value) {
        if (item.disbursed_amount > item.total_amount) {
            toast.warning(
                `Nilai pencairan untuk "${item.description}" melebihi nilai disetujui!`,
            );
            return false;
        }
        if (item.remaining_amount < 0) {
            toast.warning(
                `Nilai pencairan untuk "${item.description}" melebihi sisa anggaran!`,
            );
            return false;
        }
        if (!item.disbursed_amount || item.disbursed_amount <= 0) {
            toast.warning(
                `Nilai pencairan untuk "${item.description}" harus diisi dan lebih dari 0!`,
            );
            return false;
        }
    }
    return true;
};

const validateBasicInfo = (): boolean => {
    if (!formData.value.budget_disbursement_header_id) {
        toast.warning('Pengajuan pencairan harus dipilih!');
        return false;
    }

    if (isSubmittedStatus.value && !formData.value.fund_source_id) {
        toast.warning('Sumber dana harus dipilih!');
        return false;
    }

    if (!formData.value.payment_type) {
        toast.warning('Tipe pembayaran harus dipilih!');
        return false;
    }
    if (!formData.value.notes) {
        toast.warning('Catatan pencairan harus diisi!');
        return false;
    }
    return true;
};

const validateCashPayment = (): boolean => {
    if (!formData.value.recipient_name) {
        toast.warning('Nama penerima harus diisi!');
        return false;
    }
    if (!formData.value.recipient_position) {
        toast.warning('Jabatan penerima harus diisi!');
        return false;
    }
    if (!formData.value.recipient_department) {
        toast.warning('Unit/Prodi/Biro penerima harus diisi!');
        return false;
    }
    return true;
};

const validateNonCashPayment = (): boolean => {
    if (!formData.value.recipient_bank_name) {
        toast.warning('Nama bank harus diisi!');
        return false;
    }
    if (!formData.value.recipient_account_no) {
        toast.warning('Nomor rekening harus diisi!');
        return false;
    }
    if (!formData.value.recipient_account_name) {
        toast.warning('Nama pemilik rekening harus diisi!');
        return false;
    }
    return true;
};

const validatePaymentInfo = (): boolean => {
    if (isCashPayment.value) return validateCashPayment();
    if (isNonCashPayment.value) return validateNonCashPayment();
    return true;
};

const validateDocuments = (): boolean => {
    if (isSubmittedStatus.value) {
        if (!formData.value.files || formData.value.files.length === 0) {
            toast.warning('Minimal harus mengupload 1 file bukti transfer!');
            return false;
        }
    }
    return true;
};

const validateItems = (): boolean => {
    if (checkedItems.value.length === 0) {
        toast.warning('Minimal harus memilih 1 item untuk dicairkan!');
        return false;
    }
    return true;
};

const validateForm = (): boolean => {
    return (
        validateBasicInfo() &&
        validatePaymentInfo() &&
        validateDocuments() &&
        validateItems() &&
        validateItemsAmount()
    );
};

// =============================================================================
// FORM SUBMISSION
// =============================================================================

const buildSelectedItems = () => {
    return checkedItems.value.map((item) => ({
        budget_disbursement_item_id: item.budget_disbursement_item_id,
        total_amount: item.disbursed_amount || 0,
        notes: item.item_notes || '',
    }));
};

const buildBasePayload = (targetStatus: string) => {
    const { fund_release_date: release_date, ...rest } = formData.value;

    return {
        ...rest,
        fund_release_date: release_date,
        total_amount: totalRelease.value,
        status: targetStatus,
    };
};

const appendFiles = (formDataToSend: FormData) => {
    if (!formData.value.files?.length) return;

    formData.value.files.forEach((file: any, index: number) => {
        const actualFile =
            file instanceof File
                ? file
                : file.file || file.rawFile || file.originFileObj || file;

        if (actualFile instanceof File) {
            formDataToSend.append(`files[${index}]`, actualFile);
        }
    });
};

const saveAsDraft = async () => {
    if (!formData.value.budget_disbursement_header_id) {
        toast.warning('Pengajuan pencairan harus dipilih!');
        return;
    }

    isSubmitting.value = true;

    try {
        const formDataToSend = new FormData();
        const base = buildBasePayload('draft');

        if (formData.value.id) {
            formDataToSend.append('_method', 'PUT');
        }

        Object.entries(base).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'files') {
                formDataToSend.append(key, String(value));
            }
        });

        const selectedItems = buildSelectedItems();
        selectedItems.forEach((item, index) => {
            formDataToSend.append(
                `items[${index}][budget_disbursement_item_id]`,
                String(item.budget_disbursement_item_id),
            );
            formDataToSend.append(
                `items[${index}][total_amount]`,
                String(item.total_amount),
            );
            formDataToSend.append(
                `items[${index}][notes]`,
                String(item.notes || ''),
            );
        });

        appendFiles(formDataToSend);

        const url = formData.value.id
            ? `/api/v1/budget-fund-releases/${formData.value.id}`
            : '/api/v1/budget-fund-releases';

        await axios.post(url, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        formData.value.status = 'draft';

        toast.success('Draft pencairan berhasil disimpan', {
            description:
                'Data telah disimpan sebagai draft dan dapat diubah kembali.',
        });

        if (!formData.value.id) {
            router.visit('/realisasi-pencairan');
        }
    } catch (error: any) {
        console.error('Save draft error:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Terjadi kesalahan saat menyimpan draft';
        toast.error(errorMessage);
    } finally {
        isSubmitting.value = false;
    }
};

const submitForApproval = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
        const formDataToSend = new FormData();
        const base = buildBasePayload('submitted');

        if (formData.value.id) {
            formDataToSend.append('_method', 'PUT');
        }

        Object.entries(base).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'files') {
                formDataToSend.append(key, String(value));
            }
        });

        const selectedItems = buildSelectedItems();
        selectedItems.forEach((item, index) => {
            formDataToSend.append(
                `items[${index}][budget_disbursement_item_id]`,
                String(item.budget_disbursement_item_id),
            );
            formDataToSend.append(
                `items[${index}][total_amount]`,
                String(item.total_amount),
            );
            formDataToSend.append(
                `items[${index}][notes]`,
                String(item.notes || ''),
            );
        });

        appendFiles(formDataToSend);

        const url = formData.value.id
            ? `/api/v1/budget-fund-releases/${formData.value.id}`
            : '/api/v1/budget-fund-releases';

        await axios.post(url, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        formData.value.status = 'submitted';

        toast.success('Pencairan berhasil diajukan', {
            description: formData.value.id
                ? `Nomor pencairan ${formData.value.fund_release_no || 'baru'} telah diajukan.`
                : 'Pencatatan baru telah ditambahkan dan diajukan.',
        });

        router.visit('/realisasi-pencairan');
    } catch (error: any) {
        console.error('Submit error:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Terjadi kesalahan saat mengajukan pencairan';
        toast.error(errorMessage);
    } finally {
        isSubmitting.value = false;
    }
};

const processPayment = async () => {
    if (!validateForm()) return;
    if (
        !confirm(
            'Apakah Anda yakin ingin memproses pembayaran ini? Status akan berubah menjadi "Sudah Dibayarkan" dan tidak dapat diubah kembali.',
        )
    ) {
        return;
    }

    isSubmitting.value = true;

    try {
        const formDataToSend = new FormData();
        const base = buildBasePayload('transferred');

        formDataToSend.append('_method', 'PUT');

        Object.entries(base).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'files') {
                formDataToSend.append(key, String(value));
            }
        });

        const selectedItems = buildSelectedItems();
        selectedItems.forEach((item, index) => {
            formDataToSend.append(
                `items[${index}][budget_disbursement_item_id]`,
                String(item.budget_disbursement_item_id),
            );
            formDataToSend.append(
                `items[${index}][total_amount]`,
                String(item.total_amount),
            );
            formDataToSend.append(
                `items[${index}][notes]`,
                String(item.notes || ''),
            );
        });

        appendFiles(formDataToSend);

        const url = `/api/v1/budget-fund-releases/${formData.value.id}`;

        await axios.post(url, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        formData.value.status = 'transferred';

        toast.success('Pembayaran berhasil diproses', {
            description: `Nomor pencairan ${formData.value.fund_release_no} telah ditandai sebagai sudah dibayarkan.`,
        });

        router.reload();
    } catch (error: any) {
        console.error('Payment error:', error);
        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Terjadi kesalahan saat memproses pembayaran';
        toast.error(errorMessage);
    } finally {
        isSubmitting.value = false;
    }
};

// =============================================================================
// FORM ACTIONS
// =============================================================================

const resetForm = () => {
    if (
        confirm(
            'Apakah Anda yakin ingin mereset form? Semua data yang belum disimpan akan hilang.',
        )
    ) {
        formData.value = createInitialFormData();
        selectedDisbursementId.value = null;
        selectedDisbursement.value = null;
        selectedReleaseItems.value = [];
    }
};

const goBack = () => {
    if (mode.value === 'create' && hasUnsavedChanges()) {
        if (
            confirm(
                'Apakah Anda yakin ingin keluar? Semua data yang belum disimpan akan hilang.',
            )
        ) {
            router.visit('/realisasi-pencairan');
        }
    } else {
        router.visit('/realisasi-pencairan');
    }
};

const hasUnsavedChanges = (): boolean => {
    return !!(
        formData.value.budget_disbursement_header_id ||
        formData.value.notes ||
        selectedReleaseItems.value.length > 0 ||
        formData.value.files.length > 0
    );
};

// =============================================================================
// WATCHERS
// =============================================================================

watch(totalRelease, (newValue) => {
    formData.value.total_amount = newValue;
});

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(async () => {
    showLoadingSkeleton.value = true;

    try {
        await Promise.all([
            loadApprovedDisbursements('none'),
            loadFundSources(),
        ]);

        if (props.id) {
            await loadBudgetFundRelease(props.id);
            mode.value = props.mode as 'create' | 'edit' | 'view';
        } else {
            mode.value = 'create';
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        showLoadingSkeleton.value = false;
    }
});
</script>

<template>
    <Head title="Realisasi Pencairan" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="rounded-lg border bg-white p-6 shadow-sm">
            <!-- Loading Skeleton -->
            <div v-if="showLoadingSkeleton" class="space-y-6">
                <div class="mb-6 border-b pb-4">
                    <div
                        class="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200"
                    ></div>
                    <div
                        class="h-4 w-48 animate-pulse rounded bg-gray-200"
                    ></div>
                </div>

                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div class="space-y-6">
                        <div v-for="i in 2" :key="i" class="space-y-2">
                            <div
                                class="h-4 w-24 animate-pulse rounded bg-gray-200"
                            ></div>
                            <div
                                class="h-10 animate-pulse rounded bg-gray-200"
                            ></div>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div v-for="i in 2" :key="i" class="space-y-2">
                            <div
                                class="h-4 w-24 animate-pulse rounded bg-gray-200"
                            ></div>
                            <div
                                class="h-10 animate-pulse rounded bg-gray-200"
                            ></div>
                        </div>
                    </div>
                </div>

                <div class="border-t pt-6">
                    <div
                        class="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200"
                    ></div>
                    <div class="rounded-md border">
                        <div v-for="i in 3" :key="i" class="border-b p-4">
                            <div
                                class="h-12 animate-pulse rounded bg-gray-200"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <template v-else>
                <!-- Status Alert -->
                <div
                    v-if="!isDraftStatus && mode !== 'create'"
                    class="mb-6 rounded-md border p-4"
                    :class="statusBgColorClass"
                >
                    <div class="flex items-center gap-2">
                        <AlertCircle
                            class="h-5 w-5"
                            :class="statusColorClass"
                        />
                        <div>
                            <p
                                class="text-sm font-medium"
                                :class="statusTextColorClass"
                            >
                                {{ statusDescription }}
                            </p>
                            <p
                                v-if="isSubmittedStatus"
                                class="mt-1 text-xs"
                                :class="statusTextColorClass"
                            >
                                Data tidak dapat diubah. Klik tombol
                                "Pembayaran" untuk memproses pembayaran.
                            </p>
                            <p
                                v-if="isTransferredStatus"
                                class="mt-1 text-xs"
                                :class="statusTextColorClass"
                            >
                                Pencairan ini sudah dibayarkan dan tidak dapat
                                diedit.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Form Header -->
                <div class="mb-6 border-b pb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">
                                {{
                                    mode === 'create'
                                        ? 'Pencatatan Realisasi Pencairan'
                                        : 'Detail Realisasi Pencairan'
                                }}
                            </h1>
                            <p class="mt-1 text-sm text-gray-500">
                                Formulir pencatatan realisasi pencairan
                            </p>
                        </div>

                        <!-- Top Action Buttons -->
                        <div class="flex gap-2">
                            <Button
                                v-if="canPrintDispositionLetter"
                                type="button"
                                variant="outline"
                                @click="printDispositionLetter"
                               class="gap-2 border-primary bg-primary/5 text-primary hover:bg-primary/10"

                            >
                                <FileText class="h-4 w-4" />
                                Cetak Surat Disposisi
                            </Button>
                            <template v-if="canPrintInvoice">
                                <Button
                                    type="button"
                                    variant="outline"
                                    @click="openPrintDialog"
                                    class="gap-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                >
                                    <Printer class="h-4 w-4" />
                                    Cetak Invoice
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    @click="openReceiptPrintDialog"
                                    class="gap-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                >
                                    <Printer class="h-4 w-4" />
                                    Cetak Struk
                                </Button>
                            </template>
                        </div>
                    </div>

                    <div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <div
                            v-if="mode !== 'create' && formData.fund_release_no"
                            class="flex items-center gap-2"
                        >
                            <CalendarDays class="h-4 w-4 text-gray-400" />
                            <span class="font-bold">No Pencairan:</span>
                            <span class="font-medium">{{
                                formData.fund_release_no
                            }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <Calendar class="h-4 w-4 text-gray-400" />
                            <span class="font-bold">Tanggal:</span>
                            <span class="font-medium"
                                >[ {{ currentDate }} ]</span
                            >
                        </div>

                        <div
                            v-if="mode !== 'create' && formData.fund_release_no"
                            class="ml-auto flex items-center gap-2"
                        >
                            <Info class="h-4 w-4" :class="statusColorClass" />
                            <span class="font-bold">Status:</span>
                            <span
                                class="text-sm font-bold"
                                :class="statusTextColorClass"
                            >
                                {{ statusDescription }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Form Fields -->
                <form @submit.prevent="submitForApproval" class="space-y-6">
                    <div class="grid grid-cols-1 gap-6 md:grid-cols-[45%_55%]">
                        <!-- Left Column -->
                        <div class="space-y-6">
                            <div v-if="mode === 'create'" class="space-y-2">
                                <Label class="text-sm font-medium"
                                    >Pengajuan Pencairan
                                    <span class="text-red-500">*</span></Label
                                >
                                <div>
                                    <BudgetDisbursementPicker
                                        v-model="selectedDisbursementId"
                                        :approvedDisbursements="
                                            approvedDisbursements
                                        "
                                        placeholder="Pilih Pengajuan Pencairan"
                                        @select="handleDisbursementSelect"
                                    />
                                </div>
                            </div>

                            <div
                                v-if="selectedDisbursement"
                                class="space-y-3 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex items-center justify-between">
                                    <h3 class="font-medium text-primary">
                                        Informasi Pengajuan Pencairan
                                    </h3>
                                </div>
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <span class="text-gray-500"
                                        >No. Pencairan:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedDisbursement.disbursement_no
                                    }}</span>

                                    <span class="text-gray-500">Unit:</span>
                                    <span class="font-medium">{{
                                        selectedDisbursement.request_header
                                            ?.unit?.unit_name
                                    }}</span>

                                    <span class="text-gray-500">Kegiatan:</span>
                                    <span class="font-medium">{{
                                        selectedDisbursement.request_activity
                                            ?.description
                                    }}</span>

                                    <span class="text-gray-500"
                                        >Tujuan Pengajuan:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedDisbursement.request_header
                                            ?.notes || '-'
                                    }}</span>

                                    <span class="text-gray-500"
                                        >Nilai Disetujui:</span
                                    >
                                    <span class="font-medium"
                                        >Rp
                                        {{
                                            formatCurrency(
                                                selectedDisbursement.total_amount,
                                            )
                                        }}</span
                                    >
                                    <span class="text-gray-500"
                                        >Sudah Dicairkan:</span
                                    >
                                    <span class="font-medium text-green-600"
                                        >Rp
                                        {{
                                            formatCurrency(selectedDisbursement.released_amount ?? 0)
                                        }}</span
                                    >
                                    <span class="text-gray-500"
                                        >Sisa:</span
                                    >
                                    <span class="font-medium text-red-600"
                                        >Rp
                                        {{
                                            formatCurrency(selectedDisbursement.remaining_amount ?? 0)
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div class="space-y-6 px-4 md:px-8">
                            <div class="space-y-2">
                                <Label class="text-sm font-medium"
                                    >Tipe Pembayaran
                                    <span class="text-red-500">*</span></Label
                                >
                                <Select
                                    v-model="formData.payment_type"
                                    :disabled="isReadOnly"
                                >
                                    <SelectTrigger class="w-full">
                                        <SelectValue
                                            placeholder="Pilih Tipe Pembayaran"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel
                                                >Daftar Tipe
                                                Pembayaran</SelectLabel
                                            >
                                            <SelectItem
                                                v-for="type in PAYMENT_TYPES"
                                                :key="type.value"
                                                :value="type.value"
                                            >
                                                {{ type.label }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <!-- Cash Payment Info -->
                            <div
                                v-if="isCashPayment"
                                class="space-y-4 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex items-center gap-2">
                                    <User class="h-4 w-4 text-primary" />
                                    <Label
                                        class="text-sm font-medium text-primary"
                                    >
                                        Informasi Penerima
                                        <span class="text-red-500">*</span>
                                    </Label>
                                </div>

                                <div
                                    class="grid grid-cols-1 gap-4 md:grid-cols-3"
                                >
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">
                                            Nama Penerima
                                            <span class="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            v-model="formData.recipient_name"
                                            type="text"
                                            placeholder="Isikan nama"
                                            :disabled="isReadOnly"
                                            :maxlength="
                                                MAX_RECIPIENT_NAME_LENGTH
                                            "
                                        />
                                        <p class="text-xs text-gray-500">
                                            Nama lengkap penerima pencairan
                                        </p>
                                    </div>

                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">
                                            Jabatan
                                            <span class="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            v-model="
                                                formData.recipient_position
                                            "
                                            type="text"
                                            placeholder="Isikan jabatan"
                                            :disabled="isReadOnly"
                                            :maxlength="MAX_POSITION_LENGTH"
                                        />
                                        <p class="text-xs text-gray-500">
                                            Jabatan penerima pencairan
                                        </p>
                                    </div>

                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">
                                            Unit/Prodi/Biro
                                            <span class="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            v-model="
                                                formData.recipient_department
                                            "
                                            type="text"
                                            placeholder="Isikan unit/prodi/biro"
                                            :disabled="isReadOnly"
                                            :maxlength="MAX_DEPARTMENT_LENGTH"
                                        />
                                        <p class="text-xs text-gray-500">
                                            Unit/Prodi/Biro penerima
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Non-Cash Payment Info -->
                            <div
                                v-if="isNonCashPayment"
                                class="space-y-4 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex items-center gap-2">
                                    <Wallet class="h-4 w-4 text-primary" />
                                    <Label
                                        class="text-sm font-medium text-primary"
                                    >
                                        Informasi Bank
                                        <span class="text-red-500">*</span>
                                    </Label>
                                </div>

                                <div
                                    class="grid grid-cols-1 gap-4 md:grid-cols-3"
                                >
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">
                                            Nama Bank
                                            <span class="text-red-500">*</span>
                                        </Label>
                                        <BankSelect
                                            v-model="
                                                formData.recipient_bank_name as
                                                    | string
                                                    | null
                                            "
                                            :disabled="isReadOnly"
                                            :searchable="true"
                                        />
                                        <p class="text-xs text-gray-500">
                                            Pilih nama bank penerima
                                        </p>
                                    </div>

                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">
                                            Nomor Rekening
                                            <span class="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            v-model="
                                                formData.recipient_account_no
                                            "
                                            type="text"
                                            placeholder="Isikan nomor rekening"
                                            :disabled="isReadOnly"
                                            :maxlength="MAX_ACCOUNT_NO_LENGTH"
                                        />
                                        <p class="text-xs text-gray-500">
                                            Nomor rekening penerima
                                        </p>
                                    </div>

                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">
                                            Pemilik Rekening
                                            <span class="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            v-model="
                                                formData.recipient_account_name
                                            "
                                            type="text"
                                            placeholder="Isikan pemilik rekening"
                                            :disabled="isReadOnly"
                                            :maxlength="
                                                MAX_RECIPIENT_NAME_LENGTH
                                            "
                                        />
                                        <p class="text-xs text-gray-500">
                                            Nama pemilik rekening penerima
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <Label class="text-sm font-medium"
                                    >Catatan
                                    <span class="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    v-model="formData.notes"
                                    placeholder="Isikan catatan pencairan..."
                                    class="min-h-[100px] resize-none"
                                    :maxlength="MAX_NOTES_LENGTH"
                                    :disabled="isReadOnly"
                                />
                                <div class="flex justify-end">
                                    <span class="text-xs text-gray-500"
                                        >{{ formData.notes?.length ?? 0 }}/{{
                                            MAX_NOTES_LENGTH
                                        }}</span
                                    >
                                </div>
                            </div>

                            <div v-if="isSubmittedStatus" class="space-y-2">
                                <Label class="text-sm font-medium"
                                    >Sumber Dana
                                    <span
                                        v-if="isSubmittedStatus"
                                        class="text-red-500"
                                        >*</span
                                    ></Label
                                >
                                <Select
                                    v-model="formData.fund_source_id"
                                    :disabled="
                                        !formData.payment_type
                                    "
                                >
                                    <SelectTrigger class="w-full">
                                        <SelectValue
                                            :placeholder="
                                                formData.payment_type
                                                    ? 'Pilih Sumber Dana'
                                                    : 'Pilih tipe pembayaran terlebih dahulu'
                                            "
                                        />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel
                                                >Daftar Sumber Dana</SelectLabel
                                            >
                                            <SelectItem
                                                v-for="source in filteredFundSources"
                                                :key="source.id"
                                                :value="source.id"
                                            >
                                                {{ source.name }}
                                            </SelectItem>
                                            <div
                                                v-if="
                                                    filteredFundSources.length ===
                                                    0
                                                "
                                                class="py-6 text-center text-sm text-gray-500"
                                            >
                                                <template
                                                    v-if="
                                                        !formData.payment_type
                                                    "
                                                >
                                                    Pilih tipe pembayaran
                                                    terlebih dahulu
                                                </template>
                                                <template v-else>
                                                    Tidak ada sumber dana yang
                                                    tersedia untuk tipe
                                                    pembayaran ini
                                                </template>
                                            </div>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p class="text-xs text-gray-500">
                                    Pilih sumber dana yang akan digunakan
                                    sebagai sumber pencairan
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Items Selection -->
                    <div class="border-t pt-6">
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold">
                                Rincian Item Kegiatan
                            </h3>
                            <p class="text-sm text-gray-500">
                                Pilih item yang akan dicairkan dan masukkan
                                nilai yang akan dicairkan
                            </p>
                        </div>

                        <div class="w-full">
                            <div class="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead class="w-12">
                                                <div
                                                    class="flex items-center justify-center"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        :checked="isAllSelected"
                                                        :indeterminate="
                                                            isIndeterminate
                                                        "
                                                        :disabled="isReadOnly"
                                                        @change="
                                                            toggleSelectAll
                                                        "
                                                        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                    />
                                                </div>
                                            </TableHead>
                                            <TableHead class="w-12"
                                                >No</TableHead
                                            >
                                            <TableHead>Item Anggaran</TableHead>
                                            <TableHead class="w-44 text-right"
                                                >Nilai Disetujui</TableHead
                                            >
                                            <TableHead class="w-44 text-right"
                                                >Sudah Dicairkan</TableHead
                                            >
                                            <TableHead class="w-44 text-right"
                                                >Sisa</TableHead
                                            >
                                            <TableHead class="w-52 text-right"
                                                >Nilai Dicairkan</TableHead
                                            >
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <template
                                            v-if="
                                                selectedReleaseItems.length > 0
                                            "
                                        >
                                            <TableRow
                                                v-for="(
                                                    item, index
                                                ) in selectedReleaseItems"
                                                :key="
                                                    item.budget_disbursement_item_id
                                                "
                                                :class="{
                                                    'bg-gray-50':
                                                        !item.is_selected,
                                                    'hover:bg-gray-100': true,
                                                }"
                                            >
                                                <TableCell class="text-center">
                                                    <input
                                                        type="checkbox"
                                                        :checked="
                                                            item.is_selected
                                                        "
                                                        :disabled="isReadOnly"
                                                        @change="
                                                            toggleItemSelect(
                                                                item.budget_disbursement_item_id,
                                                            )
                                                        "
                                                        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    class="font-medium"
                                                    >{{ index + 1 }}</TableCell
                                                >
                                                <TableCell>
                                                    <span
                                                        class="text-sm"
                                                        :class="{
                                                            'text-gray-400':
                                                                !item.is_selected,
                                                        }"
                                                    >
                                                        {{ item.description }}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    class="text-right font-medium"
                                                >
                                                    <span
                                                        :class="{
                                                            'text-gray-400':
                                                                !item.is_selected,
                                                        }"
                                                    >
                                                        Rp
                                                        {{
                                                            formatCurrency(
                                                                item.total_amount,
                                                            )
                                                        }}
                                                    </span>
                                                </TableCell>
                                                <TableCell class="text-right">
                                                    <span
                                                        class="text-sm font-medium"
                                                        :class="{
                                                            'text-gray-400':
                                                                !item.is_selected,
                                                            'text-blue-600':
                                                                item.is_selected &&
                                                                item.initial_disbursed >
                                                                    0,
                                                        }"
                                                    >
                                                        Rp
                                                        {{
                                                            formatCurrency(
                                                                item.initial_disbursed,
                                                            )
                                                        }}
                                                    </span>
                                                </TableCell>
                                                <TableCell class="text-right">
                                                    <span
                                                        class="text-sm font-medium"
                                                        :class="{
                                                            'text-red-600':
                                                                item.remaining_amount <
                                                                0,
                                                            'text-gray-500':
                                                                item.remaining_amount >=
                                                                    0 &&
                                                                !item.is_selected,
                                                            'text-orange-600':
                                                                item.remaining_amount >=
                                                                    0 &&
                                                                item.is_selected,
                                                        }"
                                                    >
                                                        Rp
                                                        {{
                                                            formatCurrency(
                                                                item.remaining_amount,
                                                            )
                                                        }}
                                                    </span>
                                                </TableCell>
                                                <TableCell class="text-right">
                                                    <template
                                                        v-if="item.is_selected"
                                                    >
                                                        <div class="relative">
                                                            <span
                                                                class="absolute top-1/2 left-2 -translate-y-1/2 text-sm text-gray-400"
                                                                >Rp</span
                                                            >
                                                            <Input
                                                                :modelValue="
                                                                    item.disbursed_amount ||
                                                                    ''
                                                                "
                                                                type="text"
                                                                @update:modelValue="
                                                                    (val) =>
                                                                        handleAmountUpdate(
                                                                            val,
                                                                            item,
                                                                        )
                                                                "
                                                                :disabled="
                                                                    isReadOnly
                                                                "
                                                                :class="[
                                                                    'w-full pl-8 text-right text-sm',
                                                                    item.disbursed_amount >
                                                                    (item.total_amount ||
                                                                        0) -
                                                                        (item.initial_disbursed ||
                                                                            0)
                                                                        ? 'border-red-300 bg-red-50'
                                                                        : '',
                                                                ]"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div
                                                            v-if="
                                                                item.initial_disbursed >=
                                                                item.total_amount
                                                            "
                                                            class="mt-1 rounded bg-yellow-50 px-2 py-1"
                                                        >
                                                            <p
                                                                class="text-xs font-medium text-yellow-700"
                                                            >
                                                                ⚠️ Item ini
                                                                sudah
                                                                terealisasi
                                                                penuh
                                                            </p>
                                                        </div>
                                                        <div
                                                            v-else-if="
                                                                item.disbursed_amount >
                                                                (item.total_amount ||
                                                                    0) -
                                                                    (item.initial_disbursed ||
                                                                        0)
                                                            "
                                                            class="mt-1 rounded bg-red-50 px-2 py-1"
                                                        >
                                                            <p
                                                                class="text-xs font-medium text-red-600"
                                                            >
                                                                ⚠️ Nilai
                                                                melebihi sisa
                                                                anggaran.
                                                                Dikembalikan ke
                                                                Rp
                                                                {{
                                                                    formatCurrency(
                                                                        (item.total_amount ||
                                                                            0) -
                                                                            (item.initial_disbursed ||
                                                                                0),
                                                                    )
                                                                }}
                                                            </p>
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <span
                                                            class="text-sm text-gray-400"
                                                            >-</span
                                                        >
                                                    </template>
                                                </TableCell>
                                            </TableRow>
                                        </template>
                                        <TableRow v-else>
                                            <TableCell
                                                colspan="8"
                                                class="py-8 text-center text-gray-500"
                                            >
                                                <div
                                                    class="flex flex-col items-center gap-2"
                                                >
                                                    <ListChecks
                                                        class="h-8 w-8"
                                                    />
                                                    <p>
                                                        Pilih pengajuan
                                                        pencairan terlebih
                                                        dahulu untuk melihat
                                                        item
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            <div class="mt-4 flex items-start justify-between">
                                <div
                                    class="flex items-center gap-2 text-sm text-gray-500"
                                >
                                    <Info class="h-4 w-4" />
                                    <span>
                                        {{ totalSelectedItems }} dari
                                        {{ selectedReleaseItems.length }} item
                                        dipilih
                                    </span>
                                </div>

                                <div
                                    class="w-96 space-y-3 rounded-lg border bg-gray-50 p-4"
                                >
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-600"
                                            >Item Dipilih:</span
                                        >
                                        <span class="font-medium">{{
                                            totalSelectedItems
                                        }}</span>
                                    </div>
                                    <div
                                        class="flex justify-between border-t pt-2"
                                    >
                                        <span class="font-medium text-gray-800"
                                            >Total Dicairkan:</span
                                        >
                                        <span
                                            class="text-lg font-bold text-green-600"
                                        >
                                            Rp
                                            {{ formatCurrency(totalRelease) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div
                                v-if="hasNoItemsSelected"
                                class="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4"
                            >
                                <div class="flex items-center gap-2">
                                    <AlertCircle
                                        class="h-4 w-4 text-yellow-600"
                                    />
                                    <p
                                        class="text-sm font-medium text-yellow-700"
                                    >
                                        Minimal satu item untuk
                                        dicairkan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Documents Section -->
                    <div v-if="showDocumentSection" class="border-t pt-6">
                        <div class="mb-4">
                            <h3 class="text-lg font-semibold">
                                Dokumen Pendukung
                            </h3>
                            <p class="text-sm text-gray-500">
                                {{
                                    isTransferredStatus
                                        ? 'Upload bukti pembayaran yang diperlukan'
                                        : 'Upload dokumen pendukung yang diperlukan'
                                }}
                            </p>
                        </div>

                        <div class="space-y-4">
                            <div class="mb-2 flex items-center gap-2">
                                <Upload class="h-4 w-4 text-gray-500" />
                                <h4 class="text-sm font-medium text-gray-700">
                                    {{ documentLabel }}
                                    <span
                                        v-if="isDocumentRequired"
                                        class="text-red-500"
                                        >*</span
                                    >
                                </h4>
                            </div>

                            <FileUpload
                                v-model="formData.files"
                                :disabled="isDocumentDisabled"
                                :max-size-mb="MAX_FILE_SIZE_MB"
                                :accepted-file-types="ACCEPTED_FILE_TYPES"
                                @file-added="handleFileAdded"
                                @file-removed="handleFileRemoved"
                                @file-error="handleFileError"
                                :view-only="isDocumentDisabled"
                            />

                            <div
                                v-if="formData.files?.length > 0"
                                class="mt-1 text-xs text-gray-500"
                            >
                                Total {{ formData.files.length }} file ({{
                                    formatTotalFileSize(formData.files)
                                }})
                            </div>
                            <div
                                v-else-if="isDocumentRequired"
                                class="mt-1 text-xs text-red-500"
                            >
                                * Wajib mengupload minimal 1 file bukti transfer
                            </div>
                        </div>
                    </div>

                    <!-- Draft Status Info -->
                    <!-- <div
                        v-if="isDraftStatus && mode === 'edit'"
                        class="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4"
                    >
                        <div class="flex items-center gap-2">
                            <Info class="h-4 w-4 text-yellow-600" />
                            <div class="text-sm text-yellow-700">
                                <p class="font-medium">
                                    Status Draft: Data masih dapat diubah. Klik
                                    "Simpan Draft" untuk menyimpan perubahan
                                    tanpa mengajukan, atau "Ajukan Pencairan"
                                    untuk mengirimkan pengajuan.
                                </p>
                            </div>
                        </div>
                    </div> -->

                    <!-- Background Process Indicator -->
                    <div
                        v-if="isBackgroundProcessing"
                        class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg"
                    >
                        <div
                            class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        ></div>
                        <span class="text-sm font-medium"
                            >Memproses data...</span
                        >
                    </div>

                    <!-- Form Actions -->
                    <div
                        class="flex items-center justify-between border-t pt-6"
                    >
                        <div class="flex space-x-3">
                            <template v-if="canPrintDispositionLetter">
                                <Button
                                    type="button"
                                    variant="outline"
                                    @click="printDispositionLetter"
                                    class="gap-2 border-primary bg-primary/5 text-primary hover:bg-primary/10"
                                >
                                    <FileText class="h-4 w-4" />
                                    Cetak Surat Disposisi
                                </Button>
                            </template>
                            <template v-if="canPrintInvoice">
                                <Button
                                    type="button"
                                    variant="outline"
                                    @click="openPrintDialog"
                                    class="gap-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                >
                                    <Printer class="h-4 w-4" />
                                    Cetak Invoice
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    @click="openReceiptPrintDialog"
                                    class="gap-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                >
                                    <Printer class="h-4 w-4" />
                                    Cetak Struk
                                </Button>
                            </template>
                        </div>

                        <div class="flex space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                @click="goBack"
                                class="gap-2 border-gray-300 hover:bg-gray-50"
                            >
                                <ArrowLeft class="h-4 w-4" />
                                Kembali
                            </Button>

                            <!-- Draft/Edit Mode Buttons -->
                            <template v-if="isDraftStatus || mode === 'create'">
                                <Button
                                    v-if="mode === 'create'"
                                    type="button"
                                    variant="outline"
                                    @click="resetForm"
                                    class="gap-2 border-gray-300 hover:bg-gray-50"
                                    :disabled="isSubmitting"
                                >
                                    <RotateCcw class="h-4 w-4" />
                                    Reset
                                </Button>

                                <Button
                                    type="button"
                                    variant="default"
                                    @click="saveAsDraft"
                                    :disabled="isSubmitting"
                                >
                                    <Clock class="h-4 w-4" />
                                    {{
                                        isSubmitting
                                            ? 'Menyimpan...'
                                            : 'Simpan Draft'
                                    }}
                                </Button>

                                <Button
                                    type="button"
                                    @click="submitForApproval"
                                    class="gap-2 bg-green-600 text-white hover:bg-green-700"
                                    :disabled="isSubmitting"
                                >
                                    <Wallet class="h-4 w-4" />
                                    {{
                                        isSubmitting
                                            ? 'Mengajukan...'
                                            : 'Ajukan Pencairan'
                                    }}
                                </Button>
                            </template>

                            <!-- Submitted Mode - Show Payment Button -->
                            <template v-if="isSubmittedStatus">
                                <Button
                                    type="button"
                                    @click="processPayment"
                                    class="gap-2 bg-green-600 text-white hover:bg-green-700"
                                    :disabled="isSubmitting"
                                >
                                    <CheckCircle2 class="h-4 w-4" />
                                    {{
                                        isSubmitting
                                            ? 'Memproses...'
                                            : 'Bayarkan'
                                    }}
                                </Button>
                            </template>
                        </div>
                    </div>
                </form>
            </template>
        </div>

        <!-- Print Invoice Dialog -->
        <div
            v-if="showPrintDialog"
            class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
            <div
                :class="[
                    'max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl',
                    invoiceLayout === 'receipt'
                        ? 'w-full max-w-md p-4'
                        : 'w-full max-w-4xl p-8',
                ]"
            >
                <!-- STANDARD INVOICE LAYOUT -->
                <template v-if="invoiceLayout === 'standard'">
                    <div id="invoice-print" class="invoice-preview">
                        <div
                            class="invoice-header"
                            style="
                                text-align: center;
                                margin-bottom: 30px;
                                border-bottom: 2px solid #333;
                                padding-bottom: 20px;
                            "
                        >
                            <h1
                                style="
                                    font-size: 24px;
                                    margin-bottom: 10px;
                                    text-transform: uppercase;
                                    letter-spacing: 2px;
                                "
                            >
                                Kwitansi / Bukti Pembayaran
                            </h1>
                            <div style="font-size: 14px; color: #666">
                                No: {{ invoiceData.invoiceNo }}
                            </div>
                        </div>

                        <div
                            style="
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 30px;
                                margin-bottom: 30px;
                            "
                        >
                            <div>
                                <h3
                                    style="
                                        font-size: 14px;
                                        text-transform: uppercase;
                                        color: #666;
                                        margin-bottom: 10px;
                                        border-bottom: 1px solid #ddd;
                                        padding-bottom: 5px;
                                    "
                                >
                                    Informasi Penerima
                                </h3>
                                <div
                                    style="
                                        display: flex;
                                        margin-bottom: 5px;
                                        font-size: 14px;
                                    "
                                >
                                    <span
                                        style="font-weight: bold; width: 100px"
                                        >Nama</span
                                    >
                                    <span
                                        >: {{ invoiceData.recipientName }}</span
                                    >
                                </div>
                                <div
                                    style="
                                        display: flex;
                                        margin-bottom: 5px;
                                        font-size: 14px;
                                    "
                                >
                                    <span
                                        style="font-weight: bold; width: 100px"
                                        >Jabatan</span
                                    >
                                    <span
                                        >:
                                        {{
                                            invoiceData.recipientPosition
                                        }}</span
                                    >
                                </div>
                                <div
                                    style="
                                        display: flex;
                                        margin-bottom: 5px;
                                        font-size: 14px;
                                    "
                                >
                                    <span
                                        style="font-weight: bold; width: 100px"
                                        >Unit</span
                                    >
                                    <span
                                        >:
                                        {{
                                            invoiceData.recipientDepartment
                                        }}</span
                                    >
                                </div>
                            </div>
                            <div>
                                <h3
                                    style="
                                        font-size: 14px;
                                        text-transform: uppercase;
                                        color: #666;
                                        margin-bottom: 10px;
                                        border-bottom: 1px solid #ddd;
                                        padding-bottom: 5px;
                                    "
                                >
                                    Informasi Pembayaran
                                </h3>
                                <div
                                    style="
                                        display: flex;
                                        margin-bottom: 5px;
                                        font-size: 14px;
                                    "
                                >
                                    <span
                                        style="font-weight: bold; width: 100px"
                                        >Tanggal</span
                                    >
                                    <span
                                        >:
                                        {{
                                            formatDateIndonesian(
                                                invoiceData.date,
                                            )
                                        }}</span
                                    >
                                </div>
                                <div
                                    style="
                                        display: flex;
                                        margin-bottom: 5px;
                                        font-size: 14px;
                                    "
                                >
                                    <span
                                        style="font-weight: bold; width: 100px"
                                        >Sumber Dana</span
                                    >
                                    <span
                                        >:
                                        {{ invoiceData.fundSourceName }}</span
                                    >
                                </div>
                                <div
                                    style="
                                        display: flex;
                                        margin-bottom: 5px;
                                        font-size: 14px;
                                    "
                                >
                                    <span
                                        style="font-weight: bold; width: 100px"
                                        >Kegiatan</span
                                    >
                                    <span
                                        >: {{ invoiceData.activityName }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <table
                            style="
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 30px;
                            "
                        >
                            <thead>
                                <tr>
                                    <th
                                        style="
                                            background-color: #f5f5f5;
                                            padding: 10px;
                                            text-align: left;
                                            font-size: 12px;
                                            text-transform: uppercase;
                                            border: 1px solid #ddd;
                                        "
                                        width="50"
                                    >
                                        No
                                    </th>
                                    <th
                                        style="
                                            background-color: #f5f5f5;
                                            padding: 10px;
                                            text-align: left;
                                            font-size: 12px;
                                            text-transform: uppercase;
                                            border: 1px solid #ddd;
                                        "
                                    >
                                        Uraian
                                    </th>
                                    <th
                                        style="
                                            background-color: #f5f5f5;
                                            padding: 10px;
                                            text-align: right;
                                            font-size: 12px;
                                            text-transform: uppercase;
                                            border: 1px solid #ddd;
                                        "
                                        width="150"
                                    >
                                        Jumlah (Rp)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(item, index) in invoiceData.items"
                                    :key="index"
                                >
                                    <td
                                        style="
                                            padding: 10px;
                                            border: 1px solid #ddd;
                                            font-size: 14px;
                                        "
                                    >
                                        {{ index + 1 }}
                                    </td>
                                    <td
                                        style="
                                            padding: 10px;
                                            border: 1px solid #ddd;
                                            font-size: 14px;
                                        "
                                    >
                                        {{ item.description }}
                                    </td>
                                    <td
                                        style="
                                            padding: 10px;
                                            border: 1px solid #ddd;
                                            font-size: 14px;
                                            text-align: right;
                                        "
                                    >
                                        {{
                                            formatCurrency(
                                                item.disbursed_amount,
                                            )
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div
                            style="
                                display: flex;
                                justify-content: flex-end;
                                margin-bottom: 30px;
                            "
                        >
                            <div
                                style="
                                    width: 300px;
                                    border: 1px solid #ddd;
                                    padding: 15px;
                                "
                            >
                                <div
                                    style="
                                        display: flex;
                                        justify-content: space-between;
                                        font-size: 18px;
                                        font-weight: bold;
                                        border-top: 2px solid #333;
                                        padding-top: 10px;
                                    "
                                >
                                    <span>Total</span>
                                    <span>{{
                                        formatCurrencyWithRp(
                                            invoiceData.totalAmount,
                                        )
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div
                            style="
                                font-style: italic;
                                margin-bottom: 30px;
                                font-size: 13px;
                                color: #666;
                            "
                        >
                            Terbilang:
                            {{ terbilang(invoiceData.totalAmount) }} Rupiah
                        </div>

                        <div
                            v-if="invoiceData.notes"
                            style="margin-bottom: 20px"
                        >
                            <strong>Catatan:</strong> {{ invoiceData.notes }}
                        </div>

                        <div
                            style="
                                display: flex;
                                justify-content: space-between;
                                margin-top: 60px;
                            "
                        >
                            <div style="width: 200px; text-align: center">
                                <div>Mengetahui,</div>
                                <div
                                    style="
                                        font-weight: bold;
                                        margin-top: 80px;
                                        margin-bottom: 5px;
                                    "
                                >
                                    ...................
                                </div>
                                <div style="font-size: 13px; color: #666">
                                    Pejabat Berwenang
                                </div>
                            </div>
                            <div style="width: 200px; text-align: center">
                                <div>
                                    {{ formatDateIndonesian(invoiceData.date) }}
                                </div>
                                <div
                                    style="
                                        font-weight: bold;
                                        margin-top: 80px;
                                        margin-bottom: 5px;
                                    "
                                >
                                    {{ invoiceData.recipientName }}
                                </div>
                                <div style="font-size: 13px; color: #666">
                                    {{ invoiceData.recipientPosition }}
                                </div>
                            </div>
                        </div>

                        <div
                            style="
                                margin-top: 40px;
                                padding-top: 20px;
                                border-top: 1px solid #ddd;
                                text-align: center;
                                font-size: 12px;
                                color: #999;
                            "
                        >
                            Dokumen ini dicetak secara otomatis dari sistem pada
                            {{ formatDateIndonesian(getTodayDate()) }}
                        </div>
                    </div>
                </template>

                <!-- RECEIPT/STRUK LAYOUT -->
                <template v-if="invoiceLayout === 'receipt'">
                    <div
                        id="receipt-print"
                        style="
                            font-family: 'Courier New', monospace;
                            font-size: 11px;
                            max-width: 72mm;
                            margin: 0 auto;
                        "
                    >
                        <div
                            style="
                                text-align: center;
                                margin-bottom: 3mm;
                                padding-bottom: 2mm;
                                border-bottom: 1px dashed #000;
                            "
                        >
                            <div
                                style="
                                    font-size: 14px;
                                    font-weight: bold;
                                    margin-bottom: 1mm;
                                "
                            >
                                KWITANSI PEMBAYARAN
                            </div>
                            <div style="font-size: 10px">
                                No: {{ invoiceData.invoiceNo }}
                            </div>
                        </div>

                        <div
                            style="border-top: 1px dashed #000; margin: 2mm 0"
                        ></div>

                        <div
                            style="
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 1mm;
                                font-size: 10px;
                            "
                        >
                            <span style="font-weight: bold">Tanggal</span>
                            <span
                                >:
                                {{
                                    formatDateIndonesian(invoiceData.date)
                                }}</span
                            >
                        </div>
                        <div
                            style="
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 1mm;
                                font-size: 10px;
                            "
                        >
                            <span style="font-weight: bold">Kepada</span>
                            <span>: {{ invoiceData.recipientName }}</span>
                        </div>
                        <div
                            style="
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 1mm;
                                font-size: 10px;
                            "
                        >
                            <span style="font-weight: bold">Jabatan</span>
                            <span>: {{ invoiceData.recipientPosition }}</span>
                        </div>
                        <div
                            style="
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 1mm;
                                font-size: 10px;
                            "
                        >
                            <span style="font-weight: bold">Unit</span>
                            <span>: {{ invoiceData.recipientDepartment }}</span>
                        </div>

                        <div
                            style="border-top: 1px dashed #000; margin: 2mm 0"
                        ></div>

                        <div
                            style="
                                display: flex;
                                justify-content: space-between;
                                font-weight: bold;
                                font-size: 10px;
                                margin: 2mm 0;
                            "
                        >
                            <span>URAIAN</span>
                            <span>JUMLAH</span>
                        </div>

                        <div
                            v-for="(item, index) in invoiceData.items"
                            :key="index"
                            style="
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                                margin-bottom: 1mm;
                            "
                        >
                            <span style="flex: 1; padding-right: 2mm">{{
                                item.description
                            }}</span>
                            <span style="text-align: right; min-width: 25mm">{{
                                formatCurrency(item.disbursed_amount)
                            }}</span>
                        </div>

                        <div
                            style="border-top: 1px dashed #000; margin: 2mm 0"
                        ></div>

                        <div style="margin-top: 2mm">
                            <div
                                style="
                                    display: flex;
                                    justify-content: space-between;
                                    font-weight: bold;
                                    font-size: 12px;
                                    margin: 1mm 0;
                                "
                            >
                                <span>TOTAL</span>
                                <span
                                    >Rp
                                    {{
                                        formatCurrency(invoiceData.totalAmount)
                                    }}</span
                                >
                            </div>
                        </div>

                        <div
                            style="
                                font-size: 9px;
                                font-style: italic;
                                margin: 2mm 0;
                            "
                        >
                            Terbilang:
                            {{ terbilang(invoiceData.totalAmount) }} Rupiah
                        </div>

                        <div
                            style="border-top: 2px solid #000; margin: 2mm 0"
                        ></div>

                        <div
                            v-if="invoiceData.notes"
                            style="font-size: 9px; margin: 2mm 0"
                        >
                            <strong>Catatan:</strong> {{ invoiceData.notes }}
                        </div>

                        <div
                            style="
                                text-align: right;
                                margin-top: 10mm;
                                font-size: 10px;
                            "
                        >
                            <div>
                                {{ formatDateIndonesian(invoiceData.date) }}
                            </div>
                            <div>Penerima,</div>
                            <div style="font-weight: bold; margin-top: 8mm">
                                {{ invoiceData.recipientName }}
                            </div>
                            <div>{{ invoiceData.recipientPosition }}</div>
                        </div>

                        <div
                            style="border-top: 1px dashed #000; margin: 2mm 0"
                        ></div>

                        <div
                            style="
                                text-align: center;
                                margin-top: 5mm;
                                font-size: 9px;
                            "
                        >
                            Dicetak: {{ formatDateIndonesian(getTodayDate())
                            }}<br />
                            Sistem Informasi Unggul Anggaran
                        </div>
                    </div>
                </template>

                <!-- Dialog Actions -->
                <div class="mt-6 flex justify-end space-x-3 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        @click="closePrintDialog"
                        class="gap-2"
                    >
                        Tutup
                    </Button>
                    <Button
                        type="button"
                        @click="printInvoice"
                        class="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Printer class="h-4 w-4" />
                        Cetak
                    </Button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<style scoped>
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}

.invoice-preview {
    font-family: Arial, sans-serif;
    color: #333;
    line-height: 1.6;
}
</style>

<style scoped>
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}

.invoice-preview {
    font-family: Arial, sans-serif;
    color: #333;
    line-height: 1.6;
}
</style>
