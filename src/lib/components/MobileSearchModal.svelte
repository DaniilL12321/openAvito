<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import SearchBar from './SearchBar.svelte';
	import { onMount } from 'svelte';
	import { showSearchSuggestions } from '$lib/stores/search';

	export let selectedCategory: { name: string; subcategory?: string };
	export let showModal = false;

	const dispatch = createEventDispatcher<{
		close: void;
		openCategory: void;
	}>();

	let mediaQuery: MediaQueryList;

	onMount(() => {
		mediaQuery = window.matchMedia('(min-width: 768px)');
		mediaQuery.addEventListener('change', handleMediaChange);

		return () => {
			mediaQuery.removeEventListener('change', handleMediaChange);
		};
	});

	function handleMediaChange(e: MediaQueryListEvent) {
		if (e.matches && showModal) {
			showModal = false;
			dispatch('close');
		} else if (!e.matches && $showSearchSuggestions) {
			showModal = true;
		}
	}

	function handleClose() {
		showModal = false;
		if (!mediaQuery?.matches) {
			showSearchSuggestions.set(false);
		}
		dispatch('close');
	}

	function handleCategorySelect() {
		showModal = false;
		dispatch('openCategory');
	}

	function handleSearch() {
		showModal = false;
	}
</script>

{#if showModal}
	<div class="block md:hidden">
		<div
			class="fixed inset-0 z-[70] bg-background/80 outline-none backdrop-blur-sm"
			on:click|self={handleClose}
			transition:fly={{ duration: 200, opacity: 0 }}
		>
			<div
				class="fixed bottom-0 z-[70] h-[95vh] w-full overflow-y-auto rounded-t-3xl border bg-background p-0 shadow-lg duration-200"
				on:click|stopPropagation
				transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
			>
				<div class="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
					<div class="px-4 py-3">
						<SearchBar
							{selectedCategory}
							on:categorySelect={handleCategorySelect}
							on:search={handleSearch}
							autoFocus={true}
							isMobile={true}
						/>
					</div>
				</div>

				<div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
					<button
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
						on:click={handleClose}
					>
						<X class="h-5 w-5" />
						<span class="sr-only">Закрыть</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
