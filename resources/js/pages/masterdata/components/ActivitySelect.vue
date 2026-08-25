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
import { Activity } from '@/types/datamaster';

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
        placeholder: 'Pilih Activity',
        disabled: false,
        error: false,
        searchable: false,
        apiUrl: '/api/v1/select/activities',
        unitId: null,
        additionalParams: () => ({}),
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
    (e: 'select', value: { id: number; name: string; code: string } | null): void;
}>();

// =============================================================================
// STATE
// =============================================================================

const activities = ref<Activity[]>([]);
const isLoading = ref(false);
const hasError = ref(false);
const searchQuery = ref('');
const open = ref(false);

// =============================================================================
// COMPUTED
// =============================================================================

const selectedActivity = computed<Activity | undefined>(() =>
    activities.value.find((activity) => activity.id === props.modelValue),
);

const filteredActivities = computed<Activity[]>(() => {
    let filtered = activities.value;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
            (activity) =>
                activity.activity_code?.toLowerCase().includes(query) ||
                activity.activity_name?.toLowerCase().includes(query),
        );
    }

    return filtered;
});

const placeholderText = computed<string>(() => {
    if (isLoading.value) return 'Memuat...';
    if (hasError.value) return 'Gagal memuat data';
    if (!activities.value.length) return 'Tidak ada activity tersedia';
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

const fetchActivities = async (): Promise<void> => {
    if (isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;

    try {
        const params = { ...apiParams.value };
        
        const response = await axios.get(props.apiUrl, {
            params: Object.keys(params).length > 0 ? params : undefined,
        });
        
        let data = response.data;
        
        if (data.data && Array.isArray(data.data)) {
            activities.value = data.data;
        } 
        else if (Array.isArray(data)) {
            activities.value = data;
        }
        else {
            activities.value = [];
            console.warn('Unexpected API response structure:', data);
        }

        console.log('Activities loaded:', activities.value.length);
        
    } catch (error) {
        console.error('Failed to load activities:', error);
        activities.value = [];
        hasError.value = true;
    } finally {
        isLoading.value = false;
    }
};

const handleValueChange = (value: string): void => {
    const newValue = value ? Number(value) : null;
    emit('update:modelValue', newValue);
    
    // Emit selected activity data
    if (newValue) {
        const selected = activities.value.find(activity => activity.id === newValue);
        if (selected) {
            emit('select', {
                id: selected.id,
                name: selected.activity_name,
                code: selected.activity_code
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

// Watch for unitId changes to reload activities
watch(
    () => props.unitId,
    (newUnitId, oldUnitId) => {
        if (newUnitId !== oldUnitId) {
            // Reset selected value when unit changes
            emit('update:modelValue', null);
            emit('select', null);
            fetchActivities();
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
            fetchActivities();
        }
    },
    { deep: true }
);

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => fetchActivities());

defineExpose({
    refresh: fetchActivities,
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
                <template v-if="selectedActivity">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">
                            {{ selectedActivity.activity_name }}
                        </span>
                        <span class="text-xs text-muted-foreground">
                            ({{ selectedActivity.activity_code }})
                        </span>
                    </div>
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <!-- Unit Indicator -->
            <!-- <div
                v-if="unitId"
                class="border-b px-3 py-2 bg-muted/30"
            >
                <span class="text-xs text-muted-foreground">
                    Menampilkan activity untuk unit yang dipilih
                </span>
            </div> -->

            <div
                v-if="searchable"
                class="border-b px-2 py-2 sticky top-0 bg-white dark:bg-gray-800 z-10"
                @click.stop
            >
                <input
                    ref="searchInput"
                    type="text"
                    placeholder="Cari kegiatan..."
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
                v-else-if="!filteredActivities.length && !isLoading"
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div>
                    {{
                        searchQuery
                            ? `Tidak ada activity "${searchQuery}"`
                            : activities.length
                              ? 'Tidak ada activity yang sesuai'
                              : unitId
                                ? 'Tidak ada activity untuk unit ini'
                                : 'Tidak ada data activity'
                    }}
                </div>
            </div>

            <div v-else class="max-h-[200px] overflow-y-auto">
                <SelectItem
                    v-for="activity in filteredActivities"
                    :key="activity.id"
                    :value="activity.id.toString()"
                >
                    <div class="flex items-center justify-between w-full py-1">
                        <span class="text-sm truncate">{{ activity.activity_name }}</span>
                        <span 
                            v-if="activity.activity_code" 
                            class="text-xs text-muted-foreground ml-2 flex-shrink-0"
                        >
                            {{ activity.activity_code }}
                        </span>
                    </div>
                </SelectItem>
            </div>
        </SelectContent>
    </Select>
</template>

<style scoped>
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
</style>