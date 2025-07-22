import { writable } from 'svelte/store';
import type { City, AvitoItem } from './types';

const defaultCity: City = { id: 662810, name: 'Ярославль', url: 'yaroslavl' };

export const cities = writable<City[]>([]);
export const selectedCity = writable<City>(defaultCity);

export const items = writable<AvitoItem[]>([]); 

const COOKIES_KEY = 'avito_cookies';
const SHOW_INACTIVE_KEY = 'show_inactive_items';

const savedCookies = typeof window !== 'undefined' ? localStorage.getItem(COOKIES_KEY) : null;
const savedShowInactive = typeof window !== 'undefined' ? localStorage.getItem(SHOW_INACTIVE_KEY) : null;

export const avitoCookies = writable<string>(savedCookies || '');
export const showInactiveItems = writable<boolean>(savedShowInactive !== null ? savedShowInactive === 'true' : true);

avitoCookies.subscribe(value => {
  if (typeof window !== 'undefined' && value) {
    localStorage.setItem(COOKIES_KEY, value);
  }
});

showInactiveItems.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SHOW_INACTIVE_KEY, value.toString());
  }
});

export const favorites = writable<AvitoItem[]>([]);
export const isFavoritesLoading = writable<boolean>(false);
export const favoritesError = writable<string | null>(null); 

export const query = writable(''); 