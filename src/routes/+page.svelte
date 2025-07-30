<script lang="ts">
	import type { AvitoItem, AvitoCategory } from '$lib/types';
	import CitySelector from '$lib/components/CitySelector.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import ItemsList from '$lib/components/ItemsList.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import FavoritesModal from '$lib/components/FavoritesModal.svelte';
	import CategorySelectorModal from '$lib/components/CategorySelectorModal.svelte';
	import CityModal from '$lib/components/CityModal.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { selectedCity, avitoCookies, query } from '$lib/stores';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Heart, X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import '../lib/styles/theme.css';
	import { handleAvitoError } from '$lib/utils/handleAvitoError';
	import CookiesInstructionDialog from '$lib/components/CookiesInstructionDialog.svelte';
	import { toasts } from '$lib/stores/toast';
	import MobileSearchModal from '$lib/components/MobileSearchModal.svelte';
	import BreadcrumbHeader from '$lib/components/BreadcrumbHeader.svelte';
	import { goto } from '$app/navigation';
	import { CATEGORIES } from '$lib/types';

	export let data: { items: AvitoItem[] };
	let currentItems = data.items;
	let mounted = false;
	let error: string | null = null;
	let loading = false;
	let currentDeeplink: string | null = null;
	let initializing = false;
	let showFavorites = false;
	let showCategorySelector = false;
	let showCitySelector = false;
	let showSearch = false;
	let selectedCategory: AvitoCategory | undefined;
	let selectedSubcategory: AvitoCategory | undefined;
	let searchCategory: { name: string; subcategory?: string } = { name: 'Все категории' };
	let showCookiesInstruction = false;
	let showSettings = false;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showFavorites = false;
			showCategorySelector = false;
			showCitySelector = false;
			showSearch = false;
		}
	}

	async function initFromUrl() {
		const urlParams = new URLSearchParams($page.url.search);
		const deeplink = urlParams.get('deeplink');
		const searchQuery = urlParams.get('q');

		if (deeplink === currentDeeplink) {
			return;
		}
		currentDeeplink = deeplink;

		console.log('Initializing from URL:', { deeplink, searchQuery });

		if (deeplink) {
			try {
				loading = true;
				error = null;

				const data = await handleApiRequest('/api/search', {
					cookies: $avitoCookies,
					params: {
						deeplink,
						locationId: $selectedCity.id,
						p: 1
					}
				});

				if (data) {
					console.log('Items loaded by deeplink:', data);
					currentItems = data.items || [];

					for (const category of CATEGORIES) {
						if (category.deeplink === deeplink) {
							selectedCategory = category;
							break;
						}
						if (category.subcategories) {
							const subcategory = category.subcategories.find(
								(sub: AvitoCategory) => sub.deeplink === deeplink
							);
							if (subcategory) {
								selectedCategory = category;
								selectedSubcategory = subcategory;
								break;
							}
						}
					}

					if (selectedCategory) {
						searchCategory = {
							name: selectedSubcategory?.name || selectedCategory.name
						};
					}
				}
			} catch (err) {
				console.error('Error loading items by deeplink:', err);
				error = 'Ошибка загрузки объявлений';
				toasts.show('Ошибка загрузки объявлений', 'error');
			} finally {
				loading = false;
			}
		} else if (searchQuery) {
			$query = searchQuery;
			await loadSearchItems();
		} else if ($selectedCity) {
			await loadCityItems($selectedCity.id);
		}
	}

	onMount(() => {
		mounted = true;
		document.addEventListener('keydown', handleKeydown);

		const urlParams = new URLSearchParams($page.url.search);
		const searchQuery = urlParams.get('q');
		if (searchQuery) {
			$query = searchQuery;
			loadSearchItems();
		} else {
			initFromUrl();
		}

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	$: if (mounted && $page.url.search) {
		const urlParams = new URLSearchParams($page.url.search);
		const searchQuery = urlParams.get('q');
		const deeplink = urlParams.get('deeplink');

		if (searchQuery) {
			loadSearchItems();
		} else if (deeplink) {
			initFromUrl();
		}
	}

	$: if (mounted && !$page.url.search && !selectedCategory && !initializing) {
		console.log('Loading city items (no URL params)...');
		loadCityItems($selectedCity.id);
	}

	async function handleApiRequest(url: string, body: any) {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		const data = await response.json();
		const { error: errorMessage, needCookies } = handleAvitoError(data);

		if (needCookies) {
			showCookiesInstruction = true;
			error = errorMessage;
			return null;
		}

		if (errorMessage) {
			error = errorMessage;
			toasts.show(errorMessage, 'error');
			return null;
		}

		return data;
	}

	async function loadSearchItems() {
		loading = true;
		error = null;

		try {
			const urlParams = new URLSearchParams($page.url.search);
			const searchQuery = urlParams.get('q');

			console.log('Loading search items:', { searchQuery });

			const data = await handleApiRequest('/api/search', {
				cookies: $avitoCookies,
				params: {
					name: searchQuery,
					locationId: $selectedCity.id,
					categoryId: urlParams.get('categoryId')
						? parseInt(urlParams.get('categoryId')!)
						: undefined,
					verticalCategoryId: urlParams.get('verticalCategoryId')
						? parseInt(urlParams.get('verticalCategoryId')!)
						: undefined,
					pmin: urlParams.get('pmin') ? parseInt(urlParams.get('pmin')!) : undefined,
					pmax: urlParams.get('pmax') ? parseInt(urlParams.get('pmax')!) : undefined,
					d: urlParams.get('d') === '1' ? 1 : undefined,
					view: 'gallery',
					p: 1
				}
			});

			if (data) {
				console.log('Search results:', data);
				currentItems = data.items || data.catalog?.items || [];
			}
		} catch (err) {
			console.error('Error loading search results:', err);
			error = 'Ошибка загрузки результатов';
			toasts.show('Ошибка загрузки результатов', 'error');
		} finally {
			loading = false;
		}
	}

	async function loadCategoryItems(
		category: AvitoCategory,
		subcategory?: AvitoCategory,
		page: number = 1
	) {
		loading = true;
		error = null;

		console.log('Loading category items:', { category, subcategory, page });

		try {
			const data = await handleApiRequest('/api/search', {
				cookies: $avitoCookies,
				params: {
					deeplink: subcategory?.deeplink || category.deeplink,
					locationId: $selectedCity.id,
					p: page
				}
			});

			if (data) {
				console.log('Category items loaded:', data);
				currentItems = data.items || [];
			}
		} catch (err) {
			console.error('Error loading category items:', err);
			error = 'Ошибка загрузки объявлений';
			toasts.show('Ошибка загрузки объявлений', 'error');
		} finally {
			loading = false;
		}
	}

	async function loadCityItems(cityId: number) {
		loading = true;
		error = null;

		try {
			const data = await handleApiRequest('/api/items', {
				cookies: $avitoCookies,
				params: {
					locationId: cityId
				}
			});

			if (data) {
				currentItems = data.items || [];
			}
		} catch (err) {
			console.error('Error loading city items:', err);
			error = 'Ошибка загрузки объявлений';
			toasts.show('Ошибка загрузки объявлений', 'error');
		} finally {
			loading = false;
		}
	}

	function handleCategorySelect(
		event: CustomEvent<{ category: AvitoCategory; subcategory?: AvitoCategory }>
	) {
		const { category, subcategory } = event.detail;
		selectedCategory = category;
		selectedSubcategory = subcategory;
		searchCategory = {
			name: subcategory?.name || category.name
		};

		$query = '';

		const deeplink = subcategory?.deeplink || category.deeplink;
		if (deeplink) {
			loadCategoryItems(category, subcategory, 1);

			currentDeeplink = deeplink;
			const params = new URLSearchParams();
			params.set('deeplink', deeplink);
			goto(`/?${params.toString()}`, { replaceState: true });
		} else {
			currentDeeplink = null;
			loadCategoryItems(category, subcategory, 1);
		}
	}
</script>

<div class="md:container md:mx-auto">
	<header
		class="sticky top-0 z-10 hidden border-b border-border bg-background/80 backdrop-blur-sm md:block"
	>
		<div class="p-2 md:p-4">
			<div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
				<div class="flex items-center justify-between gap-2 md:flex-1">
					<div class="flex items-center gap-4">
						<Logo />
						<CitySelector on:open={() => (showCitySelector = true)} />
					</div>
					<div class="flex items-center gap-2">
						<button
							class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
							on:click={() => (showFavorites = true)}
						>
							<Heart class="h-5 w-5" />
							<span class="sr-only">Избранное</span>
						</button>
						<ThemeToggle />
						<Settings />
					</div>
				</div>
				<div class="md:flex-[2]">
					<SearchBar
						selectedCategory={searchCategory}
						on:categorySelect={() => (showCategorySelector = true)}
					/>
				</div>
			</div>
		</div>
	</header>

	<main class="p-2 pb-20 md:p-4 md:pb-4">
		{#if error}
			<div class="mb-4 rounded-xl bg-destructive/10 p-4 text-destructive">
				{error}
				<button
					class="ml-2 rounded-full bg-destructive px-3 py-1 text-destructive-foreground hover:bg-destructive/90"
					on:click={() => {
						error = null;
						if ($page.url.search) {
							loadSearchItems();
						} else if (selectedCategory) {
							loadCategoryItems(selectedCategory, selectedSubcategory);
						} else {
							loadCityItems($selectedCity.id);
						}
					}}
				>
					Попробовать снова
				</button>
			</div>
		{/if}

		<BreadcrumbHeader
			title={selectedCategory
				? selectedSubcategory?.name || selectedCategory.name
				: `Объявления в ${$selectedCity.name}`}
			isSearch={Boolean($query)}
			on:reset={() => {
				selectedCategory = undefined;
				selectedSubcategory = undefined;
				searchCategory = { name: 'Все категории' };
				$query = '';
				currentDeeplink = null;
				loadCityItems($selectedCity.id);
			}}
		/>

		<ItemsList
			title={selectedCategory
				? selectedSubcategory?.name || selectedCategory.name
				: $query
					? 'Результаты поиска'
					: `Объявления в ${$selectedCity.name}`}
			initialItems={currentItems}
			{loading}
			isSearch={Boolean($query)}
		/>
	</main>
</div>

<BottomNav
	selectedCategory={{
		name: searchCategory.name,
		subcategory: searchCategory.subcategory
	}}
	isSearchActive={showSearch}
	on:openSearch={() => (showSearch = true)}
	on:openFavorites={() => (showFavorites = true)}
	on:openCity={() => (showCitySelector = true)}
	on:openCategory={() => (showCategorySelector = true)}
/>

<MobileSearchModal
	bind:showModal={showSearch}
	selectedCategory={searchCategory}
	on:close={() => (showSearch = false)}
	on:openCategory={() => {
		showSearch = false;
		showCategorySelector = true;
	}}
/>

{#if showFavorites}
	<FavoritesModal on:close={() => (showFavorites = false)} />
{/if}

{#if showCategorySelector}
	<CategorySelectorModal
		bind:showModal={showCategorySelector}
		{selectedCategory}
		{selectedSubcategory}
		on:close={() => (showCategorySelector = false)}
		on:select={handleCategorySelect}
	/>
{/if}

{#if showCitySelector}
	<CityModal on:close={() => (showCitySelector = false)} />
{/if}

{#if showCookiesInstruction}
	<CookiesInstructionDialog
		on:close={() => (showCookiesInstruction = false)}
		on:openSettings={() => {
			showCookiesInstruction = false;
			showSettings = true;
		}}
	/>
{/if}

{#if showSettings}
	<Settings bind:showModal={showSettings} on:close={() => (showSettings = false)} />
{/if}
