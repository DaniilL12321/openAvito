<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { selectedCity } from '$lib/stores';
  import { Sparkles, Home, X, ChevronRight } from 'lucide-svelte';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    reset: void;
  }>();

  export let title: string;
  export let isSearch: boolean;

  let showReset = false;

  function handleReset() {
    dispatch('reset');
    goto('/', { replaceState: true });
  }
</script>

<div class="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 md:static md:bg-transparent md:backdrop-blur-none md:border-none md:z-auto -mx-2 px-2 md:mx-0 md:px-0">
  <div class="relative">
    <div class="flex items-center gap-3 overflow-x-auto scrollbar-none py-2">
      <!-- Домашняя страница -->
      <button
        class="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 dark:hover:bg-primary/20 text-primary transition-colors"
        on:click={handleReset}
        on:mouseenter={() => showReset = true}
        on:mouseleave={() => showReset = false}
      >
        {#if showReset}
          <div in:scale={{ duration: 200, easing: elasticOut }}>
            <X class="h-4 w-4" />
          </div>
        {:else}
          <div in:scale={{ duration: 200, easing: elasticOut }}>
            <Home class="h-4 w-4" />
          </div>
        {/if}
        <span class="text-sm font-medium">
          {$selectedCity.name}
        </span>
      </button>

      <!-- Разделитель -->
      <ChevronRight class="flex-shrink-0 h-4 w-4 text-muted-foreground" />

      <!-- Текущая страница -->
      <div 
        class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground"
        in:fly={{ x: 20, duration: 300, opacity: 1, easing: cubicOut }}
      >
        <Sparkles class="h-4 w-4" />
        <span class="text-sm font-medium whitespace-nowrap">
          {#if isSearch}
            Поиск: {$page.url.searchParams.get('q')}
          {:else}
            {title}
          {/if}
        </span>
      </div>
    </div>

    <!-- Градиент для скролла -->
    <div class="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />
  </div>
</div>

<style>
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style> 