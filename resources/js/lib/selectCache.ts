/**
 * Cache tingkat modul (module-level) untuk endpoint "select options" / dropdown
 * master data (mis. `/api/v1/select/activities`).
 *
 * Masalah yang diatasi:
 *  1. Komponen select (ActivitySelect, dst.) memanggil fetch setiap kali mount.
 *     Kalau 1 halaman punya banyak instance (mis. per baris di form RKA/Budget),
 *     request yang identik dikirim berkali-kali → query DB berulang.
 *  2. Navigasi SPA / remount komponen memicu fetch lagi walau datanya sama.
 *
 * Solusi di sini:
 *  - Cache in-memory per kombinasi (url + params) selama TTL. Instance/modul
 *    berikutnya yang butuh data yang sama tinggal mengambil dari cache, tidak
 *    memanggil API → tidak hit DB.
 *  - Dedupe request in-flight per key: beberapa instance yang mount bersamaan
 *    cukup melakukan 1 request HTTP, sisanya menunggu promise yang sama.
 *
 * Karena ini variabel modul (di luar komponen), cache bertahan selama sesi SPA
 * (pindah halaman via Inertia tidak me-reset bundle JS). Cache ter-reset otomatis
 * saat browser di-reload.
 *
 * Jika data master diubah (create/update/delete), panggil `clearSelectCache()`
 * agar dropdown tidak menampilkan data lama, atau gunakan opsi `force: true`.
 */

import axios from 'axios';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

export interface GetCachedListOptions {
    /** Lewati cache & paksa request baru (mis. setelah mutasi data master). */
    force?: boolean;
    /** Umur cache (ms) untuk request ini. Default: 5 menit. */
    ttlMs?: number;
}

/** Umur cache default: 5 menit. */
export const SELECT_CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

const buildKey = (url: string, params: Record<string, unknown>): string => {
    const keys = Object.keys(params).sort();
    if (!keys.length) return url;

    const sortedParams: Record<string, unknown> = {};
    for (const key of keys) {
        sortedParams[key] = params[key];
    }
    return `${url}?${JSON.stringify(sortedParams)}`;
};

/**
 * Normalisasi response select API yang bisa berbentuk:
 *  - array langsung: `[...]`
 *  - terbungkus: `{ data: [...] }`
 * Bentuk lain dianggap tidak valid → [] + warning.
 */
const normalizeList = <T>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[];
    }

    if (
        payload &&
        typeof payload === 'object' &&
        Array.isArray((payload as { data?: unknown }).data)
    ) {
        return (payload as { data: T[] }).data;
    }

    if (payload !== undefined && payload !== null) {
        console.warn('Unexpected select API response structure:', payload);
    }
    return [];
};

/**
 * Ambil daftar opsi dari API dengan cache:
 *  - masih ada cache segar & `force: false`  → langsung return dari cache.
 *  - ada request yang sama sedang berjalan   → ikut menunggu request tsb
 *    (tanpa request HTTP baru).
 *  - selain itu → lakukan request, simpan ke cache, lalu return.
 */
export async function getCachedList<T>(
    url: string,
    params: Record<string, unknown> = {},
    options: GetCachedListOptions = {},
): Promise<T[]> {
    const key = buildKey(url, params);
    const ttlMs = options.ttlMs ?? SELECT_CACHE_TTL_MS;

    // 1) Cek cache yang masih segar.
    if (!options.force) {
        const entry = cache.get(key) as CacheEntry<T[]> | undefined;
        if (entry) {
            if (entry.expiresAt > Date.now()) {
                return entry.data;
            }
            cache.delete(key); // sudah kedaluwarsa
        }
    }

    // 2) Dedupe: pakai request in-flight yang sama bila ada.
    let request = inFlight.get(key) as Promise<T[]> | undefined;
    if (!request) {
        request = axios
            .get(url, {
                params: Object.keys(params).length > 0 ? params : undefined,
            })
            .then((response) => {
                const data = normalizeList<T>(response.data);
                cache.set(key, {
                    data,
                    expiresAt: Date.now() + ttlMs,
                });
                return data;
            })
            .finally(() => {
                inFlight.delete(key);
            });
        inFlight.set(key, request);
    }

    return request;
}

/** Bersihkan seluruh cache select (mis. setelah data master diubah). */
export function clearSelectCache(): void {
    cache.clear();
}

/** Bersihkan cache untuk satu URL (semua kombinasi params-nya). */
export function clearSelectCacheForUrl(url: string): void {
    for (const key of cache.keys()) {
        if (key.startsWith(url)) {
            cache.delete(key);
        }
    }
}
