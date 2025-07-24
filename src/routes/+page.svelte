<script lang="ts">
  import type { AvitoItem, AvitoCategory } from '$lib/types';
  import CitySelector from '$lib/components/CitySelector.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import ItemsList from '$lib/components/ItemsList.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import FavoritesModal from '$lib/components/FavoritesModal.svelte';
  import CategorySelectorModal from '$lib/components/CategorySelectorModal.svelte';
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Heart } from 'lucide-svelte';
  import '../lib/styles/theme.css';

  export let data: { items: AvitoItem[] };
  let currentItems = data.items;
  let mounted = false;
  let error: string | null = null;
  let loading = false;
  let showFavorites = false;
  let showCategorySelector = false;
  let selectedCategory: AvitoCategory | undefined;
  let selectedSubcategory: AvitoCategory | undefined;
  let searchCategory: { name: string; subcategory?: string } = { name: 'Все категории' };

  onMount(() => {
    mounted = true;
    const urlParams = new URLSearchParams($page.url.search);
    const categoryId = urlParams.get('categoryId');
    const categoryName = urlParams.get('categoryName');
    const subcategoryName = urlParams.get('subcategoryName');
    if (categoryId && categoryName) {
      searchCategory = {
        name: categoryName,
        subcategory: subcategoryName || undefined
      };
    }
  });

  $: if (mounted) {
    if ($page.url.search) {
      loadSearchItems();
    } else if ($selectedCity) {
      loadCityItems($selectedCity.id);
    }
  }

  async function loadSearchItems() {
    loading = true;
    error = null;

    try {
      const urlParams = new URLSearchParams($page.url.search);
      const searchQuery = urlParams.get('q');

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: $avitoCookies,
          params: {
            name: searchQuery,
            locationId: $selectedCity.id,
            categoryId: urlParams.get('categoryId') ? parseInt(urlParams.get('categoryId')!) : undefined,
            verticalCategoryId: urlParams.get('verticalCategoryId') ? parseInt(urlParams.get('verticalCategoryId')!) : undefined,
            pmin: urlParams.get('pmin') ? parseInt(urlParams.get('pmin')!) : undefined,
            pmax: urlParams.get('pmax') ? parseInt(urlParams.get('pmax')!) : undefined,
            d: urlParams.get('d') === '1' ? 1 : undefined,
            view: 'gallery',
            p: 1
          }
        })
      });

      const data = await response.json();
      if (data.error) {
        error = 'Ошибка загрузки результатов';
        return;
      }

      currentItems = data.items || [];
    } catch (err) {
      console.error('Error loading search results:', err);
      error = 'Ошибка загрузки результатов';
    } finally {
      loading = false;
    }
  }

  async function loadCategoryItems(category: AvitoCategory, subcategory?: AvitoCategory) {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: $avitoCookies,
          params: {
            deeplink: subcategory?.deeplink || category.deeplink,
            locationId: $selectedCity.id,
            p: 1
          }
        })
      });

      const data = await response.json();
      if (data.error) {
        error = 'Ошибка загрузки объявлений';
        return;
      }

      currentItems = data.items || [];
    } catch (err) {
      console.error('Error loading category items:', err);
      error = 'Ошибка загрузки объявлений';
    } finally {
      loading = false;
    }
  }

  async function loadCityItems(cityId: number) {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: $avitoCookies,
          params: {
            locationId: cityId
          }
        })
      });

      const data = await response.json();
      if (data.error) {
        error = 'Ошибка загрузки объявлений';
        return;
      }

      currentItems = data.items || [];
    } catch (err) {
      console.error('Error loading city items:', err);
      error = 'Ошибка загрузки объявлений';
    } finally {
      loading = false;
    }
  }

  function handleCategorySelect(event: CustomEvent<{ category: AvitoCategory; subcategory?: AvitoCategory }>) {
    const { category, subcategory } = event.detail;
    selectedCategory = category;
    selectedSubcategory = subcategory;
    searchCategory = {
      name: subcategory?.name || category.name
    };
    loadCategoryItems(category, subcategory);
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
          <SearchBar 
            selectedCategory={searchCategory}
            on:categorySelect={() => showCategorySelector = true} 
          />
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
            } else if (selectedCategory) {
              loadCategoryItems(selectedCategory, selectedSubcategory);
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
      title={selectedCategory ? selectedSubcategory?.name || selectedCategory.name : $page.url.search ? "Результаты поиска" : `Объявления в ${$selectedCity.name}`}
      initialItems={currentItems}
      {loading}
      isSearch={$page.url.search ? true : false}
    />
  </main>
</div>

{#if showFavorites}
  <FavoritesModal on:close={() => showFavorites = false} />
{/if}

{#if showCategorySelector}
  <CategorySelectorModal
    bind:showModal={showCategorySelector}
    {selectedCategory}
    {selectedSubcategory}
    on:close={() => showCategorySelector = false}
    on:select={handleCategorySelect}
  />
{/if}
