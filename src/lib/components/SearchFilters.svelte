<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SearchParams } from '$lib/types';
  import { X } from 'lucide-svelte';

  export let searchParams: SearchParams = {};

  const dispatch = createEventDispatcher<{
    change: SearchParams;
  }>();

  let withDelivery = searchParams.d === 1;
  let minPrice = searchParams.pmin?.toString() || '';
  let maxPrice = searchParams.pmax?.toString() || '';

  function handleChange() {
    const params = { ...searchParams };
    
    if (withDelivery) {
      params.d = 1;
    } else {
      delete params.d;
    }

    if (minPrice) {
      params.pmin = parseInt(minPrice);
    } else {
      delete params.pmin;
  }

    if (maxPrice) {
      params.pmax = parseInt(maxPrice);
    } else {
      delete params.pmax;
    }

    dispatch('change', params);
  }

  function handleClear() {
    withDelivery = false;
    minPrice = '';
    maxPrice = '';
    dispatch('change', {});
  }
</script>

<div class="space-y-6">
<div class="space-y-4">
    <!-- Цена -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Цена</label>
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <input
            type="number"
            placeholder="От"
            bind:value={minPrice}
            on:input={handleChange}
            class="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
              </div>
        <div class="relative flex-1">
          <input
            type="number"
            placeholder="До"
            bind:value={maxPrice}
            on:input={handleChange}
            class="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>

    <!-- Доставка -->
    <button
      class="flex items-center justify-between w-full p-3 rounded-xl border transition-colors
        {withDelivery 
          ? 'border-primary bg-primary/5 dark:bg-primary/10' 
          : 'hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30'}"
      on:click={() => {
        withDelivery = !withDelivery;
        handleChange();
      }}
    >
      <span class="text-sm">С доставкой</span>
      <div class="h-4 w-8 rounded-full relative transition-colors {withDelivery ? 'bg-primary' : 'bg-muted'}">
        <div class="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-background transition-transform {withDelivery ? 'translate-x-4' : ''}" />
    </div>
    </button>
  </div>

  <!-- Кнопка сброса -->
  <button
    class="flex items-center justify-between w-full p-3 rounded-xl border hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive hover:border-destructive/20 dark:hover:border-destructive/30 transition-colors"
    on:click={handleClear}
  >
    <div class="flex items-center gap-3">
      <X class="h-5 w-5" />
      <span>Сбросить фильтры</span>
    </div>
  </button>
</div> 