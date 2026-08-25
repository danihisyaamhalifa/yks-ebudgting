export interface UploadedFile {
    id?: number | string;
    name: string;
    file: File | string;
    size: number;
    type: string;
    url?: string;
    previewUrl?: string;
    isExisting?: boolean;
    progress?: number;
    status?: 'pending' | 'uploading' | 'success' | 'error';
    errorMessage?: string;
}