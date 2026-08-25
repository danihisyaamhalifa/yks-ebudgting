<template>
    <div class="space-y-2">
        <div
            v-if="!viewOnly"
            class="cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors"
            :class="[
                isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-400 bg-gray-100 hover:border-gray-500 hover:bg-gray-200',
                disabled ? 'cursor-not-allowed bg-gray-100 opacity-50' : '',
            ]"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
            @click="!disabled && fileInput.click()"
        >
            <Upload class="mx-auto mb-2 h-8 w-8 text-gray-500" />
            <p class="text-sm text-gray-600">
                {{
                    isDragOver
                        ? 'Lepaskan file di sini'
                        : 'Klik atau drag & drop file untuk upload'
                }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
                Maksimal {{ maxSizeMb }} MB per file ({{
                    acceptedFileTypes.join(', ')
                }})
            </p>
        </div>

        <input
            ref="fileInput"
            type="file"
            :accept="acceptedFileTypes.join(',')"
            :multiple="multiple"
            class="hidden"
            @change="handleFileSelect"
            :disabled="disabled"
        />

        <!-- Daftar File -->
        <div v-if="files.length > 0" class="mt-4 space-y-2">
            <div
                v-for="(file, index) in files"
                :key="file.id || index"
                class="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-2"
            >
                <div class="flex flex-1 items-center gap-2">
                    <!-- Thumbnail Preview untuk gambar -->
                    <div
                        v-if="
                            !file.isExisting &&
                            file.previewUrl &&
                            file.type?.startsWith('image/')
                        "
                        class="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-100"
                    >
                        <img
                            :src="file.previewUrl"
                            :alt="file.name"
                            class="h-full w-full object-cover"
                        />
                    </div>
                    <!-- Preview untuk file existing -->
                    <div
                        v-else-if="
                            file.isExisting &&
                            file.type?.startsWith('image/') &&
                            file.url
                        "
                        class="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-100"
                    >
                        <img
                            :src="getFileUrl(file)"
                            :alt="file.name"
                            class="h-full w-full object-cover"
                        />
                    </div>
                    <component
                        :is="getFileIcon(file.type)"
                        v-else
                        class="h-4 w-4 flex-shrink-0 text-gray-500"
                    />

                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-blue-800">
                            {{ file.name }}
                        </p>
                        <p class="text-xs text-gray-500">
                            {{ formatFileSize(file.size) }}
                        </p>

                        <template v-if="!viewOnly">
                            <p
                                v-if="file.isExisting"
                                class="text-xs text-green-600"
                            >
                                Sudah tersimpan
                            </p>
                            <p v-else class="text-xs text-yellow-600">
                                Belum tersimpan
                            </p>
                            <p
                                v-if="file.errorMessage"
                                class="text-xs text-red-600"
                            >
                                {{ file.errorMessage }}
                            </p>
                        </template>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-1">
                        <!-- View Button for PDF and Images -->
                        <Button
                            v-if="canViewFile(file)"
                            type="button"
                            variant="ghost"
                            size="sm"
                            @click="viewFile(file)"
                            class="text-blue-600 hover:bg-gray-200 hover:text-blue-800"
                            :disabled="isViewDisabled(file)"
                            :title="'Lihat ' + file.name"
                        >
                            <Eye class="h-3 w-3" />
                        </Button>

                        <!-- Download Button untuk file existing -->
                        <Button
                            v-if="file.isExisting && file.url"
                            type="button"
                            variant="ghost"
                            size="sm"
                            @click="downloadFile(file)"
                            class="text-green-600 hover:bg-gray-200 hover:text-green-800"
                            :title="'Download ' + file.name"
                        >
                            <Download class="h-3 w-3" />
                        </Button>

                        <!-- Bungkus Status Icons dengan template v-if="!viewOnly" -->
                        <template v-if="!viewOnly">
                            <div
                                v-if="file.isExisting"
                                class="text-green-600"
                                title="File tersimpan"
                            >
                                <CheckCircle class="h-4 w-4" />
                            </div>
                            <div
                                v-else-if="file.status === 'uploading'"
                                class="text-blue-600"
                                title="Sedang mengupload"
                            >
                                <Loader2 class="h-4 w-4 animate-spin" />
                            </div>
                            <div
                                v-else-if="file.status === 'error'"
                                class="text-red-600"
                                title="Gagal upload"
                            >
                                <AlertCircle class="h-4 w-4" />
                            </div>
                            <div
                                v-else
                                class="text-yellow-600"
                                title="Belum tersimpan, akan diupload saat menyimpan"
                            >
                                <Clock class="h-4 w-4" />
                            </div>
                        </template>
                    </div>
                </div>
                <template v-if="!viewOnly">
                    <Button
                        v-if="!disabled"
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="removeFile(index)"
                        class="text-red-600 hover:bg-gray-200 hover:text-red-800"
                    >
                        <Trash2 class="h-3 w-3" />
                    </Button>
                </template>
            </div>
        </div>
        <div v-else class="mt-4 flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p class="text-sm font-medium text-gray-500">Lampiran dokumen belum ada</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    Eye,
    File,
    FileImage,
    FileText,
    Loader2,
    Trash2,
    Upload,
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { UploadedFile } from './types';

const props = withDefaults(
    defineProps<{
        modelValue: UploadedFile[];
        disabled?: boolean;
        viewOnly?: boolean;
        maxSizeMb?: number;
        acceptedFileTypes?: string[];
        multiple?: boolean;
        storageBaseUrl?: string;
    }>(),
    {
        disabled: false,
        viewOnly: false,
        maxSizeMb: 10,
        acceptedFileTypes: () => ['.pdf', '.jpg', '.jpeg', '.png'],
        multiple: true,
        storageBaseUrl: '/storage',
    },
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: UploadedFile[]): void;
    (e: 'file-added', file: UploadedFile): void;
    (e: 'file-removed', index: number): void;
    (e: 'file-error', error: string): void;
}>();

const fileInput = ref<HTMLInputElement>();
const isDragOver = ref(false);

const files = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

/**
 * Mendapatkan URL file yang bisa diakses
 * Menangani berbagai format path
 */
const getFileUrl = (file: UploadedFile): string => {
    if (!file.url) return '';
    
    // Jika sudah full URL, gunakan langsung
    if (file.url.startsWith('http://') || file.url.startsWith('https://')) {
        return file.url;
    }
    
    // Jika URL relatif, tambahkan base URL
    const baseUrl = props.storageBaseUrl.replace(/\/$/, '');
    const fileUrl = file.url.startsWith('/') ? file.url : `/${file.url}`;
    
    return `${baseUrl}${fileUrl}`;
};

const getFileIcon = (fileType?: string) => {
    if (!fileType) return File;

    if (fileType.startsWith('image/')) return FileImage;
    if (fileType === 'application/pdf') return FileText;

    return File;
};

const canViewFile = (file: UploadedFile) => {
    const fileType = file.type;
    if (fileType?.startsWith('image/')) return true;
    if (fileType === 'application/pdf') return true;
    return false;
};

const isViewDisabled = (file: UploadedFile) => {
    return !file.isExisting && !file.previewUrl;
};

/**
 * Melihat file
 */
const viewFile = (file: UploadedFile) => {
    if (file.isExisting && file.url) {
        const url = getFileUrl(file);
        
        // Untuk PDF, bisa buka di tab baru atau gunakan viewer
        if (file.type === 'application/pdf') {
            window.open(url, '_blank');
        } 
        // Untuk gambar, bisa buka di tab baru atau tampilkan modal
        else if (file.type?.startsWith('image/')) {
            window.open(url, '_blank');
        }
        // Untuk tipe file lain, download saja
        else {
            downloadFile(file);
        }
    } else if (file.previewUrl) {
        // Untuk file baru yang belum diupload
        window.open(file.previewUrl, '_blank');
    }
};

/**
 * Download file
 */
const downloadFile = async (file: UploadedFile) => {
    try {
        if (file.isExisting && file.url) {
            const url = getFileUrl(file);
            
            // Gunakan fetch untuk download file (mengatasi CORS issues)
            const response = await fetch(url);
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
        } else if (file.file) {
            // Untuk file baru yang belum diupload (dari File object)
            const url = URL.createObjectURL(file.file);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        }
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: buka di tab baru jika download gagal
        if (file.url) {
            window.open(getFileUrl(file), '_blank');
        }
    }
};

const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateFile = (file: File): string | null => {
    const maxSize = props.maxSizeMb * 1024 * 1024;

    if (file.size > maxSize) {
        return `Ukuran file melebihi ${props.maxSizeMb} MB`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!props.acceptedFileTypes.includes(fileExtension)) {
        return `Tipe file tidak didukung. Gunakan: ${props.acceptedFileTypes.join(', ')}`;
    }

    return null;
};

const processFile = (file: File): UploadedFile => {
    const errorMessage = validateFile(file);

    const uploadedFile: UploadedFile = {
        id: undefined,
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
        status: errorMessage ? 'error' : 'pending',
        errorMessage: errorMessage || undefined,
        isExisting: false,
    };

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedFile.previewUrl = e.target?.result as string;
            emit('update:modelValue', [...files.value]);
        };
        reader.readAsDataURL(file);
    }

    return uploadedFile;
};

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const selectedFiles = Array.from(target.files || []);

    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map(processFile);
    const errorFiles = newFiles.filter((f) => f.status === 'error');

    if (errorFiles.length > 0) {
        errorFiles.forEach((file) => {
            if (file.errorMessage) {
                emit('file-error', `${file.name}: ${file.errorMessage}`);
            }
        });
    }

    const validFiles = newFiles.filter((f) => f.status !== 'error');

    if (validFiles.length === 0) {
        if (fileInput.value) {
            fileInput.value.value = '';
        }
        return;
    }

    const updatedFiles = [...files.value, ...validFiles];
    emit('update:modelValue', updatedFiles);

    validFiles.forEach((file) => {
        emit('file-added', file);
    });

    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const handleDrop = (event: DragEvent) => {
    isDragOver.value = false;

    const droppedFiles = Array.from(event.dataTransfer?.files || []);

    if (droppedFiles.length === 0) return;

    const newFiles = droppedFiles.map(processFile);
    const errorFiles = newFiles.filter((f) => f.status === 'error');

    if (errorFiles.length > 0) {
        errorFiles.forEach((file) => {
            if (file.errorMessage) {
                emit('file-error', `${file.name}: ${file.errorMessage}`);
            }
        });
    }

    const validFiles = newFiles.filter((f) => f.status !== 'error');

    if (validFiles.length === 0) return;

    const updatedFiles = [...files.value, ...validFiles];
    emit('update:modelValue', updatedFiles);

    validFiles.forEach((file) => {
        emit('file-added', file);
    });
};

const removeFile = (index: number) => {
    const updatedFiles = [...files.value];
    updatedFiles.splice(index, 1);
    emit('update:modelValue', updatedFiles);
    emit('file-removed', index);
};
</script>