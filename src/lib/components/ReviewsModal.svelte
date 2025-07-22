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
    avatar: string;
    link: string;
    text: string;
    title: string;
  }

  interface Review {
    avatar: string;
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
          filteredReviews = filteredReviews.filter((review: Review) => review.images && review.images.length > 0);
        }
        
        if (filters.onlyWithDelivery) {
          filteredReviews = filteredReviews.filter((review: Review) => review.deliveryTitle);
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

  function showImage(images: Review['images'], index: number) {
    if (images) {
      selectedImages = images;
      selectedImageIndex = index;
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
    }
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

<svelte:window on:keydown={handleKeydown}/>

<div 
  bind:this={modalContainer}
  class="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm outline-none" 
  on:click|self={close} 
  on:keydown={handleKeydown}
  tabindex="0"
  transition:fly={{ duration: 200, opacity: 0 }}
>
  <div
    class="fixed bottom-0 z-[80] h-[85vh] w-full overflow-y-auto border bg-background p-0 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-6xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
    on:scroll={handleScroll}
    on:click|stopPropagation
    transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
  >
    <div class="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-30">
      <div class="px-4 py-3 md:px-6 md:py-4">
        <div class="relative flex items-center justify-between gap-2">
          <h2 class="text-lg font-semibold leading-tight tracking-tight md:text-2xl">
            Отзывы о продавце {decodeHtmlEntities(sellerName)}
          </h2>
          <button
            class="h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 hidden md:flex"
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
        <div class="flex items-center gap-4 mb-6">
          <div class="text-4xl font-bold">{scoreFloat}</div>
          <div class="flex-1">
            <div class="flex mb-1">
              {#each Array(5) as _, i}
                <Star class="h-5 w-5 {i < Math.round(scoreFloat) ? 'fill-primary text-primary' : 'fill-muted text-muted'}" />
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
                {rating.score} {rating.score === 5 ? '★★★★★' : rating.score === 4 ? '★★★★' : rating.score === 3 ? '★★★' : rating.score === 2 ? '★★' : '★'}
              </div>
              <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-primary" style="width: {percentage}%" />
              </div>
              <div class="w-16 text-sm text-right text-muted-foreground">
                {rating.count}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-4 items-center">
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
                src={review.avatar}
                alt={review.title}
                class="h-10 w-10 rounded-full object-cover"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{review.title}</span>
                  <span class="text-sm text-muted-foreground">·</span>
                  <span class="text-sm text-muted-foreground">{review.titleCaption}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <div class="flex">
                    {#each Array(5) as _, i}
                      <Star class="h-4 w-4 {i < review.score ? 'fill-primary text-primary' : 'fill-muted text-muted'}" />
                    {/each}
                  </div>
                  <span class="text-sm text-muted-foreground">{review.rated}</span>
                  {#if review.deliveryTitle}
                    <span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
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
                <div class="mt-2 text-sm whitespace-pre-line">
                  {review.textSections[0].text}
                </div>
              {/if}
              {#if review.images && review.images.length > 0}
                <div class="mt-3 flex flex-wrap gap-2">
                  {#each review.images as image, i}
                    <button 
                      class="relative block w-24 h-24 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                      on:click={() => showImage(review.images, i)}
                    >
                      <img
                        src={image['256x192']}
                        alt="Фото к отзыву"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  {/each}
                </div>
              {/if}

              {#if review.answer}
                <div class="mt-4 pl-4 border-l-2 border-muted">
                  <div class="flex items-start gap-3">
                    <img
                      src={review.answer.avatar}
                      alt={review.answer.title}
                      class="h-8 w-8 rounded-full object-cover"
                    />
                    <div class="flex-1 min-w-0">
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
                        <span class="text-sm text-muted-foreground">{review.answer.answered}</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2 text-sm whitespace-pre-line">
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
  />
{/if} 