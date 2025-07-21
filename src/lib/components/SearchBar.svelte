<script lang="ts">
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import debounce from 'lodash/debounce';
  import { Search } from 'lucide-svelte';

  let searchQuery = '';
  let suggestions: any[] = [];
  let showSuggestions = false;
  let searchInput: HTMLInputElement;

  const fetchSuggestions = debounce(async (query: string) => {
    if (!query.trim()) {
      suggestions = [];
      return;
    }

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationID: $selectedCity.id,
          query: query.trim(),
          cookies: $avitoCookies
        })
      });

      const data = await response.json();
      suggestions = data.result || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, 300);

  function handleInput() {
    showSuggestions = true;
    fetchSuggestions(searchQuery);
  }

  function handleSuggestionClick(suggestion: any) {
    const uri = suggestion.text_item.uri;
    if (uri) {
      goto(`/?${uri}`);
    }
    showSuggestions = false;
    searchQuery = suggestion.text_item.title;
  }

  function handleClickOutside(event: MouseEvent) {
    if (searchInput && !searchInput.contains(event.target as Node)) {
      showSuggestions = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="relative w-full">
  <div class="relative">
    <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
      bind:this={searchInput}
      type="text"
      placeholder="Поиск по объявлениям"
      bind:value={searchQuery}
      on:input={handleInput}
      class="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
  
  {#if showSuggestions && suggestions.length > 0}
    <div class="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-50">
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
              class="flex-shrink-0"
            />
          {/if}
          <span class="truncate">{suggestion.text_item.title}</span>
        </button>
      {/each}
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