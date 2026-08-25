<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { computed, ref } from 'vue';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// =============================================================================
// TYPES
// =============================================================================

interface Bank {
    id: number;
    bank_code: string;
    bank_name: string;
    bank_short_name?: string;
}

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(
    defineProps<{
        modelValue: string | null;
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
        id?: string;
        searchable?: boolean;
    }>(),
    {
        placeholder: 'Pilih Bank',
        disabled: false,
        error: false,
        searchable: false,
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | null): void;
}>();

// =============================================================================
// DEFAULT DATA - Daftar Bank Indonesia
// =============================================================================

const defaultBanks: Bank[] = [
    { id: 1, bank_code: '002', bank_name: 'PT Bank Rakyat Indonesia (Persero) Tbk', bank_short_name: 'BRI' },
    { id: 2, bank_code: '008', bank_name: 'PT Bank Mandiri (Persero) Tbk', bank_short_name: 'Mandiri' },
    { id: 3, bank_code: '009', bank_name: 'PT Bank Negara Indonesia (Persero) Tbk', bank_short_name: 'BNI' },
    { id: 4, bank_code: '011', bank_name: 'PT Bank Danamon Indonesia Tbk', bank_short_name: 'Danamon' },
    { id: 5, bank_code: '013', bank_name: 'PT Bank Permata Tbk', bank_short_name: 'Permata' },
    { id: 6, bank_code: '014', bank_name: 'PT Bank Central Asia Tbk', bank_short_name: 'BCA' },
    { id: 7, bank_code: '016', bank_name: 'PT Bank Maybank Indonesia Tbk', bank_short_name: 'Maybank' },
    { id: 8, bank_code: '019', bank_name: 'PT Bank Panin Tbk', bank_short_name: 'Panin' },
    { id: 9, bank_code: '020', bank_name: 'PT Bank Arta Graha Internasional Tbk', bank_short_name: 'Arta Graha' },
    { id: 10, bank_code: '022', bank_name: 'PT Bank CIMB Niaga Tbk', bank_short_name: 'CIMB Niaga' },
    { id: 11, bank_code: '023', bank_name: 'PT Bank UOB Indonesia', bank_short_name: 'UOB' },
    { id: 12, bank_code: '026', bank_name: 'PT Bank Lippo Tbk', bank_short_name: 'Lippo' },
    { id: 13, bank_code: '028', bank_name: 'PT Bank OCBC NISP Tbk', bank_short_name: 'OCBC NISP' },
    { id: 14, bank_code: '029', bank_name: 'PT Bank BTPN Tbk', bank_short_name: 'BTPN' },
    { id: 15, bank_code: '031', bank_name: 'PT Bank Syariah Indonesia Tbk', bank_short_name: 'BSI' },
    { id: 16, bank_code: '032', bank_name: 'PT Bank Mega Tbk', bank_short_name: 'Mega' },
    { id: 17, bank_code: '033', bank_name: 'PT Bank Sinarmas Tbk', bank_short_name: 'Sinarmas' },
    { id: 18, bank_code: '036', bank_name: 'PT Bank BTPN Syariah Tbk', bank_short_name: 'BTPN Syariah' },
    { id: 19, bank_code: '037', bank_name: 'PT Bank Tabungan Negara (Persero) Tbk', bank_short_name: 'BTN' },
    { id: 20, bank_code: '041', bank_name: 'PT Bank HSBC Indonesia', bank_short_name: 'HSBC' },
    { id: 21, bank_code: '042', bank_name: 'PT Bank Bukopin Tbk', bank_short_name: 'Bukopin' },
    { id: 22, bank_code: '045', bank_name: 'PT Bank Sumitomo Mitsui Indonesia', bank_short_name: 'SMBC' },
    { id: 23, bank_code: '046', bank_name: 'PT Bank DBS Indonesia', bank_short_name: 'DBS' },
    { id: 24, bank_code: '047', bank_name: 'PT Bank Standard Chartered Indonesia', bank_short_name: 'Standard Chartered' },
    { id: 25, bank_code: '048', bank_name: 'PT Bank ANZ Indonesia', bank_short_name: 'ANZ' },
    { id: 26, bank_code: '050', bank_name: 'PT Bank Commonwealth', bank_short_name: 'Commonwealth' },
    { id: 27, bank_code: '052', bank_name: 'PT Bank BJB Tbk', bank_short_name: 'BJB' },
    { id: 28, bank_code: '053', bank_name: 'PT Bank DKI', bank_short_name: 'Bank DKI' },
    { id: 29, bank_code: '054', bank_name: 'PT Bank Jateng', bank_short_name: 'Bank Jateng' },
    { id: 30, bank_code: '055', bank_name: 'PT Bank Jatim Tbk', bank_short_name: 'Bank Jatim' },
    { id: 31, bank_code: '056', bank_name: 'PT Bank Sumut', bank_short_name: 'Bank Sumut' },
    { id: 32, bank_code: '057', bank_name: 'PT Bank Nagari', bank_short_name: 'Bank Nagari' },
    { id: 33, bank_code: '058', bank_name: 'PT Bank Sulselbar', bank_short_name: 'Bank Sulselbar' },
    { id: 34, bank_code: '061', bank_name: 'PT Bank Kalbar', bank_short_name: 'Bank Kalbar' },
    { id: 35, bank_code: '062', bank_name: 'PT Bank Kalsel', bank_short_name: 'Bank Kalsel' },
    { id: 36, bank_code: '063', bank_name: 'PT Bank Kalteng', bank_short_name: 'Bank Kalteng' },
    { id: 37, bank_code: '064', bank_name: 'PT Bank Kaltimtara', bank_short_name: 'Bank Kaltimtara' },
    { id: 38, bank_code: '065', bank_name: 'PT Bank NTB Syariah', bank_short_name: 'Bank NTB Syariah' },
    { id: 39, bank_code: '066', bank_name: 'PT Bank NTT', bank_short_name: 'Bank NTT' },
    { id: 40, bank_code: '067', bank_name: 'PT Bank Maluku Malut', bank_short_name: 'Bank Maluku Malut' },
    { id: 41, bank_code: '068', bank_name: 'PT Bank Papua', bank_short_name: 'Bank Papua' },
    { id: 42, bank_code: '069', bank_name: 'PT Bank Bengkulu', bank_short_name: 'Bank Bengkulu' },
    { id: 43, bank_code: '071', bank_name: 'PT Bank Riau Kepri', bank_short_name: 'Bank Riau Kepri' },
    { id: 44, bank_code: '072', bank_name: 'PT Bank Sulteng', bank_short_name: 'Bank Sulteng' },
    { id: 45, bank_code: '073', bank_name: 'PT Bank Sultra', bank_short_name: 'Bank Sultra' },
    { id: 46, bank_code: '076', bank_name: 'PT Bank BNI Syariah', bank_short_name: 'BNI Syariah' },
    { id: 47, bank_code: '087', bank_name: 'PT Bank J Trust Indonesia Tbk', bank_short_name: 'J Trust' },
    { id: 48, bank_code: '088', bank_name: 'PT Bank Capital Indonesia Tbk', bank_short_name: 'Bank Capital' },
    { id: 49, bank_code: '089', bank_name: 'PT Bank Mestika Dharma Tbk', bank_short_name: 'Bank Mestika' },
    { id: 50, bank_code: '110', bank_name: 'PT Bank BJB Syariah', bank_short_name: 'BJB Syariah' },
    { id: 51, bank_code: '147', bank_name: 'PT Bank Muamalat Indonesia Tbk', bank_short_name: 'Muamalat' },
    { id: 52, bank_code: '152', bank_name: 'PT Bank Jasa Jakarta', bank_short_name: 'Bank Jasa Jakarta' },
    { id: 53, bank_code: '157', bank_name: 'PT Bank Maspion Indonesia Tbk', bank_short_name: 'Bank Maspion' },
    { id: 54, bank_code: '161', bank_name: 'PT Bank Nationalnobu Tbk', bank_short_name: 'Nobu Bank' },
    { id: 55, bank_code: '164', bank_name: 'PT Bank Ina Perdana Tbk', bank_short_name: 'Bank Ina' },
    { id: 56, bank_code: '167', bank_name: 'PT Bank QNB Indonesia Tbk', bank_short_name: 'QNB Indonesia' },
    { id: 57, bank_code: '200', bank_name: 'PT Bank Antardaerah', bank_short_name: 'Bank Antardaerah' },
    { id: 58, bank_code: '212', bank_name: 'PT Bank Woori Saudara Indonesia 1906 Tbk', bank_short_name: 'Bank Woori Saudara' },
    { id: 59, bank_code: '422', bank_name: 'PT Bank Syariah Bukopin', bank_short_name: 'Bank Syariah Bukopin' },
    { id: 60, bank_code: '426', bank_name: 'PT Bank Mega Syariah', bank_short_name: 'Mega Syariah' },
    { id: 61, bank_code: '427', bank_name: 'PT Bank Panin Dubai Syariah Tbk', bank_short_name: 'Panin Dubai Syariah' },
    { id: 62, bank_code: '490', bank_name: 'PT Bank Victoria International Tbk', bank_short_name: 'Bank Victoria' },
    { id: 63, bank_code: '491', bank_name: 'PT Bank Victoria Syariah', bank_short_name: 'Victoria Syariah' },
    { id: 64, bank_code: '494', bank_name: 'PT Bank Raya Indonesia Tbk', bank_short_name: 'Bank Raya' },
    { id: 65, bank_code: '498', bank_name: 'PT Bank KB Bukopin Tbk', bank_short_name: 'KB Bukopin' },
    { id: 66, bank_code: '501', bank_name: 'PT Bank Aladin Syariah Tbk', bank_short_name: 'Aladin Syariah' },
    { id: 67, bank_code: '503', bank_name: 'PT Bank Ganesha Tbk', bank_short_name: 'Bank Ganesha' },
    { id: 68, bank_code: '506', bank_name: 'PT Bank Amar Indonesia Tbk', bank_short_name: 'Bank Amar' },
    { id: 69, bank_code: '513', bank_name: 'PT Bank BCA Syariah', bank_short_name: 'BCA Syariah' },
    { id: 70, bank_code: '517', bank_name: 'PT Bank Jago Tbk', bank_short_name: 'Bank Jago' },
    { id: 71, bank_code: '520', bank_name: 'PT Bank Neo Commerce Tbk', bank_short_name: 'Neo Commerce' },
    { id: 72, bank_code: '521', bank_name: 'PT Bank Seabank Indonesia', bank_short_name: 'SeaBank' },
    { id: 73, bank_code: '522', bank_name: 'PT Bank Allo Bank Indonesia Tbk', bank_short_name: 'Allo Bank' },
    { id: 74, bank_code: '535', bank_name: 'PT Bank IBK Indonesia Tbk', bank_short_name: 'IBK Indonesia' },
    { id: 75, bank_code: '536', bank_name: 'PT Bank Oke Indonesia Tbk', bank_short_name: 'Bank Oke' },
    { id: 76, bank_code: '542', bank_name: 'PT Bank Shinhan Indonesia', bank_short_name: 'Shinhan' },
    { id: 77, bank_code: '547', bank_name: 'PT Bank Bumi Arta Tbk', bank_short_name: 'Bank Bumi Arta' },
    { id: 78, bank_code: '548', bank_name: 'PT Bank Multiarta Sentosa Tbk', bank_short_name: 'Bank MAS' },
    { id: 79, bank_code: '553', bank_name: 'PT Bank Index Selindo', bank_short_name: 'Bank Index' },
    { id: 80, bank_code: '555', bank_name: 'PT Bank Mayora', bank_short_name: 'Bank Mayora' },
    { id: 81, bank_code: '558', bank_name: 'PT Bank Sahabat Sampoerna', bank_short_name: 'Bank Sampoerna' },
    { id: 82, bank_code: '562', bank_name: 'PT Bank SBI Indonesia', bank_short_name: 'SBI Indonesia' },
    { id: 83, bank_code: '566', bank_name: 'PT Bank CTBC Indonesia', bank_short_name: 'CTBC' },
    { id: 84, bank_code: '567', bank_name: 'PT Bank KEB Hana Indonesia', bank_short_name: 'KEB Hana' },
    { id: 85, bank_code: '688', bank_name: 'PT Bank Danamon Indonesia Tbk (Unit Usaha Syariah)', bank_short_name: 'Danamon Syariah' },
    { id: 86, bank_code: '730', bank_name: 'PT Bank Maybank Indonesia Tbk (Unit Usaha Syariah)', bank_short_name: 'Maybank Syariah' },
    { id: 87, bank_code: '002', bank_name: 'PT Bank Rakyat Indonesia Agroniaga Tbk', bank_short_name: 'BRI Agroniaga' },
    { id: 88, bank_code: '405', bank_name: 'PT Bank Jabar Banten Syariah', bank_short_name: 'BJB Syariah' },
    { id: 89, bank_code: '451', bank_name: 'PT Bank Tabungan Pensiunan Nasional Syariah Tbk', bank_short_name: 'BTPN Syariah' },
    { id: 90, bank_code: '950', bank_name: 'PT Bank China Construction Bank Indonesia Tbk', bank_short_name: 'CCB Indonesia' },
];

// =============================================================================
// STATE
// =============================================================================

const banks = ref<Bank[]>(defaultBanks);
const isLoading = ref(false);
const searchQuery = ref('');

// =============================================================================
// COMPUTED
// =============================================================================

const selectedBank = computed<Bank | undefined>(() =>
    banks.value.find((bank) => bank.bank_short_name === props.modelValue),
);

const filteredBanks = computed<Bank[]>(() => {
    if (!searchQuery.value) return banks.value;

    const query = searchQuery.value.toLowerCase();
    return banks.value.filter(
        (bank) =>
            bank.bank_code?.toLowerCase().includes(query) ||
            bank.bank_name?.toLowerCase().includes(query) ||
            bank.bank_short_name?.toLowerCase().includes(query),
    );
});

const placeholderText = computed<string>(() => {
    if (isLoading.value) return 'Memuat...';
    if (!banks.value.length) return 'Tidak ada bank tersedia';
    if (!filteredBanks.value.length && searchQuery.value) return 'Bank tidak ditemukan';
    if (!filteredBanks.value.length) return 'Tidak ada bank tersedia';
    return props.placeholder;
});

const isDisabled = computed<boolean>(
    () => props.disabled || isLoading.value,
);

// =============================================================================
// METHODS
// =============================================================================

const handleValueChange = (value: string): void => {
    emit('update:modelValue', value || null);
};

const debouncedSearch = useDebounceFn((value: string) => {
    searchQuery.value = value;
}, 300);

const handleSearchInput = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    debouncedSearch(target.value);
};

const reset = () => {
    searchQuery.value = '';
    emit('update:modelValue', null);
};

// =============================================================================
// EXPOSE
// =============================================================================

defineExpose({
    reset,
});
</script>

<template>
    <Select
        :model-value="modelValue ?? ''"
        :disabled="isDisabled"
        @update:model-value="handleValueChange"
    >
        <SelectTrigger
            :id="id"
            :class="{ 'border-red-500': error }"
            class="w-full"
        >
            <SelectValue :placeholder="placeholderText">
                <template v-if="selectedBank">
                    <div class="flex items-center gap-2 truncate">
                        <span class="text-sm font-medium truncate">
                            {{ selectedBank.bank_short_name || selectedBank.bank_name }}
                        </span>
                        <span class="text-xs text-muted-foreground flex-shrink-0">
                            ({{ selectedBank.bank_code }})
                        </span>
                    </div>
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <!-- Search input -->
            <div
                v-if="searchable"
                class="px-2 py-2 border-b"
                @keydown.stop
                @keyup.stop
                @keypress.stop
                @input.stop
                @change.stop
                @focus.stop
                @blur.stop
                @click.stop
            >
                <input
                    type="text"
                    placeholder="Cari bank..."
                    class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @input="handleSearchInput"
                    @keydown.stop
                    @keyup.stop
                    @keypress.stop
                    @click.stop
                />
            </div>

            <!-- Bank list dengan scroll -->
            <div class="max-h-[200px] overflow-y-auto">
                <SelectItem
                    v-for="bank in filteredBanks"
                    :key="bank.id"
                    :value="bank.bank_short_name || bank.bank_name"
                >
                    <div class="flex items-center justify-between w-full py-1">
                        <div class="flex flex-col min-w-0 flex-1">
                            <span class="text-sm truncate">
                                {{ bank.bank_short_name || bank.bank_name }}
                            </span>
                            <span class="text-xs text-muted-foreground truncate">
                                {{ bank.bank_name }}
                            </span>
                        </div>
                    </div>
                </SelectItem>
            </div>

            <!-- Empty state -->
            <div
                v-if="!filteredBanks.length && !isLoading"
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div v-if="searchQuery">
                    Tidak ada bank "{{ searchQuery }}"
                </div>
                <div v-else-if="banks.length">
                    Tidak ada bank yang sesuai
                </div>
                <div v-else>
                    Tidak ada data bank
                </div>
            </div>

            <!-- Loading state -->
            <div
                v-if="isLoading"
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div class="flex items-center justify-center gap-2">
                    <svg
                        class="animate-spin h-4 w-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Memuat data...</span>
                </div>
            </div>
        </SelectContent>
    </Select>
</template>

<style scoped>
/* Styling untuk scroll area */
.max-h-\[200px\] {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.max-h-\[200px\]::-webkit-scrollbar {
    width: 6px;
}

.max-h-\[200px\]::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.max-h-\[200px\]::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 3px;
}

.max-h-\[200px\]::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}

/* Animasi loading */
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
    display: inline-block;
}
</style>