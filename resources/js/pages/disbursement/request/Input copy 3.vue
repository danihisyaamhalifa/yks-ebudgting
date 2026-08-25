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
import BudgetRequestPicker from '@/pages/budget/components/BudgetRequestPicker.vue';
import { BreadcrumbItem } from '@/types';
import { BudgetRequestHeader, BudgetRequestItem } from '@/types/budget';
import { Employee } from '@/types/datamaster';
import { Head, router } from '@inertiajs/vue3';
import axios from 'axios';
import ExcelJS from 'exceljs';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CalendarDays,
    CheckSquare,
    Edit2,
    Info,
    ListChecks,
    RotateCcw,
    Save,
    Send,
    Trash2,
    Upload,
    UserPlus,
    Users,
    X,
} from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import * as XLSX from 'xlsx';

// Interfaces
interface BudgetRequest extends BudgetRequestHeader {
    fiscal_year: { id: number; year: string };
    unit: { id: number; unit_name: string };
    budget_category: { id: number; name: string };
    sub_budget_category: { id: number; name: string };
    request_activities?: BudgetActivity[];
}

interface BudgetActivity {
    id: number;
    activity_id: number;
    total_amount: number;
    disbursed_amount: number;
    remaining_amount: number;
    activity: { activity_name: string; activity_code: string };
    request_items: BudgetRequestItem[];
}

interface BudgetDisbursementRecipient {
    id?: number;
    recipient_type: string;
    recipient_id: number;
    recipient_name: string;
    identity_no?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    amount: number;
    notes?: string;
}

interface ActivityItem extends BudgetRequestItem {
    selected: boolean;
    remaining_amount: number;
    disbursed_amount: number;
    initial_disbursed: number;
    can_be_selected: boolean;
    recipients: BudgetDisbursementRecipient[];
    trans_type_group: string;
    volume: number;
    unit_price: number;
}

interface DisbursementHeader {
    id?: number;
    disbursement_no: string;
    disbursement_date: string;
    budget_request_header_id: number;
    budget_request_activity_id: number;
    notes?: string;
    status: string;
    status_display: string;
    total_amount: number;
    files: UploadedFile[];
}

interface Vendor {
    id: number;
    name: string;
    code?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
}

// Props
const props = defineProps<{ id?: number | string }>();

// Reactive data
const mode = ref<'create' | 'edit' | 'view'>('create');
const isSubmitting = ref(false);
const isDraft = ref(false);
const showLoadingSkeleton = ref(true);
const isBackgroundProcessing = ref(false);
const selectedBudgetRequestId = ref<number | null>(null);
const selectedBudgetRequest = ref<BudgetRequest | null>(null);
const selectedActivity = ref<BudgetActivity | null>(null);

//Employee state
const showEmployeeModal = ref(false);
const employeeRecipientItem = ref<ActivityItem | null>(null);
const employees = ref<Employee[]>([]);
const searchEmployeeKeyword = ref('');
const selectedEmployee = ref<Employee | null>(null);
const recipientAmount = ref(0);
const recipientNotes = ref('');
const activeTab = ref<'manual' | 'upload'>('manual');
const uploadFile = ref<File | null>(null);
const isUploadingRecipients = ref(false);

// Vendor state
const showVendorModal = ref(false);
const currentVendorItem = ref<ActivityItem | null>(null);
const vendors = ref<Vendor[]>([]);
const searchVendorKeyword = ref('');
const selectedVendor = ref<Vendor | null>(null);
const vendorAmount = ref(0);
const vendorNotes = ref('');

const approvedBudgetRequests = ref<BudgetRequest[]>([]);
const activityItems = ref<ActivityItem[]>([]);

// Form data
const getTodayDate = () => new Date().toISOString().split('T')[0];

const formData = ref<DisbursementHeader>({
    disbursement_no: '',
    disbursement_date: getTodayDate(),
    budget_request_header_id: 0,
    budget_request_activity_id: 0,
    notes: '',
    status: 'submitted',
    status_display: 'Submitted',
    total_amount: 0,
    files: [],
});

// Helper functions
const getRecipientTypeString = (type: 'employee' | 'vendor'): string => {
    return type === 'employee'
        ? 'Modules\\DataMaster\\Models\\Employee'
        : 'Modules\\DataMaster\\Models\\Vendor';
};

const getDisplayType = (recipientType: string): string => {
    if (recipientType.includes('Employee')) return 'Pegawai';
    if (recipientType.includes('Vendor')) return 'Vendor';
    return 'Lainnya';
};

const getTypeBadgeClass = (recipientType: string): string => {
    if (recipientType.includes('Employee')) return 'bg-blue-100 text-blue-700';
    if (recipientType.includes('Vendor'))
        return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
};

// Computed properties
const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { title: 'Dashboard', href: 'dashboard' },
    { title: 'Pengajuan Pencairan', href: '/pengajuan-pencairan' },
    {
        title:
            mode.value === 'create'
                ? 'Pengajuan Pencairan Baru'
                : 'Detail Pengajuan Pencairan',
        href: '',
    },
]);

const currentDate = computed(() => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
});

const isReadOnly = computed(() => {
    if (mode.value === 'create') return false;
    if (mode.value === 'edit' || mode.value === 'view')
        return formData.value.status?.toUpperCase() !== 'DRAFT';
    return true;
});

const statusDescription = computed(() => {
    const status = (formData.value.status ?? 'SUBMITTED').toUpperCase();
    switch (status) {
        case 'DRAFT':
            return 'Masih dalam penyusunan';
        case 'SUBMITTED':
            return 'Menunggu persetujuan';
        case 'APPROVED':
            return 'Telah disetujui';
        case 'REJECTED':
            return 'Ditolak, perlu revisi';
        case 'RETURNED':
            return 'Dikembalikan, perlu revisi';
        case 'PAID':
            return 'Dana telah dicairkan';
        default:
            return '';
    }
});

// Filter request activity dengan remaining_amount > 0
const availableActivities = computed(() => {
    if (!selectedBudgetRequest.value?.request_activities) return [];
    return selectedBudgetRequest.value.request_activities.filter((activity) => {
        const remaining =
            (activity.total_amount || 0) - (activity.disbursed_amount || 0);
        return remaining > 0;
    });
});

const selectedItemsCount = computed(
    () => activityItems.value.filter((item) => item.selected).length,
);

const totalDisbursed = computed(() =>
    activityItems.value
        .filter((item) => item.selected)
        .reduce((sum, item) => sum + Number(item.disbursed_amount || 0), 0),
);

const getDisplayRemaining = (item: ActivityItem): number => {
    // if (item.selected) {
    //     return item.remaining_amount - item.disbursed_amount;
    // }
    return item.remaining_amount;
};

const filteredEmployees = computed(() => {
    if (!searchEmployeeKeyword.value) return employees.value;
    const keyword = searchEmployeeKeyword.value.toLowerCase();
    return employees.value.filter(
        (emp) =>
            emp.name.toLowerCase().includes(keyword) ||
            emp.nik.toLowerCase().includes(keyword),
    );
});

const filteredVendors = computed(() => {
    if (!searchVendorKeyword.value) return vendors.value;
    const keyword = searchVendorKeyword.value.toLowerCase();
    return vendors.value.filter(
        (vendor) =>
            vendor.name.toLowerCase().includes(keyword) ||
            vendor.code?.toLowerCase().includes(keyword),
    );
});

const totalRecipientAmount = computed(() =>
    employeeRecipientItem.value
        ? employeeRecipientItem.value.recipients.reduce(
              (sum, r) => sum + Number(r.amount || 0),
              0,
          )
        : 0,
);

const remainingFunds = computed(() => {
    if (!employeeRecipientItem.value) return 0;
    const disbursed = Number(employeeRecipientItem.value.disbursed_amount) || 0;
    const total = Number(totalRecipientAmount.value) || 0;
    return disbursed - total;
});

const isTotalRecipientAmountEqual = computed(() => {
    if (!employeeRecipientItem.value) return false;
    const total = totalRecipientAmount.value;
    const disbursed = employeeRecipientItem.value.disbursed_amount;
    return Math.abs(total - disbursed) <= 1;
});

const vendorRecipients = computed(() => {
    if (!currentVendorItem.value) return [];
    return currentVendorItem.value.recipients.filter(
        (r) => r.recipient_type === getRecipientTypeString('vendor'),
    );
});

const totalVendorAmount = computed(() =>
    vendorRecipients.value.reduce((sum, r) => sum + Number(r.amount || 0), 0),
);

const remainingVendorFunds = computed(() => {
    if (!currentVendorItem.value) return 0;
    const disbursed = Number(currentVendorItem.value.disbursed_amount) || 0;
    const total = Number(totalVendorAmount.value) || 0;
    return disbursed - total;
});

const isTotalVendorAmountEqual = computed(() => {
    if (!currentVendorItem.value) return false;
    const total = totalVendorAmount.value;
    const disbursed = currentVendorItem.value.disbursed_amount;
    return Math.abs(total - disbursed) <= 1;
});

// Methods
const loadEmployees = async () => {
    try {
        const { data } = await axios.get('/api/v1/select/employees');
        employees.value = data.data || [];
    } catch (error) {
        console.error('Failed to load employees:', error);
        employees.value = [];
    }
};

const loadVendors = async () => {
    try {
        const { data } = await axios.get('/api/v1/select/vendors');
        vendors.value = data.data || [];
    } catch (error) {
        console.error('Failed to load vendors:', error);
        vendors.value = [];
    }
};

const loadApprovedBudgetRequests = async () => {
    try {
        const { data } = await axios.get('/api/v1/budget-requests', {
            params: {
                status: ['submitted', 'approved'],
                filter: {
                    context: 'input'
                }
            },
        });
        approvedBudgetRequests.value = data.data || [];
    } catch (error) {
        console.error('Failed to load approved budget requests:', error);
        approvedBudgetRequests.value = [];
    }
};

const loadBudgetRequestDetails = async () => {
    if (!selectedBudgetRequestId.value) {
        selectedBudgetRequest.value = null;
        formData.value.budget_request_header_id = 0;
        formData.value.budget_request_activity_id = 0;
        activityItems.value = [];
        return;
    }
    try {
        isBackgroundProcessing.value = true;
        const { data } = await axios.get(
            `/api/v1/budget-requests/${selectedBudgetRequestId.value}`,
        );

        formData.value.budget_request_header_id = data.data.id;
        selectedBudgetRequest.value = data.data;
        selectedBudgetRequest.value?.request_activities?.forEach((activity) => {
            activity.disbursed_amount = activity.disbursed_amount || 0;
            activity.remaining_amount =
                (activity.total_amount || 0) - (activity.disbursed_amount || 0);
        });
    } catch (error) {
        console.error('Failed to load budget request details:', error);
        alert('Gagal memuat detail pengajuan anggaran');
    } finally {
        isBackgroundProcessing.value = false;
    }
};

const loadActivityItems = async (activityId: number) => {
    if (!activityId || !selectedBudgetRequest.value) {
        activityItems.value = [];
        selectedActivity.value = null;
        return;
    }
    try {
        isBackgroundProcessing.value = true;
        const activity = selectedBudgetRequest.value.request_activities?.find(
            (a) => a.id === activityId,
        );
        if (activity) {
            selectedActivity.value = activity;
            if (selectedActivity.value.remaining_amount === undefined) {
                selectedActivity.value.remaining_amount =
                    (selectedActivity.value.total_amount || 0) -
                    (selectedActivity.value.disbursed_amount || 0);
            }
            activityItems.value = (activity.request_items || []).map(
                (item) => ({
                    ...item,
                    selected: false,
                    remaining_amount:
                        (item.total_amount || 0) - (item.disbursed_amount || 0),
                    disbursed_amount: 0,
                    initial_disbursed: item.disbursed_amount || 0,
                    can_be_selected: true,
                    trans_type_group:
                        item.activity_item?.trans_type?.group_code || 'OTHER',
                    recipients: [],
                    volume: item.volume || 0,
                    unit_price: item.unit_price || 0,
                }),
            );
        }
    } catch (error) {
        console.error('Failed to load activity items:', error);
        activityItems.value = [];
    } finally {
        isBackgroundProcessing.value = false;
    }
};

const loadDisbursement = async (id: number | string) => {
    try {
        const { data } = await axios.get(`/api/v1/budget-disbursements/${id}`);
        const disbursement = data.data;

        formData.value = {
            id: disbursement.id,
            disbursement_no: disbursement.disbursement_no,
            disbursement_date:
                disbursement.disbursement_date?.split('T')[0] || '',
            budget_request_header_id: disbursement.budget_request_header_id,
            budget_request_activity_id: disbursement.budget_request_activity_id,
            notes: disbursement.notes,
            status: disbursement.status,
            status_display: disbursement.status_display,
            total_amount: parseFloat(disbursement.total_amount || 0),
            files:
                disbursement.documents?.map((att: any) => ({
                    id: att.id,
                    name: att.document_name,
                    file: att.file_path,
                    size: att.file_size,
                    type: att.file_type,
                    url: att.file_path,
                    isExisting: true,
                    status: 'success',
                })) || [],
        };

        if (disbursement.request_header) {
            selectedBudgetRequest.value = {
                id: disbursement.request_header.id,
                request_no: disbursement.request_header.request_no,
                request_date: disbursement.request_header.request_date,
                total_amount: parseFloat(
                    disbursement.request_header.total_amount || 0,
                ),
                status: disbursement.request_header.status,
                fiscal_year: disbursement.request_header.fiscal_year,
                unit: disbursement.request_header.unit,
                budget_category: disbursement.request_header.budget_category,
                sub_budget_category:
                    disbursement.request_header.sub_budget_category,
                request_activities: [],
            };
            selectedBudgetRequestId.value =
                disbursement.budget_request_header_id;
        }

        if (disbursement.request_activity) {
            selectedActivity.value = {
                id: disbursement.budget_request_activity_id,
                activity_id: disbursement.request_activity.id,
                total_amount: parseFloat(
                    disbursement.request_activity.total_amount || 0,
                ),
                disbursed_amount:
                    disbursement.request_activity.total_disbursed ||
                    disbursement.request_activity.disbursed_amount ||
                    0,
                remaining_amount:
                    disbursement.request_activity.remaining_amount || 0,
                activity: {
                    activity_name:
                        disbursement.request_activity.description ||
                        disbursement.request_activity.activity?.activity_name ||
                        '',
                    activity_code:
                        disbursement.request_activity.activity?.activity_code ||
                        '',
                },
                request_items: [],
            };

            activityItems.value = (disbursement.available_items || []).map(
                (item: any) => {
                    const disbursedItem = disbursement.items?.find(
                        (di: any) => di.budget_request_item_id === item.id,
                    );
                    return {
                        ...item,
                        selected: !!disbursedItem,
                        volume: item.volume || 0,
                        unit_price: item.unit_price || 0,
                        total_amount: item.total_amount || 0,
                        disbursed_amount: item.disbursed_amount || 0,
                        remaining_amount: item.remaining_amount || 0,
                        can_be_selected: item.can_be_selected !== false,
                        recipients: disbursedItem?.recipients || [],
                        trans_type_group: item.trans_type_group || 'OTHER',
                    };
                },
            );
        }

        if (formData.value.status?.toUpperCase() === 'DRAFT') {
            mode.value = 'edit';
        } else {
            mode.value = 'view';
        }
    } catch (error) {
        console.error('Failed to load disbursement:', error);
        alert('Gagal memuat data pencairan');
    }
};

// const updateSelectedItems = () => {
//     activityItems.value.forEach((item) => {
//         if (item.selected && item.disbursed_amount === 0) {
//             item.disbursed_amount = item.remaining_amount;
//             item.remaining_amount = 0;
//         } else if (!item.selected) {
//             item.disbursed_amount = 0;
//             item.remaining_amount =
//                 (item.total_amount || 0) - (item.initial_disbursed || 0);
//             item.recipients = [];
//         }
//     });
// };

const updateSelectedItems = () => {
    activityItems.value.forEach((item) => {
        if (item.selected && item.disbursed_amount === 0) {
            item.disbursed_amount = Math.trunc(item.remaining_amount || 0);
        } else if (!item.selected) {
            item.disbursed_amount = 0;
            item.recipients = [];
        }
    });
};

const openEmployeeModal = (item: ActivityItem) => {
    if (isReadOnly.value) return;
    if (item.can_be_selected === false || item.remaining_amount <= 0) {
        toast.warning('Item ini sudah tidak tersedia untuk pencairan');
        return;
    }
    employeeRecipientItem.value = item;
    selectedEmployee.value = null;
    recipientAmount.value = 0;
    recipientNotes.value = '';
    searchEmployeeKeyword.value = '';
    activeTab.value = 'manual';
    uploadFile.value = null;
    showEmployeeModal.value = true;
};

const closeRecipientModal = () => {
    showEmployeeModal.value = false;
    employeeRecipientItem.value = null;
    selectedEmployee.value = null;
    recipientAmount.value = 0;
    recipientNotes.value = '';
    searchEmployeeKeyword.value = '';
    uploadFile.value = null;
};

const addRecipientToModal = () => {
    if (!employeeRecipientItem.value) return;
    if (!selectedEmployee.value) {
        toast.warning('Pilih penerima terlebih dahulu');
        return;
    }
    if (recipientAmount.value <= 0) {
        toast.warning('Jumlah pembayaran harus lebih dari 0');
        return;
    }

    if (
        !selectedEmployee.value.bank_name?.trim() ||
        !selectedEmployee.value.bank_account_number?.trim() ||
        !selectedEmployee.value.bank_account_name?.trim()
    ) {
        toast.warning(
            'Data bank untuk pegawai belum lengkap di datamaster. Silakan lengkapi data bank terlebih dahulu.',
        );
        return;
    }

    const currentTotal = employeeRecipientItem.value.recipients.reduce(
        (sum, r) => sum + Number(r.amount),
        0,
    );
    const newTotal = Number(currentTotal) + Number(recipientAmount.value);

    if (newTotal > employeeRecipientItem.value.disbursed_amount) {
        const sisa =
            employeeRecipientItem.value.disbursed_amount - currentTotal;
        toast.warning(
            `Total pembayaran akan melebihi nilai dicairkan! Sisa dana yang tersedia: Rp ${formatCurrency(sisa)}`,
        );
        return;
    }

    const existingRecipient = employeeRecipientItem.value.recipients.find(
        (r) =>
            r.recipient_id === selectedEmployee.value?.id &&
            r.recipient_type === getRecipientTypeString('employee'),
    );

    if (existingRecipient) {
        toast.warning('Pegawai sudah ditambahkan');
        return;
    }

    // Ambil data bank langsung dari selectedEmployee
    employeeRecipientItem.value.recipients.push({
        recipient_type: getRecipientTypeString('employee'),
        recipient_id: selectedEmployee.value.id,
        recipient_name: selectedEmployee.value.name,
        identity_no: selectedEmployee.value.nik,
        bank_name: selectedEmployee.value.bank_name || '',
        bank_account_number: selectedEmployee.value.bank_account_number || '',
        bank_account_name: selectedEmployee.value.bank_account_name || '',
        amount: recipientAmount.value,
        notes: recipientNotes.value,
    });

    selectedEmployee.value = null;
    recipientAmount.value = 0;
    recipientNotes.value = '';
    searchEmployeeKeyword.value = '';
    toast.success('Pegawai berhasil ditambahkan ke daftar');
};

const removeRecipientFromModal = (index: number) => {
    if (employeeRecipientItem.value) {
        employeeRecipientItem.value.recipients.splice(index, 1);
        toast.success('Pegawai berhasil dihapus dari daftar');
    }
};

const editRecipientFromModal = (index: number) => {
    if (!employeeRecipientItem.value) return;
    const recipient = employeeRecipientItem.value.recipients[index];
    const employee = employees.value.find(
        (e) => e.id === recipient.recipient_id,
    );
    if (employee) {
        selectedEmployee.value = employee;
        recipientAmount.value = recipient.amount;
        recipientNotes.value = recipient.notes || '';
        employeeRecipientItem.value.recipients.splice(index, 1);
        setTimeout(() => {
            const formElement = document.querySelector(
                '.rounded-lg.border.bg-gray-50.p-4',
            );
            if (formElement)
                formElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
        }, 100);
        toast.warning('Silakan edit data dan tambahkan kembali');
    }
};

const clearAllRecipients = () => {
    if (!employeeRecipientItem.value) return;
    if (
        confirm(
            `Hapus semua ${employeeRecipientItem.value.recipients.length} penerima?`,
        )
    ) {
        employeeRecipientItem.value.recipients = [];
        toast.success('Semua penerima telah dihapus');
    }
};

const saveRecipients = () => {
    if (!employeeRecipientItem.value) return;
    const totalRecipientAmount = employeeRecipientItem.value.recipients.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0,
    );
    const disbursedAmount = Number(
        employeeRecipientItem.value.disbursed_amount || 0,
    );

    if (Math.abs(totalRecipientAmount - disbursedAmount) > 1) {
        toast.warning(
            `Total pembayaran (Rp ${formatCurrency(totalRecipientAmount)}) harus sama dengan nilai dicairkan (Rp ${formatCurrency(disbursedAmount)})!`,
        );
        return;
    }

    for (const recipient of employeeRecipientItem.value.recipients) {
        if (!recipient.recipient_type) {
            toast.warning('Tipe penerima harus diisi!');
            return;
        }
        if (
            recipient.recipient_type === getRecipientTypeString('employee') &&
            !recipient.recipient_id
        ) {
            toast.warning('Pegawai harus dipilih!');
            return;
        }
        if (!recipient.recipient_name) {
            toast.warning('Nama pegawai harus diisi!');
            return;
        }
        if (recipient.amount <= 0) {
            toast.warning(
                'Jumlah pembayaran harus lebih dari 0 untuk semua penerima!',
            );
            return;
        }
        if (
            !recipient.bank_name?.trim() ||
            !recipient.bank_account_number?.trim() ||
            !recipient.bank_account_name?.trim()
        ) {
            toast.warning(
                `Data bank untuk "${recipient.recipient_name}" tidak lengkap: Data bank harus diisi!`,
            );
            return;
        }
    }

    closeRecipientModal();
    toast.success('Daftar penerima berhasil disimpan');
};

const handleRecipientFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0)
        uploadFile.value = target.files[0];
};

const importRecipientsFromFile = () => {
    if (!uploadFile.value) {
        toast.warning('Pilih file terlebih dahulu');
        return;
    }
    if (!employeeRecipientItem.value) return;

    const fileExt = uploadFile.value.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
        toast.error('Format file harus .csv, .xlsx, atau .xls');
        return;
    }

    isUploadingRecipients.value = true;
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (rows.length < 2) {
                toast.error('File tidak mengandung data');
                return;
            }

            const headers = (rows[0] as string[]).map((h) =>
                String(h)
                    .replace(/"/g, '')
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, '_'),
            );

            const nikIndex = headers.findIndex(
                (h) =>
                    h.includes('nik') ||
                    h.includes('kode') ||
                    h.includes('nip'),
            );
            const nameIndex = headers.findIndex(
                (h) => h.includes('name') || h.includes('nama'),
            );
            const amountIndex = headers.findIndex(
                (h) =>
                    h.includes('amount') ||
                    h.includes('jumlah') ||
                    h.includes('nominal'),
            );
            const notesIndex = headers.findIndex(
                (h) =>
                    h.includes('notes') ||
                    h.includes('catatan') ||
                    h.includes('keterangan'),
            );
            const bankNameIndex = headers.findIndex(
                (h) =>
                    h.includes('bank_name') ||
                    h.includes('nama_bank') ||
                    h.includes('bank'),
            );
            const bankAccountIndex = headers.findIndex(
                (h) =>
                    h.includes('bank_account_number') ||
                    h.includes('nomor_rekening') ||
                    h.includes('no_rekening'),
            );
            const bankAccountNameIndex = headers.findIndex(
                (h) =>
                    h.includes('bank_account_name') ||
                    h.includes('nama_rekening'),
            );

            if (nikIndex === -1 || nameIndex === -1 || amountIndex === -1) {
                toast.error(
                    'Format file tidak sesuai. Kolom yang diperlukan: nik, nama, jumlah',
                );
                return;
            }

            let validRecipients = 0,
                duplicateRecipients = 0,
                invalidAmountRecipients = 0,
                notFoundEmployees = 0,
                exceededFunds = 0;

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i] as any[];
                if (!row || row.every((cell) => !cell)) continue;

                const nik = String(row[nikIndex] || '').trim();
                const name = String(row[nameIndex] || '').trim();
                const amountRaw = String(row[amountIndex] || '').replace(
                    /[^0-9]/g,
                    '',
                );
                const amount = parseInt(amountRaw) || 0;
                const notes =
                    notesIndex !== -1
                        ? String(row[notesIndex] || '').trim()
                        : '';
                const bankName =
                    bankNameIndex !== -1
                        ? String(row[bankNameIndex] || '').trim()
                        : '';
                const bankAccountNo =
                    bankAccountIndex !== -1
                        ? String(row[bankAccountIndex] || '').trim()
                        : '';
                const bankAccountName =
                    bankAccountNameIndex !== -1
                        ? String(row[bankAccountNameIndex] || '').trim()
                        : '';

                if (!nik || !name) continue;
                if (amount <= 0) {
                    invalidAmountRecipients++;
                    continue;
                }

                const employee = employees.value.find((emp) => emp.nik === nik);
                if (!employee) {
                    notFoundEmployees++;
                    continue;
                }

                const existingRecipient = (
                    employeeRecipientItem.value?.recipients || []
                ).find(
                    (r) =>
                        r.recipient_id === employee.id &&
                        r.recipient_type === getRecipientTypeString('employee'),
                );
                if (existingRecipient) {
                    duplicateRecipients++;
                    continue;
                }

                const currentTotal =
                    employeeRecipientItem.value?.recipients.reduce(
                        (sum, r) => sum + (r.amount || 0),
                        0,
                    ) ?? 0;
                const remainingFundsAmount =
                    (employeeRecipientItem.value?.disbursed_amount ?? 0) -
                    currentTotal;

                if (amount > remainingFundsAmount) {
                    exceededFunds++;
                    toast.warning(
                        `Pegawai ${employee.name} (${nik}) tidak ditambahkan. Jumlah Rp ${formatCurrency(amount)} melebihi sisa dana Rp ${formatCurrency(remainingFundsAmount)}`,
                    );
                    continue;
                }

                employeeRecipientItem.value?.recipients.push({
                    recipient_type: getRecipientTypeString('employee'),
                    recipient_id: employee.id,
                    recipient_name: employee.name,
                    identity_no: nik,
                    bank_name: employee.bank_name || '',
                    bank_account_number: employee.bank_account_number || '',
                    bank_account_name: employee.bank_account_name || '',
                    amount: amount,
                    notes: notes,
                });

                validRecipients++;
            }

            let message = `Berhasil mengimport ${validRecipients} data penerima`;
            if (duplicateRecipients > 0)
                message += `, ${duplicateRecipients} data duplikat`;
            if (invalidAmountRecipients > 0)
                message += `, ${invalidAmountRecipients} data jumlah tidak valid`;
            if (notFoundEmployees > 0)
                message += `, ${notFoundEmployees} pegawai tidak ditemukan`;
            if (exceededFunds > 0)
                message += `, ${exceededFunds} data melebihi sisa dana`;

            if (validRecipients > 0) toast.success(message);
            else if (
                duplicateRecipients > 0 ||
                invalidAmountRecipients > 0 ||
                notFoundEmployees > 0 ||
                exceededFunds > 0
            )
                toast.warning(message);
            else toast.warning('Tidak ada data baru yang dapat diimport');
        } catch (error) {
            console.error('Error parsing file:', error);
            toast.error('Gagal memproses file. Pastikan format file benar.');
        } finally {
            isUploadingRecipients.value = false;
        }
    };

    reader.onerror = () => {
        toast.error('Gagal membaca file');
        isUploadingRecipients.value = false;
    };

    reader.readAsArrayBuffer(uploadFile.value);
    uploadFile.value = null;
    const fileInput = document.getElementById(
        'employee-file-input',
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
};

const downloadRecipientTemplate = async () => {
    try {
        const loadingToast = toast.loading('Mempersiapkan template...');

        let employeesData = [];
        try {
            const { data } = await axios.get('/api/v1/select/employees', {
                params: { limit: 1000, status: 'active' },
            });
            employeesData = data.data || [];
        } catch (error) {
            console.error('Failed to load employees:', error);
            employeesData = [
                {
                    nik: '320051',
                    name: 'Budi Santoso',
                    bank_name: 'BCA',
                    bank_account_number: '1234567890',
                    bank_account_name: 'Budi Santoso',
                    unit: { unit_name: 'IT' },
                },
                {
                    nik: '320501',
                    name: 'Siti Rahayu',
                    bank_name: 'MANDIRI',
                    bank_account_number: '0987654321',
                    bank_account_name: 'Siti Rahayu',
                    unit: { unit_name: 'Finance' },
                },
            ];
        }

        const referenceData = employeesData.map((emp) => ({
            nik: emp.nik,
            nama: emp.name,
            nama_bank: emp.bank_name || '',
            nomor_rekening: emp.bank_account_number || '',
            nama_rekening: emp.bank_account_name || '',
            unit: emp.unit?.unit_name || '-',
        }));

        const workbook = new ExcelJS.Workbook();

        // Sheet template pegawai
        const templateSheet = workbook.addWorksheet('Template Pegawai');

        templateSheet.columns = [
            { header: 'NIK', key: 'nik', width: 15 },
            { header: 'Nama', key: 'nama', width: 25 },
            { header: 'Jumlah', key: 'jumlah', width: 15 },
            { header: 'Catatan', key: 'catatan', width: 30 },
        ];

        // Style header
        templateSheet.getRow(1).font = { bold: true };
        templateSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        const lastRefRow = referenceData.length + 1;
        const maxRow = 1000;

        for (let i = 2; i <= maxRow; i++) {
            // Dropdown NIK
            templateSheet.getCell(`A${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`'Daftar Pegawai'!$A$2:$A$${lastRefRow}`],
                showErrorMessage: true,
                errorTitle: 'NIK Tidak Valid',
                error: 'Silakan pilih NIK dari daftar yang tersedia',
                showInputMessage: true,
                promptTitle: 'Pilih NIK',
                prompt: 'Klik untuk memilih NIK karyawan',
            };

            // VLOOKUP Nama
            templateSheet.getCell(`B${i}`).value = {
                formula: `IF(A${i}="","",VLOOKUP(A${i},'Daftar Pegawai'!$A$2:$B$${lastRefRow},2,FALSE))`,
            };
        }

        // Condtional Formating: Tandai duplikat NIK
        templateSheet.addConditionalFormatting({
            ref: `A2:A${maxRow}`,
            rules: [
                {
                    type: 'expression',
                    priority: 1,
                    formulae: [`COUNTIF($A$2:$A$${maxRow},A2)>1`],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFC7CE' }, // Light red background
                        },
                        font: {
                            color: { argb: 'FF9C0006' }, // Dark red font
                            bold: true,
                        },
                    },
                },
            ],
        });

        // Condtional Formating, warnai kolom selain NIK
        templateSheet.addConditionalFormatting({
            ref: `B2:C${maxRow}`,
            rules: [
                {
                    type: 'expression',
                    priority: 2,
                    formulae: [`AND($A2<>"",B2="")`],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFEB9C' }, // Yellow warning
                        },
                    },
                },
            ],
        });

        // Unlock kolom NIK, Jumlah, Catatan
        ['A', 'C', 'D'].forEach((col) => {
            templateSheet.getColumn(col).eachCell((cell, rowNumber) => {
                if (rowNumber > 1) {
                    cell.protection = { locked: false };
                }
            });
        });

        // Lock kolom Nama (VLOOKUP)
        templateSheet.getColumn('B').eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.protection = { locked: true };
            }
        });

        templateSheet.protect('', {
            selectLockedCells: true,
            selectUnlockedCells: true,
        });

        // Sheet referensi pegawai
        if (referenceData.length > 0) {
            const refSheet = workbook.addWorksheet('Daftar Pegawai');

            refSheet.columns = [
                { header: 'NIK', key: 'nik', width: 15 },
                { header: 'Nama', key: 'nama', width: 30 },
                { header: 'Nama Bank', key: 'nama_bank', width: 20 },
                { header: 'Nomor Rekening', key: 'nomor_rekening', width: 20 },
                { header: 'Nama Rekening', key: 'nama_rekening', width: 25 },
                { header: 'Unit', key: 'unit', width: 20 },
            ];

            refSheet.getRow(1).font = { bold: true };
            refSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' },
            };

            referenceData.forEach((row) => refSheet.addRow(row));

            // Hidden sheet referensi
            refSheet.state = 'hidden';
        }

        // Freeze pane
        templateSheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Generate file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute(
            'download',
            `template_pegawai_${new Date().toISOString().split('T')[0]}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.dismiss(loadingToast);
        toast.success(
            `Template berhasil didownload! ${referenceData.length} referensi karyawan tersedia.`,
        );
    } catch (error) {
        console.error('Error downloading template:', error);
        toast.error('Gagal mendownload template. Silakan coba lagi.');
    }
};

// Vendor modal methods
const openVendorModal = (item: ActivityItem) => {
    if (isReadOnly.value) return;
    if (item.can_be_selected === false || item.remaining_amount <= 0) {
        toast.info('Item ini sudah tidak tersedia untuk pencairan');
        return;
    }
    currentVendorItem.value = item;
    selectedVendor.value = null;
    vendorAmount.value = 0;
    vendorNotes.value = '';
    searchVendorKeyword.value = '';
    showVendorModal.value = true;
};

const closeVendorModal = () => {
    showVendorModal.value = false;
    currentVendorItem.value = null;
    selectedVendor.value = null;
    vendorAmount.value = 0;
    vendorNotes.value = '';
    searchVendorKeyword.value = '';
};

const addVendorToModal = () => {
    if (!currentVendorItem.value) return;

    if (!selectedVendor.value) {
        toast.warning('Pilih vendor terlebih dahulu');
        return;
    }

    if (vendorAmount.value <= 0) {
        toast.warning('Jumlah pembayaran harus lebih dari 0');
        return;
    }

    if (
        !selectedVendor.value.bank_name?.trim() ||
        !selectedVendor.value.bank_account_number?.trim() ||
        !selectedVendor.value.bank_account_name?.trim()
    ) {
        toast.warning(
            'Data bank vendor belum lengkap di datamaster. Silakan lengkapi data bank terlebih dahulu.',
        );
        return;
    }

    const currentTotal = vendorRecipients.value.reduce(
        (sum, r) => sum + Number(r.amount),
        0,
    );
    const newTotal = Number(currentTotal) + Number(vendorAmount.value);

    if (newTotal > currentVendorItem.value.disbursed_amount) {
        const sisa = currentVendorItem.value.disbursed_amount - currentTotal;
        toast.warning(
            `Total pembayaran akan melebihi nilai dicairkan! Sisa dana yang tersedia: Rp ${formatCurrency(sisa)}`,
        );
        return;
    }

    const existingVendor = vendorRecipients.value.find(
        (r) =>
            r.recipient_name.toLowerCase() ===
                selectedVendor.value!.name.toLowerCase() &&
            r.recipient_type === getRecipientTypeString('vendor'),
    );

    if (existingVendor) {
        toast.info('Vendor sudah ditambahkan');
        return;
    }

    // Tambahkan langsung ke recipients array
    currentVendorItem.value.recipients.push({
        recipient_type: getRecipientTypeString('vendor'),
        recipient_id: selectedVendor.value.id,
        recipient_name: selectedVendor.value.name,
        identity_no: selectedVendor.value.code || '',
        bank_name: selectedVendor.value.bank_name || '',
        bank_account_number: selectedVendor.value.bank_account_number || '',
        bank_account_name: selectedVendor.value.bank_account_name || '',
        amount: vendorAmount.value,
        notes: vendorNotes.value.trim(),
    });

    selectedVendor.value = null;
    vendorAmount.value = 0;
    vendorNotes.value = '';
    searchVendorKeyword.value = '';

    toast.success('Vendor berhasil ditambahkan ke daftar');
};

const removeVendorFromModal = (index: number) => {
    if (!currentVendorItem.value) return;
    const vendorList = vendorRecipients.value;
    if (index < vendorList.length) {
        const actualIndex = currentVendorItem.value.recipients.findIndex(
            (r, i) =>
                r.recipient_type === getRecipientTypeString('vendor') &&
                vendorList.indexOf(r) === index,
        );
        if (actualIndex !== -1) {
            currentVendorItem.value.recipients.splice(actualIndex, 1);
            toast.success('Vendor berhasil dihapus dari daftar');
        }
    }
};

const editVendorFromModal = (index: number) => {
    if (!currentVendorItem.value) return;
    const vendorList = vendorRecipients.value;
    if (index >= vendorList.length) return;

    const vendor = vendorList[index];

    const foundVendor = vendors.value.find(
        (v) => v.name.toLowerCase() === vendor.recipient_name.toLowerCase(),
    );
    if (foundVendor) {
        selectedVendor.value = foundVendor;
    }

    vendorAmount.value = vendor.amount;
    vendorNotes.value = vendor.notes || '';

    // Hapus dari recipients
    const actualIndex = currentVendorItem.value.recipients.findIndex(
        (r, i) =>
            r.recipient_type === getRecipientTypeString('vendor') &&
            vendorList.indexOf(r) === index,
    );
    if (actualIndex !== -1) {
        currentVendorItem.value.recipients.splice(actualIndex, 1);
    }

    setTimeout(() => {
        const formElement = document.querySelector('.vendor-form');
        if (formElement)
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    toast.info('Silakan edit data dan tambahkan kembali');
};

const clearAllVendors = () => {
    if (!currentVendorItem.value) return;
    const vendorCount = vendorRecipients.value.length;
    if (vendorCount === 0) return;

    if (confirm(`Hapus semua ${vendorCount} vendor?`)) {
        currentVendorItem.value.recipients =
            currentVendorItem.value.recipients.filter(
                (r) => r.recipient_type !== getRecipientTypeString('vendor'),
            );
        toast.success('Semua vendor telah dihapus');
    }
};

const saveVendors = () => {
    if (!currentVendorItem.value) return;
    const totalVendor = totalVendorAmount.value;
    const disbursedAmount = Number(
        currentVendorItem.value.disbursed_amount || 0,
    );

    if (Math.abs(totalVendor - disbursedAmount) > 1) {
        toast.warning(
            `Total pembayaran (Rp ${formatCurrency(totalVendor)}) harus sama dengan nilai dicairkan (Rp ${formatCurrency(disbursedAmount)})!`,
        );
        return;
    }

    for (const vendor of vendorRecipients.value) {
        if (!vendor.recipient_type) {
            toast.warning('Tipe penerima harus diisi!');
            return;
        }
        if (
            vendor.recipient_type === getRecipientTypeString('vendor') &&
            !vendor.recipient_id
        ) {
            toast.warning('Vendor harus dipilih!');
            return;
        }
        if (!vendor.recipient_name) {
            toast.warning('Nama vendor harus diisi!');
            return;
        }

        if (vendor.amount <= 0) {
            toast.warning(
                'Jumlah pembayaran harus lebih dari 0 untuk semua vendor!',
            );
            return;
        }

        if (
            !vendor.bank_name?.trim() ||
            !vendor.bank_account_number?.trim() ||
            !vendor.bank_account_name?.trim()
        ) {
            toast.warning(
                `Data bank untuk "${vendor.recipient_name}" tidak lengkap: Data bank harus diisi!`,
            );
            return;
        }
    }

    closeVendorModal();
    toast.success('Daftar vendor berhasil disimpan');
};

const getVendorCount = (item: ActivityItem): number => {
    return item.recipients.filter(
        (r) => r.recipient_type === getRecipientTypeString('vendor'),
    ).length;
};

// Computed untuk status checkbox header
const isAllSelected = computed(() => {
    if (activityItems.value.length === 0) return false;
    return activityItems.value.every(item => item.selected);
});

const isIndeterminate = computed(() => {
    if (activityItems.value.length === 0) return false;
    const selectedCount = activityItems.value.filter(item => item.selected).length;
    return selectedCount > 0 && selectedCount < activityItems.value.length;
});

// Method untuk toggle semua item
const toggleSelectAll = () => {
    if (isAllSelected.value) {
        deselectAllItems();
    } else {
        selectAllItems();
    }
};

const selectAllItems = () => {
    activityItems.value.forEach((item) => {
        if (item.can_be_selected !== false && item.remaining_amount > 0) {
            item.selected = true;
            item.disbursed_amount = Math.trunc(item.remaining_amount || 0);
        }
    });
};

const deselectAllItems = () => {
    activityItems.value.forEach((item) => {
        item.selected = false;
        item.disbursed_amount = 0;
        item.remaining_amount = item.total_amount;
        item.recipients = [];
    });

    
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID').format(amount || 0);
const handleFileAdded = (file: UploadedFile) =>
    console.log(`File added:`, file.name);
const handleFileRemoved = (index: Number) =>
    console.log(`File removed:`, index);
const handleFileError = (error: string) => {
    console.error('File upload error:', error);
    alert(error);
};
const formatTotalFileSize = (files: any[]) => {
    if (!files?.length) return '0 KB';
    return formatFileSize(files.reduce((sum, f) => sum + (f.size || 0), 0));
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024,
        sizes = ['Bytes', 'KB', 'MB', 'GB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const handleBudgetRequestSelect = (request: any) => loadBudgetRequestDetails();

const validateForm = (isDraftSave = false) => {
    if (isDraftSave) {
        if (!formData.value.budget_request_header_id) {
            toast.warning('Perencanaan anggaran harus dipilih!');
            return false;
        }
        return true;
    }

    if (!formData.value.budget_request_header_id) {
        toast.warning('Perencanaan anggaran harus dipilih!');
        return false;
    }
    if (!formData.value.budget_request_activity_id) {
        toast.warning('Kegiatan harus dipilih!');
        return false;
    }
    if (!formData.value.notes) {
        toast.warning('Catatan pengajuan harus diisi!');
        return false;
    }
    if (!formData.value.files || formData.value.files.length === 0) {
        toast.warning('Minimal harus mengupload 1 file lampiran!');
        return false;
    }

    const selectedItems = activityItems.value.filter((item) => item.selected);
    if (selectedItems.length === 0) {
        toast.warning('Minimal harus memilih satu item untuk dicairkan!');
        return false;
    }

    for (const item of selectedItems) {
        if (item.disbursed_amount <= 0) {
            toast.warning('Nilai yang dicairkan harus lebih dari 0!');
            return false;
        }

        if (item.trans_type_group === 'EMPLOYEE') {
            if (!item.recipients || item.recipients.length === 0) {
                toast.warning(
                    `Item "${item.description}" harus memiliki penerima!`,
                );
                return false;
            }
            const totalRecipientAmount = item.recipients.reduce(
                (sum, r) => sum + (r.amount || 0),
                0,
            );
            if (Math.abs(totalRecipientAmount - item.disbursed_amount) > 1) {
                toast.warning(
                    `Total pembayaran (Rp ${formatCurrency(totalRecipientAmount)}) untuk item "${item.description}" harus sama dengan nilai dicairkan (Rp ${formatCurrency(item.disbursed_amount)})!`,
                );
                return false;
            }
            for (const recipient of item.recipients) {
                if (
                    recipient.recipient_type ===
                        getRecipientTypeString('employee') &&
                    (!recipient.recipient_id || recipient.recipient_id === 0)
                ) {
                    toast.warning(
                        `Pegawai untuk item "${item.description}" harus diisi lengkap!`,
                    );
                    return false;
                }
                if (recipient.amount <= 0) {
                    toast.warning(
                        `Jumlah pembayaran untuk item "${item.description}" harus lebih dari 0!`,
                    );
                    return false;
                }
            }
        }

        // Validasi untuk VENDOR
        if (item.trans_type_group === 'VENDOR') {
            const vendorRecipients = item.recipients.filter(
                (r) => r.recipient_type === getRecipientTypeString('vendor'),
            );

            if (vendorRecipients.length === 0) {
                toast.warning(`Item "${item.description}" harus memiliki vendor!`);
                return false;
            }

            const totalVendorAmount = vendorRecipients.reduce(
                (sum, r) => sum + (r.amount || 0),
                0,
            );
            if (Math.abs(totalVendorAmount - item.disbursed_amount) > 1) {
                toast.warning(
                    `Total pembayaran (Rp ${formatCurrency(totalVendorAmount)}) untuk item "${item.description}" harus sama dengan nilai dicairkan (Rp ${formatCurrency(item.disbursed_amount)})!`,
                );
                return false;
            }

            for (const vendor of vendorRecipients) {
                if (!vendor.recipient_name?.trim()) {
                    toast.warning(
                        `Vendor untuk item "${item.description}" harus memiliki nama!`,
                    );
                    return false;
                }
                if (vendor.amount <= 0) {
                    toast.warning(
                        `Jumlah pembayaran untuk item "${item.description}" harus lebih dari 0!`,
                    );
                    return false;
                }
            }
        }
    }
    return true;
};

const buildSelectedItems = () =>
    activityItems.value
        .filter((i) => i.selected && i.disbursed_amount > 0)
        .map((item) => ({
            budget_request_item_id: item.id,
            total_amount: item.disbursed_amount,
            notes: '',
            recipients: item.recipients || [],
        }));

const buildBasePayload = () => ({
    ...formData.value,
    total_amount: totalDisbursed.value,
});

const appendFiles = (formDataToSend: FormData) => {
    if (!formData.value.files?.length) return;

    formData.value.files.forEach((file) => {
        const isExisting = !!(file.isExisting || file.id);

        if (isExisting && file.id) {
            // Jika file lama, cukup kirim ID-nya saja ke dalam array teks biasa
            formDataToSend.append('keep_files[]', String(file.id));
        } else if (file.file) {
            // Jika file baru, kirim ke array file biner murni
            formDataToSend.append('new_files[]', file.file, file.name);
        }
    });
};

const saveAsDraft = async () => {
    if (!validateForm(true)) return;
    isSubmitting.value = true;
    isDraft.value = true;

    try {
        const formDataToSend = new FormData();
        const isEdit = !!formData.value.id;
        const baseData = {
            ...formData.value,
            status: 'draft',
            status_display: 'Draft',
            total_amount: totalDisbursed.value || 0,
        };

        if (isEdit) formDataToSend.append('_method', 'PUT');
        Object.entries(baseData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'files')
                formDataToSend.append(key, String(value));
        });

        const selectedItems = buildSelectedItems();
        if (selectedItems.length > 0) {
            selectedItems.forEach((item, index) => {
                Object.entries(item).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (key === 'recipients' && Array.isArray(value)) {
                            value.forEach((recipient, recIndex) => {
                                Object.entries(recipient).forEach(
                                    ([recKey, recValue]) => {
                                        if (
                                            recValue !== undefined &&
                                            recValue !== null
                                        )
                                            formDataToSend.append(
                                                `items[${index}][recipients][${recIndex}][${recKey}]`,
                                                String(recValue),
                                            );
                                    },
                                );
                            });
                        } else {
                            formDataToSend.append(
                                `items[${index}][${key}]`,
                                String(value),
                            );
                        }
                    }
                });
            });
        }

        appendFiles(formDataToSend);

        const url = isEdit
            ? `/api/v1/budget-disbursements/${formData.value.id}`
            : '/api/v1/budget-disbursements';
        await axios.post(url, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(
            isEdit
                ? 'Pengajuan berhasil diupdate sebagai draft!'
                : 'Pengajuan berhasil disimpan sebagai draft!',
        );
        router.visit('/pengajuan-pencairan');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Gagal menyimpan draft.');
    } finally {
        isSubmitting.value = false;
        isDraft.value = false;
    }
};

const submitForm = async () => {
    if (!validateForm(false)) return;
    isSubmitting.value = true;

    try {
        const formDataToSend = new FormData();
        const isEdit = !!formData.value.id;
        const base = buildBasePayload();

        if (isEdit) formDataToSend.append('_method', 'PUT');
        Object.entries(base).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'files')
                formDataToSend.append(key, String(value));
        });

        const selectedItems = buildSelectedItems();
        selectedItems.forEach((item, index) => {
            Object.entries(item).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'recipients' && Array.isArray(value)) {
                        value.forEach((recipient, recIndex) => {
                            Object.entries(recipient).forEach(
                                ([recKey, recValue]) => {
                                    if (
                                        recValue !== undefined &&
                                        recValue !== null
                                    )
                                        formDataToSend.append(
                                            `items[${index}][recipients][${recIndex}][${recKey}]`,
                                            String(recValue),
                                        );
                                },
                            );
                        });
                    } else {
                        formDataToSend.append(
                            `items[${index}][${key}]`,
                            String(value),
                        );
                    }
                }
            });
        });

        appendFiles(formDataToSend);

        let id = formData.value.id;
        const url = isEdit
            ? `/api/v1/budget-disbursements/${id}`
            : '/api/v1/budget-disbursements';

        const response = await axios.post(url, formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!isEdit) {
            id = response.data.data.id;
            formData.value.id = id;
        }

        const status = formData.value.status?.toUpperCase();
        const endpoint =
            status === 'RETURNED'
                ? `/api/v1/budget-disbursement-approvals/${id}/resubmit`
                : `/api/v1/budget-disbursement-approvals/${id}/submit`;

        await axios.post(endpoint);

        toast.success(
            status === 'RETURNED'
                ? 'Berhasil diajukan ulang'
                : 'Berhasil diajukan untuk approval',
        );

        toast.success('Pengajuan pencairan berhasil diajukan!');
        router.visit('/pengajuan-pencairan');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
        isSubmitting.value = false;
    }
};

const resetForm = () => {
    if (confirm('Apakah Anda yakin ingin mereset form?')) {
        formData.value = {
            disbursement_no: '',
            disbursement_date: getTodayDate(),
            budget_request_header_id: 0,
            budget_request_activity_id: 0,
            notes: '',
            status: 'submitted',
            status_display: 'Submitted',
            total_amount: 0,
            files: [],
        };
        selectedBudgetRequestId.value = null;
        selectedBudgetRequest.value = null;
        selectedActivity.value = null;
        activityItems.value = [];
    }
};

const goBack = () => {
    if (
        mode.value === 'create' &&
        (formData.value.budget_request_header_id ||
            formData.value.budget_request_activity_id ||
            formData.value.notes ||
            activityItems.value.length > 0 ||
            formData.value.files.length > 0)
    ) {
        if (
            confirm(
                'Apakah Anda yakin ingin keluar? Data yang belum disimpan akan hilang.',
            )
        )
            router.visit('/pengajuan-pencairan');
    } else router.visit('/pengajuan-pencairan');
};

// Watchers
watch(totalDisbursed, (newValue) => {
    formData.value.total_amount = newValue;
});

watch(
    () => selectedActivity.value?.remaining_amount,
    (newRemaining) => {
        if (newRemaining !== undefined && newRemaining <= 0) {
            activityItems.value.forEach((item) => {
                if (!item.selected) item.can_be_selected = false;
            });
        }
    },
);

// Lifecycle
onMounted(async () => {
    showLoadingSkeleton.value = true;
    try {
        await Promise.all([loadEmployees(), loadVendors()]);

        if (props.id) {
            await loadDisbursement(props.id);
        } else {
            await loadApprovedBudgetRequests();
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
    <Head title="Pengajuan Pencairan" />
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
                        <div v-for="i in 4" :key="i" class="space-y-2">
                            <div
                                class="h-4 w-24 animate-pulse rounded bg-gray-200"
                            ></div>
                            <div
                                class="h-10 animate-pulse rounded bg-gray-200"
                            ></div>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div v-for="i in 3" :key="i" class="space-y-2">
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

            <!-- Konten Utama -->
            <template v-else>
                <!-- Alert untuk mode draft -->
                <div
                    v-if="
                        mode === 'edit' &&
                        formData.status?.toUpperCase() === 'DRAFT'
                    "
                    class="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4"
                >
                    <div class="flex items-center gap-2">
                        <Info class="h-5 w-5 text-blue-600" />
                        <p class="text-sm font-medium text-blue-700">
                            Draft pengajuan. Anda dapat mengedit dan melengkapi
                            data sebelum mengajukan.
                        </p>
                    </div>
                </div>

                <!-- Alert untuk mode read-only -->
                <div
                    v-if="
                        isReadOnly &&
                        formData.status?.toUpperCase() !== 'SUBMITTED'
                    "
                    class="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4"
                >
                    <div class="flex items-center gap-2">
                        <AlertCircle class="h-5 w-5 text-yellow-600" />
                        <p class="text-sm font-medium text-yellow-700">
                            Form dalam mode baca saja. Pengajuan ini sudah
                            diajukan dan tidak dapat diedit.
                        </p>
                    </div>
                </div>

                <!-- Header Form -->
                <div class="mb-6 border-b pb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">
                                {{
                                    mode === 'create'
                                        ? 'Pengajuan Pencairan'
                                        : 'Detail Pengajuan Pencairan'
                                }}
                            </h1>
                            <p class="mt-1 text-sm text-gray-500">
                                Formulir pengajuan pencairan anggaran kegiatan
                            </p>
                        </div>
                    </div>
                    <div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <div
                            v-if="mode !== 'create' && formData.disbursement_no"
                            class="flex items-center gap-2"
                        >
                            <CalendarDays class="h-4 w-4 text-gray-400" />
                            <span class="font-bold"
                                >No Pengajuan Pencairan:</span
                            >
                            <span class="font-medium">{{
                                formData.disbursement_no
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
                            v-if="mode !== 'create' && formData.disbursement_no"
                            class="ml-auto flex items-center gap-2"
                        >
                            <Info class="h-4 w-4 text-blue-500" />
                            <span class="font-bold">Status:</span>
                            <span class="text-sm font-bold">{{
                                statusDescription
                            }}</span>
                        </div>
                    </div>
                </div>

                <!-- Form Fields -->
                <form @submit.prevent="submitForm" class="space-y-6">
                    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div class="space-y-6">
                            <div v-if="mode === 'create'" class="space-y-2">
                                <Label class="text-sm font-medium"
                                    >Perencanaan Anggaran
                                    <span class="text-red-500">*</span></Label
                                >
                                <div>
                                    <BudgetRequestPicker
                                        v-model="selectedBudgetRequestId"
                                        :approvedBudgetRequests="
                                            approvedBudgetRequests
                                        "
                                        :disabled="isReadOnly"
                                        @select="handleBudgetRequestSelect"
                                    />
                                </div>
                            </div>
                            <div
                                v-if="selectedBudgetRequest"
                                class="space-y-3 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex items-center justify-between">
                                    <h3 class="font-medium text-primary">
                                        Informasi Perencanaan
                                    </h3>
                                </div>

                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <span class="text-gray-500"
                                        >No. Perencanaan:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedBudgetRequest.request_no
                                    }}</span>
                                    <span class="text-gray-500">Unit:</span>
                                    <span class="font-medium">{{
                                        selectedBudgetRequest.unit?.unit_name
                                    }}</span>
                                    <span class="text-gray-500"
                                        >Tahun Anggaran:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedBudgetRequest.fiscal_year?.year
                                    }}</span>
                                    <span class="text-gray-500">Kategori:</span>
                                    <span class="font-medium">{{
                                        selectedBudgetRequest.budget_category
                                            ?.name
                                    }}</span>
                                    <span class="text-gray-500"
                                        >Sub Kategori:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedBudgetRequest
                                            .sub_budget_category?.name
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div v-if="mode === 'create'" class="space-y-2">
                                <Label class="text-sm font-medium"
                                    >Rincian Kegiatan
                                    <span class="text-red-500">*</span></Label
                                >
                                <Select
                                    v-model="
                                        formData.budget_request_activity_id
                                    "
                                    @update:modelValue="loadActivityItems"
                                    :disabled="
                                        isReadOnly || !selectedBudgetRequest
                                    "
                                >
                                    <SelectTrigger class="w-full">
                                        <SelectValue
                                            placeholder="Pilih Kegiatan"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel
                                                >Daftar Kegiatan</SelectLabel
                                            >
                                            <SelectItem
                                                v-for="activity in availableActivities"
                                                :key="activity.id"
                                                :value="activity.id"
                                            >
                                                <div class="flex flex-col">
                                                    <span class="font-medium">{{
                                                        activity.activity
                                                            ?.activity_name
                                                    }}</span>
                                                </div>
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div
                                v-if="
                                    selectedActivity &&
                                    formData.budget_request_activity_id
                                "
                                class="space-y-3 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex items-center gap-2">
                                    <h3 class="font-medium text-primary">
                                        Informasi Rincian Kegiatan
                                    </h3>
                                </div>
                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span class="text-gray-600"
                                            >Kode Kegiatan:</span
                                        >
                                        <div class="font-medium text-gray-800">
                                            {{
                                                selectedActivity.activity
                                                    ?.activity_code || '-'
                                            }}
                                        </div>
                                    </div>
                                    <div>
                                        <span class="text-gray-600"
                                            >Nama Kegiatan:</span
                                        >
                                        <div class="font-medium text-gray-800">
                                            {{
                                                selectedActivity.activity
                                                    ?.activity_name || '-'
                                            }}
                                        </div>
                                    </div>
                                    <div>
                                        <span class="text-gray-600"
                                            >Total Anggaran Kegiatan:</span
                                        >
                                        <div
                                            class="font-semibold text-blue-700"
                                        >
                                            Rp
                                            {{
                                                formatCurrency(
                                                    selectedActivity.total_amount,
                                                )
                                            }}
                                        </div>
                                    </div>
                                    <div>
                                        <span class="text-gray-600"
                                            >Terealisasi:</span
                                        >
                                        <div
                                            class="font-medium text-orange-600"
                                        >
                                            Rp
                                            {{
                                                formatCurrency(
                                                    selectedActivity.disbursed_amount ||
                                                        0,
                                                )
                                            }}
                                        </div>
                                    </div>
                                    <div>
                                        <span class="text-gray-600"
                                            >Sisa Anggaran:</span
                                        >
                                        <div
                                            class="font-semibold"
                                            :class="{
                                                'text-green-700':
                                                    selectedActivity.remaining_amount >
                                                    0,
                                                'text-red-600':
                                                    selectedActivity.remaining_amount <=
                                                    0,
                                            }"
                                        >
                                            Rp
                                            {{
                                                formatCurrency(
                                                    selectedActivity.remaining_amount,
                                                )
                                            }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <Label class="text-sm font-medium"
                                    >Catatan
                                    <span class="text-red-500">*</span></Label
                                >
                                <Textarea
                                    v-model="formData.notes"
                                    placeholder="Isikan catatan pengajuan..."
                                    class="min-h-[100px] resize-none"
                                    :maxlength="500"
                                    :disabled="isReadOnly"
                                />
                                <div class="flex justify-end">
                                    <span class="text-xs text-gray-500"
                                        >{{
                                            formData.notes?.length ?? 0
                                        }}/500</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detail Item Pencairan -->
                    <div class="border-t pt-6">
                        <div class="mb-4 flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold">
                                    Rincian Item Kegiatan
                                </h3>
                                <p class="text-sm text-gray-500">
                                    Item Kegiatan yang diajukan untuk dicairkan
                                </p>
                            </div>
                            <!-- <div class="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    @click="selectAllItems"
                                    class="gap-2"
                                    :disabled="isReadOnly || !selectedActivity"
                                >
                                    <CheckSquare class="h-4 w-4" /> Pilih Semua
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    @click="deselectAllItems"
                                    class="gap-2"
                                    :disabled="isReadOnly || !selectedActivity"
                                >
                                    <Square class="h-4 w-4" /> Hapus Semua
                                </Button>
                            </div> -->
                        </div>

                        <div class="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <!-- <TableHead class="w-12"
                                            >Pilih</TableHead
                                        > -->
                                        <TableHead class="w-12">
                                            <input
                                                type="checkbox"
                                                :checked="isAllSelected"
                                                :indeterminate="isIndeterminate"
                                                @change="toggleSelectAll"
                                                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                :disabled="
                                                    isReadOnly ||
                                                    !selectedActivity ||
                                                    activityItems.length === 0
                                                "
                                            />
                                        </TableHead>
                                        <TableHead class="w-12">No</TableHead>
                                        <TableHead class="min-w-[200px]"
                                            >Item Anggaran</TableHead
                                        >
                                        <TableHead class="w-32 text-right"
                                            >Nilai Anggaran</TableHead
                                        >
                                        <TableHead class="w-32 text-right"
                                            >Terealisasi</TableHead
                                        >
                                        <TableHead class="w-32 text-right"
                                            >Sisa</TableHead
                                        >
                                        <TableHead class="w-32 text-right"
                                            >Nilai Diajukan</TableHead
                                        >
                                        <TableHead class="w-48"
                                            >Pegawai</TableHead
                                        >
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <template v-if="activityItems.length > 0">
                                        <TableRow
                                            v-for="(
                                                item, index
                                            ) in activityItems"
                                            :key="item.id"
                                        >
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    v-model="item.selected"
                                                    @change="
                                                        updateSelectedItems
                                                    "
                                                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    :disabled="
                                                        isReadOnly ||
                                                        item.remaining_amount <=
                                                            0 ||
                                                        item.can_be_selected ===
                                                            false
                                                    "
                                                />
                                            </TableCell>
                                            <TableCell class="font-medium">{{
                                                index + 1
                                            }}</TableCell>
                                            <TableCell>
                                                <div
                                                    :title="
                                                        'Tipe Transaksi: ' +
                                                        item.trans_type_group
                                                    "
                                                    class="cursor-help"
                                                >
                                                    <span class="text-sm">{{
                                                        item.description
                                                    }}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                class="text-right font-medium"
                                                >Rp
                                                {{
                                                    formatCurrency(
                                                        item.total_amount,
                                                    )
                                                }}</TableCell
                                            >
                                            <TableCell
                                                class="text-right font-medium"
                                                >Rp
                                                {{
                                                    formatCurrency(
                                                        item.disbursed_amount ||
                                                            0,
                                                    )
                                                }}</TableCell
                                            >
                                            <TableCell
                                                class="text-right font-medium"
                                                :class="{
                                                    'text-green-600':
                                                        getDisplayRemaining(
                                                            item,
                                                        ) > 0,
                                                    'text-red-600':
                                                        getDisplayRemaining(
                                                            item,
                                                        ) <= 0,
                                                }"
                                            >
                                                Rp
                                                {{
                                                    formatCurrency(
                                                        getDisplayRemaining(
                                                            item,
                                                        ),
                                                    )
                                                }}
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    class="relative"
                                                    v-if="item.selected"
                                                >
                                                    <template
                                                        v-if="!isReadOnly"
                                                    >
                                                        <span
                                                            class="absolute top-2 left-2 text-xs text-gray-500"
                                                            >Rp</span
                                                        >
                                                        <Input
                                                            :modelValue="
                                                                item.disbursed_amount ||
                                                                ''
                                                            "
                                                            type="text"
                                                            @update:modelValue="
                                                                (
                                                                    value:
                                                                        | string
                                                                        | number,
                                                                ) => {
                                                                    const sanitized =
                                                                        String(
                                                                            value,
                                                                        )
                                                                            .replace(
                                                                                /[^0-9.]/g,
                                                                                '',
                                                                            )
                                                                            .slice(
                                                                                0,
                                                                                15,
                                                                            );
                                                                    item.disbursed_amount =
                                                                        Number(
                                                                            sanitized,
                                                                        ) || 0;
                                                                        
                                                                    item.remaining_amount =
                                                                        (item.total_amount ||
                                                                            0) -
                                                                        (item.initial_disbursed ||
                                                                            0) -
                                                                        (Number(
                                                                            sanitized,
                                                                        ) || 0);
                                                                    
                                                                }
                                                            "
                                                            class="w-full pl-8 text-right text-sm"
                                                        />
                                                    </template>
                                                    <div
                                                        v-else
                                                        class="text-right text-sm font-medium"
                                                    >
                                                        Rp
                                                        {{
                                                            formatCurrency(
                                                                item.disbursed_amount,
                                                            )
                                                        }}
                                                    </div>
                                                </div>
                                                <span
                                                    v-else
                                                    class="text-sm text-gray-400"
                                                    >-</span
                                                >
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    v-if="
                                                        item.selected &&
                                                        item.trans_type_group ===
                                                            'EMPLOYEE'
                                                    "
                                                >
                                                    <Button
                                                        v-if="
                                                            !isReadOnly &&
                                                            item.disbursed_amount >
                                                                0
                                                        "
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        @click="
                                                            openEmployeeModal(
                                                                item,
                                                            )
                                                        "
                                                        class="gap-1"
                                                    >
                                                        <Users
                                                            class="h-3 w-3"
                                                        />
                                                        Kelola Pegawai
                                                        <span
                                                            v-if="
                                                                item.recipients &&
                                                                item.recipients
                                                                    .length > 0
                                                            "
                                                            class="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs"
                                                            >{{
                                                                item.recipients
                                                                    .length
                                                            }}</span
                                                        >
                                                    </Button>
                                                    <div
                                                        v-else-if="
                                                            item.recipients &&
                                                            item.recipients
                                                                .length > 0
                                                        "
                                                        class="text-xs text-gray-500"
                                                    >
                                                        {{
                                                            item.recipients
                                                                .length
                                                        }}
                                                        penerima
                                                    </div>
                                                    <div
                                                        v-else-if="
                                                            item.disbursed_amount >
                                                            0
                                                        "
                                                        class="text-xs text-red-500"
                                                    >
                                                        * Belum ada penerima
                                                    </div>
                                                </div>
                                                <!-- Di tabel utama, bagian penerima untuk VENDOR -->
                                                <div
                                                    v-else-if="
                                                        item.selected &&
                                                        item.trans_type_group ===
                                                            'VENDOR'
                                                    "
                                                >
                                                    <Button
                                                        v-if="
                                                            !isReadOnly &&
                                                            item.disbursed_amount >
                                                                0
                                                        "
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        @click="
                                                            openVendorModal(
                                                                item,
                                                            )
                                                        "
                                                        class="gap-1"
                                                    >
                                                        <Building2
                                                            class="h-3 w-3"
                                                        />
                                                        Kelola Vendor
                                                        <span
                                                            v-if="
                                                                getVendorCount(
                                                                    item,
                                                                ) > 0
                                                            "
                                                            class="ml-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs"
                                                            >{{
                                                                getVendorCount(
                                                                    item,
                                                                )
                                                            }}</span
                                                        >
                                                    </Button>
                                                    <div
                                                        v-else-if="
                                                            getVendorCount(
                                                                item,
                                                            ) > 0
                                                        "
                                                        class="text-xs text-gray-500"
                                                    >
                                                        {{
                                                            getVendorCount(item)
                                                        }}
                                                        vendor
                                                    </div>
                                                    <div
                                                        v-else-if="
                                                            item.disbursed_amount >
                                                            0
                                                        "
                                                        class="text-xs text-red-500"
                                                    >
                                                        * Belum ada vendor
                                                    </div>
                                                </div>
                                                <div
                                                    v-else-if="
                                                        item.selected &&
                                                        item.trans_type_group !==
                                                            'EMPLOYEE' &&
                                                        item.trans_type_group !==
                                                            'VENDOR'
                                                    "
                                                    class="text-xs text-gray-400"
                                                >
                                                    -
                                                </div>
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
                                                <ListChecks class="h-8 w-8" />
                                                <p>
                                                    Pilih kegiatan terlebih
                                                    dahulu untuk melihat item
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div class="mt-6 flex justify-end">
                            <div
                                class="w-96 space-y-3 rounded-lg border bg-gray-50 p-4"
                            >
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600"
                                        >Jumlah Item Dipilih:</span
                                    >
                                    <span class="font-medium">{{
                                        selectedItemsCount
                                    }}</span>
                                </div>
                                <div class="flex justify-between border-t pt-2">
                                    <span class="font-medium text-gray-800"
                                        >Total Diajukan:</span
                                    >
                                    <span
                                        class="text-lg font-bold text-blue-600"
                                        >Rp
                                        {{
                                            formatCurrency(totalDisbursed)
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lampiran Dokumen -->
                    <div class="border-t pt-6">
                        <div class="mb-3 flex items-center gap-2">
                            <Upload class="h-4 w-4 text-gray-500" />
                            <h4 class="font-medium text-gray-700">
                                Lampiran Dokumen Pengajuan Pencairan
                                <span class="text-red-500">*</span>
                            </h4>
                        </div>
                        <FileUpload
                            v-model="formData.files"
                            :disabled="isReadOnly"
                            :view-only="isReadOnly"
                            :max-size-mb="10"
                            :accepted-file-types="[
                                '.pdf',
                                '.jpg',
                                '.jpeg',
                                '.png',
                            ]"
                            @file-added="handleFileAdded"
                            @file-removed="handleFileRemoved"
                            @file-error="handleFileError"
                        />
                        <div
                            v-if="formData.files?.length > 0"
                            class="mt-2 text-xs text-gray-500"
                        >
                            Total {{ formData.files.length }} file lampiran ({{
                                formatTotalFileSize(formData.files)
                            }})
                        </div>
                        <div
                            v-else
                            class="mt-2 text-xs text-red-500"
                        >
                            * Wajib mengupload minimal 1 file lampiran dokumen
                            pendukung
                        </div>
                    </div>

                    <!-- Background Process Indicator -->
                    <div
                        v-if="isBackgroundProcessing"
                        class="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
                    >
                        <div
                            class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        ></div>
                        <span class="text-sm font-medium"
                            >Memproses data...</span
                        >
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-3 border-t pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            @click="goBack"
                            class="gap-2 border-gray-300 hover:bg-gray-50"
                        >
                            <ArrowLeft class="h-4 w-4" /> Kembali
                        </Button>
                        <div v-if="!isReadOnly" class="flex space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                @click="resetForm"
                                class="gap-2 border-gray-300 hover:bg-gray-50"
                                :disabled="isSubmitting"
                            >
                                <RotateCcw class="h-4 w-4" /> Reset
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                @click="saveAsDraft"
                                class="gap-2"
                                :disabled="isSubmitting"
                            >
                                <Save class="h-4 w-4" />
                                {{
                                    isSubmitting && isDraft
                                        ? 'Menyimpan...'
                                        : 'Simpan Draft'
                                }}
                            </Button>
                            <Button
                                type="submit"
                                class="gap-2 bg-green-600 text-white hover:bg-green-700"
                                :disabled="isSubmitting"
                            >
                                <Send class="h-4 w-4" />
                                {{
                                    isSubmitting && !isDraft
                                        ? 'Menyimpan...'
                                        : 'Ajukan Pengajuan'
                                }}
                            </Button>
                        </div>
                    </div>
                </form>
            </template>
        </div>

        <!-- Modal for recipient management -->
        <div
            v-if="showEmployeeModal"
            class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black"
            @click.self="closeRecipientModal"
        >
            <div
                class="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            >
                <div
                    class="sticky top-0 mb-4 flex items-center justify-between border-b bg-white pb-3"
                >
                    <h3 class="text-lg font-semibold">
                        Kelola Pegawai -
                        {{ employeeRecipientItem?.description }}
                    </h3>
                    <button
                        @click="closeRecipientModal"
                        class="text-gray-400 hover:text-gray-600"
                    >
                        <X class="h-5 w-5" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div class="flex border-b">
                        <button
                            @click="activeTab = 'manual'"
                            :class="[
                                'px-4 py-2 text-sm font-medium',
                                activeTab === 'manual'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700',
                            ]"
                        >
                            Input Manual
                        </button>
                        <button
                            @click="activeTab = 'upload'"
                            :class="[
                                'px-4 py-2 text-sm font-medium',
                                activeTab === 'upload'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700',
                            ]"
                        >
                            Upload File (Batch)
                        </button>
                    </div>

                    <div
                        v-if="activeTab === 'manual'"
                        class="rounded-lg border bg-gray-50 p-4"
                    >
                        <h4 class="mb-3 font-medium text-gray-700">
                            Tambah Pegawai Baru
                        </h4>
                        <div class="mb-4 rounded-md bg-green-50 p-3">
                            <div class="flex justify-between text-sm">
                                <span class="font-medium text-green-700"
                                    >Sisa Dana Tersedia:</span
                                >
                                <span class="font-bold text-green-800"
                                    >Rp
                                    {{ formatCurrency(remainingFunds) }}</span
                                >
                            </div>
                            <div
                                class="mt-1 flex justify-between text-xs text-green-600"
                            >
                                <span
                                    >Nilai Dicairkan: Rp
                                    {{
                                        formatCurrency(
                                            employeeRecipientItem?.disbursed_amount ||
                                                0,
                                        )
                                    }}</span
                                >
                                <span
                                    >Sudah Dialokasikan: Rp
                                    {{
                                        formatCurrency(totalRecipientAmount)
                                    }}</span
                                >
                            </div>
                        </div>

                        <!-- Info bank dari employee yang dipilih -->
                        <div
                            v-if="
                                selectedEmployee &&
                                (selectedEmployee.bank_name ||
                                    selectedEmployee.bank_account_number ||
                                    selectedEmployee.bank_account_name)
                            "
                            class="mb-4 rounded-md bg-blue-50 p-3"
                        >
                            <h5
                                class="mb-2 text-xs font-semibold text-blue-700 uppercase"
                            >
                                Informasi Bank Pegawai
                            </h5>
                            <div
                                class="grid grid-cols-1 gap-2 text-sm md:grid-cols-3"
                            >
                                <div v-if="selectedEmployee.bank_name">
                                    <span class="text-xs text-blue-600"
                                        >Bank:</span
                                    >
                                    <p class="font-medium text-blue-800">
                                        {{ selectedEmployee.bank_name }}
                                    </p>
                                </div>
                                <div
                                    v-if="selectedEmployee.bank_account_number"
                                >
                                    <span class="text-xs text-blue-600"
                                        >No. Rekening:</span
                                    >
                                    <p class="font-medium text-blue-800">
                                        {{
                                            selectedEmployee.bank_account_number
                                        }}
                                    </p>
                                </div>
                                <div v-if="selectedEmployee.bank_account_name">
                                    <span class="text-xs text-blue-600"
                                        >Pemilik Rekening:</span
                                    >
                                    <p class="font-medium text-blue-800">
                                        {{ selectedEmployee.bank_account_name }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label class="text-sm font-medium"
                                    >Pegawai *</Label
                                >
                                <Select v-model="selectedEmployee">
                                    <SelectTrigger class="mt-1 w-full">
                                        <span
                                            v-if="selectedEmployee"
                                            class="w-full truncate text-left"
                                            >{{ selectedEmployee.nik }} -
                                            {{ selectedEmployee.name }}</span
                                        >
                                        <SelectValue
                                            v-else
                                            placeholder="Pilih Pegawai"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div class="p-2">
                                            <Input
                                                v-model="searchEmployeeKeyword"
                                                placeholder="Cari nama, nik..."
                                                class="mb-2"
                                            />
                                        </div>
                                        <SelectGroup>
                                            <SelectItem
                                                v-for="employee in filteredEmployees"
                                                :key="employee.id"
                                                :value="employee"
                                            >
                                                <div class="flex flex-col">
                                                    <span class="font-medium">{{
                                                        employee.name
                                                    }}</span>
                                                    <span
                                                        class="text-xs text-gray-500"
                                                        >{{
                                                            employee.nik
                                                        }}</span
                                                    >
                                                </div>
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label class="text-sm font-medium"
                                    >Jumlah Pembayaran *</Label
                                >
                                <div class="relative mt-1">
                                    <span
                                        class="absolute top-2 left-3 text-gray-500"
                                        >Rp</span
                                    >
                                    <Input
                                        v-model="recipientAmount"
                                        type="text"
                                        placeholder="0"
                                        @input="
                                            recipientAmount =
                                                $event.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                )
                                        "
                                        class="pl-10"
                                    />
                                </div>
                                <div class="mt-1 text-xs text-gray-500">
                                    Maksimal: Rp
                                    {{ formatCurrency(remainingFunds) }}
                                </div>
                            </div>
                            <div class="md:col-span-2">
                                <Label class="text-sm font-medium"
                                    >Catatan (Opsional)</Label
                                >
                                <Input
                                    v-model="recipientNotes"
                                    type="text"
                                    placeholder="Catatan untuk pembayaran ini..."
                                    class="mt-1"
                                />
                            </div>
                        </div>
                        <div class="mt-4 flex justify-end">
                            <Button
                                type="button"
                                @click="addRecipientToModal"
                                class="bg-blue-600 text-white hover:bg-blue-700"
                                :disabled="
                                    !selectedEmployee ||
                                    recipientAmount <= 0 ||
                                    recipientAmount > remainingFunds
                                "
                            >
                                <UserPlus class="mr-2 h-4 w-4" /> Tambah ke
                                Daftar
                            </Button>
                        </div>
                    </div>

                    <div
                        v-if="activeTab === 'upload'"
                        class="rounded-lg border bg-gray-50 p-4"
                    >
                        <h4 class="mb-3 font-medium text-gray-700">
                            Upload Data Pegawai (Batch)
                        </h4>
                        <div class="space-y-4">
                            <div class="rounded-md bg-blue-50 p-3">
                                <div class="flex items-start gap-2">
                                    <Info
                                        class="mt-0.5 h-4 w-4 text-blue-600"
                                    />
                                    <div class="text-sm text-blue-700">
                                        <p class="font-medium">Petunjuk:</p>
                                        <ul
                                            class="mt-1 list-inside list-disc space-y-1"
                                        >
                                            <li>Format file: .xlsx</li>
                                            <li>
                                                Kolom yang diperlukan: nik,
                                                nama, jumlah
                                            </li>
                                            <li>Kolom opsional: catatan</li>
                                            <li>
                                                Download template untuk melihat
                                                format yang benar
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    @click="downloadRecipientTemplate"
                                    class="gap-2"
                                    ><Upload class="h-4 w-4" /> Download
                                    Template</Button
                                >
                            </div>
                            <div
                                class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center"
                            >
                                <input
                                    id="employee-file-input"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    class="hidden"
                                    @change="handleRecipientFileUpload"
                                />
                                <label
                                    for="employee-file-input"
                                    class="cursor-pointer"
                                >
                                    <div
                                        class="flex flex-col items-center gap-2"
                                    >
                                        <Upload class="h-8 w-8 text-gray-400" />
                                        <span class="text-sm text-gray-600">{{
                                            uploadFile
                                                ? uploadFile.name
                                                : 'Klik untuk pilih file atau drag & drop'
                                        }}</span>
                                        <span class="text-xs text-gray-500"
                                            >Support: .csv, .xlsx, .xls (Max
                                            10MB)</span
                                        >
                                    </div>
                                </label>
                            </div>
                            <div class="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    @click="uploadFile = null"
                                    :disabled="
                                        !uploadFile || isUploadingRecipients
                                    "
                                    >Reset</Button
                                >
                                <Button
                                    type="button"
                                    @click="importRecipientsFromFile"
                                    class="bg-green-600 text-white hover:bg-green-700"
                                    :disabled="
                                        !uploadFile || isUploadingRecipients
                                    "
                                >
                                    <Users
                                        v-if="!isUploadingRecipients"
                                        class="mr-2 h-4 w-4"
                                    />
                                    <div
                                        v-else
                                        class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                                    ></div>
                                    {{
                                        isUploadingRecipients
                                            ? 'Memproses...'
                                            : 'Import Data'
                                    }}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="mb-3 flex items-center justify-between">
                            <h4 class="font-medium text-gray-700">
                                Daftar Pegawai
                                <span class="text-sm text-gray-500"
                                    >({{
                                        employeeRecipientItem?.recipients
                                            .length || 0
                                    }}
                                    penerima)</span
                                >
                            </h4>
                            <Button
                                v-if="
                                    (employeeRecipientItem?.recipients || [])
                                        .length > 0
                                "
                                type="button"
                                variant="ghost"
                                size="sm"
                                @click="clearAllRecipients"
                                class="text-red-600 hover:bg-red-50"
                            >
                                <Trash2 class="mr-1 h-3 w-3" /> Hapus Semua
                            </Button>
                        </div>
                        <div
                            class="max-h-[300px] overflow-x-auto overflow-y-auto rounded-md border"
                        >
                            <Table>
                                <TableHeader class="sticky top-0 bg-white">
                                    <TableRow>
                                        <TableHead class="w-12">No</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead>Nama Pegawai</TableHead>
                                        <TableHead>Kode/NIK</TableHead>
                                        <TableHead class="text-right"
                                            >Jumlah</TableHead
                                        >
                                        <TableHead>Bank</TableHead>
                                        <TableHead>No. Rekening</TableHead>
                                        <TableHead>Catatan</TableHead>
                                        <TableHead class="w-28">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <template
                                        v-if="
                                            employeeRecipientItem?.recipients
                                                .length
                                        "
                                    >
                                        <TableRow
                                            v-for="(
                                                recipient, rIdx
                                            ) in employeeRecipientItem.recipients"
                                            :key="rIdx"
                                        >
                                            <TableCell class="text-center">{{
                                                rIdx + 1
                                            }}</TableCell>
                                            <TableCell>
                                                <span
                                                    class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                                                    :class="
                                                        getTypeBadgeClass(
                                                            recipient.recipient_type,
                                                        )
                                                    "
                                                >
                                                    {{
                                                        getDisplayType(
                                                            recipient.recipient_type,
                                                        )
                                                    }}
                                                </span>
                                            </TableCell>
                                            <TableCell class="font-medium">{{
                                                recipient.recipient_name
                                            }}</TableCell>
                                            <TableCell>{{
                                                recipient.identity_no || '-'
                                            }}</TableCell>
                                            <TableCell class="text-right"
                                                >Rp
                                                {{
                                                    formatCurrency(
                                                        recipient.amount,
                                                    )
                                                }}</TableCell
                                            >
                                            <TableCell>{{
                                                recipient.bank_name || '-'
                                            }}</TableCell>
                                            <TableCell>{{
                                                recipient.bank_account_number ||
                                                '-'
                                            }}</TableCell>
                                            <TableCell class="text-gray-500">{{
                                                recipient.notes || '-'
                                            }}</TableCell>
                                            <TableCell>
                                                <div class="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        @click="
                                                            editRecipientFromModal(
                                                                rIdx,
                                                            )
                                                        "
                                                        class="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Edit2
                                                            class="h-4 w-4"
                                                        />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        @click="
                                                            removeRecipientFromModal(
                                                                rIdx,
                                                            )
                                                        "
                                                        class="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                                    >
                                                        <X class="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </template>
                                    <TableRow v-else>
                                        <TableCell
                                            colspan="9"
                                            class="py-8 text-center text-gray-500"
                                        >
                                            <div
                                                class="flex flex-col items-center gap-2"
                                            >
                                                <Users
                                                    class="h-8 w-8 text-gray-300"
                                                />
                                                <p>
                                                    Belum ada penerima yang
                                                    ditambahkan
                                                </p>
                                                <p class="text-xs">
                                                    Tambahkan via Input Manual
                                                    atau Upload File
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <div class="mt-4 rounded-lg bg-blue-50 p-3">
                            <div class="flex justify-between text-sm">
                                <span class="font-medium text-gray-700"
                                    >Sudah Dialokasikan:</span
                                >
                                <span class="font-bold text-blue-700"
                                    >Rp
                                    {{
                                        formatCurrency(totalRecipientAmount)
                                    }}</span
                                >
                            </div>
                            <div class="mt-1 flex justify-between text-sm">
                                <span class="font-medium text-gray-700"
                                    >Nilai Dicairkan:</span
                                >
                                <span class="font-medium text-gray-900"
                                    >Rp
                                    {{
                                        formatCurrency(
                                            employeeRecipientItem?.disbursed_amount ||
                                                0,
                                        )
                                    }}</span
                                >
                            </div>
                            <div
                                v-if="
                                    Math.abs(
                                        totalRecipientAmount -
                                            (employeeRecipientItem?.disbursed_amount ||
                                                0),
                                    ) > 1
                                "
                                class="mt-2 text-xs"
                                :class="{
                                    'text-red-600':
                                        totalRecipientAmount >
                                        (employeeRecipientItem?.disbursed_amount ||
                                            0),
                                    'text-orange-600':
                                        totalRecipientAmount <
                                        (employeeRecipientItem?.disbursed_amount ||
                                            0),
                                }"
                            >
                                <span
                                    v-if="
                                        totalRecipientAmount >
                                        (employeeRecipientItem?.disbursed_amount ||
                                            0)
                                    "
                                    >⚠️ Kelebihan: Rp
                                    {{
                                        formatCurrency(
                                            totalRecipientAmount -
                                                (employeeRecipientItem?.disbursed_amount ||
                                                    0),
                                        )
                                    }}</span
                                >
                                <span v-else
                                    >💰 Kekurangan: Rp
                                    {{
                                        formatCurrency(
                                            (employeeRecipientItem?.disbursed_amount ||
                                                0) - totalRecipientAmount,
                                        )
                                    }}</span
                                >
                            </div>
                            <div v-else class="mt-2 text-xs text-green-600">
                                ✅ Total pembayaran sudah sesuai dengan nilai
                                dicairkan
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="sticky bottom-0 mt-6 flex justify-end space-x-2 border-t bg-white pt-4"
                >
                    <Button
                        type="button"
                        variant="outline"
                        @click="closeRecipientModal"
                        >Batal</Button
                    >
                    <Button
                        type="button"
                        @click="saveRecipients"
                        class="bg-green-600 text-white hover:bg-green-700"
                        :disabled="!isTotalRecipientAmountEqual"
                    >
                        <CheckSquare class="mr-2 h-4 w-4" /> Simpan Semua
                        Pegawai
                    </Button>
                </div>
            </div>
        </div>

        <!-- Modal for vendor management -->
        <div
            v-if="showVendorModal"
            class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black"
            @click.self="closeVendorModal"
        >
            <div
                class="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            >
                <div
                    class="sticky top-0 mb-4 flex items-center justify-between border-b bg-white pb-3"
                >
                    <h3 class="text-lg font-semibold">
                        Kelola Vendor - {{ currentVendorItem?.description }}
                    </h3>
                    <button
                        @click="closeVendorModal"
                        class="text-gray-400 hover:text-gray-600"
                    >
                        <X class="h-5 w-5" />
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="vendor-form rounded-lg border bg-gray-50 p-4">
                        <h4 class="mb-3 font-medium text-gray-700">
                            Tambah Vendor Baru
                        </h4>
                        <div class="mb-4 rounded-md bg-green-50 p-3">
                            <div class="flex justify-between text-sm">
                                <span class="font-medium text-green-700"
                                    >Sisa Dana Tersedia:</span
                                >
                                <span class="font-bold text-green-800"
                                    >Rp
                                    {{
                                        formatCurrency(remainingVendorFunds)
                                    }}</span
                                >
                            </div>
                            <div
                                class="mt-1 flex justify-between text-xs text-green-600"
                            >
                                <span
                                    >Nilai Dicairkan: Rp
                                    {{
                                        formatCurrency(
                                            currentVendorItem?.disbursed_amount ||
                                                0,
                                        )
                                    }}</span
                                >
                                <span
                                    >Sudah Dialokasikan: Rp
                                    {{
                                        formatCurrency(totalVendorAmount)
                                    }}</span
                                >
                            </div>
                        </div>

                        <!-- Info bank dari vendor yang dipilih -->
                        <div
                            v-if="
                                selectedVendor &&
                                (selectedVendor.bank_name ||
                                    selectedVendor.bank_account_number ||
                                    selectedVendor.bank_account_name)
                            "
                            class="mb-4 rounded-md bg-blue-50 p-3"
                        >
                            <h5
                                class="mb-2 text-xs font-semibold text-blue-700 uppercase"
                            >
                                Informasi Bank Vendor
                            </h5>
                            <div
                                class="grid grid-cols-1 gap-2 text-sm md:grid-cols-3"
                            >
                                <div v-if="selectedVendor.bank_name">
                                    <span class="text-xs text-blue-600"
                                        >Bank:</span
                                    >
                                    <p class="font-medium text-blue-800">
                                        {{ selectedVendor.bank_name }}
                                    </p>
                                </div>
                                <div v-if="selectedVendor.bank_account_number">
                                    <span class="text-xs text-blue-600"
                                        >No. Rekening:</span
                                    >
                                    <p class="font-medium text-blue-800">
                                        {{ selectedVendor.bank_account_number }}
                                    </p>
                                </div>
                                <div v-if="selectedVendor.bank_account_name">
                                    <span class="text-xs text-blue-600"
                                        >Pemilik Rekening:</span
                                    >
                                    <p class="font-medium text-blue-800">
                                        {{
                                            selectedEmployee?.bank_account_name
                                        }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label class="text-sm font-medium"
                                    >Vendor *</Label
                                >
                                <Select v-model="selectedVendor">
                                    <SelectTrigger class="mt-1 w-full">
                                        <span
                                            v-if="selectedVendor"
                                            class="w-full truncate text-left"
                                        >
                                            {{
                                                selectedVendor.code
                                                    ? selectedVendor.code +
                                                      ' - '
                                                    : ''
                                            }}{{ selectedVendor.name }}
                                        </span>
                                        <SelectValue
                                            v-else
                                            placeholder="Pilih Vendor"
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div class="p-2">
                                            <Input
                                                v-model="searchVendorKeyword"
                                                placeholder="Cari nama, kode vendor..."
                                                class="mb-2"
                                            />
                                        </div>
                                        <SelectGroup>
                                            <SelectItem
                                                v-for="vendor in filteredVendors"
                                                :key="vendor.id"
                                                :value="vendor"
                                            >
                                                <div class="flex flex-col">
                                                    <span class="font-medium">{{
                                                        vendor.name
                                                    }}</span>
                                                    <span
                                                        v-if="vendor.code"
                                                        class="text-xs text-gray-500"
                                                        >{{ vendor.code }}</span
                                                    >
                                                </div>
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <!-- Jumlah Pembayaran -->
                            <div>
                                <Label class="text-sm font-medium"
                                    >Jumlah Pembayaran *</Label
                                >
                                <div class="relative mt-1">
                                    <span
                                        class="absolute top-2 left-3 text-gray-500"
                                        >Rp</span
                                    >
                                    <Input
                                        v-model="vendorAmount"
                                        type="text"
                                        placeholder="0"
                                        @input="
                                            vendorAmount =
                                                $event.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                )
                                        "
                                        class="pl-10"
                                    />
                                </div>
                                <div class="mt-1 text-xs text-gray-500">
                                    Maksimal: Rp
                                    {{ formatCurrency(remainingVendorFunds) }}
                                </div>
                            </div>

                            <div class="md:col-span-2">
                                <Label class="text-sm font-medium"
                                    >Catatan (Opsional)</Label
                                >
                                <Input
                                    v-model="vendorNotes"
                                    type="text"
                                    placeholder="Catatan untuk pembayaran ini..."
                                    class="mt-1"
                                />
                            </div>
                        </div>

                        <div class="mt-4 flex justify-end">
                            <Button
                                type="button"
                                @click="addVendorToModal"
                                class="bg-blue-600 text-white hover:bg-blue-700"
                                :disabled="
                                    !selectedVendor ||
                                    vendorAmount <= 0 ||
                                    vendorAmount > remainingVendorFunds
                                "
                            >
                                <Building2 class="mr-2 h-4 w-4" /> Tambah ke
                                Daftar
                            </Button>
                        </div>
                    </div>

                    <div>
                        <div class="mb-3 flex items-center justify-between">
                            <h4 class="font-medium text-gray-700">
                                Daftar Vendor
                                <span class="text-sm text-gray-500"
                                    >({{
                                        vendorRecipients.length || 0
                                    }}
                                    vendor)</span
                                >
                            </h4>
                            <Button
                                v-if="vendorRecipients.length > 0"
                                type="button"
                                variant="ghost"
                                size="sm"
                                @click="clearAllVendors"
                                class="text-red-600 hover:bg-red-50"
                            >
                                <Trash2 class="mr-1 h-3 w-3" /> Hapus Semua
                            </Button>
                        </div>
                        <div
                            class="max-h-[300px] overflow-x-auto overflow-y-auto rounded-md border"
                        >
                            <Table>
                                <TableHeader class="sticky top-0 bg-white">
                                    <TableRow>
                                        <TableHead class="w-12">No</TableHead>
                                        <TableHead>Nama Vendor</TableHead>
                                        <TableHead>Kode Vendor</TableHead>
                                        <TableHead class="text-right"
                                            >Jumlah</TableHead
                                        >
                                        <TableHead>Bank</TableHead>
                                        <TableHead>No. Rekening</TableHead>
                                        <TableHead>Catatan</TableHead>
                                        <TableHead class="w-28">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <template v-if="vendorRecipients.length">
                                        <TableRow
                                            v-for="(
                                                vendor, sIdx
                                            ) in vendorRecipients"
                                            :key="sIdx"
                                        >
                                            <TableCell class="text-center">{{
                                                sIdx + 1
                                            }}</TableCell>
                                            <TableCell class="font-medium">{{
                                                vendor.recipient_name
                                            }}</TableCell>
                                            <TableCell>{{
                                                vendor.identity_no || '-'
                                            }}</TableCell>
                                            <TableCell class="text-right"
                                                >Rp
                                                {{
                                                    formatCurrency(
                                                        vendor.amount,
                                                    )
                                                }}</TableCell
                                            >
                                            <TableCell>{{
                                                vendor.bank_name || '-'
                                            }}</TableCell>
                                            <TableCell>{{
                                                vendor.bank_account_number ||
                                                '-'
                                            }}</TableCell>
                                            <TableCell class="text-gray-500">{{
                                                vendor.notes || '-'
                                            }}</TableCell>
                                            <TableCell>
                                                <div class="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        @click="
                                                            editVendorFromModal(
                                                                sIdx,
                                                            )
                                                        "
                                                        class="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Edit2
                                                            class="h-4 w-4"
                                                        />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        @click="
                                                            removeVendorFromModal(
                                                                sIdx,
                                                            )
                                                        "
                                                        class="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                                    >
                                                        <X class="h-4 w-4" />
                                                    </Button>
                                                </div>
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
                                                <Building2
                                                    class="h-8 w-8 text-gray-300"
                                                />
                                                <p>
                                                    Belum ada vendor yang
                                                    ditambahkan
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <div class="mt-4 rounded-lg bg-blue-50 p-3">
                            <div class="flex justify-between text-sm">
                                <span class="font-medium text-gray-700"
                                    >Sudah Dialokasikan:</span
                                >
                                <span class="font-bold text-blue-700"
                                    >Rp
                                    {{
                                        formatCurrency(totalVendorAmount)
                                    }}</span
                                >
                            </div>
                            <div class="mt-1 flex justify-between text-sm">
                                <span class="font-medium text-gray-700"
                                    >Nilai Dicairkan:</span
                                >
                                <span class="font-medium text-gray-900"
                                    >Rp
                                    {{
                                        formatCurrency(
                                            currentVendorItem?.disbursed_amount ||
                                                0,
                                        )
                                    }}</span
                                >
                            </div>
                            <div
                                v-if="
                                    Math.abs(
                                        totalVendorAmount -
                                            (currentVendorItem?.disbursed_amount ||
                                                0),
                                    ) > 1
                                "
                                class="mt-2 text-xs"
                                :class="{
                                    'text-red-600':
                                        totalVendorAmount >
                                        (currentVendorItem?.disbursed_amount ||
                                            0),
                                    'text-orange-600':
                                        totalVendorAmount <
                                        (currentVendorItem?.disbursed_amount ||
                                            0),
                                }"
                            >
                                <span
                                    v-if="
                                        totalVendorAmount >
                                        (currentVendorItem?.disbursed_amount ||
                                            0)
                                    "
                                    >⚠️ Kelebihan: Rp
                                    {{
                                        formatCurrency(
                                            totalVendorAmount -
                                                (currentVendorItem?.disbursed_amount ||
                                                    0),
                                        )
                                    }}</span
                                >
                                <span v-else
                                    >💰 Kekurangan: Rp
                                    {{
                                        formatCurrency(
                                            (currentVendorItem?.disbursed_amount ||
                                                0) - totalVendorAmount,
                                        )
                                    }}</span
                                >
                            </div>
                            <div v-else class="mt-2 text-xs text-green-600">
                                ✅ Total pembayaran sudah sesuai dengan nilai
                                dicairkan
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="sticky bottom-0 mt-6 flex justify-end space-x-2 border-t bg-white pt-4"
                >
                    <Button
                        type="button"
                        variant="outline"
                        @click="closeVendorModal"
                        >Batal</Button
                    >
                    <Button
                        type="button"
                        @click="saveVendors"
                        class="bg-green-600 text-white hover:bg-green-700"
                        :disabled="!isTotalVendorAmountEqual"
                    >
                        <CheckSquare class="mr-2 h-4 w-4" /> Simpan Semua Vendor
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
</style>
