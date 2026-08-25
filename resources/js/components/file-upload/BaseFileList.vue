<script setup lang="ts">
import { Eye, Download, Trash2, FileText, FileImage, File } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

export interface UploadedFile {
    id?: number | string;
    name: string;
    size: number;
    type: string;
    url?: string;
    previewUrl?: string;
    isExisting?: boolean;
}

const props = defineProps<{
    files: UploadedFile[];

    showDelete?: boolean;
    showDownload?: boolean;
    showView?: boolean;
}>();

const emit = defineEmits<{
    'remove': [index: number];
    'view': [file: UploadedFile];
    'download': [file: UploadedFile];
}>();

// helpers
const isImage = (file: UploadedFile) => file.type?.startsWith('image/');
const isPdf = (file: UploadedFile) => file.type === 'application/pdf';

const getFileIcon = (type: string) => {
    if (type.includes('image')) return FileImage;
    if (type.includes('pdf')) return FileText;
    return File;
};

const formatSize = (bytes: number) => {
    if (!bytes) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};
</script>

<template>
    <div class="space-y-2">
        <div 
            v-for="(file, index) in files" 
            :key="file.id || index"
            class="flex items-center justify-between p-2 border rounded-md bg-gray-50"
        >
            <div class="flex items-center gap-2 flex-1">

                <!-- preview -->
                <img 
                    v-if="isImage(file) && file.previewUrl"
                    :src="file.previewUrl"
                    class="w-8 h-8 object-cover rounded"
                />

                <component 
                    v-else 
                    :is="getFileIcon(file.type)" 
                    class="h-4 w-4 text-gray-500"
                />

                <div class="flex-1">
                    <p class="text-sm">{{ file.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatSize(file.size) }}</p>
                </div>

                <div class="flex gap-1">

                    <Button
                        v-if="showView && (isImage(file) || isPdf(file))"
                        size="sm"
                        variant="ghost"
                        @click="$emit('view', file)"
                    >
                        <Eye class="h-3 w-3"/>
                    </Button>

                    <Button
                        v-if="showDownload && file.url"
                        size="sm"
                        variant="ghost"
                        @click="$emit('download', file)"
                    >
                        <Download class="h-3 w-3"/>
                    </Button>

                    <Button
                        v-if="showDelete"
                        size="sm"
                        variant="ghost"
                        @click="$emit('remove', index)"
                        class="text-red-600"
                    >
                        <Trash2 class="h-3 w-3"/>
                    </Button>

                </div>
            </div>
        </div>
    </div>
</template>