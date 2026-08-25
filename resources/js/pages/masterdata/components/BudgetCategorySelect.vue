<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useDebounceFn } from '@vueuse/core'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { BudgetCategory } from '@/types/datamaster'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type CategoryLevel = 'root' | 'child' | 'all'

// =============================================================================
// PROPS & EMITS
// =============================================================================

const props = withDefaults(defineProps<{
    modelValue: number | null
    id?: string
    placeholder?: string
    disabled?: boolean
    level?: CategoryLevel
    excludeId?: number | null
    required?: boolean
    error?: boolean
    parentId?: number | null
    budgetType?: string | null
    unitId?: number | null
    searchable?: boolean
    withParent?: boolean
    withBudgetType?: boolean
    ignoreBudgetType?: boolean
}>(), {
    placeholder: 'Pilih Kategori Anggaran',
    level: 'all',
    disabled: false,
    required: false,
    error: false,
    searchable: false,
    budgetType: null,
    unitId: null,
    withParent: false,
    withBudgetType: false,
    ignoreBudgetType: false,
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void
}>()

// =============================================================================
// STATE
// =============================================================================

const categories = ref<BudgetCategory[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

// =============================================================================
// COMPUTED
// =============================================================================

/**
 * Cek apakah parentId valid untuk fetch data
 */
const isParentValid = computed<boolean>(() => {
    // Jika withParent = false, parent selalu valid
    if (!props.withParent) return true
    
    // Jika withParent = true, hanya valid jika parentId tersedia
    return props.parentId !== null 
        && props.parentId !== undefined 
        && props.parentId !== 0 
        && props.parentId > 0
})

/**
 * Cek apakah budgetType valid untuk fetch data
 */
const isBudgetTypeValid = computed<boolean>(() => {
    // Jika withBudgetType = false, budgetType selalu valid
    if (!props.withBudgetType) return true
    
    // Jika withBudgetType = true, hanya valid jika budgetType tersedia
    return props.budgetType !== null 
        && props.budgetType !== undefined 
        && props.budgetType !== ''
})

/**
 * Cek apakah boleh fetch data (semua kondisi terpenuhi)
 */
const canFetchData = computed<boolean>(() => {
    return isParentValid.value && isBudgetTypeValid.value
})

/**
 * Tentukan apakah budget_type harus dikirim ke API
 */
const shouldSendBudgetType = computed<boolean>(() => {
    // Jika ignoreBudgetType = true, jangan kirim
    if (props.ignoreBudgetType) return false
    
    // Selain itu, kirim jika budgetType ada
    return !!props.budgetType
})

/**
 * Get selected category object
 */
const selectedCategory = computed<BudgetCategory | undefined>(() => 
    categories.value.find(cat => cat.id === props.modelValue)
)

/**
 * API endpoint URL based on component props
 */
const apiUrl = computed<string>(() => {
    const endpoints: Record<CategoryLevel, string> = {
        root: '/api/v1/budget-category-root',
        child: '/api/v1/budget-category-child',
        all: '/api/v1/budget-categories',
    }

    return endpoints[props.level]
})

/**
 * Filter categories based on search query and business rules
 */
const filteredCategories = computed<BudgetCategory[]>(() => {
    let filtered = categories.value.filter(cat => cat.is_active !== false)
    
    // Exclude specific ID if provided
    if (props.excludeId) {
        filtered = filtered.filter(cat => cat.id !== props.excludeId)
    }
    
    // Filter by unit_id - cek dalam array unit_ids
    if (props.unitId) {
        filtered = filtered.filter(cat => {
            // Jika unit_ids kosong/null, berarti untuk semua unit
            if (!cat.unit_ids || cat.unit_ids.length === 0) {
                return true
            }
            // Cek apakah unitId ada dalam array unit_ids
            return cat.unit_ids.includes(props.unitId)
        })
    }
    
    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(cat => 
            cat.name?.toLowerCase().includes(query) ||
            cat.code?.toLowerCase().includes(query)
        )
    }
    
    return filtered
})

/**
 * Placeholder text based on component state
 */
const placeholderText = computed<string>(() => {
    // Jika withParent = true dan parent belum dipilih
    if (props.withParent && !isParentValid.value) {
        return 'Pilih kategori induk terlebih dahulu'
    }
    
    // Jika withBudgetType = true dan budgetType belum dipilih
    if (props.withBudgetType && !isBudgetTypeValid.value) {
        return 'Pilih tipe anggaran terlebih dahulu'
    }

    if (isLoading.value) return 'Memuat...'
    if (!categories.value.length) return 'Tidak ada kategori tersedia'
    if (!filteredCategories.value.length && searchQuery.value) return 'Kategori tidak ditemukan'
    if (!filteredCategories.value.length) return 'Tidak ada kategori tersedia'
    return props.placeholder
})

/**
 * Determine if select should be disabled
 */
const isDisabled = computed<boolean>(() => {
    // Disable jika withParent = true dan parent belum dipilih
    if (props.withParent && !isParentValid.value) {
        return true
    }
    
    // Disable jika withBudgetType = true dan budgetType belum dipilih
    if (props.withBudgetType && !isBudgetTypeValid.value) {
        return true
    }
    
    return props.disabled || isLoading.value || (!filteredCategories.value.length && !searchQuery.value && !categories.value.length)
})

/**
 * Get message untuk kondisi tidak bisa fetch data
 */
const cannotFetchMessage = computed<string>(() => {
    if (!isParentValid.value && !isBudgetTypeValid.value) {
        return 'Pilih kategori induk dan tipe anggaran terlebih dahulu'
    }
    if (!isParentValid.value) {
        return 'Pilih kategori induk terlebih dahulu'
    }
    if (!isBudgetTypeValid.value) {
        return 'Pilih tipe anggaran terlebih dahulu'
    }
    return ''
})

// =============================================================================
// METHODS
// =============================================================================

/**
 * Fetch budget categories from API
 */
const fetchCategories = async (): Promise<void> => {
    // Jangan fetch jika kondisi tidak terpenuhi
    if (!canFetchData.value) {
        categories.value = []
        return
    }
    
    if (isLoading.value) return
    
    isLoading.value = true
    
    try {
        const params: Record<string, any> = {}
        
        // Tambahkan budget_type
        if (props.budgetType && shouldSendBudgetType.value) {
            params.budget_type = props.budgetType
        }
        
        // Tambahkan unit_id
        if (props.unitId) {
            params.unit_id = props.unitId
        }
        
        // Tambahkan parent_id (untuk root)
        if (props.parentId && props.parentId > 0) {
            params.parent_id = props.parentId
            
        }
        else {
            params.parent_id = null
        }
            
        const { data } = await axios.get(apiUrl.value, { 
            params: Object.keys(params).length ? params : undefined 
        })
        
        categories.value = Array.isArray(data) 
            ? data 
            : data.data || []
            
    } catch (error) {
        console.error('Failed to load budget categories:', error)
        categories.value = []
    } finally {
        isLoading.value = false
    }
}

/**
 * Handle value change from Select component
 */
const handleValueChange = (value: string): void => {
    const newValue = (value === 'null' || value === '') 
        ? null 
        : Number(value)
        
    emit('update:modelValue', newValue)
}

/**
 * Reset selection if current value no longer valid
 */
const resetSelection = (): void => {
    const selectedExists = selectedCategory.value 
        && filteredCategories.value.some(cat => cat.id === selectedCategory.value?.id)
    
    if (!selectedExists && props.modelValue !== null) {
        emit('update:modelValue', null)
    }
}

/**
 * Handle search input with event propagation prevention
 */
const handleSearchInput = (event: Event): void => {
    event.stopPropagation()
    event.preventDefault()
    const target = event.target as HTMLInputElement
    debouncedSearch(target.value)
}

/**
 * Debounced search function
 */
const debouncedSearch = useDebounceFn((value: string) => {
    searchQuery.value = value
}, 300)

// =============================================================================
// WATCHERS
// =============================================================================

// Refetch when dependencies change
watch(
    () => [props.level, props.parentId, props.budgetType, props.unitId],
    () => {
        searchQuery.value = '' // Reset search when refetching
        fetchCategories()
    },
    { immediate: false }
)

// Reset selection if current value no longer valid
watch(filteredCategories, () => resetSelection())

// Reset value when parentId changes (untuk child select)
watch(() => props.parentId, (newVal, oldVal) => {
    if (newVal !== oldVal && props.withParent) {
        emit('update:modelValue', null)
    }
})

// Reset value when budgetType changes
watch(() => props.budgetType, (newVal, oldVal) => {
    if (newVal !== oldVal && props.withBudgetType) {
        emit('update:modelValue', null)
    }
})

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => fetchCategories())

// =============================================================================
// EXPOSE
// =============================================================================

defineExpose({
    refresh: fetchCategories,
    reset: () => {
        searchQuery.value = ''
        emit('update:modelValue', null)
    },
    categories,
    isLoading,
})
</script>

<template>
    <Select 
        :model-value="modelValue?.toString() ?? ''" 
        :disabled="isDisabled"
        @update:model-value="handleValueChange"
    >
        <SelectTrigger 
            :id="id" 
            :class="{ 'border-red-500': error }"
            class="w-full"
        >
            <SelectValue :placeholder="placeholderText">
                <template v-if="selectedCategory">
                    <div class="flex items-center gap-2 truncate">
                        <span class="text-sm font-medium truncate">
                            {{ selectedCategory.name }}
                        </span>
                        <span 
                            v-if="selectedCategory.code" 
                            class="text-xs text-muted-foreground flex-shrink-0"
                        >
                            ({{ selectedCategory.code }})
                        </span>
                    </div>
                </template>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            <!-- Search input -->
            <div 
                v-if="searchable && canFetchData" 
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
                    placeholder="Cari kategori..." 
                    class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @input="handleSearchInput"
                    @keydown.stop
                    @keyup.stop
                    @keypress.stop
                    @click.stop
                />
            </div>

            <!-- Category list -->
            <div v-if="canFetchData" class="max-h-[200px] overflow-y-auto">
                <SelectItem 
                    v-for="category in filteredCategories" 
                    :key="category.id" 
                    :value="category.id.toString()"
                >
                    <div class="flex items-center justify-between w-full py-1">
                        <span class="text-sm truncate">{{ category.name }}</span>
                        <span 
                            v-if="category.code" 
                            class="text-xs text-muted-foreground ml-2 flex-shrink-0"
                        >
                            {{ category.code }}
                        </span>
                    </div>
                </SelectItem>
            </div>

            <!-- Empty state -->
            <div 
                v-if="canFetchData && !filteredCategories.length && !isLoading" 
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div v-if="searchQuery">
                    Tidak ada kategori "{{ searchQuery }}"
                </div>
                <div v-else-if="categories.length">
                    Tidak ada kategori yang sesuai
                </div>
                <div v-else>
                    Tidak ada data kategori
                </div>
            </div>

            <!-- Info: Kondisi tidak terpenuhi -->
            <div 
                v-if="!canFetchData" 
                class="px-2 py-8 text-center text-sm text-muted-foreground"
            >
                <div class="flex flex-col items-center gap-2">
                    <svg 
                        class="w-8 h-8 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>{{ cannotFetchMessage }}</span>
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