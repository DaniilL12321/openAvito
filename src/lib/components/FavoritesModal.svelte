<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { favorites, isFavoritesLoading, favoritesError, avitoCookies, showInactiveItems } from '$lib/stores';
  import type { AvitoItem } from '$lib/types';
  import { X, Heart, MapPin, AlertCircle, Image } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import ItemModal from './ItemModal.svelte';

  const dispatch = createEventDispatcher();
  let currentPage = 1;
  let hasMore = true;
  let selectedItem: AvitoItem | null = null;
  let imageErrors: Record<string, boolean> = {};
  let modalContent: HTMLDivElement;

  function handleScroll(e: Event | { target: HTMLDivElement }) {
    const target = e.target as HTMLDivElement;
    const threshold = 100;

    if (!$isFavoritesLoading && hasMore) {
      if (target.scrollHeight <= target.clientHeight) {
        loadFavorites(currentPage + 1);
      }
      else if (target.scrollHeight - (target.scrollTop + target.clientHeight) < threshold) {
        loadFavorites(currentPage + 1);
      }
    }
  }

  $: if (filteredFavorites.length > 0 && modalContent) {
    handleScroll({ target: modalContent });
  }

  function adaptItem(item: any): AvitoItem {
    const images = item.images ? [
      {
        '208x208': item.images.main['208x208'] || item.images.main['catalog'],
        '236x236': item.images.main['236x236'] || item.images.main['catalog'],
        '240x240': item.images.main['240x240'] || item.images.main['catalog'],
        '416x416': item.images.main['416x416'] || item.images.main['catalog'],
        '432x432': item.images.main['432x432'] || item.images.main['catalog'],
        '472x472': item.images.main['472x472'] || item.images.main['catalog'],
        '864x864': item.images.main['864x864'] || item.images.main['web']
      }
    ] : [];

    return {
      id: item.id,
      category: {
        id: item.categoryId,
        slug: ''
      },
      images,
      imagesAlt: item.title || '',
      imagesCount: item.images?.count || 0,
      location: {
        id: 0,
        name: item.address || '',
        namePrepositional: ''
      },
      locationId: 0,
      priceDetailed: {
        postfix: '',
        string: item.price?.formattedValue || '',
        value: 0,
        valueOld: '',
        wasLowered: false
      },
      title: item.title || '',
      urlPath: item.uri || '',
      isFavorite: true,
      isActive: item.isActive,
      isDeleted: item.isDeleted
    };
  }

  async function loadFavorites(page = 1) {
    if ($isFavoritesLoading || !hasMore) return;
    
    $isFavoritesLoading = true;
    $favoritesError = null;
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'list',
          cookies: $avitoCookies,
          page
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        $favoritesError = 'Ошибка загрузки избранного';
        return;
      }

      if (!data.items?.length) {
        hasMore = false;
      } else {
        const adaptedItems = data.items.map(adaptItem);
        if (page === 1) {
          $favorites = adaptedItems;
        } else {
          $favorites = [...$favorites, ...adaptedItems];
        }
        currentPage = page;
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      $favoritesError = 'Ошибка загрузки избранного';
    } finally {
      $isFavoritesLoading = false;
    }
  }

  function close() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }

  async function toggleFavorite(item: AvitoItem) {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'remove',
          ids: [item.id],
          cookies: $avitoCookies
        })
      });

      const data = await response.json();
      
      if (data.success) {
        $favorites = $favorites.filter(f => f.id !== item.id);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  function handleImageError(itemId: number) {
    imageErrors[itemId] = true;
  }

  onMount(() => {
    loadFavorites();
  });

  $: filteredFavorites = $showInactiveItems 
    ? $favorites.filter(item => item.images && item.images.length > 0)
    : $favorites.filter(item => item.isActive && item.images && item.images.length > 0);
  $: activeCount = $favorites.filter(item => item.isActive).length;
  $: inactiveCount = $favorites.length - activeCount;
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" on:click={close} transition:fly={{ duration: 200, opacity: 0 }}>
  <div
    bind:this={modalContent}
    on:scroll={handleScroll}
    class="fixed bottom-0 z-50 h-[85vh] w-full overflow-y-auto border bg-background p-0 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:min-h-[400px] md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-6xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
    on:click|stopPropagation
    transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
  >
    <div class="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-30">
      <div class="px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-4 lg:px-8 lg:pt-8 lg:pb-6">
        <div class="relative flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 md:gap-3">
            <Heart class="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
            <div>
              <h2 class="text-lg font-semibold leading-tight tracking-tight md:text-2xl">
                Избранное
                {#if activeCount > 0}
                  <p class="text-xs text-muted-foreground md:text-sm">
                    {activeCount} {activeCount === 1 ? 'активное' : 'активных'}
                  </p>
                {/if}
              </h2>
            </div>
          </div>

          <div class="flex items-center gap-2">
            {#if inactiveCount > 0}
              <button
                class="inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-secondary px-2 py-1.5 md:px-3 text-xs md:text-sm font-medium text-secondary-foreground hover:bg-secondary/80 flex-shrink-0"
                on:click={() => $showInactiveItems = !$showInactiveItems}
              >
                <AlertCircle class="h-3.5 w-3.5 md:h-4 md:w-4" />
                {#if $showInactiveItems}
                  <span>Скрыть закрытые</span>
                {:else}
                  <span>Показать закрытые</span>
                  <span>({inactiveCount})</span>
                {/if}
              </button>
            {/if}
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

    <div class="p-4 md:p-6 lg:p-8">
      <div class="space-y-6">
        {#if $favoritesError}
          <div class="rounded-xl bg-destructive/10 p-4 text-destructive">
            {$favoritesError}
            <button
              class="ml-2 rounded-full bg-destructive px-3 py-1 text-destructive-foreground hover:bg-destructive/90"
              on:click={() => loadFavorites(1)}
            >
              Попробовать снова
            </button>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {#each filteredFavorites as item (item.id)}
            <div class="group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <a href="https://www.avito.ru{item.urlPath}" on:click|preventDefault={() => selectedItem = item} class="block">
                <div class="relative aspect-square overflow-hidden">
                  {#if imageErrors[item.id] || item.isDeleted}
                    <div class="absolute inset-0 flex flex-col items-center justify-center bg-card">
                      <AlertCircle class="mb-2 h-8 w-8 text-muted-foreground" />
                      <p class="text-xs font-medium text-muted-foreground">Удалено</p>
                    </div>
                  {:else}
                    <img
                      src={item.images[0]['432x432']}
                      alt={item.imagesAlt}
                      loading="lazy"
                      class="h-full w-full object-cover transition-transform group-hover:scale-105 {!item.isActive && 'opacity-50'}"
                      on:error={() => handleImageError(item.id)}
                    />
                    {#if !item.isActive}
                      <span class="absolute left-2 top-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        Закрыто
                      </span>
                    {/if}
                  {/if}
                  <button
                    class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                    on:click|stopPropagation={() => toggleFavorite(item)}
                  >
                    <Heart class="h-4 w-4" fill="currentColor" />
                    <span class="sr-only">Удалить из избранного</span>
                  </button>
                </div>
                <div class="p-4">
                  <h3 class="line-clamp-2 text-sm font-medium {(!item.isActive || imageErrors[item.id] || item.isDeleted) && 'text-muted-foreground'}">{item.title}</h3>
                  <p class="mt-2 text-lg font-bold {(!item.isActive || imageErrors[item.id] || item.isDeleted) && 'text-muted-foreground'}">{item.priceDetailed.string} ₽</p>
                  {#if item.location?.name}
                    <p class="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin class="h-4 w-4" />
                      {item.location.name}
                    </p>
                  {/if}
                </div>
              </a>
            </div>
          {/each}
        </div>

        {#if $isFavoritesLoading}
          <div class="py-4 text-center text-sm text-muted-foreground">Загрузка...</div>
        {/if}

        {#if !$isFavoritesLoading && !hasMore && filteredFavorites.length === 0}
          <div class="py-4 text-center text-sm text-muted-foreground">
            {#if $favorites.length > 0}
              {$showInactiveItems ? 'У вас пока нет избранных объявлений' : 'Все избранные объявления закрыты'}
            {:else}
              У вас пока нет избранных объявлений
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

{#if selectedItem}
  <ItemModal item={selectedItem} on:close={() => selectedItem = null} />
{/if} 

<style>
  .image-error {
    @apply bg-card;
  }
  
  .image-error::before {
    content: '';
    @apply absolute inset-0 flex items-center justify-center bg-card;
  }

  .image-error img {
    @apply hidden;
  }

  .image-error::after {
    content: '🖼️';
    @apply absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground;
  }
</style> 