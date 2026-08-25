<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Unit } from '@/types/datamaster';

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(
    defineProps<{
        modelValue: number | null;
        placeholder?: string;
        disabled?: boolean;
        error?: boolean;
        id?: string;
        searchable?: boolean;
    }>(),
    {
        placeholder: 'Pilih Unit',
        disabled: false,
        error: false,
        searchable: false,
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
}>();

// =============================================================================
// STATE
// =============================================================================

const units = ref<Unit[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const searchQuery = ref('');

// =============================================================================
// COMPUTED
// =============================================================================

const selectedUnit = computed<Unit | undefined>(() =>
    units.value.find((unit) => unit.id === props.modelValue),
);

const filteredUnits = computed<Unit[]>(() => {
    if (!searchQuery.value) return units.value;

    const query = searchQuery.value.toLowerCase();
    return units.value.filter(
        (unit) =>
            unit.unit_code?.toLowerCase().includes(query) ||
            unit.unit_name?.toLowerCase().includes(query),
    );
});

const placeholderText = computed<string>(() => {
    if (isLoading.value) return 'Memuat...';
    if (hasError.value) return 'Gagal memuat data';
    if (!units.value.length) return 'Tidak ada unit tersedia';
    return props.placeholder;
});

const isDisabled = computed<boolean>(
    () => props.disabled || isLoading.value || hasError.value,
);

// =============================================================================
// METHODS
// =============================================================================

const fetchUnits = async (): Promise<void> => {
    if (isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;

    try {
        const { data } = await axios.get<{ data: Unit[] } | Unit[]>(
            '/api/v1/select/units',
        );
        units.value = Array.isArray(data) ? data : (data.data ?? []);
    } catch (error) {
        console.error('Failed to load units:', error);
        units.value = [];
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleValueChange = (value: string): void => {
    emit('update:modelValue', value ? Number(value) : null);
};

const debouncedSearch = useDebounceFn((value: string) => {
    searchQuery.value = value;
}, 300);

// Add this method to prevent event propagation
const handleSearchInput = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    debouncedSearch(target.value);
};

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => fetchUnits());

defineExpose({
    refresh: fetchUnits,
    reset: () => emit('update:modelValue', null),
});
</script>

<template>
    <Select
        :model-value="modelValue?.toString() ?? ''"
        :disabled="isDisabled"
        @update:model-value="handleValueChange"
    >
        <SelectTrigger
            :id="id"
            :class="{ 'border-red-500': error || hasError }"
            class="w-full"
        >
            <SelectValue :placeholder="placeholderText">
                <template v-if="selectedUnit">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">
                            {{ selectedUnit.unit_name }}
                        </span>
                        <span class="text-xs text-muted-foreground">
                            ({{ selectedUnit.unit_code }})
                        </span>
                    </div>
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <!-- Search input for searchable mode - FIXED -->
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
                    type="text"
                    placeholder="Cari unit..."
                    class="w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    @input="handleSearchInput"
                    @keydown.stop
                    @keyup.stop
                    @keypress.stop
                    @click.stop
                />
            </div>

            <!-- Empty state untuk Unit -->
            <div
                v-if="!filteredUnits.length && !isLoading"
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div>
                    {{
                        searchQuery
                            ? `Tidak ada unit "${searchQuery}"`
                            : units.length
                              ? 'Tidak ada unit yang sesuai'
                              : 'Tidak ada data unit'
                    }}
                </div>
            </div>

            <!-- Unit options -->
            <SelectItem
                v-for="unit in filteredUnits"
                :key="unit.id"
                :value="unit.id.toString()"
            >
                <div class="flex w-full items-center justify-between">
                    <span class="text-sm">
                        {{ unit.unit_name }}
                    </span>
                    <span class="ml-2 text-xs text-muted-foreground">
                        {{ unit.unit_code }}
                    </span>
                </div>
            </SelectItem>
        </SelectContent>
    </Select>
</template>
