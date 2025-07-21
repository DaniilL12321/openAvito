import { writable } from 'svelte/store';
import type { City, AvitoItem } from './types';

export const cities: City[] = [
  { id: 662810, name: 'Ярославль', url: 'yaroslavl' },
  { id: 637640, name: 'Москва', url: 'moskva' },
  { id: 653240, name: 'Санкт-Петербург', url: 'sankt-peterburg' },
  { id: 650400, name: 'Казань', url: 'kazan' },
  { id: 652000, name: 'Ростов-на-Дону', url: 'rostov-na-donu' }
];

export const selectedCity = writable<City>(cities[0]);

export const items = writable<AvitoItem[]>([]); 

const COOKIES_KEY = 'avito_cookies';
const savedCookies = typeof window !== 'undefined' ? localStorage.getItem(COOKIES_KEY) : null;

export const avitoCookies = writable<string>(savedCookies || '');

avitoCookies.subscribe(value => {
  if (typeof window !== 'undefined' && value) {
    localStorage.setItem(COOKIES_KEY, value);
  }
}); 