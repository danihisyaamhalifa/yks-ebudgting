<template>
    <Head title="Login" />

    <div class="flex min-h-screen overflow-hidden">
        <!-- LEFT PANEL: Branding & Image -->
        <div class="relative hidden overflow-hidden lg:flex lg:w-1/2">
            <!-- Background Image -->
            <div class="absolute inset-0">
                <img
                    src="/assets/img/bg_yayasan.jpg"
                    alt="Yayasan Dharma Husada Insani Garut Background"
                    class="h-full w-full object-cover"
                />
                <!-- Overlay for better text readability -->
                <div
                    class="absolute inset-0 bg-gradient-to-br from-slate-900/70 to-slate-800/60 dark:from-slate-950/70 dark:to-slate-900/60"
                ></div>

                <!-- Gradient mesh effect -->
                <div
                    class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10"
                ></div>

                <!-- Radial gradient glow -->
                <div
                    class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
                ></div>
                <div
                    class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/15 blur-3xl"
                ></div>
            </div>

            <!-- Content Overlay -->
            <div
                class="relative z-10 flex h-full w-full flex-col justify-between p-8 text-white lg:p-12"
            >
                <!-- Logo Section -->
                <div>
                    <div class="flex items-center gap-3">
                        <div
                            class="from-primary-400 to-primary-600 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg lg:h-12 lg:w-12"
                        >
                            <img
                                src="/assets/img/logo_yys_kecil.png"
                                alt="Yayasan Karsa Husada Logo"
                                class="h-12 w-12 object-contain shadow-lg"
                            />
                        </div>
                        <div
                            class="text-xl font-bold tracking-wider text-white lg:text-2xl"
                        >
                            UNGGUL ANGGARAN
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="space-y-6 py-8 lg:space-y-8 lg:py-0">
                    <!-- Decorative quote -->
                    <div class="relative">
                        <div
                            class="absolute -top-4 -left-4 font-serif text-5xl text-white/20 lg:text-6xl"
                        >
                            "
                        </div>
                        <h2
                            class="relative z-10 text-3xl leading-tight font-bold lg:text-4xl"
                        >
                            Selaras Berencana, Unggul Mengelola
                        </h2>
                        <div
                            class="absolute right-0 -bottom-8 font-serif text-5xl text-white/20 lg:text-6xl"
                        >
                            "
                        </div>
                    </div>

                    <p
                        class="max-w-md text-base leading-relaxed text-white/90 lg:text-lg"
                    >
                        Sistem informasi terpadu untuk kelola administrasi
                        anggaran yang unggul
                    </p>
                </div>

                <!-- Footer -->
                <div class="text-xs text-white/60 lg:text-sm">
                    © 2026 UNGGUL ANGGARAN — Yayasan Dharma Husada Insani Garut
                </div>
            </div>
        </div>

        <!-- RIGHT PANEL: Login Form -->
        <div
            class="flex w-full items-center justify-center overflow-y-auto bg-white p-6 sm:p-8 md:p-12 lg:w-1/2 dark:bg-slate-950"
        >
            <div class="w-full max-w-md space-y-6 lg:space-y-8">
                <!-- Mobile Logo -->
                <div class="space-y-2 text-center lg:hidden">
                    <div class="flex justify-center">
                        <img
                            src="/assets/img/logo_yys_kecil.png"
                            alt="Yayasan Karsa Husada Logo"
                            class="h-12 w-12 rounded-full border border-white object-contain shadow-lg"
                        />
                    </div>
                    <h1
                        class="text-2xl font-bold tracking-wider text-slate-800 dark:text-slate-100"
                    >
                        UNGGUL ANGGARAN
                    </h1>
                    <p class="text-sm text-muted-foreground">
                        Sistem Administrasi Rencana Anggaran
                    </p>
                </div>

                <!-- Form Container -->
                <div class="space-y-5 lg:space-y-6">
                    <!-- Welcome Text -->
                    <div
                        class="hidden space-y-2 text-center lg:block lg:text-left"
                    >
                        <h2
                            class="text-2xl font-semibold tracking-tight text-slate-800 lg:text-3xl dark:text-slate-100"
                        >
                            Selamat Datang
                        </h2>
                        <p class="text-sm text-muted-foreground">
                            Silakan login untuk melanjutkan
                        </p>
                    </div>

                    <form @submit.prevent="submit" class="space-y-5">
                        <!-- Status Message -->
                        <div
                            v-if="status"
                            class="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                        >
                            {{ status }}
                        </div>

                        <!-- Username / Email -->
                        <div class="space-y-2">
                            <Label for="login" class="text-sm font-medium">
                                Username atau Email
                            </Label>
                            <div class="group relative">
                                <User
                                    class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                                />
                                <Input
                                    id="login"
                                    v-model="form.login"
                                    name="login"
                                    placeholder="Isikan username atau email"
                                    class="h-11 border-slate-200 pl-10 transition-all focus:ring-2 focus:ring-primary/20 dark:border-slate-700"
                                    autofocus
                                    autocomplete="username"
                                />
                            </div>
                            <InputError :message="form.errors.login" />
                        </div>

                        <!-- Password -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <Label
                                    for="password"
                                    class="text-sm font-medium"
                                >
                                    Password
                                </Label>
                                <TextLink
                                    v-if="canResetPassword"
                                    :href="request()"
                                    class="text-xs font-medium text-primary hover:underline"
                                >
                                    Lupa password?
                                </TextLink>
                            </div>

                            <div class="group relative">
                                <Lock
                                    class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                                />
                                <Input
                                    id="password"
                                    v-model="form.password"
                                    :type="
                                        passwordVisible ? 'text' : 'password'
                                    "
                                    name="password"
                                    placeholder="Isikan password"
                                    class="h-11 border-slate-200 pr-10 pl-10 transition-all focus:ring-2 focus:ring-primary/20 dark:border-slate-700"
                                    autocomplete="current-password"
                                />
                                <button
                                    type="button"
                                    @click="togglePasswordVisibility"
                                    class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                                >
                                    <EyeIcon
                                        v-if="!passwordVisible"
                                        class="h-4 w-4"
                                    />
                                    <EyeOffIcon v-else class="h-4 w-4" />
                                </button>
                            </div>
                            <InputError :message="form.errors.password" />
                        </div>

                        <!-- Submit Button -->
                        <Button
                            type="submit"
                            class="h-11 w-full bg-primary text-sm font-semibold shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                            :disabled="form.processing"
                        >
                            <Spinner
                                v-if="form.processing"
                                class="mr-2 h-4 w-4 animate-spin"
                            />
                            Masuk
                        </Button>
                    </form>
                </div>

                <!-- Footer Mobile -->
                <div class="pt-4 text-center lg:hidden">
                    <p class="text-xs text-muted-foreground">
                        © 2026 UNGGUL ANGGARAN — Yayasan Dharma Husada Insani
                        Garut
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- TOAST VUE-SONNER -->
    <Toaster position="top-right" rich-colors close-button :duration="6000" />
</template>

<script setup lang="ts">
import InputError from '@/components/InputError.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { request } from '@/routes/password';
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { EyeIcon, EyeOffIcon, Lock, User } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

defineProps<{
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}>();

const page = usePage();

/**
 * Toggle visibilitas password
 */
const passwordVisible = ref(false);

const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value;
};

/**
 * Form Inertia
 */
const form = useForm({
    login: '',
    password: '',
    remember: false,
});

/**
 * Validasi Sisi Klien
 */
const validateForm = () => {
    form.clearErrors();
    let valid = true;

    if (!form.login) {
        form.setError('login', 'Username atau email wajib diisi');
        valid = false;
    }

    if (!form.password) {
        form.setError('password', 'Password wajib diisi');
        valid = false;
    }

    return valid;
};

/**
 * Submit Handler
 */
const submit = () => {
    if (!validateForm()) return;

    form.post('/login', {
        onFinish: () => {
            form.reset('password');
        },
    });
};

/**
 * Hapus error saat input berubah
 */
watch(
    () => form.login,
    () => form.clearErrors('login'),
);
watch(
    () => form.password,
    () => form.clearErrors('password'),
);

// ========== TOAST / FLASH HANDLING ==========
/**
 * Memproses flash message dari Inertia
 */
const handleFlashToast = (flash: any) => {
    if (!flash) return;

    if (flash.sonner) {
        const { type = 'warning', title, message } = flash.sonner;
        const toastMethod = (toast as any)[type] || toast.info;
        toastMethod(title || 'Pemberitahuan', {
            description: message,
            duration: 6000,
            position: 'top-right',
        });
    }

    if (flash.error) {
        toast.error(flash.error, { duration: 6000, position: 'top-right' });
    }
    if (flash.success) {
        toast.success(flash.success, { duration: 4000, position: 'top-right' });
    }
    if (flash.warning) {
        toast.warning(flash.warning, { duration: 5000, position: 'top-right' });
    }
    if (flash.info) {
        toast.info(flash.info, { duration: 4000, position: 'top-right' });
    }
};

/**
 * Cek URL query string untuk toast (dari middleware session expired)
 */
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('expired') === '1') {
        const type = urlParams.get('type') || 'warning';
        const title = urlParams.get('title') || 'Session Expired';
        const message =
            urlParams.get('message') || 'Sesi Anda telah berakhir.';

        const toastMethod = (toast as any)[type] || toast.warning;

        // Delay kecil agar toast muncul setelah halaman selesai render
        setTimeout(() => {
            toastMethod(title, {
                description: message,
                duration: 6000,
                position: 'top-right',
                important: true,
            });
        }, 300);

        // Bersihkan URL agar tidak muncul lagi saat refresh
        window.history.replaceState({}, '', '/login');
    }
});

/**
 * Watch flash messages dari Inertia (untuk flash selain session expired)
 */
watch(
    () => page.props.flash,
    (newFlash) => {
        handleFlashToast(newFlash);
    },
    { deep: true, immediate: true },
);
// ========== END TOAST / FLASH HANDLING ==========
</script>

<style scoped>
input:focus {
    transition: all 0.2s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.w-full.max-w-md {
    animation: fadeInUp 0.5s ease-out;
}

@media (max-width: 1024px) {
    .w-full.max-w-md {
        animation: fadeInUp 0.3s ease-out;
    }
}
</style>