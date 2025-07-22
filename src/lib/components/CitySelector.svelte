<script lang="ts">
  import { cities, selectedCity, avitoCookies } from '$lib/stores';
  import type { City } from '$lib/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { invalidateAll } from '$app/navigation';
  import { MapPin, Search, ChevronDown, X } from 'lucide-svelte';

  const STORAGE_KEY = 'selectedCityId';
  let isOpen = false;
  let searchQuery = '';
  let filteredCities: Array<{
    names: { 1: string };
    id: number;
    parent?: { names: { 1: string }; id: number };
  }> = [];
  let loading = false;
  
  onMount(() => {
    if (browser) {
      const savedCityId = localStorage.getItem(STORAGE_KEY);
      if (savedCityId) {
        loadCity(parseInt(savedCityId));
      }
    }
  });

  async function loadCity(cityId: number) {
    if (!browser) return;
    
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId: cityId,
          query: '',
          cookies: $avitoCookies
        })
      });
      const data = await response.json();
      if (data.result?.locations?.[0]) {
        const city = data.result.locations[0];
        selectedCity.set({
          id: city.id,
          name: city.names[1],
          url: city.names[1] === 'Все регионы' ? '' : city.names[1].toLowerCase().replace(/[^а-яё-]/g, '')
        });
      }
    } catch (error) {
      console.error('Error loading city:', error);
    }
  }

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
      filteredCities = data.result?.locations || [];
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      loading = false;
    }
  }

  function handleCityChange(city: typeof filteredCities[0]) {
    selectedCity.set({
      id: city.id,
      name: city.names[1],
      url: city.names[1] === 'Все регионы' ? '' : city.names[1].toLowerCase().replace(/[^а-яё-]/g, '')
    });
    localStorage.setItem(STORAGE_KEY, city.id.toString());
    isOpen = false;
    searchQuery = '';
    invalidateAll();
  }

  function handleOpen() {
    if (browser) {
      isOpen = true;
      loadCities();
    }
  }

  $: if (isOpen) {
    loadCities();
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

  onMount(() => {
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  });
</script>

<div class="relative">
  <button
    class="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 md:w-auto"
    on:click={handleOpen}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    type="button"
  >
    <MapPin class="h-4 w-4" />
    <span class="truncate">{$selectedCity.name}</span>
    <ChevronDown class="h-4 w-4" />
  </button>

  {#if isOpen}
    <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" on:click|preventDefault={() => isOpen = false} />
    <div
      class="fixed inset-x-0 top-0 z-50 bg-background p-4 shadow-lg md:absolute md:inset-auto md:mt-2 md:min-w-[320px] md:rounded-2xl md:border"
      on:click|stopPropagation
      role="listbox"
      aria-label="Выберите город"
    >
      <div class="mb-4 flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск города"
            bind:value={searchQuery}
            class="w-full rounded-full border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Поиск города"
          />
        </div>
        <button
          class="rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-secondary/80 md:hidden"
          on:click|preventDefault={() => isOpen = false}
          type="button"
          aria-label="Закрыть"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="max-h-[60vh] space-y-1 overflow-y-auto md:max-h-[320px]">
        {#if loading}
          <div class="px-3 py-2 text-sm text-muted-foreground" role="status">
            Загрузка...
          </div>
        {:else if filteredCities.length === 0}
          <div class="px-3 py-2 text-sm text-muted-foreground" role="status">
            Ничего не найдено
          </div>
        {:else}
          {#each filteredCities as city}
            <button
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent
                {$selectedCity.id === city.id ? 'bg-accent text-accent-foreground' : 'text-foreground'}"
              on:click={() => handleCityChange(city)}
              role="option"
              aria-selected={$selectedCity.id === city.id}
              type="button"
            >
              <MapPin class="h-4 w-4" />
              <div>
                <div>{city.names[1]}</div>
                {#if city.parent && city.names[1] !== 'Все регионы'}
                  <div class="text-xs text-muted-foreground">{city.parent.names[1]}</div>
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  
</style> 