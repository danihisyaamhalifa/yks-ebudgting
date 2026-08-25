<script setup lang="ts">
import InputError from '@/components/InputError.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox'; // Pastikan komponen ini ada
import { request } from '@/routes/password';
import { Head, useForm } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

import { EyeIcon, EyeOffIcon, Lock, User, Shield } from 'lucide-vue-next';

defineProps<{
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}>();

/**
 * password visibility
 */
const passwordVisible = ref(false);

const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value;
};

/**
 * inertia form
 */
const form = useForm({
    login: '',
    password: '',
    remember: false, // Tambahan field remember
});

/**
 * frontend validation
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
 * submit
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
 * auto clear error
 */
watch(() => form.login, () => form.clearErrors('login'));
watch(() => form.password, () => form.clearErrors('password'));
</script>

<template>
    <Head title="Login" />

    <div
        class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4"
    >
        <div class="w-full max-w-md">

            <!-- LOGO -->
            <div class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <img
                        src="/assets/img/logo-yayasan.png"
                        alt="UNGGUL ANGGARAN"
                        class="h-16 w-auto"
                    />
                </div>

                <h1 class="text-2xl font-bold tracking-wider uppercase">
                    UNGGUL ANGGARAN
                </h1>

                <p class="text-sm text-muted-foreground mt-1">
                    Sistem Administrasi Rencana Anggaran Terpadu
                </p>
            </div>

            <!-- CARD LOGIN -->
            <div
                class="bg-white dark:bg-slate-900 border border-border shadow-xl rounded-2xl p-8"
            >
                <form @submit.prevent="submit" class="space-y-6">

                    <!-- Username -->
                    <div class="space-y-2">
                        <Label for="login">Username / Email</Label>

                        <div class="relative">
                            <User
                                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            />

                            <Input
                                id="login"
                                v-model="form.login"
                                name="login"
                                placeholder="masukkan username atau email"
                                class="pl-10 h-11"
                                autofocus
                                autocomplete="off"
                            />
                        </div>

                        <InputError :message="form.errors.login" />
                    </div>

                    <!-- Password -->
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <Label for="password">Password</Label>

                            <TextLink
                                v-if="canResetPassword"
                                :href="request()"
                                class="text-xs"
                            >
                                Lupa password?
                            </TextLink>
                        </div>

                        <div class="relative">
                            <Lock
                                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            />

                            <Input
                                id="password"
                                v-model="form.password"
                                :type="passwordVisible ? 'text' : 'password'"
                                name="password"
                                placeholder="masukkan password"
                                class="pl-10 pr-10 h-11"
                                autocomplete="new-password"
                            />

                            <button
                                type="button"
                                @click="togglePasswordVisibility"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <EyeIcon v-if="!passwordVisible" class="h-4 w-4" />
                                <EyeOffIcon v-else class="h-4 w-4" />
                            </button>
                        </div>

                        <InputError :message="form.errors.password" />
                    </div>

                    <!-- Remember Me -->
                    <div class="flex items-center space-x-2">
                        <Checkbox 
                            id="remember" 
                            :checked="form.remember" 
                            @update:checked="(val) => form.remember = val" 
                        />
                        <label
                            for="remember"
                            class="text-sm font-medium leading-none cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Ingat saya
                        </label>
                    </div>

                    <!-- Button -->
                    <Button
                        type="submit"
                        class="w-full h-11 text-sm font-semibold"
                        :disabled="form.processing"
                    >
                        <Spinner
                            v-if="form.processing"
                            class="mr-2 h-4 w-4"
                        />
                        Masuk
                    </Button>

                    <!-- Security Info -->
                    <div class="text-center pt-4 border-t">
                        <div
                            class="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                        >
                            <Shield class="h-3 w-3" />
                            Sistem aman dan terenkripsi
                        </div>
                    </div>

                </form>
            </div>

            <!-- FOOTER -->
            <div class="text-center mt-6 text-xs text-muted-foreground">
                © 2026 UNGGUL ANGGARAN - Yayasan Karsa Husada
            </div>

        </div>
    </div>
</template>
