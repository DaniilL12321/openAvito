<script lang="ts">
  import { selectedCity, avitoCookies } from '$lib/stores';
  import { MapPin } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    open: void;
  }>();

  onMount(() => {
    if (browser) {
      const savedCityId = localStorage.getItem('selectedCityId');
      if (savedCityId) {
        loadCity(parseInt(savedCityId));
      }
    }
  });

  async function loadCity(cityId: number) {
    if (!browser) return;
    
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId: cityId,
          query: '',
          cookies: $avitoCookies
        })
      });
      const data = await response.json();
      if (data.result?.locations?.[0]) {
        const city = data.result.locations[0];
        selectedCity.set({
          id: city.id,
          name: city.names[1],
          url: city.names[1] === 'Все регионы' ? '' : city.names[1].toLowerCase().replace(/[^а-яё-]/g, '')
        });
      }
    } catch (error) {
      console.error('Error loading city:', error);
    }
  }
</script>

<button
  class="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors md:px-4 md:py-2"
  on:click={() => dispatch('open')}
>
  <MapPin class="h-4 w-4" />
  <span class="truncate">{$selectedCity.name}</span>
</button> 