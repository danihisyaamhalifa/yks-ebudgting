<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class MaintenanceController extends Controller
{
    public function activateStorage()
{
    try {
        // 1. Pastikan folder asal (source) ada
        $targetFolder = storage_path('app/public');
        if (!file_exists($targetFolder)) {
            mkdir($targetFolder, 0755, true);
        }

        // 2. Tentukan folder tujuan di public_html
        $linkFolder = base_path('public_html/storage');
        
        // Pengecekan alternatif jika base_path tidak mendeteksi public_html
        if (!str_contains($linkFolder, 'public_html')) {
            $linkFolder = '/home/yayasand/domains/saratus.yayasan-dhig.or.id/public_html/storage';
        }

        // 3. Hapus folder fisik atau symlink lama yang menghalangi
        if (file_exists($linkFolder)) {
            if (is_link($linkFolder)) {
                unlink($linkFolder); // Hapus jika berupa tautan/symlink rusak
            } else {
                File::deleteDirectory($linkFolder); // Hapus total jika berupa folder fisik asli
            }
        }

        // 4. Buat tautan symlink baru
        if (symlink($targetFolder, $linkFolder)) {
            return response()->json([
                'status' => 'success',
                'message' => 'Storage berhasil dibersihkan dan diaktifkan!',
                'target' => $targetFolder,
                'link' => $linkFolder
            ], 200);
        }

        throw new \Exception("Gagal membuat symlink.");

    } catch (\Exception $e) {
        Log::error('Gagal mengaktifkan storage: ' . $e->getMessage());

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengaktifkan storage.',
            'error' => $e->getMessage()
        ], 500);
    }
}


    public function clearCache()
    {
        try {
            // Bersihkan konfigurasi cache
            Artisan::call('config:clear');

            // Bersihkan application cache
            Artisan::call('cache:clear');

            // Bersihkan route cache
            Artisan::call('route:clear');

            return response()->json([
                'status' => 'success',
                'message' => 'Semua cache aplikasi telah berhasil dibersihkan!',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Gagal membersihkan cache: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membersihkan cache.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
