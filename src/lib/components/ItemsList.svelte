<script lang="ts">
  import type { AvitoItem } from '$lib/types';
  import ItemCard from './ItemCard.svelte';
  import { onMount } from 'svelte';
  import { selectedCity } from '$lib/stores';

  export let title: string;
  export let initialItems: AvitoItem[] = [];

  let loading = false;
  let offset = 0;
  let hasMore = true;
  let items: AvitoItem[] = [];

  // Обновляем список при изменении начальных элементов
  $: {
    items = initialItems;
    offset = initialItems.length;
    hasMore = true;
  }

  async function loadMore() {
    if (loading || !hasMore) return;
    
    loading = true;
    try {
      const response = await fetch(`/api/items?offset=${offset}&locationId=${$selectedCity.id}`);
      const data = await response.json();
      
      if (!data.items?.length) {
        hasMore = false;
      } else {
        // Фильтруем дубликаты по id
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
    } catch (error) {
      console.error('Error loading more items:', error);
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
  <h2>{title}</h2>
  <div class="grid">
    {#each items.filter(item => !item.bannerId) as item (item.id)}
      <ItemCard {item} />
    {/each}
  </div>

  {#if loading}
    <div class="loading">Загрузка...</div>
  {/if}

  {#if !hasMore}
    <div class="no-more">Больше объявлений нет</div>
  {/if}
</section>

<style>
  .items-section {
    margin-bottom: 40px;
  }

  h2 {
    font-size: 24px;
    margin: 0 20px 20px;
    color: #2b2b2b;
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

  @media (max-width: 768px) {
    h2 {
      margin: 0 10px 15px;
      font-size: 20px;
    }

    .grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
      padding: 0 10px;
    }
  }
</style> 