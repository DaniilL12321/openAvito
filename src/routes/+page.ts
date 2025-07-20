import type { AvitoResponse } from '$lib/types';
import type { PageLoad } from './$types';
import { selectedCity } from '$lib/stores';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ fetch }) => {
  const city = get(selectedCity);
  const locationId = city?.id || 662810;
  
  try {
    const response = await fetch(`/api/items?locationId=${locationId}`);
    const data: AvitoResponse = await response.json();
    return { items: data.items };
  } catch (error) {
    console.error('Error loading data:', error);
    return { items: [] };
  }
}; 