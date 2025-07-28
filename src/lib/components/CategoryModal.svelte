<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { X, ChevronLeft } from 'lucide-svelte';
  import type { AvitoCategory } from '$lib/types';
  import { avitoCookies } from '$lib/stores';
  
  const dispatch = createEventDispatcher<{
    close: void;
    select: { category: AvitoCategory };
  }>();
  
  export let showModal = false;
  let modalContainer: HTMLDivElement;
  let currentCategory: AvitoCategory | null = null;
  let categories: AvitoCategory[] = [];
  let loading = true;
  let subcategories: AvitoCategory[] = [];
  let groupedSubcategories: { [key: string]: { header?: AvitoCategory; items: AvitoCategory[] } } = {};
  
  async function loadCategories() {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: $avitoCookies
        })
      });
      const data = await response.json();
      categories = data.items;
      loading = false;
    } catch (error) {
      console.error('Error loading categories:', error);
      loading = false;
    }
  }

  function close() {
    dispatch('close');
  }

  function selectCategory(category: AvitoCategory) {
    if (currentCategory) {
      dispatch('select', { 
        category: {
          ...category,
          deeplink: category.deeplink || `ru.avito://1/items/search?categoryId=${category.categoryId}&microcategoryId=${category.microcategoryId}&presentationType=serp&sort=date`
        }
      });
      close();
    } else {
      showSubcategories(category);
    }
  }

  function hasChildren(category: AvitoCategory): boolean {
    return categories.some(c => c.parentId === category.id);
  }

  function showSubcategories(category: AvitoCategory) {
    currentCategory = category;
    const subs = categories
      .filter(c => c.parentId === category.id && c.nodeType !== 'externalLink')
      .sort((a, b) => {
        if (a.name === 'Автомобили') return -1;
        if (b.name === 'Автомобили') return 1;
        return a.name.localeCompare(b.name);
      });
    
    groupedSubcategories = {};

    const autoCategory = subs.find(c => c.name === 'Автомобили');
    if (autoCategory) {
      groupedSubcategories['auto'] = {
        items: [autoCategory]
      };
    }

    subs.forEach(sub => {
      if (sub.name !== 'Автомобили') {
        const groupItems = categories
          .filter(c => c.parentId === sub.id && c.nodeType !== 'externalLink')
          .sort((a, b) => a.name.localeCompare(b.name));

        if (groupItems.length > 0) {
          groupedSubcategories[sub.id] = {
            header: sub,
            items: groupItems
          };
        } else if (!sub.parentId || sub.parentId === category.id) {
          if (!groupedSubcategories['ungrouped']) {
            groupedSubcategories['ungrouped'] = { items: [] };
          }
          groupedSubcategories['ungrouped'].items.push(sub);
        }
      }
    });

    if (groupedSubcategories['ungrouped']) {
      groupedSubcategories['ungrouped'].items.sort((a, b) => a.name.localeCompare(b.name));
    }

    subcategories = subs;
  }

  function goBack() {
    currentCategory = null;
    subcategories = [];
    groupedSubcategories = {};
  }

  $: if (showModal) {
    loadCategories();
    setTimeout(() => modalContainer?.focus(), 0);
  }
</script>

<div 
  bind:this={modalContainer}
  class="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm outline-none" 
  on:click|self={close}
  tabindex="0"
  transition:fly={{ duration: 200, opacity: 0 }}
>
  <div
    class="fixed bottom-0 z-[70] h-[85vh] w-full overflow-y-auto border bg-background p-0 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-2xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
    on:click|stopPropagation
    transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
  >
    <div class="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-30">
      <div class="px-4 py-3 md:px-6 md:py-4">
        <div class="relative flex items-center justify-between gap-2">
          {#if currentCategory}
            <button
              class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
              on:click={goBack}
            >
              <ChevronLeft class="h-5 w-5" />
            </button>
            <h2 class="text-lg font-semibold leading-tight tracking-tight md:text-2xl">{currentCategory.name}</h2>
          {:else}
            <h2 class="text-lg font-semibold leading-tight tracking-tight md:text-2xl">Категории</h2>
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

    <div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:hidden">
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        on:click={close}
      >
        <X class="h-5 w-5" />
        <span class="sr-only">Закрыть</span>
      </button>
    </div>

    <div class="p-4 space-y-4 pb-20 md:pb-4">
      {#if loading}
        <div class="flex items-center justify-center py-8">
          <div class="text-muted-foreground">Загрузка категорий...</div>
        </div>
      {:else}
        {#if currentCategory}
          {#if groupedSubcategories['auto']}
            <div class="grid grid-cols-2 gap-3">
              {#each groupedSubcategories['auto'].items as category}
                <button
                  class="w-full flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm border border-border hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                  on:click={() => selectCategory(category)}
                >
                  <span class="truncate">{category.name}</span>
                  <ChevronLeft class="h-4 w-4 rotate-180 text-muted-foreground flex-shrink-0" />
                </button>
              {/each}
            </div>
          {/if}
          {#each Object.entries(groupedSubcategories) as [groupId, group]}
            {#if groupId !== 'ungrouped' && groupId !== 'auto'}
              <div class="space-y-3">
                {#if group.header}
                  <button
                    class="w-full px-4 py-2 bg-muted rounded-lg text-left hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                    on:click={() => group.header && selectCategory(group.header)}
                  >
                    <strong class="text-base font-medium">
                      {group.header.name}
                    </strong>
                  </button>
                {/if}
                <div class="grid grid-cols-2 gap-3">
                  {#each group.items as subcategory}
                    <button
                      class="w-full flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm border border-border hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                      on:click={() => selectCategory(subcategory)}
                    >
                      <span class="truncate">{subcategory.name}</span>
                      <ChevronLeft class="h-4 w-4 rotate-180 text-muted-foreground flex-shrink-0" />
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
          {#if groupedSubcategories['ungrouped']?.items.length > 0}
            <div class="grid grid-cols-2 gap-3">
              {#each groupedSubcategories['ungrouped'].items as subcategory}
                <button
                  class="w-full flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm border border-border hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
                  on:click={() => selectCategory(subcategory)}
                >
                  <span class="truncate">{subcategory.name}</span>
                  <ChevronLeft class="h-4 w-4 rotate-180 text-muted-foreground flex-shrink-0" />
                </button>
              {/each}
            </div>
          {/if}
        {:else}
          {#each categories.filter(c => !c.parentId) as category}
            <button
              class="w-full flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm border border-border hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-colors"
              on:click={() => selectCategory(category)}
            >
              <div class="flex items-center gap-3">
                {#if category.image}
                  <img
                    src={category.image['56x44']}
                    alt=""
                    class="h-8 w-8 object-contain"
                    loading="lazy"
                  />
                {/if}
                <span class="font-medium">{category.name}</span>
              </div>
              {#if hasChildren(category)}
                <ChevronLeft class="h-4 w-4 rotate-180 text-muted-foreground flex-shrink-0" />
              {/if}
            </button>
          {/each}
        {/if}
      {/if}
    </div>
  </div>
</div> 