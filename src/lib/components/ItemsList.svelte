<script lang="ts">
  import type { AvitoItem } from '$lib/types';
  import ItemCard from './ItemCard.svelte';
  import { onMount } from 'svelte';
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { page } from '$app/stores';

  export let title: string;
  export let initialItems: AvitoItem[] = [];
  export let items: AvitoItem[] = initialItems;
  export let loading = false;
  export let isSearch = false;

  let offset = 0;
  let hasMore = true;
  let error: string | null = null;
  let recommendations: AvitoItem[] = [];
  let recommendationsLoaded = false;

  $: {
    items = initialItems;
    offset = initialItems.length;
    hasMore = true;
    recommendations = [];
    recommendationsLoaded = false;
  }

  $: searchParams = $page.url.searchParams;

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams(searchParams);
      const nextPage = Math.floor(offset / 50) + 2;
      let url = '/api/items';
      let isSearchMode = false;
      if (isSearch) {
        url = '/api/search';
        isSearchMode = true;
        
        const searchQuery = params.get('q');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: $avitoCookies,
            params: {
              name: searchQuery,
              locationId: $selectedCity.id,
              categoryId: params.get('categoryId') ? parseInt(params.get('categoryId')!) : undefined,
              verticalCategoryId: params.get('verticalCategoryId') ? parseInt(params.get('verticalCategoryId')!) : undefined,
              pmin: params.get('pmin') ? parseInt(params.get('pmin')!) : undefined,
              pmax: params.get('pmax') ? parseInt(params.get('pmax')!) : undefined,
              d: params.get('d') === '1' ? 1 : undefined,
              view: 'gallery',
              p: nextPage
            }
        })
      });
      const data = await response.json();
      if (data.error) {
        error = 'Ошибка загрузки объявлений. Возможно, нужно обновить куки.';
        return;
      }
      if (!data.items?.length) {
        hasMore = false;
          if (!recommendationsLoaded) {
          await loadRecommendations();
        }
      } else {
        const newItems = data.items.filter((newItem: AvitoItem) => 
          !items.some(existingItem => existingItem.id === newItem.id)
        );
        if (newItems.length === 0) {
          hasMore = false;
            if (!recommendationsLoaded) {
            await loadRecommendations();
          }
        } else {
          items = [...items, ...newItems];
          offset += data.items.length;
          }
        }
      } else {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cookies: $avitoCookies,
            params: {
              deeplink: params.get('deeplink'),
              locationId: $selectedCity.id,
              p: nextPage
            }
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
      }
    } catch (err) {
      console.error('Error loading more items:', err);
      error = 'Ошибка загрузки объявлений. Возможно, нужно обновить куки.';
      hasMore = false;
    } finally {
      loading = false;
    }
  }

  async function loadRecommendations() {
    recommendationsLoaded = true;
    try {
      const params = new URLSearchParams(searchParams);
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
      if (data.items?.length) {
        recommendations = data.items;
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
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

<section class="space-y-4 md:space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold tracking-tight md:text-2xl">{title}</h2>
  </div>

  {#if error}
    <div class="rounded-xl bg-destructive/10 p-4 text-destructive">
      {error}
      <button
        class="ml-2 rounded-full bg-destructive px-3 py-1 text-destructive-foreground hover:bg-destructive/90"
        on:click={() => { error = null; hasMore = true; loadMore(); }}
      >
        Попробовать снова
      </button>
    </div>
  {/if}

  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
    <div class="py-4 text-center text-sm text-muted-foreground">Загрузка...</div>
  {/if}

  {#if !hasMore && !error && isSearch && recommendations.length > 0}
    <div class="pt-8">
      <h3 class="text-lg font-semibold mb-4">Вам также может понравиться</h3>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {#each recommendations.filter(item => 
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
    </div>
  {/if}

  {#if !hasMore && !error && !isSearch}
    <div class="py-4 text-center text-sm text-muted-foreground">Больше объявлений нет</div>
  {/if}
</section> 