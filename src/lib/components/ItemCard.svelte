<script lang="ts">
	import type { AvitoItem } from '$lib/types';
	import { selectedCity, cities, avitoCookies } from '$lib/stores';
	import ItemModal from './ItemModal.svelte';
	import { MapPin, Heart } from 'lucide-svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	export let item: AvitoItem;
	let showModal = false;
	let location = '';
	let isLoadingLocation = false;
	let locationLoaded = false;
	const dispatch = createEventDispatcher();

	async function loadLocation() {
		if (!item.location?.name && !isLoadingLocation && !locationLoaded) {
			isLoadingLocation = true;
			try {
				const response = await fetch('/api/item-location', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						url: item.urlPath,
						cookies: $avitoCookies
					})
				});
				const data = await response.json();

				if (data.address) {
					location = data.address;
					locationLoaded = true;
				}
			} catch (error) {
				console.error('Error loading location:', error);
			} finally {
				isLoadingLocation = false;
			}
		}
	}

	function getLocationString(item: AvitoItem): string {
		if (location) return location;

		let locationStr = '';
		const cityById = $cities.find((c) => c.id === item.locationId);
		const currentCity = cityById || $selectedCity;

		if (currentCity.name === 'Все регионы') {
			return item.location?.name || '';
		}

		if (item.location?.name) {
			locationStr = item.location.name;
		} else if (item.location?.id) {
			const parts = item.location.name?.split(', ') || [];
			const district = parts.length > 1 ? parts[1] : '';
			locationStr = district ? `${currentCity.name}, ${district}` : currentCity.name;
		} else if (typeof item.locationId === 'number') {
			locationStr = currentCity.name;
		}

		return locationStr;
	}

	$: isValid =
		item &&
		item.title &&
		item.urlPath &&
		item.priceDetailed?.string &&
		(item.images?.length > 0 || item.locationId);

	function handleClick(e: MouseEvent) {
		e.preventDefault();
		showModal = true;
	}

	async function toggleFavorite(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		try {
			const response = await fetch('/api/favorites', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					action: item.isFavorite ? 'remove' : 'add',
					ids: [item.id],
					cookies: $avitoCookies
				})
			});

			const data = await response.json();

			if (data.success) {
				item.isFavorite = !item.isFavorite;
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
		}
	}

	onMount(() => {
		loadLocation();
	});
</script>

{#if isValid}
	<div
		class="group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
	>
		<a href="https://www.avito.ru{item.urlPath}" on:click={handleClick} class="block">
			<div class="relative aspect-square overflow-hidden">
				{#if item.images && item.images.length > 0}
					<img
						src={item.images[0]['432x432']}
						alt={item.imagesAlt}
						loading="lazy"
						class="h-full w-full object-cover transition-transform group-hover:scale-105"
					/>
				{/if}
				{#if item.hasDiscount}
					<span
						class="absolute left-2 top-2 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground"
					>
						Скидка
					</span>
				{/if}
				<button
					class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
					on:click={toggleFavorite}
				>
					<Heart class="h-4 w-4" fill={item.isFavorite ? 'currentColor' : 'none'} />
					<span class="sr-only"
						>{item.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}</span
					>
				</button>
			</div>
			<div class="p-4">
				<h3 class="line-clamp-2 text-sm font-medium">{item.title}</h3>
				<p class="mt-2 text-lg font-bold">{item.priceDetailed.string} ₽</p>
				{#if getLocationString(item) || isLoadingLocation}
					<p class="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
						<MapPin class="h-4 w-4" />
						{#if isLoadingLocation}
							<span class="animate-pulse">Загрузка адреса...</span>
						{:else}
							{getLocationString(item)}
						{/if}
					</p>
				{/if}
			</div>
		</a>
	</div>

	{#if showModal}
		<ItemModal {item} on:close={() => (showModal = false)} />
	{/if}
{/if}

<style>
	.card {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease-in-out;
	}

	.image-container {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.discount {
		position: absolute;
		top: 8px;
		left: 8px;
		background: #ff4747;
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
	}

	.content {
		padding: 12px;
	}

	.title {
		margin: 0;
		font-size: 16px;
		color: #2b2b2b;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.price {
		font-size: 18px;
		font-weight: bold;
		margin: 8px 0;
		color: #000;
	}

	.location {
		font-size: 14px;
		color: #666;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.location-icon {
		color: #666;
		width: 14px;
		height: 14px;
	}

	a {
		text-decoration: none;
		color: inherit;
	}
</style>
