<template>
    <div class="rounded-lg border bg-background p-4">
        <h5 class="mb-3 font-medium">
            {{ isEdit ? 'Edit Barang' : 'Tambah Barang Baru' }}
        </h5>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
                <Label>Nama Barang <span class="text-red-500">*</span></Label>
                <Input
                    v-model="form.item_name"
                    placeholder="Masukkan nama barang"
                />
            </div>

            <div class="space-y-2">
                <Label>Tipe Barang</Label>
                <Select v-model="form.goods_type">
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe barang" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="option in goodsTypeOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-2">
                <Label>Spesifikasi</Label>
                <Input
                    v-model="form.specification"
                    placeholder="Spesifikasi barang"
                />
            </div>

            <div class="space-y-2">
                <Label>Brand/Merk</Label>
                <Input v-model="form.brand" placeholder="Brand atau merk" />
            </div>

            <div class="space-y-2">
                <Label>Quantity <span class="text-red-500">*</span></Label>
                <Input
                    v-model.number="form.quantity"
                    type="number"
                    min="1"
                    step="1"
                    @input="debouncedCalculateSubtotal"
                    placeholder="Jumlah"
                />
            </div>

            <div class="space-y-2">
                <Label>Satuan</Label>
                <Input
                    v-model="form.unit_measure"
                    placeholder="Contoh: pcs, box, unit"
                />
            </div>

            <div class="space-y-2">
                <Label>Harga Satuan <span class="text-red-500">*</span></Label>
                <div class="relative">
                    <span class="absolute top-2 left-3 text-muted-foreground"
                        >Rp</span
                    >
                    <Input
                        v-model="form.unit_price"
                        type="text"
                        placeholder="0"
                        @input="handleUnitPrice"
                        class="pl-10"
                    />
                </div>
            </div>

            <div class="space-y-2">
                <Label>Subtotal</Label>
                <div class="relative">
                    <span class="absolute top-2 left-3 text-muted-foreground"
                        >Rp</span
                    >
                    <Input
                        :value="formatCurrency(form.subtotal)"
                        class="bg-muted pl-10"
                        readonly
                    />
                </div>
            </div>

            <div class="space-y-2 md:col-span-2">
                <Label>Catatan</Label>
                <Textarea
                    v-model="form.notes"
                    placeholder="Catatan tambahan (opsional)"
                    class="min-h-[60px] resize-none"
                    rows="2"
                />
            </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" @click="$emit('cancel')">
                Batal
            </Button>
            <Button type="button" @click="handleSave" class="gap-1">
                <Save class="h-4 w-4" />
                {{ isEdit ? 'Update Barang' : 'Simpan Barang' }}
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Save } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'vue-sonner';
import { debounce } from 'lodash';
import { BudgetRequestItemGood } from '@/types/budget';

interface Props {
    goods: BudgetRequestItemGood | null;
    isEdit: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'save', goods: BudgetRequestItemGood): void;
    (e: 'cancel'): void;
}>();

const goodsTypeOptions = [
    { value: 'bhp', label: 'BHP (Bahan Habis Pakai)' },
    { value: 'non_bhp', label: 'Non BHP' },
];

const form = ref<BudgetRequestItemGood>({
    item_name: props.goods?.item_name || '',
    goods_type: props.goods?.goods_type || 'bhp',
    specification: props.goods?.specification || '',
    brand: props.goods?.brand || '',
    quantity: props.goods?.quantity || 1,
    unit_measure: props.goods?.unit_measure || '',
    unit_price: props.goods?.unit_price || 0,
    subtotal: props.goods?.subtotal || 0,
    notes: props.goods?.notes || '',
});

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

const debouncedCalculateSubtotal = debounce(() => {
    calculateSubtotal();
}, 300);

const calculateSubtotal = () => {
    const qty = form.value.quantity || 0;
    const price = form.value.unit_price || 0;
    form.value.subtotal = qty * price;
};

const handleUnitPrice = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/\D/g, '');
    form.value.unit_price = parseInt(rawValue || '0', 10);
    debouncedCalculateSubtotal();
};

const handleSave = () => {
    if (!form.value.item_name.trim()) {
        toast.warning('Nama barang harus diisi');
        return;
    }

    if (form.value.quantity <= 0) {
        toast.warning('Quantity harus lebih dari 0');
        return;
    }

    if (form.value.unit_price < 0) {
        toast.warning('Harga satuan tidak boleh negatif');
        return;
    }

    emit('save', { ...form.value });
};
</script>