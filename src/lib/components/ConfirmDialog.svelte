<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { portal } from '$lib/actions/portal';
  import { AlertTriangle } from 'lucide-svelte';

  export let title: string;
  export let description: string;
  export let confirmText: string = 'Подтвердить';
  export let cancelText: string = 'Отмена';
  export let destructive: boolean = false;

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  function handleConfirm() {
    dispatch('confirm');
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div use:portal>
  <div 
    class="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm" 
    on:click={handleCancel}
    transition:fly={{ duration: 200, opacity: 0 }}
  >
    <div
      class="fixed left-1/2 top-1/2 z-[80] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-6 rounded-3xl border bg-background p-6 shadow-lg duration-200"
      on:click|stopPropagation
      transition:fly={{ y: -30, duration: 200, opacity: 1, easing: cubicOut }}
    >
      <div class="flex flex-col items-center text-center">
        <div class="mb-4 rounded-full bg-destructive/10 p-4">
          <AlertTriangle class="h-8 w-8 text-destructive" />
        </div>
        <h2 class="text-lg font-semibold">{title}</h2>
        <p class="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          class="px-4 py-2 rounded-xl hover:bg-accent transition-colors text-sm"
          on:click={handleCancel}
        >
          {cancelText}
        </button>
        <button
          class="px-4 py-2 rounded-xl transition-colors text-sm {destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}"
          on:click={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
</div> 