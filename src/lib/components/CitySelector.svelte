<script lang="ts">
  import { cities, selectedCity } from '$lib/stores';
  import type { City } from '$lib/types';
  import { onMount } from 'svelte';
  import { MapPin, Search, ChevronDown, X } from 'lucide-svelte';

  const STORAGE_KEY = 'selectedCityId';
  let isOpen = false;
  let searchQuery = '';
  let filteredCities: City[] = [];
  
  onMount(() => {
    const savedCityId = localStorage.getItem(STORAGE_KEY);
    if (savedCityId) {
      const city = cities.find(c => c.id === parseInt(savedCityId));
      if (city) {
        selectedCity.set(city);
      }
    }
  });

  function handleCityChange(city: City) {
    selectedCity.set(city);
    localStorage.setItem(STORAGE_KEY, city.id.toString());
    isOpen = false;
    searchQuery = '';
  }

  $: {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCities = cities.filter(city => 
        city.name.toLowerCase().includes(query)
      );
    } else {
      filteredCities = cities;
    }
  }
</script>

<div class="relative">
  <button
    class="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 md:w-auto"
    on:click={() => isOpen = !isOpen}
  >
    <MapPin class="h-4 w-4" />
    <span class="truncate">{$selectedCity.name}</span>
    <ChevronDown class="h-4 w-4" />
  </button>

  {#if isOpen}
    <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" on:click={() => isOpen = false} />
    <div
      class="fixed inset-x-0 top-0 z-50 bg-background p-4 shadow-lg md:absolute md:inset-auto md:mt-2 md:min-w-[320px] md:rounded-2xl md:border"
      on:click|stopPropagation
    >
      <div class="mb-4 flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск города"
            bind:value={searchQuery}
            class="w-full rounded-full border bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          class="rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-secondary/80 md:hidden"
          on:click={() => isOpen = false}
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="max-h-[60vh] space-y-1 overflow-y-auto md:max-h-[320px]">
        {#each filteredCities as city}
          <button
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent
              {$selectedCity.id === city.id ? 'bg-accent text-accent-foreground' : 'text-foreground'}"
            on:click={() => handleCityChange(city)}
          >
            <MapPin class="h-4 w-4" />
            {city.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .city-selector {
    margin-top: 10px;
    margin-bottom: 10px;
    padding: 0 20px;
  }

  .cities {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .city-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .city-btn:hover {
    background: #f5f5f5;
  }

  .city-btn.active {
    background: #00aaff;
    color: white;
    border-color: #00aaff;
  }

  @media (max-width: 768px) {
    .city-selector {
      padding: 0 10px;
    }

    .city-btn {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
</style> 