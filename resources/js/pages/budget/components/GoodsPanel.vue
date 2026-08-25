<template>
    <div class="border-t-2 border-blue-200 p-4 dark:border-blue-800">
        <!-- Panel Header -->
        <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Package class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h5 class="font-semibold text-foreground">
                    Data Barang: {{ itemDescription }}
                </h5>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="$emit('close')"
                class="text-muted-foreground hover:text-foreground"
            >
                <ChevronUp class="h-4 w-4" />
            </Button>
        </div>

        <!-- MODE: LIST BARANG -->
        <div v-if="!showForm">
            <GoodsUpload
                v-if="!isReadOnly"
                @file-processed="handleFileProcessed"
                @template-downloaded="handleTemplateDownloaded"
            />

            <GoodsList
                :goods="goods"
                :is-read-only="isReadOnly"
                @add="showForm = true"
                @edit="handleEdit"
                @remove="handleRemove"
                @total-change="handleTotalChange"
            />
        </div>

        <!-- MODE: FORM INPUT BARANG -->
        <GoodsForm
            v-else
            :goods="editingGoods"
            :is-edit="editingIndex >= 0"
            @save="handleSave"
            @cancel="showForm = false"
        />
    </div>
</template>

<script setup lang="ts">
import { Package, ChevronUp } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ref, computed } from 'vue';
import GoodsForm from './GoodsForm.vue';
import GoodsList from './GoodsList.vue';
import GoodsUpload from './GoodsUpload.vue';
import { BudgetRequestItemGood } from '@/types/budget';

interface Props {
    itemDescription: string;
    goods: BudgetRequestItemGood[];
    isReadOnly: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'update:goods', goods: BudgetRequestItemGood[]): void;
}>();

const showForm = ref(false);
const editingIndex = ref(-1);
const editingGoods = ref<BudgetRequestItemGood | null>(null);

const handleFileProcessed = (newGoods: BudgetRequestItemGood[]) => {
    const updatedGoods = [...props.goods, ...newGoods];
    emit('update:goods', updatedGoods);
};

const handleTemplateDownloaded = () => {
    // Handle template download notification if needed
};

const handleEdit = (index: number) => {
    editingIndex.value = index;
    editingGoods.value = { ...props.goods[index] };
    showForm.value = true;
};

const handleRemove = (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        const updatedGoods = [...props.goods];
        updatedGoods.splice(index, 1);
        emit('update:goods', updatedGoods);
    }
};

const handleSave = (goodsData: BudgetRequestItemGood) => {
    const updatedGoods = [...props.goods];

    if (editingIndex.value >= 0) {
        updatedGoods[editingIndex.value] = goodsData;
    } else {
        updatedGoods.push(goodsData);
    }

    emit('update:goods', updatedGoods);
    showForm.value = false;
    editingIndex.value = -1;
    editingGoods.value = null;
};

const handleTotalChange = (total: number) => {
    // Handle total change if needed
};
</script>