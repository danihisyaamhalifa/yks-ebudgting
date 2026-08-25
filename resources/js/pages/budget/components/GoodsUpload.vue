<template>
    <div>
        <!-- Toolbar -->
        <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2"></div>
            <div class="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="downloadTemplate"
                    class="gap-1"
                >
                    <Download class="h-4 w-4" />
                    Download Template
                </Button>
            </div>
        </div>

        <!-- Dropzone Upload Area -->
        <div
            ref="dropzoneRef"
            class="relative mb-3 rounded-lg border-2 border-dashed p-6 transition-colors"
            :class="
                isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                    : uploadedFile
                      ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/20'
                      : 'border-muted-foreground/25 hover:border-blue-400 hover:bg-accent/50'
            "
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
        >
            <input
                type="file"
                accept=".csv,.xls,.xlsx"
                class="absolute inset-0 cursor-pointer opacity-0"
                @change="handleFileInputChange"
            />

            <!-- Uploaded File Info -->
            <div
                v-if="uploadedFile"
                class="flex items-center justify-between"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"
                    >
                        <FileSpreadsheet
                            class="h-5 w-5 text-green-600 dark:text-green-400"
                        />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">
                            {{ uploadedFile.name }}
                        </p>
                        <p class="text-xs text-muted-foreground">
                            {{ formatFileSize(uploadedFile.size) }}
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="clearUploadedFile"
                    class="text-muted-foreground hover:text-destructive"
                >
                    <X class="h-4 w-4" />
                </Button>
            </div>

            <!-- Dropzone Placeholder -->
            <div v-else class="flex flex-col items-center gap-2 text-center">
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
                >
                    <Upload class="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                    <p class="text-sm font-medium text-foreground">
                        Drag & drop atau klik untuk upload
                    </p>
                    <p class="text-xs text-muted-foreground">
                        CSV atau Excel (max 5MB)
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Download, Upload, X, FileSpreadsheet } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';
import * as XLSX from 'xlsx';
import { BudgetRequestItemGood } from '@/types/budget';

const emit = defineEmits<{
    (e: 'file-processed', goods: BudgetRequestItemGood[]): void;
}>();

const dropzoneRef = ref<HTMLDivElement | null>(null);
const isDragOver = ref(false);
const uploadedFile = ref<{ name: string; size: number } | null>(null);

let goodsIdCounter = 1;

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const clearUploadedFile = () => {
    uploadedFile.value = null;
};

const downloadTemplate = () => {
    try {
        const wb = XLSX.utils.book_new();

        const headers = [
            'Nama Barang',
            'Tipe Barang (bhp/non_bhp)',
            'Spesifikasi',
            'Brand/Merk',
            'Quantity',
            'Satuan',
            'Harga Satuan',
            'Catatan',
        ];

        const sampleData = [
            [
                'Contoh Barang 1',
                'bhp',
                'Spesifikasi A',
                'Brand X',
                10,
                'pcs',
                50000,
                'Catatan opsional',
            ],
            [
                'Contoh Barang 2',
                'non_bhp',
                'Spesifikasi B',
                'Brand Y',
                5,
                'unit',
                250000,
                '',
            ],
        ];

        const wsData = [headers, ...sampleData];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws['!cols'] = [
            { wch: 25 },
            { wch: 20 },
            { wch: 25 },
            { wch: 20 },
            { wch: 12 },
            { wch: 12 },
            { wch: 18 },
            { wch: 30 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Data Barang');

        const instructionsData = [
            ['PETUNJUK PENGISIAN TEMPLATE BARANG'],
            [''],
            [
                '1. Sheet "Data Barang" digunakan untuk mengisi data barang yang akan diimport.',
            ],
            ['2. Jangan mengubah nama kolom (header) pada baris pertama.'],
            ['3. Isi data barang mulai dari baris ke-2.'],
            ['4. Kolom "Tipe Barang" hanya boleh diisi: bhp atau non_bhp'],
            ['5. Kolom "Quantity" diisi dengan angka bulat (contoh: 10)'],
            [
                '6. Kolom "Harga Satuan" diisi dengan angka tanpa titik/koma (contoh: 50000)',
            ],
            ['7. Baris contoh bisa dihapus saat mengisi data sebenarnya.'],
            ['8. Simpan file dalam format .xlsx atau .csv sebelum diupload.'],
            [''],
            ['CONTOH DATA:'],
            [
                'Nama Barang',
                'Tipe Barang',
                'Spesifikasi',
                'Brand',
                'Quantity',
                'Satuan',
                'Harga Satuan',
                'Catatan',
            ],
            [
                'Kertas A4',
                'bhp',
                '80 gram',
                'PaperOne',
                '50',
                'rim',
                '55000',
                'Untuk keperluan administrasi',
            ],
            [
                'Laptop',
                'non_bhp',
                'Core i5, 8GB RAM',
                'Lenovo',
                '3',
                'unit',
                '8500000',
                'Untuk staff baru',
            ],
        ];

        const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
        wsInstructions['!cols'] = [{ wch: 80 }];

        XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk');
        XLSX.writeFile(wb, 'template_barang_budget_request.xlsx');

        toast.success('Template Excel berhasil diunduh');
    } catch (error) {
        console.error('Error downloading template:', error);
        toast.error('Gagal mengunduh template');
    }
};

const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragOver.value = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        processFile(files[0]);
    }
};

const handleFileInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        processFile(file);
    }
    target.value = '';
};

const processFile = (file: File) => {
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
        toast.warning(
            'Format file tidak valid. Gunakan file CSV atau Excel (.csv, .xls, .xlsx)',
        );
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        toast.warning('Ukuran file maksimal 5MB');
        return;
    }

    uploadedFile.value = {
        name: file.name,
        size: file.size,
    };

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            if (fileExtension === '.csv') {
                const content = e.target?.result as string;
                parseCSVContent(content);
            } else {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json<any[]>(firstSheet, {
                    header: 1,
                });

                if (jsonData.length < 2) {
                    toast.warning('File kosong atau hanya berisi header');
                    clearUploadedFile();
                    return;
                }

                const dataRows = jsonData.slice(1);
                parseExcelRows(dataRows);
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            toast.error(
                'Gagal membaca file. Pastikan format file sesuai template.',
            );
            clearUploadedFile();
        }
    };

    reader.onerror = () => {
        toast.error('Gagal membaca file');
        clearUploadedFile();
    };

    if (fileExtension === '.csv') {
        reader.readAsText(file, 'UTF-8');
    } else {
        reader.readAsArrayBuffer(file);
    }
};

const parseCSVContent = (content: string) => {
    const cleanContent = content.replace(/^\uFEFF/, '');
    const lines = cleanContent.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
        toast.warning('File kosong atau hanya berisi header');
        return;
    }

    const dataLines = lines.slice(1);
    let newGoods: BudgetRequestItemGood[] = [];
    let errorCount = 0;

    dataLines.forEach((line, index) => {
        const lineNumber = index + 2;

        try {
            const values = parseCSVLine(line);

            if (values.length < 6) {
                errorCount++;
                return;
            }

            const good = createGoodFromRow(values);
            if (!good) {
                errorCount++;
            } else {
                newGoods.push(good);
            }
        } catch (e) {
            errorCount++;
        }
    });

    finalizeImport(newGoods, errorCount);
};

const parseExcelRows = (rows: any[][]) => {
    const newGoods: BudgetRequestItemGood[] = [];
    let errorCount = 0;

    rows.forEach((row) => {
        try {
            const values = row.map((val) => {
                if (val === null || val === undefined) return '';
                return String(val);
            });

            if (values.length < 6 || !values[0]?.trim()) {
                errorCount++;
                return;
            }

            const good = createGoodFromRow(values);
            if (good) {
                newGoods.push(good);
            } else {
                errorCount++;
            }
        } catch (e) {
            errorCount++;
        }
    });

    finalizeImport(newGoods, errorCount);
};

const createGoodFromRow = (
    values: string[],
): BudgetRequestItemGood | null => {
    const goodsType = values[1]?.trim().toLowerCase();
    if (goodsType !== 'bhp' && goodsType !== 'non_bhp') {
        return null;
    }

    const quantity = parseInt(values[4]?.trim() || '0', 10);
    const unitPrice = parseInt(
        String(values[6])?.replace(/[^\d]/g, '') || '0',
        10,
    );

    if (
        isNaN(quantity) ||
        quantity <= 0 ||
        isNaN(unitPrice) ||
        unitPrice < 0
    ) {
        return null;
    }

    const good: BudgetRequestItemGood = {
        id: -goodsIdCounter++,
        item_name: values[0]?.trim() || '',
        goods_type: goodsType as 'bhp' | 'non_bhp',
        specification: values[2]?.trim() || '',
        brand: values[3]?.trim() || '',
        quantity: quantity,
        unit_measure: values[5]?.trim() || '',
        unit_price: unitPrice,
        subtotal: quantity * unitPrice,
        notes: values[7]?.trim() || '',
    };

    if (!good.item_name) {
        return null;
    }

    return good;
};

const finalizeImport = (
    newGoods: BudgetRequestItemGood[],
    errorCount: number,
) => {
    if (newGoods.length > 0) {
        emit('file-processed', newGoods);
        toast.success(`${newGoods.length} barang berhasil diimport`);
    }

    if (errorCount > 0) {
        toast.error(
            `${errorCount} baris gagal diimport karena format tidak valid`,
        );
    }

    if (newGoods.length === 0 && errorCount === 0) {
        toast.error('Tidak ada data yang berhasil diimport');
    }

    clearUploadedFile();
};

const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }

    result.push(current);
    return result;
};
</script>