<script lang="ts">
  import type { AvitoItem } from '$lib/types';
  import CitySelector from '$lib/components/CitySelector.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import ItemsList from '$lib/components/ItemsList.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import FavoritesModal from '$lib/components/FavoritesModal.svelte';
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Heart } from 'lucide-svelte';
  import '../lib/styles/theme.css';

  export let data: { items: AvitoItem[] };
  let currentItems = data.items;
  let mounted = false;
  let error: string | null = null;
  let showFavorites = false;

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

<div class="md:container md:mx-auto">
  <header class="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
    <div class="p-2 md:p-4">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div class="flex items-center justify-between gap-2 md:flex-1">
          <div class="flex items-center gap-4">
            <Logo />
            <CitySelector />
          </div>
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center justify-center rounded-full w-10 h-10 hover:bg-accent hover:text-accent-foreground"
              on:click={() => showFavorites = true}
            >
              <Heart class="h-5 w-5" />
              <span class="sr-only">Избранное</span>
            </button>
            <ThemeToggle />
            <Settings />
          </div>
        </div>
        <div class="md:flex-[2]">
          <SearchBar />
        </div>
      </div>
    </div>
  </header>

  <main class="p-2 md:p-4">
    {#if error}
      <div class="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl">
        {error}
        <button
          class="ml-2 px-3 py-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
          on:click={() => {
            error = null;
            if ($page.url.search) {
              loadSearchItems();
            } else {
              loadCityItems($selectedCity.id);
            }
          }}
        >
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

{#if showFavorites}
  <FavoritesModal on:close={() => showFavorites = false} />
{/if}
