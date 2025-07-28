<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Check, X, AlertTriangle, Info } from 'lucide-svelte';
  import { portal } from '$lib/actions/portal';

  export let type: 'success' | 'error' | 'info' = 'success';
  export let message: string;
  export let duration = 3000;

  let show = true;

  const icons = {
    success: Check,
    error: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-destructive text-destructive-foreground',
    info: 'bg-primary text-primary-foreground'
  };

  const Icon = icons[type];
  const colorClass = colors[type];

  if (duration > 0) {
    setTimeout(() => {
      show = false;
    }, duration);
  }
</script>

{#if show}
  <div use:portal>
    <div 
      class="fixed left-1/2 z-[100] w-full max-w-sm -translate-x-1/2 px-4 md:px-0"
      class:bottom-24={window.innerWidth < 768}
      class:top-6={window.innerWidth >= 768}
      transition:fade={{ duration: 200 }}
    >
      <div
        class="flex items-center gap-3 rounded-2xl p-4 shadow-lg {colorClass}"
        transition:fly={{ 
          y: window.innerWidth < 768 ? 50 : -50, 
          duration: 300, 
          opacity: 1,
          easing: cubicOut 
        }}
      >
        <Icon class="h-5 w-5" />
        <p class="flex-1 text-sm font-medium">{message}</p>
        <button
          class="rounded-full p-1 hover:bg-white/10 transition-colors"
          on:click={() => show = false}
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Закрыть</span>
        </button>
      </div>
    </div>
  </div>
{/if} 