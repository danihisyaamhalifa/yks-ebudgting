<template>
    <div>
        <!-- Toolbar -->
        <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Button
                    v-if="!isReadOnly"
                    type="button"
                    variant="default"
                    size="sm"
                    @click="$emit('add')"
                    class="gap-1"
                >
                    <Plus class="h-4 w-4" />
                    Tambah Barang
                </Button>
            </div>
        </div>

        <!-- Goods List Table -->
        <div class="rounded-md border bg-background">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-10">No</TableHead>
                        <TableHead class="w-100">Nama Barang</TableHead>
                        <TableHead class="w-16">Tipe</TableHead>
                        <TableHead class="w-16">Qty</TableHead>
                        <TableHead class="w-20">Satuan</TableHead>
                        <TableHead class="w-36 text-right"
                            >Harga Satuan</TableHead
                        >
                        <TableHead class="w-36 text-right">Subtotal</TableHead>
                        <TableHead class="w-20">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="(good, gIndex) in goods" :key="gIndex">
                        <TableCell class="font-medium">{{
                            gIndex + 1
                        }}</TableCell>
                        <TableCell class="max-w-[200px]">
                            <div class="overflow-hidden">
                                <div
                                    class="truncate font-medium"
                                    :title="good.item_name"
                                >
                                    {{ good.item_name }}
                                </div>
                                <div
                                    v-if="good.specification"
                                    class="overflow-hidden text-xs break-all whitespace-normal text-muted-foreground"
                                >
                                    Spec: {{ good.specification }}
                                </div>
                                <div
                                    v-if="good.brand"
                                    class="overflow-hidden text-xs break-all whitespace-normal text-muted-foreground"
                                >
                                    Brand: {{ good.brand }}
                                </div>
                                <div
                                    v-if="good.notes"
                                    class="overflow-hidden text-xs break-all whitespace-normal text-muted-foreground italic"
                                >
                                    {{ good.notes }}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span
                                class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium"
                                :class="
                                    good.goods_type === 'bhp'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                "
                            >
                                {{ good.goods_type === 'bhp' ? 'BHP' : 'Non BHP' }}
                            </span>
                        </TableCell>
                        <TableCell>{{ good.quantity }}</TableCell>
                        <TableCell>{{ good.unit_measure || '-' }}</TableCell>
                        <TableCell class="text-right"
                            >Rp {{ formatCurrency(good.unit_price) }}</TableCell
                        >
                        <TableCell class="text-right font-medium"
                            >Rp {{ formatCurrency(good.subtotal) }}</TableCell
                        >
                        <TableCell>
                            <div class="flex gap-1">
                                <Button
                                    v-if="!isReadOnly"
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    @click="$emit('edit', gIndex)"
                                    class="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    title="Edit barang"
                                >
                                    <Pencil class="h-3 w-3" />
                                </Button>
                                <Button
                                    v-if="!isReadOnly"
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    @click="$emit('remove', gIndex)"
                                    class="text-destructive hover:bg-destructive/10"
                                    title="Hapus barang"
                                >
                                    <Trash2 class="h-3 w-3" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow v-if="goods.length === 0">
                        <TableCell
                            colspan="8"
                            class="py-8 text-center text-muted-foreground"
                        >
                            <div class="flex flex-col items-center gap-2">
                                <Package class="h-8 w-8" />
                                <p>
                                    Belum ada barang. Klik "Tambah Barang" atau
                                    upload file.
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <!-- Goods Summary -->
        <div v-if="goods.length > 0" class="mt-3 flex justify-end">
            <div class="w-64 space-y-1 rounded border bg-muted p-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-muted-foreground">Jumlah Barang:</span>
                    <span class="font-medium">{{ goods.length }}</span>
                </div>
                <div class="flex justify-between border-t pt-1">
                    <span class="font-medium text-foreground"
                        >Total Barang:</span
                    >
                    <span class="font-bold text-primary"
                        >Rp {{ formatCurrency(totalAmount) }}</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plus, Pencil, Trash2, Package } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BudgetRequestItemGood } from '@/types/budget';

interface Props {
    goods: BudgetRequestItemGood[];
    isReadOnly: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'add'): void;
    (e: 'edit', index: number): void;
    (e: 'remove', index: number): void;
    (e: 'total-change', total: number): void;
}>();

const totalAmount = computed(() => {
    return props.goods.reduce((sum, good) => sum + (good.subtotal || 0), 0);
});

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};
</script>