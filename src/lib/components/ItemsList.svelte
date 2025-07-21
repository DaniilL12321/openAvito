<script lang="ts">
  import type { AvitoItem } from '$lib/types';
  import ItemCard from './ItemCard.svelte';
  import { onMount } from 'svelte';
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { page } from '$app/stores';

  export let title: string;
  export let initialItems: AvitoItem[] = [];

  let loading = false;
  let offset = 0;
  let hasMore = true;
  let items: AvitoItem[] = [];
  let error: string | null = null;

  $: {
    items = initialItems;
    offset = initialItems.length;
    hasMore = true;
  }

  $: searchParams = $page.url.searchParams;

  async function loadMore() {
    if (loading || !hasMore) return;
    
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams(searchParams);
      params.set('offset', offset.toString());
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

      if (!data.items?.length) {
        hasMore = false;
      } else {
        const newItems = data.items.filter((newItem: AvitoItem) => 
          !items.some(existingItem => existingItem.id === newItem.id)
        );
        
        if (newItems.length === 0) {
          hasMore = false;
        } else {
          items = [...items, ...newItems];
          offset += data.items.length;
        }
      }
    } catch (err) {
      console.error('Error loading more items:', err);
      error = 'Ошибка загрузки объявлений. Возможно, нужно обновить куки.';
      hasMore = false;
    } finally {
      loading = false;
    }
  }

  let scrollHandler: () => void;

  function handleScroll() {
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
    
    if (
      window.innerHeight + window.scrollY >= scrollHeight - 1000 &&
      !loading &&
      hasMore
    ) {
      loadMore();
    }
  }

  onMount(() => {
    scrollHandler = handleScroll;
    document.addEventListener('scroll', scrollHandler);
    return () => {
      document.removeEventListener('scroll', scrollHandler);
    };
  });
</script>

<section class="items-section">
  <div class="header">
    <h2>{title}</h2>
  </div>

  {#if error}
    <div class="error">
      {error}
      <button class="retry-button" on:click={() => { error = null; hasMore = true; loadMore(); }}>
        Попробовать снова
      </button>
    </div>
  {/if}

  <div class="grid">
    {#each items.filter(item => 
      !item.bannerId && 
      item && 
      item.title && 
      item.urlPath && 
      item.priceDetailed?.string &&
      (item.images?.length > 0 || item.locationId)
    ) as item (item.id)}
      <ItemCard {item} />
    {/each}
  </div>

  {#if loading}
    <div class="loading">Загрузка...</div>
  {/if}

  {#if !hasMore && !error}
    <div class="no-more">Больше объявлений нет</div>
  {/if}
</section>

<style>
  .items-section {
    margin-bottom: 40px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 20px 20px;
  }

  h2 {
    font-size: 24px;
    color: #2b2b2b;
    margin: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 0 20px;
  }

  .loading,
  .no-more {
    text-align: center;
    padding: 20px;
    color: #666;
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
    .header {
      margin: 0 10px 15px;
    }

    h2 {
      font-size: 20px;
    }

    .grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
      padding: 0 10px;
    }
  }
</style> 