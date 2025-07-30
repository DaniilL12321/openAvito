import { writable } from 'svelte/store';

export interface Suggestion {
	text_item: {
		title: string;
		icon?: {
			server: {
				uri: string;
			};
		};
	};
}

export const showSearchSuggestions = writable(false);
export const searchQuery = writable('');
export const suggestions = writable<Suggestion[]>([]);
