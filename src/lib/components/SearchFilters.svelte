<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Category, SearchParams } from '$lib/types';
  import { CATEGORIES } from '$lib/types';
  import { selectedCity } from '$lib/stores';
  import { ChevronDown, Truck } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  const dispatch = createEventDispatcher<{
    change: SearchParams;
  }>();

  export let searchParams: SearchParams = {};
  
  let selectedCategory: Category | undefined;
  let selectedSubcategory: Category | undefined;
  let showCategories = false;
  let priceFrom = searchParams.pmin?.toString() || '';
  let priceTo = searchParams.pmax?.toString() || '';
  let withDelivery = searchParams.d === 1;
  let categoriesMenu: HTMLDivElement;

  $: {
    selectedCategory = CATEGORIES.find(c => c.id === searchParams.categoryId);
    if (selectedCategory) {
      selectedSubcategory = selectedCategory.subcategories?.find(
        s => s.id === searchParams.verticalCategoryId
      );
    }
  }

  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showCategories && categoriesMenu && !categoriesMenu.contains(event.target as Node)) {
        showCategories = false;
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  function handleCategorySelect(category: Category) {
    selectedCategory = category;
    selectedSubcategory = undefined;
    updateParams({
      categoryId: category.id,
      verticalCategoryId: undefined
    });
    showCategories = false;
  }

  function handleSubcategorySelect(subcategory: Category) {
    selectedSubcategory = subcategory;
    updateParams({
      verticalCategoryId: subcategory.verticalId
    });
  }

  function handlePriceChange() {
    updateParams({
      pmin: priceFrom ? parseInt(priceFrom) : undefined,
      pmax: priceTo ? parseInt(priceTo) : undefined
    });
  }

  function handleDeliveryChange() {
    withDelivery = !withDelivery;
    updateParams({
      d: withDelivery ? 1 : undefined
    });
  }

  function updateParams(newParams: Partial<SearchParams>) {
    searchParams = { ...searchParams, ...newParams };
    dispatch('change', searchParams);
  }
</script>

<div class="space-y-4">
  <div class="relative">
    <button
      class="w-full flex items-center justify-between gap-2 rounded-xl border bg-background px-4 py-3 text-sm"
      on:click={() => showCategories = !showCategories}
    >
      <span class="truncate">
        {#if selectedSubcategory}
          {selectedCategory?.name} › {selectedSubcategory.name}
        {:else if selectedCategory}
          {selectedCategory.name}
        {:else}
          Все категории
        {/if}
      </span>
      <ChevronDown class="h-4 w-4" />
    </button>

    {#if showCategories}
      <div
        bind:this={categoriesMenu}
        class="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-xl border bg-background shadow-lg"
        in:fly={{ y: -10, duration: 200, opacity: 1, easing: cubicOut }}
        out:fly={{ y: -10, duration: 150, opacity: 0, easing: cubicOut }}
        on:click|stopPropagation
      >
        <div class="p-2 space-y-1">
          {#each CATEGORIES as category}
            <button
              class="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground
                {selectedCategory?.id === category.id ? 'bg-accent text-accent-foreground' : ''}"
              on:click={() => handleCategorySelect(category)}
            >
              {category.name}
            </button>
            {#if selectedCategory?.id === category.id && category.subcategories}
              <div class="ml-4 space-y-1 border-l pl-2">
                {#each category.subcategories as subcategory}
                  <button
                    class="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground
                      {selectedSubcategory?.id === subcategory.id ? 'bg-accent text-accent-foreground' : ''}"
                    on:click={() => handleSubcategorySelect(subcategory)}
                  >
                    {subcategory.name}
                  </button>
                {/each}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="flex gap-2">
    <div class="flex-1 space-y-1.5">
      <label for="priceFrom" class="text-sm font-medium">Цена от</label>
      <input
        id="priceFrom"
        type="number"
        bind:value={priceFrom}
        on:change={handlePriceChange}
        placeholder="0"
        class="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground"
      />
    </div>
    <div class="flex-1 space-y-1.5">
      <label for="priceTo" class="text-sm font-medium">до</label>
      <input
        id="priceTo"
        type="number"
        bind:value={priceTo}
        on:change={handlePriceChange}
        placeholder="∞"
        class="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground"
      />
    </div>
  </div>

  <button
    class="flex w-full items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground
      {withDelivery ? 'border-primary text-primary' : ''}"
    on:click={handleDeliveryChange}
  >
    <Truck class="h-4 w-4" />
    <span>С доставкой</span>
  </button>
</div> 