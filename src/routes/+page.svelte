<script lang="ts">
  import type { AvitoItem } from '$lib/types';
  import CitySelector from '$lib/components/CitySelector.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import ItemsList from '$lib/components/ItemsList.svelte';
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  export let data: { items: AvitoItem[] };
  let currentItems = data.items;
  let mounted = false;
  let error: string | null = null;

  onMount(() => {
    mounted = true;
  });

  $: if (mounted) {
    if ($page.url.search) {
      loadSearchItems();
    } else if ($selectedCity) {
    loadCityItems($selectedCity.id);
    }
  }

  async function loadSearchItems() {
    try {
      const params = new URLSearchParams($page.url.search);
      params.set('locationId', $selectedCity.id.toString());
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: $avitoCookies,
          params: Object.fromEntries(params.entries())
        })
      });
      
      const data = await response.json();
      if (data.error) {
        error = 'Ошибка загрузки объявлений. Возможно, нужно обновить куки.';
        return;
      }
      if (data.items) {
        currentItems = data.items;
        error = null;
      }
    } catch (err) {
      console.error('Error loading search items:', err);
      error = 'Ошибка загрузки объявлений. Возможно, нужно обновить куки.';
    }
  }

  async function loadCityItems(cityId: number) {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: $avitoCookies,
          params: {
            locationId: cityId.toString()
          }
        })
      });
      
      const data = await response.json();
      if (data.error) {
        error = 'Ошибка загрузки объявлений. Возможно, нужно обновить куки.';
        return;
      }
      if (data.items) {
        currentItems = data.items;
        error = null;
      }
    } catch (err) {
      console.error('Error loading city items:', err);
      error = 'Ошибка загрузки объявлений. Возможно, нужно обновить куки.';
    }
  }
</script>

<div class="container">
  <header class="sticky-header">
    <div class="header-content">
    <CitySelector />
      <SearchBar />
      <Settings />
    </div>
  </header>

  <main>
    {#if error}
      <div class="error">
        {error}
        <button class="retry-button" on:click={() => {
          error = null;
          if ($page.url.search) {
            loadSearchItems();
          } else {
            loadCityItems($selectedCity.id);
          }
        }}>
          Попробовать снова
        </button>
      </div>
    {/if}
    
    <ItemsList 
      title={$page.url.search ? "Результаты поиска" : `Объявления в ${$selectedCity.name}`}
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

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 20px;
  }

  .error {
    margin: 20px;
    padding: 16px;
    background: #fff1f0;
    border: 1px solid #ffccc7;
    border-radius: 8px;
    color: #cf1322;
    text-align: center;
  }

  .retry-button {
    margin-left: 12px;
    padding: 6px 12px;
    background: #ff4d4f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .retry-button:hover {
    background: #ff7875;
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px 0;
    }

    .header-content {
      padding: 0 10px;
      flex-direction: column;
      gap: 10px;
    }
  }
</style>
