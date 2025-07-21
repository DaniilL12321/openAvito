import type { AvitoResponse } from '$lib/types';
import type { PageLoad } from './$types';
import { selectedCity, avitoCookies } from '$lib/stores';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ fetch, url }) => {
  const city = get(selectedCity);
  const locationId = city?.id || 662810;
  const cookies = get(avitoCookies);
  
  try {
    const params = new URLSearchParams(url.search);
    params.set('locationId', locationId.toString());
    
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cookies,
        params: Object.fromEntries(params.entries())
      })
    });

    const data: AvitoResponse = await response.json();
    return { items: data.items || [] };
  } catch (error) {
    console.error('Error loading data:', error);
    return { items: [] };
  }
}; 