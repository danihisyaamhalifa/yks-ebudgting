<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';

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

interface ParameterValue {
    id: number;
    code: string;
    name: string;
}

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(
    defineProps<{
        groupCode: string;
        modelValue: number | null;
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
        id?: string;
        searchable?: boolean;
    }>(),
    {
        placeholder: 'Pilih Parameter',
        disabled: false,
        error: false,
        searchable: true,
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
}>();

// =============================================================================
// STATE
// =============================================================================

const options = ref<ParameterValue[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const searchQuery = ref('');
const isOpen = ref(false);

// =============================================================================
// COMPUTED
// =============================================================================

const selectedOption = computed<ParameterValue | undefined>(() =>
    options.value.find((item) => item.id === props.modelValue),
);

const filteredOptions = computed<ParameterValue[]>(() => {
    if (!searchQuery.value) return options.value;

    const query = searchQuery.value.toLowerCase();
    return options.value.filter(
        (item) =>
            item.name?.toLowerCase().includes(query),
    );
});

const placeholderText = computed<string>(() => {
    if (isLoading.value) return 'Memuat...';
    if (hasError.value) return 'Gagal memuat data';
    if (!options.value.length) return 'Tidak ada parameter tersedia';
    return props.placeholder;
});

const isDisabled = computed<boolean>(
    () => props.disabled || isLoading.value || hasError.value,
);

// =============================================================================
// METHODS
// =============================================================================

const fetchParameters = async (): Promise<void> => {
    if (isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;

    try {
        const { data } = await axios.get<{ data: ParameterValue[] } | ParameterValue[]>(
            `/api/v1/parameters/${props.groupCode}`,
        );
        options.value = Array.isArray(data) ? data : (data.data ?? []);
    } catch (error) {
        console.error('Failed to load parameters:', error);
        options.value = [];
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleValueChange = (value: string): void => {
    emit('update:modelValue', value ? Number(value) : null);
    // Reset search query setelah memilih
    searchQuery.value = '';
};

const handleOpenChange = (open: boolean): void => {
    isOpen.value = open;
    // Reset search query setiap kali dropdown dibuka
    if (open) {
        searchQuery.value = '';
    }
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

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => fetchParameters());

watch(() => props.groupCode, () => {
    fetchParameters();
    searchQuery.value = '';
});

defineExpose({
    refresh: fetchParameters,
    reset: () => emit('update:modelValue', null),
});
</script>

<template>
    <Select
        :model-value="modelValue?.toString() ?? ''"
        :disabled="isDisabled"
        :open="isOpen"
        @update:model-value="handleValueChange"
        @update:open="handleOpenChange"
    >
        <SelectTrigger
            :id="id"
            :class="{ 'border-red-500': error || hasError }"
            class="w-full"
        >
            <SelectValue :placeholder="placeholderText">
                <template v-if="selectedOption">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">
                            {{ selectedOption.name }}
                        </span>
                    </div>
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <!-- Search input for searchable mode -->
            <div
                v-if="searchable"
                class="border-b px-2 py-2"
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
                    ref="searchInputRef"
                    type="text"
                    placeholder="Cari parameter..."
                    class="w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    @input="handleSearchInput"
                    @keydown.stop
                    @keyup.stop
                    @keypress.stop
                    @click.stop
                />
            </div>

            <!-- Empty state -->
            <div
                v-if="!filteredOptions.length && !isLoading"
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div>
                    {{
                        searchQuery
                            ? `Tidak ada parameter "${searchQuery}"`
                            : options.length
                              ? 'Tidak ada parameter yang sesuai'
                              : 'Tidak ada data parameter'
                    }}
                </div>
            </div>

            <!-- Parameter options -->
            <SelectItem
                v-for="item in filteredOptions"
                :key="item.id"
                :value="item.id.toString()"
            >
                <div class="flex w-full items-center justify-between">
                    <span class="text-sm">
                        {{ item.name }}
                    </span>
                </div>
            </SelectItem>
        </SelectContent>
    </Select>
</template>