<script setup lang="ts">
// PWAインストールプロンプト
const deferredPrompt = ref<any>(null)
const showInstallPrompt = ref(false)

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      showInstallPrompt.value = true
    })
  }
})

const installPwa = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    showInstallPrompt.value = false
  }
  deferredPrompt.value = null
}
</script>

<template>
  <div class="app">
    <NuxtPage />
    
    <!-- PWAインストールバナー -->
    <Transition name="slide-up">
      <div v-if="showInstallPrompt" class="install-banner">
        <p>アプリをホーム画面に追加できます</p>
        <div class="install-actions">
          <button class="btn btn-outline" @click="showInstallPrompt = false">
            後で
          </button>
          <button class="btn btn-primary" @click="installPwa">
            インストール
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  min-height: 100dvh;
}

.install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  z-index: 1000;
}

.install-banner p {
  font-size: 0.9rem;
}

.install-actions {
  display: flex;
  gap: var(--space-sm);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
