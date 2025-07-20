<script lang="ts">
  import { cities, selectedCity } from '$lib/stores';
  import type { City } from '$lib/types';
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'selectedCityId';
  
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
  }
</script>

<div class="city-selector">
  <div class="cities">
    {#each cities as city}
      <button
        class="city-btn"
        class:active={$selectedCity.id === city.id}
        on:click={() => handleCityChange(city)}
      >
        {city.name}
      </button>
    {/each}
  </div>
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