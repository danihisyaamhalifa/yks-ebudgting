<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';

import { getCachedList } from '@/lib/selectCache';
import type { ActivityItem } from '@/types/datamaster';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
        apiUrl?: string;
        unitId?: number | null;
        additionalParams?: Record<string, any>;
    }>(),
    {
        placeholder: 'Pilih Activity Item',
        disabled: false,
        error: false,
        searchable: false,
        apiUrl: '/api/v1/select/activity-items',
        unitId: null,
        additionalParams: () => ({}),
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
    // Kirim objek master item lengkap (ActivityItem), bukan hanya {id, name, code},
    // supaya consumer bisa mengisi description/item_name/trans_type dll.
    (e: 'select', value: ActivityItem | null): void;
}>();

// =============================================================================
// TYPES
// =============================================================================

interface ActivityItemData {
    id: number;
    item_code: string;
    item_name: string;
    trans_type_id?: number | null;
    unit_measure_id?: number | null;
    estimation_price?: number;
    trans_type?: { id?: number; code?: string; name: string; group_code: string } | null;
    unit_measure?: { id?: number; code?: string; name: string } | null;
}

// =============================================================================
// STATE
// =============================================================================

const activityItems = ref<ActivityItemData[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const searchQuery = ref('');
const open = ref(false);

// =============================================================================
// COMPUTED
// =============================================================================

const selectedItem = computed<ActivityItemData | undefined>(() =>
    activityItems.value.find((item) => item.id === props.modelValue),
);

const filteredItems = computed<ActivityItemData[]>(() => {
    let filtered = activityItems.value;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
            (item) =>
                item.item_code?.toLowerCase().includes(query) ||
                item.item_name?.toLowerCase().includes(query),
        );
    }

    return filtered;
});

const placeholderText = computed<string>(() => {
    if (isLoading.value) return 'Memuat...';
    if (hasError.value) return 'Gagal memuat data';
    if (!activityItems.value.length) return 'Tidak ada activity item tersedia';
    return props.placeholder;
});

const isDisabled = computed<boolean>(
    () => props.disabled || isLoading.value || hasError.value,
);

const apiParams = computed(() => {
    const params: Record<string, any> = { ...props.additionalParams };
    
    if (props.unitId) {
        params.unit_id = props.unitId;
    }
    
    return params;
});

// =============================================================================
// METHODS
// =============================================================================

const fetchActivityItems = async (force = false): Promise<void> => {
    if (isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;

    try {
        // getCachedList: pakai cache in-memory per (apiUrl + params) selama TTL,
        // dan dedupe request yang sama sedang berjalan antar instance.
        // DB hanya di-hit saat cache kosong/kedaluwarsa (default TTL 5 menit).
        activityItems.value = await getCachedList<ActivityItemData>(
            props.apiUrl,
            apiParams.value,
            { force },
        );

        console.log('Activity items loaded:', activityItems.value.length);
    } catch (error) {
        console.error('Failed to load activity items:', error);
        activityItems.value = [];
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleValueChange = (value: string): void => {
    const newValue = value ? Number(value) : null;
    emit('update:modelValue', newValue);

    // Emit selected activity item data (objek master lengkap)
    if (newValue) {
        const selected = activityItems.value.find(item => item.id === newValue);
        if (selected) {
            emit('select', {
                id: selected.id,
                item_code: selected.item_code || '',
                item_name: selected.item_name || '',
                trans_type_id: selected.trans_type_id ?? null,
                unit_measure_id: selected.unit_measure_id ?? null,
                estimation_price: Number(selected.estimation_price) || 0,
                trans_type: selected.trans_type ?? undefined,
                unit_measure: selected.unit_measure ?? undefined,
            });
        }
    } else {
        emit('select', null);
    }
};

const debouncedSearch = useDebounceFn((value: string) => {
    searchQuery.value = value;
}, 300);

const handleSearchInput = (event: Event): void => {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    debouncedSearch(target.value);
};

const handleOpenChange = (isOpen: boolean) => {
    open.value = isOpen;
    if (!isOpen) {
        searchQuery.value = '';
    }
};

// =============================================================================
// WATCHERS
// =============================================================================

// Watch for unitId changes to reload activity items
watch(
    () => props.unitId,
    (newUnitId, oldUnitId) => {
        if (newUnitId !== oldUnitId) {
            // Reset selected value when unit changes
            emit('update:modelValue', null);
            emit('select', null);
            fetchActivityItems();
        }
    }
);

// Watch for additionalParams changes
watch(
    () => props.additionalParams,
    (newParams, oldParams) => {
        const newParamsStr = JSON.stringify(newParams);
        const oldParamsStr = JSON.stringify(oldParams);
        
        if (newParamsStr !== oldParamsStr) {
            fetchActivityItems();
        }
    },
    { deep: true }
);

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => fetchActivityItems());

defineExpose({
    // refresh() melewati cache (force) supaya data benar-benar baru dari server.
    refresh: () => fetchActivityItems(true),
    reset: () => {
        emit('update:modelValue', null);
        emit('select', null);
    },
});
</script>

<template>
    <Select
        :model-value="modelValue?.toString() ?? ''"
        :disabled="isDisabled"
        :open="open"
        @update:model-value="handleValueChange"
        @update:open="handleOpenChange"
    >
        <SelectTrigger
            :id="id"
            :class="{ 'border-red-500': error || hasError }"
            class="w-full"
        >
            <SelectValue :placeholder="placeholderText">
                <template v-if="selectedItem">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">
                            {{ selectedItem.item_name }}
                        </span>
                        <span class="text-xs text-muted-foreground">
                            ({{ selectedItem.item_code }})
                        </span>
                    </div>
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <div
                v-if="searchable"
                class="border-b px-2 py-2 sticky top-0 bg-white dark:bg-gray-800 z-10"
                @click.stop
            >
                <input
                    ref="searchInput"
                    type="text"
                    placeholder="Cari item anggaran..."
                    class="w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    :value="searchQuery"
                    @input="handleSearchInput"
                    @click.stop
                    @keydown.stop
                />
            </div>

            <div v-if="isLoading" class="px-2 py-8 text-center text-sm text-muted-foreground">
                <div>Memuat data...</div>
            </div>

            <div
                v-else-if="!filteredItems.length && !isLoading"
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div>
                    {{
                        searchQuery
                            ? `Tidak ada activity item "${searchQuery}"`
                            : activityItems.length
                              ? 'Tidak ada activity item yang sesuai'
                              : unitId
                                ? 'Tidak ada activity item untuk unit ini'
                                : 'Tidak ada data activity item'
                    }}
                </div>
            </div>

            <div v-else class="max-h-[280px] overflow-y-auto">
                <SelectItem
                    v-for="item in filteredItems"
                    :key="item.id"
                    :value="item.id.toString()"
                >
                    <div class="flex items-center justify-between w-full py-1">
                        <span class="text-sm truncate">{{ item.item_name }}</span>
                        <span 
                            v-if="item.item_code" 
                            class="text-xs text-muted-foreground ml-2 flex-shrink-0"
                        >
                            {{ item.item_code }}
                        </span>
                    </div>
                </SelectItem>
            </div>
        </SelectContent>
    </Select>
</template>

<style scoped>
.max-h-\[280px\] {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.max-h-\[280px\]::-webkit-scrollbar {
    width: 6px;
}

.max-h-\[280px\]::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.max-h-\[280px\]::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 3px;
}

.max-h-\[280px\]::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}
</style>