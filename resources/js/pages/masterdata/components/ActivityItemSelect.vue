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
    }>(),
    {
        placeholder: 'Pilih Activity Item',
        disabled: false,
        error: false,
        searchable: false,
        apiUrl: '/api/v1/select/activity-items',
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
    (e: 'select', value: ActivityItemData | null): void;
}>();

// =============================================================================
// TYPES
// =============================================================================

interface ActivityItemData {
    id: number;
    item_code: string;
    item_name: string;
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
                (item.item_code?.toLowerCase().includes(query) ||
                item.item_name?.toLowerCase().includes(query)),
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

// =============================================================================
// METHODS
// =============================================================================

const fetchActivityItems = async (): Promise<void> => {
    if (isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;

    try {
        const response = await axios.get(props.apiUrl);
        
        let data = response.data;
        
        if (data.data && Array.isArray(data.data)) {
            activityItems.value = data.data;
        } 
        else if (Array.isArray(data)) {
            activityItems.value = data;
        }
        else {
            activityItems.value = [];
            console.warn('Unexpected API response structure:', data);
        }

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
    
    // Emit selected activity item data
    if (newValue) {
        const selected = activityItems.value.find(item => item.id === newValue);
        if (selected) {
            emit('select', selected);
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
// LIFECYCLE
// =============================================================================

onMounted(() => fetchActivityItems());

// Refresh when API URL changes
watch(() => props.apiUrl, () => {
    fetchActivityItems();
});

defineExpose({
    refresh: fetchActivityItems,
    reset: () => emit('update:modelValue', null),
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
                    <div class="flex items-center justify-between gap-2 py-1 w-full">
                        <div class="flex items-center gap-2 flex-1 min-w-0">
                            <span class="text-sm font-medium truncate">
                                {{ item.item_name }}
                            </span>
                            <span class="text-xs text-muted-foreground flex-shrink-0">
                                {{ item.item_code }}
                            </span>
                        </div>
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