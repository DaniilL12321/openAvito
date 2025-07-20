<script lang="ts">
  import type { AvitoItem } from '$lib/types';
  import CitySelector from '$lib/components/CitySelector.svelte';
  import ItemsList from '$lib/components/ItemsList.svelte';
  import { selectedCity } from '$lib/stores';
  import { onMount, afterUpdate } from 'svelte';

  export let data: { items: AvitoItem[] };
  let currentItems = data.items;
  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  $: if (mounted && $selectedCity) {
    loadCityItems($selectedCity.id);
  }

  async function loadCityItems(cityId: number) {
    try {
      const response = await fetch(`/api/items?locationId=${cityId}`);
      const data = await response.json();
      if (data.items) {
        currentItems = data.items;
      }
    } catch (error) {
      console.error('Error loading city items:', error);
    }
  }
</script>

<div class="container">
  <header class="sticky-header">
    <CitySelector />
  </header>

  <main>
    <ItemsList 
      title="Объявления в {$selectedCity.name}" 
      initialItems={currentItems} 
    />
  </main>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .sticky-header {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    padding: 10px 0;
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px 0;
    }
  }
</style>
