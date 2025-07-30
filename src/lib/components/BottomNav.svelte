<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { elasticOut, cubicOut } from 'svelte/easing';
	import { selectedCity, query } from '$lib/stores';
	import {
		Search,
		MapPin,
		Heart,
		Settings as SettingsIcon,
		Menu,
		X,
		ChevronDown,
		LayoutGrid
	} from 'lucide-svelte';
	import Logo from './Logo.svelte';
	import Settings from './Settings.svelte';

	const dispatch = createEventDispatcher<{
		openSearch: void;
		openFavorites: void;
		openCity: void;
		openCategory: void;
	}>();

	export let selectedCategory: { name: string; subcategory?: string } = { name: 'Все категории' };
	export let isSearchActive = false;

	function handleSearchClick() {
		if (!isSearchActive) {
			dispatch('openSearch');
		}
	}
</script>

<div class="md:hidden">
	<div class="fixed bottom-0 left-0 right-0 z-50 pb-6">
		<div class="relative mx-auto max-w-lg px-4">
			<div class="relative">
				<div
					class="absolute bottom-0 left-0 right-0 h-16 rounded-full border bg-background/95 shadow-lg backdrop-blur-lg"
				/>

				<div class="relative flex h-16 items-center px-6">
					<div class="flex items-center gap-8">
						<button
							class="flex flex-col items-center justify-center gap-1 rounded-full p-2 transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
							on:click={() => dispatch('openCategory')}
						>
							<LayoutGrid class="h-6 w-6" />
						</button>

						<button
							class="flex flex-col items-center justify-center gap-1 rounded-full p-2 transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
							on:click={() => dispatch('openCity')}
						>
							<MapPin class="h-6 w-6" />
						</button>
					</div>

					<button
						class="absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
						on:click={handleSearchClick}
						style="transform: translate(-50%, 0)"
					>
						<Search class="h-7 w-7" />
					</button>

					<div class="ml-auto flex items-center gap-8">
						<button
							class="flex flex-col items-center justify-center gap-1 rounded-full p-2 transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
							on:click={() => dispatch('openFavorites')}
						>
							<Heart class="h-6 w-6" />
						</button>

						<Settings />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
