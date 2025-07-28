<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { X, Search } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { browser } from '$app/environment';
  import { invalidateAll } from '$app/navigation';

  const dispatch = createEventDispatcher();
  let modalContainer: HTMLDivElement;
  let searchInput: HTMLInputElement;
  let searchQuery = '';
  let loading = false;
  let cities: Array<{
    names: { 1: string };
    id: number;
    parent?: { names: { 1: string }; id: number };
  }> = [];

  async function loadCities() {
    if (!browser || loading) return;
    
    loading = true;
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId: $selectedCity.id,
          query: searchQuery,
          cookies: $avitoCookies
        })
      });
      const data = await response.json();
      cities = data.result?.locations || [];
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      loading = false;
    }
  }

  let searchDebounce: NodeJS.Timeout;
  $: {
    if (searchQuery !== undefined && browser) {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
      searchDebounce = setTimeout(loadCities, 300);
    }
  }

  function close() {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  }

  function selectCity(city: typeof cities[0]) {
    selectedCity.set({
      id: city.id,
      name: city.names[1],
      url: city.names[1] === 'Все регионы' ? '' : city.names[1].toLowerCase().replace(/[^а-яё-]/g, '')
    });
    localStorage.setItem('selectedCityId', city.id.toString());
    close();
    invalidateAll();
  }
</script>

<div 
  bind:this={modalContainer}
  class="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm outline-none" 
  on:click|self={close}
  on:keydown={handleKeydown}
  tabindex="0"
  transition:fly={{ duration: 200, opacity: 0 }}
>
  <div
    class="fixed bottom-0 z-[70] h-[85vh] w-full overflow-y-auto border bg-background p-0 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
    on:click|stopPropagation
    transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
  >
    <div class="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-30">
      <div class="px-4 py-3 md:px-6 md:py-4">
        <div class="relative flex items-center justify-between gap-2">
          <h2 class="text-lg font-semibold leading-tight tracking-tight md:text-2xl">Выбор города</h2>
          <button
            class="hidden h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:flex"
            on:click={close}
          >
            <X class="h-5 w-5" />
            <span class="sr-only">Закрыть</span>
          </button>
        </div>
      </div>
    </div>

    <div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:hidden">
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        on:click={close}
      >
        <X class="h-5 w-5" />
        <span class="sr-only">Закрыть</span>
      </button>
    </div>

    <div class="p-4 md:p-6">
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          bind:this={searchInput}
          type="text"
          placeholder="Поиск города"
          bind:value={searchQuery}
          class="h-11 w-full rounded-full border bg-background pl-11 pr-4 text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div class="space-y-2">
        {#if loading}
          <div class="px-3 py-2 text-sm text-muted-foreground">
            Загрузка...
          </div>
        {:else if cities.length === 0}
          <div class="px-3 py-2 text-sm text-muted-foreground">
            Ничего не найдено
          </div>
        {:else}
          {#each cities as city}
            <button
            class="w-full rounded-2xl p-3 text-left transition-colors hover:bg-primary/10 dark:hover:bg-primary/20 {$selectedCity.id === city.id ? 'bg-primary/10 dark:bg-primary/20' : ''}"              on:click={() => selectCity(city)}
            >
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[15px] font-medium">{city.names[1]}</span>
                  {#if city.parent && city.names[1] !== 'Все регионы'}
                    <div class="text-xs text-muted-foreground">{city.parent.names[1]}</div>
                  {/if}
                </div>
                {#if $selectedCity.id === city.id}
                  <span class="text-sm text-primary">Выбран</span>
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div> 