<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { selectedCity, avitoCookies, query } from '$lib/stores';
	import {
		showSearchSuggestions,
		suggestions as sharedSuggestions,
		type Suggestion
	} from '$lib/stores/search';
	import { Search, HelpCircle, ChevronDown, Sliders, LayoutGrid } from 'lucide-svelte';
	import type { SearchParams } from '$lib/types';
	import SearchFilters from './SearchFilters.svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		categorySelect: void;
		search: void;
	}>();

	export let selectedCategory: { name: string } = { name: 'Все категории' };
	export let autoFocus = false;
	export let isMobile = false;

	let searchInput: HTMLInputElement;
	let filtersContainer: HTMLDivElement;
	let suggestionsContainer: HTMLDivElement;
	let showFilters = false;
	let searchParams: SearchParams = {};

	onMount(() => {
		const urlParams = new URLSearchParams($page.url.search);
		$query = urlParams.get('q') || '';
		const categoryId = urlParams.get('categoryId');
		const verticalCategoryId = urlParams.get('verticalCategoryId');

		searchParams = {
			name: $query,
			categoryId: categoryId ? parseInt(categoryId) : undefined,
			verticalCategoryId: verticalCategoryId ? parseInt(verticalCategoryId) : undefined,
			pmin: urlParams.get('pmin') ? parseInt(urlParams.get('pmin')!) : undefined,
			pmax: urlParams.get('pmax') ? parseInt(urlParams.get('pmax')!) : undefined,
			d: urlParams.get('d') === '1' ? 1 : undefined
		};

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);

		if (autoFocus && searchInput) {
			searchInput.focus();
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;

		if (
			$showSearchSuggestions &&
			suggestionsContainer &&
			!suggestionsContainer.contains(target) &&
			!searchInput.contains(target)
		) {
			showSearchSuggestions.set(false);
		}

		if (showFilters && filtersContainer && !filtersContainer.contains(target)) {
			showFilters = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showSearchSuggestions.set(false);
			showFilters = false;
			searchInput?.blur();
		}
	}

	let suggestionsTimeout: NodeJS.Timeout;
	async function handleInput() {
		if (suggestionsTimeout) {
			clearTimeout(suggestionsTimeout);
		}

		showFilters = false;
		suggestionsTimeout = setTimeout(async () => {
			try {
				const response = await fetch('/api/suggest', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						query: $query,
						locationId: $selectedCity.id,
						cookies: $avitoCookies
					})
				});

				const data = await response.json();
				$sharedSuggestions = (data.result || []) as Suggestion[];
				showSearchSuggestions.set(true);
			} catch (error) {
				console.error('Error fetching suggestions:', error);
			}
		}, 300);
	}

	function handleSuggestionClick(suggestion: Suggestion) {
		$query = suggestion.text_item.title;
		showSearchSuggestions.set(false);
		handleSearch();
	}

	function handleSearch() {
		const params = new URLSearchParams();
		if ($query) {
			params.set('q', $query);
			searchParams.name = $query;
		}
		if (searchParams.categoryId) {
			params.set('categoryId', searchParams.categoryId.toString());
		}
		if (searchParams.verticalCategoryId) {
			params.set('verticalCategoryId', searchParams.verticalCategoryId.toString());
		}
		if (searchParams.pmin) {
			params.set('pmin', searchParams.pmin.toString());
		}
		if (searchParams.pmax) {
			params.set('pmax', searchParams.pmax.toString());
		}
		if (searchParams.d) {
			params.set('d', searchParams.d.toString());
		}

		showSearchSuggestions.set(false);
		showFilters = false;
		goto(`/?${params.toString()}`);
		dispatch('search');
	}

	function handleFiltersChange(event: CustomEvent<SearchParams>) {
		searchParams = event.detail;
		handleSearch();
	}

	function handleSearchFocus() {
		showFilters = false;
		handleInput();
	}

	function toggleFilters() {
		showFilters = !showFilters;
		if (showFilters) {
			showSearchSuggestions.set(false);
		}
	}
</script>

<div class="relative w-full {isMobile ? '' : 'hidden md:block'}" bind:this={filtersContainer}>
	<div class="flex items-center gap-2">
		<button
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/15 dark:hover:bg-primary/25 md:h-11 md:w-auto md:px-5"
			on:click={() => dispatch('categorySelect')}
		>
			<LayoutGrid class="block h-5 w-5 md:hidden" />
			<span class="hidden max-w-[200px] truncate text-[15px] font-medium md:block">
				{selectedCategory.name}
			</span>
		</button>

		<div class="relative flex-1">
			<div
				class="flex h-11 w-full items-center rounded-full border border-input bg-background px-4"
			>
				<div class="relative flex flex-1 items-center">
					<Search class="h-5 w-5 flex-shrink-0 text-muted-foreground" />
					<input
						bind:this={searchInput}
						type="text"
						placeholder="Поиск по объявлениям"
						bind:value={$query}
						on:input={handleInput}
						on:focus={handleSearchFocus}
						on:keydown={(e) => e.key === 'Enter' && handleSearch()}
						class="w-full border-none bg-transparent pl-2.5 text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-0"
					/>
				</div>

				<div class="flex items-center gap-1.5">
					<button
						class="rounded-full p-1.5 transition-colors hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
						on:click|stopPropagation={toggleFilters}
						title="Фильтры"
					>
						<Sliders class="h-5 w-5" />
					</button>
					<div class="group hidden md:block" tabindex="0">
						<HelpCircle class="h-5 w-5 cursor-pointer text-muted-foreground" />
						<div
							class="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max min-w-[220px] max-w-[310px] rounded-xl bg-popover px-4 py-2 text-xs text-muted-foreground opacity-0 shadow-lg ring-1 transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100"
						>
							Чтобы исключить слово из поиска, добавьте <span class="font-mono"
								>--слово</span
							><br />
							<span class="text-muted-foreground/70">Например: iphone --чехол</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if $showSearchSuggestions && $sharedSuggestions.length > 0}
		<div
			bind:this={suggestionsContainer}
			class="absolute left-0 right-0 top-full z-50 mt-6 overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-lg md:mt-2"
			in:fly={{ y: -10, duration: 200, opacity: 1, easing: cubicOut }}
			out:fly={{ y: -10, duration: 150, opacity: 0, easing: cubicOut }}
		>
			{#each $sharedSuggestions as suggestion}
				<button
					class="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
					on:click={() => handleSuggestionClick(suggestion)}
				>
					{#if suggestion.text_item.icon}
						<img
							src={suggestion.text_item.icon.server.uri}
							alt=""
							width="20"
							height="20"
							class="flex-shrink-0 dark:invert"
						/>
					{:else}
						<div
							class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<Search class="h-3.5 w-3.5" />
						</div>
					{/if}
					<span class="truncate text-sm">{suggestion.text_item.title}</span>
				</button>
			{/each}
		</div>
	{/if}

	{#if showFilters}
		<div
			class="absolute left-0 right-0 top-full z-50 mt-6 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg md:mt-2"
			in:fly={{ y: -10, duration: 200, opacity: 1, easing: cubicOut }}
			out:fly={{ y: -10, duration: 150, opacity: 0, easing: cubicOut }}
			on:click|stopPropagation
		>
			<div class="p-4">
				<SearchFilters {searchParams} on:change={handleFiltersChange} />
			</div>
		</div>
	{/if}
</div>

<style>
	.search-container {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}

	.search-input {
		width: 100%;
		padding: 12px 16px;
		font-size: 16px;
		border: 2px solid #ddd;
		border-radius: 8px;
		outline: none;
		transition: border-color 0.2s ease;
	}

	.search-input:focus {
		border-color: #00aaff;
	}

	.suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		margin-top: 4px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		max-height: 400px;
		overflow-y: auto;
	}

	.suggestion-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px 16px;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.suggestion-item:hover {
		background-color: #f5f5f5;
	}

	.suggestion-icon {
		margin-right: 12px;
		object-fit: contain;
	}

	@media (max-width: 768px) {
		.search-container {
			max-width: 100%;
		}

		.search-input {
			font-size: 14px;
			padding: 10px 14px;
		}
	}
</style>
