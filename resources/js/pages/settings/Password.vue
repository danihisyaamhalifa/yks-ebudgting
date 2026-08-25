<script setup lang="ts">
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/InputError.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { edit } from '@/routes/user-password';
import { Form, Head } from '@inertiajs/vue3';

import HeadingSmall from '@/components/HeadingSmall.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import { Eye, EyeOff } from 'lucide-vue-next';
import { computed, ref } from 'vue';

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

// State untuk show/hide password
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Validasi password strength
const isStrongPassword = (password: string): boolean => {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Untuk validasi, kita perlu mengakses form values
// Karena menggunakan Inertia Form, kita bisa menggunakan ref terpisah
const passwordValue = ref('');
const passwordConfirmationValue = ref('');

const passwordValidationMessage = computed(() => {
    if (!passwordValue.value) return '';
    if (passwordValue.value.length < 8)
        return 'Kata sandi harus minimal 8 karakter';
    if (!isStrongPassword(passwordValue.value)) {
        return 'Kata sandi harus mengandung huruf besar, huruf kecil, angka dan karakter khusus';
    }
    return '';
});

const passwordsMatch = computed(() => {
    return passwordValue.value === passwordConfirmationValue.value;
});

const isFormValid = computed(() => {
    return (
        passwordValue.value.trim() !== '' &&
        isStrongPassword(passwordValue.value) &&
        passwordsMatch.value
    );
});
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="Password settings" />

        <SettingsLayout>
            <div class="space-y-6">
                <!-- <HeadingSmall
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                /> -->

                <HeadingSmall
                    title="Update password"
                    description="Pastikan menggunakan kata sandi yang panjang dan acak agar tetap aman"
                />

                <Form
                    v-bind="PasswordController.update.form()"
                    :options="{
                        preserveScroll: true,
                    }"
                    reset-on-success
                    :reset-on-error="[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]"
                    class="space-y-6"
                    v-slot="{ errors, processing, recentlySuccessful }"
                >
                    <!-- Current Password -->
                    <div class="grid gap-2">
                        <Label for="current_password">Current password</Label>
                        <div class="relative">
                            <Input
                                id="current_password"
                                name="current_password"
                                :type="showCurrentPassword ? 'text' : 'password'"
                                class="mt-1 block w-full pr-10"
                                autocomplete="current-password"
                                placeholder="Current password"
                            />
                            <button
                                type="button"
                                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                                @click="showCurrentPassword = !showCurrentPassword"
                                :disabled="processing"
                            >
                                <EyeOff v-if="showCurrentPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <InputError :message="errors.current_password" />
                    </div>

                    <!-- New Password -->
                    <div class="grid gap-2">
                        <Label for="password">New password</Label>
                        <div class="relative">
                            <Input
                                id="password"
                                name="password"
                                :type="showNewPassword ? 'text' : 'password'"
                                class="mt-1 block w-full pr-10"
                                autocomplete="new-password"
                                placeholder="New password"
                                @input="passwordValue = ($event.target as HTMLInputElement).value"
                            />
                            <button
                                type="button"
                                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                                @click="showNewPassword = !showNewPassword"
                                :disabled="processing"
                            >
                                <EyeOff v-if="showNewPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p
                            v-if="passwordValidationMessage"
                            class="text-xs text-red-500"
                        >
                            {{ passwordValidationMessage }}
                        </p>
                        <InputError :message="errors.password" />
                    </div>

                    <!-- Confirm Password -->
                    <div class="grid gap-2">
                        <Label for="password_confirmation">
                            Confirm password
                        </Label>
                        <div class="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                class="mt-1 block w-full pr-10"
                                autocomplete="new-password"
                                placeholder="Confirm password"
                                @input="passwordConfirmationValue = ($event.target as HTMLInputElement).value"
                            />
                            <button
                                type="button"
                                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                                @click="showConfirmPassword = !showConfirmPassword"
                                :disabled="processing"
                            >
                                <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
                                <Eye v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p
                            v-if="passwordConfirmationValue && !passwordsMatch"
                            class="text-xs text-red-500"
                        >
                            Kata sandi tidak cocok
                        </p>
                        <InputError :message="errors.password_confirmation" />
                    </div>

                    <div class="flex items-center gap-4">
                        <Button
                            :disabled="processing || !isFormValid"
                            data-test="update-password-button"
                        >
                            Save password
                        </Button>

                        <Transition
                            enter-active-class="transition ease-in-out"
                            enter-from-class="opacity-0"
                            leave-active-class="transition ease-in-out"
                            leave-to-class="opacity-0"
                        >
                            <p
                                v-show="recentlySuccessful"
                                class="text-sm text-neutral-600"
                            >
                                Saved.
                            </p>
                        </Transition>
                    </div>
                </Form>
            </div>
        </SettingsLayout>
    </AppLayout>
</template>