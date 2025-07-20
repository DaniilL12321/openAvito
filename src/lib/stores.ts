import { writable } from 'svelte/store';
import type { City, AvitoItem } from './types';

// Популярные города
export const cities: City[] = [
  { id: 662810, name: 'Ярославль', url: 'yaroslavl' },
  { id: 637640, name: 'Москва', url: 'moskva' },
  { id: 653240, name: 'Санкт-Петербург', url: 'sankt-peterburg' },
  { id: 650400, name: 'Казань', url: 'kazan' },
  { id: 652000, name: 'Ростов-на-Дону', url: 'rostov-na-donu' }
];

// Создаем хранилище для выбранного города
export const selectedCity = writable<City>(cities[0]);

// Хранилище для основного списка объявлений
export const items = writable<AvitoItem[]>([]); 