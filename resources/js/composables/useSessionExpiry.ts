import { router, usePage } from '@inertiajs/vue3'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { SessionExpiryInfo } from '@/types'

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

/** Tampilkan peringatan saat sisa waktu sesi <= 1 menit */
const WARN_BEFORE_SECONDS = 60

/** Batasi frekuensi heartbeat ke server (jaga-jaga agar tidak spam) */
const HEARTBEAT_INTERVAL_MS = 60_000

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes} menit ${seconds} detik` : `${seconds} detik`
}

/**
 * Countdown & notifikasi session expiry untuk halaman yang sudah login.
 *
 * - Menghitung mundur sisa waktu sesi (dari shared prop `session_expiry`).
 * - Aktifitas user (mouse/keyboard/scroll) me-reset countdown & mengirim
 *   heartbeat agar last_activity server tetap segar.
 * - Menampilkan toast peringatan saat sisa waktu < 1 menit.
 * - Saat habis, memanggil POST /session-expire; server akan logout &
 *   redirect ke login dengan notifikasi.
 */
export function useSessionExpiry() {
  const page = usePage()

  const info = computed<SessionExpiryInfo | null>(
    () => (page.props.session_expiry as SessionExpiryInfo | null) ?? null,
  )

  const remaining = ref(0)

  let timer: ReturnType<typeof setInterval> | null = null
  let warned = false
  let expiring = false
  let lastHeartbeatAt = 0

  const clearTimer = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  const sendHeartbeat = () => {
    const now = Date.now()
    if (now - lastHeartbeatAt < HEARTBEAT_INTERVAL_MS) return
    lastHeartbeatAt = now

    fetch('/session/heartbeat', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
    })
      .then((response) => {
        // Session ternyata sudah expire di server → ikuti redirect ke login
        if (response.redirected) {
          window.location.href = response.url
        }
      })
      .catch(() => {})
  }

  const expireSession = () => {
    if (expiring) return
    expiring = true
    clearTimer()
    router.post('/session-expire', {}, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => {
        expiring = false
      },
    })
  }

  const resetCountdown = () => {
    if (!info.value || expiring) return
    warned = false
    sendHeartbeat()
    startCountdown(info.value.lifetime_seconds)
  }

  const startCountdown = (fromSeconds: number) => {
    remaining.value = Math.max(0, Math.floor(fromSeconds))
    clearTimer()

    timer = setInterval(() => {
      remaining.value -= 1

      if (remaining.value <= 0) {
        expireSession()
        return
      }

      if (remaining.value <= WARN_BEFORE_SECONDS && !warned) {
        warned = true
        toast.warning('Sesi akan segera berakhir', {
          description: `Sesi Anda akan berakhir dalam ${formatDuration(remaining.value)} karena tidak ada aktivitas. Lanjutkan aktivitas agar tetap masuk.`,
          duration: 60_000,
          position: 'top-right',
          important: true,
          action: {
            label: 'Tetap Masuk',
            onClick: resetCountdown,
          },
        })
      }
    }, 1000)
  }

  const syncFromServer = () => {
    if (!info.value || expiring) return
    warned = false
    startCountdown(info.value.remaining_seconds)
  }

  const onActivity = () => {
    if (!info.value || expiring) return

    // Countdown masih segar → cukup pastikan peringatan bisa muncul lagi nanti
    if (remaining.value >= info.value.lifetime_seconds - 5) {
      warned = false
      return
    }

    resetCountdown()
  }

  onMounted(() => {
    syncFromServer()
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, onActivity, { passive: true })
    })
  })

  watch(() => info.value?.remaining_seconds, syncFromServer)

  onBeforeUnmount(() => {
    clearTimer()
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, onActivity)
    })
  })

  return { remaining, info }
}
