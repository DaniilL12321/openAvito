<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { X, Star } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { avitoCookies } from '$lib/stores';
	import ImageViewer from './ImageViewer.svelte';
	import Select from './ui/Select.svelte';
	import Toggle from './ui/Toggle.svelte';

	interface RatingEntry {
		count: number;
		score: number;
		title: string;
	}

	interface Answer {
		answerId: number;
		answered: string;
		avatar: AnswerAvatarSizes;
		link: string;
		text: string;
		title: string;
	}

	interface UserAvatarSizes {
		'128x128': string;
		'192x192': string;
		'24x24': string;
		'256x256': string;
		'36x36': string;
		'48x48': string;
		'64x64': string;
		'72x72': string;
		'96x96': string;
		[key: string]: string;
	}

	interface AnswerAvatarSizes {
		'120x80': string;
		'168x112': string;
		'192x128': string;
		'336x224': string;
		'60x40': string;
		'96x64': string;
		[key: string]: string;
	}

	interface Review {
		avatar: UserAvatarSizes;
		id: number;
		itemTitle: string;
		rated: string;
		score: number;
		stageTitle: string;
		textSections: Array<{ text: string }>;
		title: string;
		titleCaption: string;
		images?: Array<{
			'1280x960': string;
			'180x135': string;
			'256x192': string;
			'640x480': string;
			originalSize: {
				width: number;
				height: number;
			};
		}>;
		deliveryTitle?: string;
		answer?: Answer;
	}

	interface ReviewFilters {
		sort: 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';
		onlyWithImages: boolean;
		onlyWithDelivery: boolean;
	}

	export let sellerName: string;
	export let ratingStat: RatingEntry[];
	export let scoreFloat: number;
	export let totalReviews: number;
	export let userId: string;

	const dispatch = createEventDispatcher();
	let reviews: Review[] = [];
	let loading = false;
	let hasMore = true;
	let offset = 0;
	let modalContainer: HTMLDivElement;
	let selectedImages: Review['images'] | null = null;
	let selectedImageIndex = 0;
	let touchStartX = 0;
	let touchEndX = 0;
	let isSwiping = false;

	const sortOptions = [
		{ value: 'date_desc', label: 'Сначала новые' },
		{ value: 'date_asc', label: 'Сначала старые' },
		{ value: 'score_desc', label: 'Сначала положительные' },
		{ value: 'score_asc', label: 'Сначала отрицательные' }
	];

	let filters: ReviewFilters = {
		sort: 'date_desc',
		onlyWithImages: false,
		onlyWithDelivery: false
	};

	async function loadReviews(resetList = false) {
		if (loading || (!hasMore && !resetList)) return;

		loading = true;
		try {
			if (resetList) {
				reviews = [];
				offset = 0;
				hasMore = true;
			}

			const response = await fetch(
				`/api/reviews?userId=${userId}&offset=${offset}&sortRating=${filters.sort}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						cookies: $avitoCookies
					})
				}
			);
			const data = await response.json();

			if (data.reviews) {
				let filteredReviews = data.reviews;

				if (filters.onlyWithImages) {
					filteredReviews = filteredReviews.filter(
						(review: Review) => review.images && review.images.length > 0
					);
				}

				if (filters.onlyWithDelivery) {
					filteredReviews = filteredReviews.filter(
						(review: Review) => review.deliveryTitle
					);
				}

				reviews = resetList ? filteredReviews : [...reviews, ...filteredReviews];
				offset += 25;
				hasMore = data.reviews.length > 0 && data.nextPage !== null;
			}
		} catch (error) {
			console.error('Error loading reviews:', error);
		} finally {
			loading = false;
		}
	}

	function handleFilterChange() {
		loadReviews(true);
	}

	function handleScroll(e: Event) {
		const target = e.target as HTMLElement;
		if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) {
			loadReviews();
		}
	}

	function handleTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0].clientX;
		isSwiping = true;
	}

	function handleTouchMove(event: TouchEvent) {
		if (!isSwiping) return;
		touchEndX = event.touches[0].clientX;
	}

	function handleTouchEnd() {
		if (!isSwiping) return;

		const swipeDistance = touchEndX - touchStartX;
		const minSwipeDistance = 50;

		if (Math.abs(swipeDistance) > minSwipeDistance && selectedImages) {
			if (swipeDistance > 0 && selectedImageIndex > 0) {
				selectedImageIndex--;
				preloadImages(selectedImageIndex);
			} else if (swipeDistance < 0 && selectedImageIndex < selectedImages.length - 1) {
				selectedImageIndex++;
				preloadImages(selectedImageIndex);
			}
		}

		isSwiping = false;
		touchStartX = 0;
		touchEndX = 0;
	}

	function preloadImages(currentIndex: number) {
		if (!selectedImages) return;

		if (currentIndex > 0) {
			const prevImg = new Image();
			prevImg.src = selectedImages[currentIndex - 1]['1280x960'];
		}

		if (currentIndex < selectedImages.length - 1) {
			const nextImg = new Image();
			nextImg.src = selectedImages[currentIndex + 1]['1280x960'];
		}
	}

	function showImage(images: Review['images'], index: number) {
		if (images) {
			selectedImages = images;
			selectedImageIndex = index;
			preloadImages(index);
		}
	}

	onMount(() => {
		modalContainer?.focus();
		loadReviews();
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			close();
		} else if (selectedImages) {
			if (event.key === 'ArrowRight' && selectedImageIndex < selectedImages.length - 1) {
				event.stopPropagation();
				selectedImageIndex++;
				preloadImages(selectedImageIndex);
			} else if (event.key === 'ArrowLeft' && selectedImageIndex > 0) {
				event.stopPropagation();
				selectedImageIndex--;
				preloadImages(selectedImageIndex);
			}
		}
	}

	$: if (selectedImages && selectedImageIndex >= 0) {
		preloadImages(selectedImageIndex);
	}

	function close() {
		dispatch('close');
	}

	function handleImageViewerClose() {
		selectedImages = null;
		setTimeout(() => modalContainer?.focus(), 0);
	}

	function decodeHtmlEntities(text: string): string {
		const textarea = document.createElement('textarea');
		textarea.innerHTML = text;
		return textarea.value;
	}

	$: totalScore = ratingStat.reduce((acc, curr) => acc + curr.count, 0);
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	bind:this={modalContainer}
	class="fixed inset-0 z-[80] bg-background/80 outline-none backdrop-blur-sm"
	on:click|self={close}
	on:keydown={handleKeydown}
	tabindex="0"
	transition:fly={{ duration: 200, opacity: 0 }}
>
	<div
		class="fixed bottom-0 z-[80] h-[85vh] w-full overflow-y-auto rounded-t-3xl border bg-background p-0 shadow-lg duration-200 md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-6xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
		on:scroll={handleScroll}
		on:click|stopPropagation
		transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
	>
		<div class="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
			<div class="px-4 py-3 md:px-6 md:py-4">
				<div class="relative flex items-center justify-between gap-2">
					<h2 class="text-lg font-semibold leading-tight tracking-tight md:text-2xl">
						Отзывы о продавце {decodeHtmlEntities(sellerName)}
					</h2>
					<button
						class="hidden h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:flex"
						on:click={close}
					>
						<X class="h-5 w-5" />
						<span class="sr-only">Закрыть</span>
					</button>
				</div>
			</div>
		</div>

		<div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:hidden">
			<button
				class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
				on:click={close}
			>
				<X class="h-5 w-5" />
				<span class="sr-only">Закрыть</span>
			</button>
		</div>

		<div class="p-4">
			<div class="rounded-2xl border bg-card p-4 text-card-foreground">
				<div class="mb-6 flex items-center gap-4">
					<div class="text-4xl font-bold">{scoreFloat}</div>
					<div class="flex-1">
						<div class="mb-1 flex">
							{#each Array(5) as _, i}
								<Star
									class="h-5 w-5 {i < Math.round(scoreFloat)
										? 'fill-primary text-primary'
										: 'fill-muted text-muted'}"
								/>
							{/each}
						</div>
						<div class="text-sm text-muted-foreground">
							На основании {totalReviews} оценок
						</div>
					</div>
				</div>

				<div class="space-y-3">
					{#each ratingStat as rating}
						{@const percentage = (rating.count / totalScore) * 100}
						<div class="flex items-center gap-3">
							<div class="w-20 text-sm">
								{rating.score}
								{rating.score === 5
									? '★★★★★'
									: rating.score === 4
										? '★★★★'
										: rating.score === 3
											? '★★★'
											: rating.score === 2
												? '★★'
												: '★'}
							</div>
							<div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
								<div class="h-full bg-primary" style="width: {percentage}%" />
							</div>
							<div class="w-16 text-right text-sm text-muted-foreground">
								{rating.count}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-6 flex flex-wrap items-center gap-4">
				<div class="w-full sm:w-auto">
					<Select
						options={sortOptions}
						bind:value={filters.sort}
						on:change={handleFilterChange}
					/>
				</div>

				<Toggle
					bind:checked={filters.onlyWithImages}
					label="Только с фото"
					on:change={handleFilterChange}
				/>

				<Toggle
					bind:checked={filters.onlyWithDelivery}
					label="Только с Авито Доставкой"
					on:change={handleFilterChange}
				/>
			</div>

			<div class="mt-6 space-y-4">
				{#each reviews as review}
					<div class="rounded-2xl border bg-card p-4 text-card-foreground">
						<div class="flex items-start gap-3">
							<img
								src={review.avatar['64x64']}
								alt={review.title}
								class="h-10 w-10 rounded-full object-cover"
							/>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium">{review.title}</span>
									<span class="text-sm text-muted-foreground">·</span>
									<span class="text-sm text-muted-foreground"
										>{review.titleCaption}</span
									>
								</div>
								<div class="mt-1 flex items-center gap-2">
									<div class="flex">
										{#each Array(5) as _, i}
											<Star
												class="h-4 w-4 {i < review.score
													? 'fill-primary text-primary'
													: 'fill-muted text-muted'}"
											/>
										{/each}
									</div>
									<span class="text-sm text-muted-foreground">{review.rated}</span
									>
									{#if review.deliveryTitle}
										<span
											class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
										>
											Авито Доставка
										</span>
									{/if}
								</div>
							</div>
						</div>

						<div class="mt-4">
							{#if review.itemTitle}
								<div class="text-sm text-muted-foreground">
									Товар: {review.itemTitle}
								</div>
							{/if}
							{#if review.stageTitle}
								<div class="mt-1 text-sm text-muted-foreground">
									{review.stageTitle}
								</div>
							{/if}
							{#if review.textSections?.length}
								<div class="mt-2 whitespace-pre-line text-sm">
									{review.textSections[0].text}
								</div>
							{/if}
							{#if review.images && review.images.length > 0}
								<div class="mt-3 flex flex-wrap gap-2">
									{#each review.images as image, i}
										<button
											class="relative block h-24 w-24 overflow-hidden rounded-lg transition-opacity hover:opacity-90"
											on:click={() => showImage(review.images, i)}
										>
											<img
												src={image['256x192']}
												alt="Фото к отзыву"
												class="h-full w-full object-cover"
											/>
										</button>
									{/each}
								</div>
							{/if}

							{#if review.answer}
								<div class="mt-4 border-l-2 border-muted pl-4">
									<div class="flex items-start gap-3">
										<img
											src={review.answer.avatar['96x64']}
											alt={review.answer.title}
											class="h-8 w-8 rounded-full object-cover"
										/>
										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-2">
												<a
													href={review.answer.link}
													target="_blank"
													rel="noopener noreferrer"
													class="font-medium text-primary"
												>
													{review.answer.title}
												</a>
												<span class="text-sm text-muted-foreground">·</span>
												<span class="text-sm text-muted-foreground"
													>{review.answer.answered}</span
												>
											</div>
										</div>
									</div>
									<div class="mt-2 whitespace-pre-line text-sm">
										{review.answer.text}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="py-8 text-center text-muted-foreground">
						{#if loading}
							Загрузка отзывов...
						{:else}
							У продавца пока нет отзывов
						{/if}
					</div>
				{/each}

				{#if loading && reviews.length > 0}
					<div class="py-4 text-center text-sm text-muted-foreground">
						Загрузка отзывов...
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if selectedImages}
	<ImageViewer
		images={selectedImages}
		currentIndex={selectedImageIndex}
		on:close={handleImageViewerClose}
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}
	/>
{/if}
