<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { selectedCity, avitoCookies, query } from '$lib/stores';
  import { Search, HelpCircle } from 'lucide-svelte';
  import type { SearchParams } from '$lib/types';
  import SearchFilters from './SearchFilters.svelte';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let searchInput: HTMLInputElement;
  let filtersContainer: HTMLDivElement;
  let suggestionsContainer: HTMLDivElement;
  let suggestions: any[] = [];
  let showSuggestions = false;
  let showFilters = false;
  let searchParams: SearchParams = {};

  onMount(() => {
    const urlParams = new URLSearchParams($page.url.search);
    $query = urlParams.get('q') || '';
    searchParams = {
      name: $query,
      categoryId: urlParams.get('categoryId') ? parseInt(urlParams.get('categoryId')!) : undefined,
      verticalCategoryId: urlParams.get('verticalCategoryId') ? parseInt(urlParams.get('verticalCategoryId')!) : undefined,
      pmin: urlParams.get('pmin') ? parseInt(urlParams.get('pmin')!) : undefined,
      pmax: urlParams.get('pmax') ? parseInt(urlParams.get('pmax')!) : undefined,
      d: urlParams.get('d') === '1' ? 1 : undefined
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  function handleClickOutside(event: MouseEvent) {
    if (filtersContainer && !filtersContainer.contains(event.target as Node)) {
      showFilters = false;
    }
    if (suggestionsContainer && !suggestionsContainer.contains(event.target as Node)) {
      showSuggestions = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      showFilters = false;
      showSuggestions = false;
    }
  }

  let suggestionsTimeout: NodeJS.Timeout;
  async function handleInput() {
    if (suggestionsTimeout) {
      clearTimeout(suggestionsTimeout);
    }

    showFilters = false;
    suggestionsTimeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: $query,
            locationId: $selectedCity.id,
            cookies: $avitoCookies
          })
        });
        
        const data = await response.json();
        suggestions = data.result || [];
        showSuggestions = true;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300);
  }

  function handleSuggestionClick(suggestion: any) {
    $query = suggestion.text_item.title;
    showSuggestions = false;
    handleSearch();
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if ($query) {
      params.set('q', $query);
      searchParams.name = $query;
    }
    if (searchParams.categoryId) {
      params.set('categoryId', searchParams.categoryId.toString());
    }
    if (searchParams.verticalCategoryId) {
      params.set('verticalCategoryId', searchParams.verticalCategoryId.toString());
    }
    if (searchParams.pmin) {
      params.set('pmin', searchParams.pmin.toString());
    }
    if (searchParams.pmax) {
      params.set('pmax', searchParams.pmax.toString());
    }
    if (searchParams.d) {
      params.set('d', searchParams.d.toString());
    }

    showSuggestions = false;
    showFilters = false;
    goto(`/?${params.toString()}`);
  }

  function handleFiltersChange(event: CustomEvent<SearchParams>) {
    searchParams = event.detail;
    handleSearch();
  }

  function handleSearchFocus() {
    showFilters = false;
    handleInput();
  }

  function toggleFilters() {
    showFilters = !showFilters;
    if (showFilters) {
      showSuggestions = false;
    }
  }
</script>

<div class="relative w-full" bind:this={filtersContainer}>
  <div class="relative">
    <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
      bind:this={searchInput}
      type="text"
      placeholder="Поиск по объявлениям"
      bind:value={$query}
      on:input={handleInput}
      on:focus={handleSearchFocus}
      on:keydown={(e) => e.key === 'Enter' && handleSearch()}
      class="w-full pl-10 pr-20 py-3 rounded-full border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    />

    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-primary"
      on:click|stopPropagation={toggleFilters}
    >
      Фильтры
    </button>
    <div class="absolute right-20 top-1/2 -translate-y-1/2 mr-2 group" tabindex="0">
      <HelpCircle class="w-5 h-5 text-muted-foreground cursor-pointer" />
      <div class="pointer-events-none absolute top-full z-50 mt-2 w-max min-w-[220px] max-w-[310px] translate-x-[-26.7vh]  rounded-xl bg-popover px-4 py-2 text-xs text-muted-foreground shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 ring-1">
        Чтобы исключить слово из поиска, добавьте <span class="font-mono">--слово</span><br/>
        <span class="text-muted-foreground/70">Например: iphone --чехол</span>
      </div>
    </div>
  </div>
  
  {#if showSuggestions && suggestions.length > 0}
    <div 
      bind:this={suggestionsContainer}
      class="absolute top-full left-0 right-0 md:mt-2 mt-4 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-50"
      in:fly={{ y: -10, duration: 200, opacity: 1, easing: cubicOut }}
      out:fly={{ y: -10, duration: 150, opacity: 0, easing: cubicOut }}
    >
      {#each suggestions as suggestion}
        <button
          class="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
          on:click={() => handleSuggestionClick(suggestion)}
        >
          {#if suggestion.text_item.icon}
            <img
              src={suggestion.text_item.icon.server.uri}
              alt=""
              width="20"
              height="20"
              class="flex-shrink-0 dark:invert"
            />
          {/if}
          <span class="truncate">{suggestion.text_item.title}</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if showFilters}
    <div 
      class="absolute top-full left-0 right-0 md:mt-2 mt-4 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-50"
      in:fly={{ y: -10, duration: 200, opacity: 1, easing: cubicOut }}
      out:fly={{ y: -10, duration: 150, opacity: 0, easing: cubicOut }}
      on:click|stopPropagation
    >
      <div class="p-4">
        <SearchFilters {searchParams} on:change={handleFiltersChange} />
      </div>
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .search-input:focus {
    border-color: #00aaff;
  }

  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-top: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .suggestion-item:hover {
    background-color: #f5f5f5;
  }

  .suggestion-icon {
    margin-right: 12px;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    .search-container {
      max-width: 100%;
    }

    .search-input {
      font-size: 14px;
      padding: 10px 14px;
    }
  }
</style> 