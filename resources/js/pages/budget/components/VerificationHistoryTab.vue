<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CheckCircle, Clock, HelpCircle, Info, XCircle } from 'lucide-vue-next';
import { computed } from 'vue';

// Props
const props = defineProps<{
    submitter: {
        name: string;
    };
    submissionDate: string;
    submitterNotes?: string;
    verifiers: Array<{
        id: number;
        name: string;
        role: string;
        department: string;
        verificationStatus:
            | 'pending'
            | 'waiting'
            | 'completed'
            | 'rejected'
            | 'approved';
        verifiedAt?: string;
        notes?: string;
        decision?: string;
        step: number;
    }>;
    currentStep: number;
}>();

// Emits
const emit = defineEmits<{
    (e: 'refresh'): void;
}>();

// Computed properties
const sortedVerifiers = computed(() => {
    return [...props.verifiers].sort((a, b) => a.step - b.step);
});

const totalSteps = computed(() => {
    return props.verifiers.length;
});

const getCompletedStepsCount = computed(() => {
    return props.verifiers.filter(
        (v) =>
            v.verificationStatus === 'completed' ||
            v.verificationStatus === 'approved',
    ).length;
});

const isCurrentStep = (step: number) => {
    return step === props.currentStep;
};

// Helper functions
const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const getStepStatusVariant = (
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const statusMap: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline'
    > = {
        pending: 'outline',
        waiting: 'secondary',
        completed: 'default',
        approved: 'default',
        returned: 'destructive',
        rejected: 'destructive',
    };
    return statusMap[status] || 'secondary';
};

const getStepStatusIcon = (status: string) => {
    const iconMap: Record<string, any> = {
        pending: HelpCircle,
        waiting: Clock,
        completed: CheckCircle,
        approved: CheckCircle,
        rejected: XCircle,
    };
    return iconMap[status] || HelpCircle;
};

const getStepStatusText = (status: string): string => {
    const textMap: Record<string, string> = {
        pending: 'Menunggu',
        waiting: 'Menunggu',
        completed: 'Selesai',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        returned: 'Dikembalikan',
    };
    return textMap[status] || status;
};

const getDecisionClass = (decision: string): string => {
    const classMap: Record<string, string> = {
        approved: 'text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded',
        returned: 'text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded',
        rejected: 'text-sm font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded',
    };
    
    return classMap[decision] || 'text-sm font-medium text-gray-600';
};

</script>

<template>
    <div class="space-y-6">
        <!-- Header Tab -->
        <div class="flex items-center justify-between">
            <div>
                <h3 class="text-lg font-semibold text-gray-900">
                    Riwayat Alur Verifikasi
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                    Riwayat lengkap proses verifikasi multi-level
                </p>
            </div>
            <Badge variant="outline" class="px-3 py-1 text-sm">
                {{ getCompletedStepsCount }} dari {{ totalSteps }} Tahap Selesai
            </Badge>
        </div>

        <!-- Timeline dalam Bentuk Table -->
        <div class="overflow-hidden rounded-lg border">
            <div class="overflow-x-auto">
                <Table>
                    <TableHeader class="bg-gray-50">
                        <TableRow>
                            <TableHead class="w-16 text-center"
                                >Tahap</TableHead
                            >
                            <TableHead>Verifikator / Role</TableHead>
                            <TableHead class="w-32">Status</TableHead>
                            <TableHead class="w-48"
                                >Tanggal Verifikasi</TableHead
                            >
                            <TableHead>Catatan</TableHead>
                            <TableHead class="w-36">Keputusan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <!-- Baris Pengaju (Inisiator) -->
                        <TableRow class="hover:bg-gray-50">
                            <TableCell class="text-center font-medium"
                                >-</TableCell
                            >
                            <TableCell>
                                <div class="flex flex-col">
                                    <span class="font-medium">{{
                                        submitter.name
                                    }}</span>
                                    <span class="text-xs text-gray-500"
                                        >Pengaju / Unit</span
                                    >
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    class="border-green-200 bg-green-50 text-green-700"
                                >
                                    <CheckCircle class="mr-1 h-3 w-3" />
                                    Diajukan
                                </Badge>
                            </TableCell>
                            <TableCell>{{
                                formatDateTime(submissionDate)
                            }}</TableCell>
                            <TableCell>
                                <p
                                    class="max-w-xs truncate text-sm text-gray-600"
                                    :title="submitterNotes"
                                >
                                    {{ submitterNotes || '-' }}
                                </p>
                            </TableCell>
                            <TableCell>
                                <span class="text-sm font-medium text-green-600"
                                    >Mengajukan</span
                                >
                            </TableCell>
                        </TableRow>

                        <!-- Dynamic Verification Steps -->
                        <TableRow
                            v-for="(verifier, index) in sortedVerifiers"
                            :key="verifier.id"
                            :class="[
                                'transition-colors hover:bg-gray-50',
                                isCurrentStep(verifier.step)
                                    ? 'bg-blue-50/50'
                                    : '',
                            ]"
                        >
                            <TableCell class="text-center font-medium">{{
                                verifier.step
                            }}</TableCell>
                            <TableCell>
                                <div class="flex flex-col">
                                    <span class="font-medium">{{
                                        verifier.name
                                    }}</span>
                                    <span class="text-xs text-gray-500"
                                        >{{ verifier.role }} •
                                        {{ verifier.department }}</span
                                    >
                                </div>
                            </TableCell>
                            <TableCell>
                                <div class="flex items-center gap-2">
                                    <Badge
                                        :variant="
                                            getStepStatusVariant(
                                                verifier.verificationStatus,
                                            )
                                        "
                                    >
                                        <component
                                            :is="
                                                getStepStatusIcon(
                                                    verifier.verificationStatus,
                                                )
                                            "
                                            class="mr-1 h-3 w-3"
                                        />
                                        {{
                                            getStepStatusText(
                                                verifier.verificationStatus,
                                            )
                                        }}
                                    </Badge>
                                    <span
                                        v-if="isCurrentStep(verifier.step)"
                                        class="animate-pulse text-xs font-medium text-blue-600"
                                    >
                                        (Sedang Berlangsung)
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span
                                    v-if="verifier.verifiedAt"
                                    class="text-sm text-gray-600"
                                >
                                    {{ formatDateTime(verifier.verifiedAt) }}
                                </span>
                                <span v-else class="text-sm text-gray-400"
                                    >-</span
                                >
                            </TableCell>
                            <TableCell>
                                <div class="max-w-xs">
                                    <p
                                        v-if="verifier.notes"
                                        class="line-clamp-2 text-sm text-gray-600"
                                        :title="verifier.notes"
                                    >
                                        {{ verifier.notes }}
                                    </p>
                                    <span v-else class="text-sm text-gray-400"
                                        >-</span
                                    >
                                </div>
                            </TableCell>
                            <TableCell>
                                <span
                                    v-if="verifier.decision"
                                    :class="getDecisionClass(verifier.decision)"
                                >
                                    {{ verifier.decision }}
                                </span>
                                <span v-else class="text-sm text-gray-400"
                                    >Menunggu</span
                                >
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <!-- Summary Timeline -->
            <div
                class="flex flex-wrap items-center justify-between gap-4 border-t bg-gray-50 px-4 py-3 text-sm"
            >
                <div class="flex flex-wrap items-center gap-4">
                    <div class="flex items-center gap-1">
                        <div class="h-3 w-3 rounded-full bg-black"></div>
                        <span class="text-gray-600">Selesai</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <div
                            class="h-3 w-3 animate-pulse rounded-full bg-blue-500"
                        ></div>
                        <span class="text-gray-600">Sedang Berlangsung</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <div class="h-3 w-3 rounded-full bg-gray-300"></div>
                        <span class="text-gray-600">Menunggu</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <div class="h-3 w-3 rounded-full bg-red-500"></div>
                        <span class="text-gray-600">Ditolak/Dikembalikan</span>
                    </div>
                </div>
                <div class="text-gray-500">
                    <template v-if="getCompletedStepsCount === totalSteps">
                        Tahap Aktif:-
                    </template>
                    <template v-else>
                        Tahap Aktif:
                        <span class="font-medium text-blue-600"
                            >Verifikator Tahap {{ currentStep }}</span
                        >
                    </template>
                </div>
            </div>
        </div>

        <!-- Informasi Tambahan -->
        <div
            class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
        >
            <div class="flex items-start gap-3">
                <Info class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                    <p class="mb-1 font-medium">Informasi Verifikasi</p>
                    <p class="text-blue-700">
                        Proses verifikasi terdiri dari {{ totalSteps }} tahap.
                        <template v-if="getCompletedStepsCount === totalSteps">
                            Semua tahap telah selesai.
                        </template>
                        <template v-else>
                            <span v-if="getCompletedStepsCount === 0">
                                Belum ada tahap yang selesai, saat ini berada
                                pada tahap {{ currentStep }}.
                            </span>
                            <span v-else>
                                {{ getCompletedStepsCount }} tahap telah
                                selesai, dan saat ini berada pada tahap
                                {{ currentStep }}.
                            </span>
                        </template>

                        Silakan lihat detail setiap tahap pada tabel di atas.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 768px) {
    .overflow-x-auto {
        overflow-x: auto;
    }
}
</style>
