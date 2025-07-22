<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export let images: Array<{
    '1280x960': string;
    '180x135': string;
    '256x192': string;
    '640x480': string;
    originalSize: {
      width: number;
      height: number;
    };
  }>;
  export let currentIndex: number = 0;

  const dispatch = createEventDispatcher();
  let container: HTMLDivElement;

  onMount(() => {
    container?.focus();
  });

  function close() {
    dispatch('close');
  }

  function next() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
    }
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    } else if (event.key === 'ArrowRight') {
      event.stopPropagation();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.stopPropagation();
      prev();
    }
  }
</script>

<div 
  bind:this={container}
  class="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm outline-none" 
  on:click|self={close}
  on:keydown={handleKeydown}
  tabindex="0"
  transition:fly={{ duration: 200, opacity: 0 }}
>
  <div class="relative h-full w-full flex items-center justify-center p-4">
    <button
      class="absolute right-4 top-4 h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 z-10"
      on:click={close}
    >
      <X class="h-5 w-5" />
      <span class="sr-only">Закрыть</span>
    </button>

    {#if images.length > 1}
      {#if currentIndex > 0}
        <button
          class="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          on:click|stopPropagation={prev}
        >
          <ChevronLeft class="h-5 w-5" />
          <span class="sr-only">Предыдущее фото</span>
        </button>
      {/if}

      {#if currentIndex < images.length - 1}
        <button
          class="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          on:click|stopPropagation={next}
        >
          <ChevronRight class="h-5 w-5" />
          <span class="sr-only">Следующее фото</span>
        </button>
      {/if}

      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary/80 px-3 py-1 text-sm text-primary-foreground backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>
    {/if}

    <img
      src={images[currentIndex]['1280x960']}
      alt="Фото к отзыву"
      class="max-h-full max-w-full object-contain"
      on:click|stopPropagation
    />
  </div>
</div> 