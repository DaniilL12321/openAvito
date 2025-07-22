<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { AvitoItem } from '$lib/types';
  import { selectedCity, cities, avitoCookies } from '$lib/stores';
  import { X, ChevronLeft, ChevronRight, MapPin, Star, ExternalLink, AlertCircle, ChevronDown } from 'lucide-svelte';
  import { fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import ReviewsModal from './ReviewsModal.svelte';
  import Map from './Map.svelte';

  interface RatingEntry {
    count: number;
    score: number;
    title: string;
  }

  interface SellerInfo {
    name: string;
    rating: string;
    reviewsCount: string;
    type: string;
    badges: string[];
    registrationDate: string;
    avatar: string;
    responseTime: string;
    itemsCount: string;
    profileUrl: string;
    itemsUrl: string;
    isCompany: boolean;
    ratingStat: RatingEntry[] | null;
    scoreFloat: number | null;
    sellerId: string;
  }

  interface LocationDetails {
    shortAddress: string;
    fullAddress: string | null;
  }

  interface Location {
    lat: number;
    lon: number;
  }

  export let item: AvitoItem;
  
  const dispatch = createEventDispatcher();
  let currentImageIndex = 0;
  let description = '';
  let loadingDescription = false;
  let descriptionError = false;
  let sellerInfo: SellerInfo | null = null;
  let isDeleted = false;
  let isClosed = false;
  let showReviews = false;
  let modalContainer: HTMLDivElement;
  let location: Location | null = null;
  let showMap = false;
  let touchStartX = 0;
  let touchEndX = 0;
  let isSwiping = false;

  async function getLocationDetails(lat: number, lon: number): Promise<LocationDetails> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=ru`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const fullAddress = data.features[0].place_name;
        const shortMatch = fullAddress.match(/Ярославль(?:,\s*([^,]+))?/);
        const shortAddress = shortMatch 
          ? shortMatch[1] 
            ? `Ярославль, ${shortMatch[1]}` 
            : 'Ярославль'
          : fullAddress;

        return {
          shortAddress,
          fullAddress
        };
      }
      
      return {
        shortAddress: getLocationString(item),
        fullAddress: null
      };
    } catch (error) {
      console.error('Error fetching location details:', error);
      return {
        shortAddress: getLocationString(item),
        fullAddress: null
      };
    }
  }

  let locationDetails: LocationDetails | null = null;

  onMount(async () => {
    modalContainer?.focus();
    loadingDescription = true;
    
    if (item.images && item.images.length > 0) {
      item.images.forEach(image => {
        const img = new Image();
        img.src = image['864x864'];
      });
    }
    
    try {
      const response = await fetch('/api/item-description', {
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
      
      if (data.description) {
        description = data.description;
      }
      if (data.sellerInfo) {
        sellerInfo = data.sellerInfo;
      }
      if (data.location) {
        location = data.location;
        locationDetails = await getLocationDetails(data.location.lat, data.location.lon);
      }
      isDeleted = data.isDeleted || false;
      isClosed = data.isClosed || false;
    } catch (error) {
      console.error('Error loading description:', error);
      descriptionError = true;
    } finally {
      loadingDescription = false;
    }
  });

  function close() {
    dispatch('close');
  }

  function handleReviewsClose() {
    showReviews = false;
    setTimeout(() => modalContainer?.focus(), 0);
  }

  function nextImage() {
    if (item.images && currentImageIndex < item.images.length - 1) {
      currentImageIndex++;
      if (currentImageIndex + 1 < item.images.length) {
        const nextImg = new Image();
        nextImg.src = item.images[currentImageIndex + 1]['864x864'];
      }
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      if (currentImageIndex - 1 >= 0) {
        const prevImg = new Image();
        prevImg.src = item.images[currentImageIndex - 1]['864x864'];
      }
    }
  }

  function selectImage(index: number) {
    currentImageIndex = index;
    if (index + 1 < item.images.length) {
      const nextImg = new Image();
      nextImg.src = item.images[index + 1]['864x864'];
    }
    if (index - 1 >= 0) {
      const prevImg = new Image();
      prevImg.src = item.images[index - 1]['864x864'];
    }
  }

  function getLocationString(item: AvitoItem): string {
    let location = '';
    const cityById = $cities.find(c => c.id === item.locationId);
    const currentCity = cityById || $selectedCity;
    
    if (currentCity.name === 'Все регионы') {
      return item.location?.name || '';
    }
    
    if (item.location?.name) {
      location = item.location.name;
    } else if (item.location?.id) {
      const parts = item.location.name?.split(', ') || [];
      const district = parts.length > 1 ? parts[1] : '';
      location = district ? `${currentCity.name}, ${district}` : currentCity.name;
    } else if (typeof item.locationId === 'number') {
      location = currentCity.name;
    }
    
    return location;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    } else if (event.key === 'ArrowLeft') {
      event.stopPropagation();
      prevImage();
    } else if (event.key === 'ArrowRight') {
      event.stopPropagation();
      nextImage();
    }
  }

  function decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
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

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }

    isSwiping = false;
    touchStartX = 0;
    touchEndX = 0;
  }
</script>

<div 
  bind:this={modalContainer}
  class="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm outline-none" 
  on:click|self={close}
  on:keydown={handleKeydown}
  tabindex="0"
  transition:fly={{ duration: 200, opacity: 0 }}
>
  <div
    class="fixed bottom-0 z-[70] h-[85vh] w-full overflow-y-auto border bg-background p-0 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-6xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
    on:click|stopPropagation
    transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
  >
    <div class="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-30">
      <div class="px-4 py-3 md:px-6 md:py-4">
        <div class="relative flex items-center justify-between gap-2">
          <h2 class="text-lg font-semibold leading-tight tracking-tight md:text-2xl line-clamp-2 text-foreground">{item.title}</h2>
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

    <div class="p-4 lg:p-8">
      <div class="grid min-w-0 gap-4 md:grid-cols-2 md:gap-6">
        <div class="space-y-4 min-w-0">
          <div class="relative aspect-square overflow-hidden rounded-2xl bg-muted">
            {#if isDeleted}
              <div class="absolute inset-0 flex flex-col items-center justify-center bg-card">
                <AlertCircle class="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 class="text-lg font-semibold">Объявление удалено</h3>
                <p class="mt-2 text-sm text-muted-foreground text-center px-4">
                  Это объявление было удалено<br>или больше не доступно
                </p>
              </div>
            {:else if item.images && item.images.length > 0}
              <img
                src={item.images[currentImageIndex]['864x864']}
                alt={item.imagesAlt}
                class="h-full w-full object-contain touch-pan-x"
                on:touchstart={handleTouchStart}
                on:touchmove={handleTouchMove}
                on:touchend={handleTouchEnd}
              />
              
              {#if currentImageIndex > 0}
                <button
                  class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background md:left-4 md:p-3"
                  on:click={prevImage}
                >
                  <ChevronLeft class="h-4 w-4 md:h-5 md:w-5" />
                  <span class="sr-only">Предыдущее фото</span>
                </button>
              {/if}
              
              {#if item.images && currentImageIndex < item.images.length - 1}
                <button
                  class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background md:right-4 md:p-3"
                  on:click={nextImage}
                >
                  <ChevronRight class="h-4 w-4 md:h-5 md:w-5" />
                  <span class="sr-only">Следующее фото</span>
                </button>
              {/if}

              <div class="absolute bottom-2 right-2 rounded-full bg-background/80 px-3 py-1.5 text-xs backdrop-blur-sm md:bottom-4 md:right-4 md:px-4 md:py-2 md:text-sm">
                {currentImageIndex + 1} / {item.images.length}
              </div>
            {/if}
          </div>

          {#if item.images && item.images.length > 1 && !isDeleted}
            <div class="relative">
              <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
                <div class="flex gap-2 px-2 md:px-0">
                  {#each item.images as image, i}
                    <button
                      class="relative aspect-square h-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors md:h-20
                        {i === currentImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'}"
                      on:click={() => selectImage(i)}
                    >
                      <img
                        src={image['208x208']}
                        alt={`${item.imagesAlt} ${i + 1}`}
                        class="h-full w-full object-cover"
                        loading="eager"
                        decoding="sync"
                      />
                    </button>
                  {/each}
                </div>
              </div>
              {#if item.images.length > 5}
                <div class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />
              {/if}
            </div>
          {/if}
        </div>

        <div class="space-y-4 min-w-0 md:space-y-6">
          <div class="space-y-4 min-w-0">
            <div class="flex flex-wrap items-center gap-2 md:gap-4">
              <p class="text-2xl font-bold md:text-3xl">{item.priceDetailed.string} ₽</p>
              {#if item.priceDetailed.wasLowered}
                <span class="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 md:px-4 md:py-2 md:text-sm">
                  Цена снижена
                </span>
              {/if}
              {#if item.hasDiscount}
                <span class="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive md:px-4 md:py-2 md:text-sm">
                  Скидка
                </span>
              {/if}
            </div>
            
            {#if location}
              <div class="rounded-2xl border bg-card overflow-hidden">
                <button
                  class="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                  on:click={() => showMap = !showMap}
                >
                  <div class="flex items-start gap-2">
                    <MapPin class="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div class="text-left">
                      {#if locationDetails?.fullAddress}
                        <p class="text-sm">{locationDetails.fullAddress}</p>
                      {:else}
                        <p class="text-sm">{locationDetails?.shortAddress || ''}</p>
                      {/if}
                    </div>
                  </div>
                  <ChevronDown 
                    class="h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0"
                    style="transform: rotate({showMap ? '180deg' : '0deg'})"
                  />
                </button>

                {#if showMap}
                  <div 
                    transition:slide={{ duration: 200 }}
                    class="border-t"
                  >
                    <Map lat={location.lat} lon={location.lon} />
                  </div>
                {/if}
              </div>
            {/if}

            {#if loadingDescription}
              <div class="rounded-2xl border bg-card p-4 text-card-foreground">
                <div class="text-sm text-muted-foreground">Загрузка описания...</div>
              </div>
            {:else if description}
              <div class="rounded-2xl border bg-card p-4 text-card-foreground">
                <h3 class="mb-3 font-semibold md:mb-4">Описание</h3>
                {#if description.includes('<ul>')}
                  <div class="text-sm space-y-4">
                    {@html description
                      .replace(/([А-Яа-я ]+):<ul/g, '<div class="font-medium mb-2">$1:</div><ul')
                      .replace(/<ul>/g, '<ul class="space-y-2">')
                      .replace(/<li>/g, '<li class="flex gap-2 items-baseline"><span class="text-muted-foreground">•</span>')
                      .replace(/<\/li>/g, '</li>')
                      .replace(/:\s*<\/ul>/g, '</ul>')
                      .replace(/\n/g, '<br>')
                    }
                  </div>
                {:else}
                  <p class="whitespace-pre-line text-sm">{description}</p>
                {/if}
              </div>
            {:else if descriptionError}
              <div class="rounded-2xl bg-destructive/10 p-4 text-destructive">
                Не удалось загрузить описание
              </div>
            {/if}

            {#if sellerInfo}
              <div class="rounded-2xl border bg-card p-4 text-card-foreground">
                <h3 class="font-semibold">Информация о продавце</h3>
                <div class="flex items-start gap-4">
                  {#if sellerInfo.avatar}
                    <img
                      src={sellerInfo.avatar}
                      alt={decodeHtmlEntities(sellerInfo.name)}
                      class="h-12 w-12 rounded-full object-cover md:h-16 md:w-16"
                    />
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-1 md:gap-2">
                      <a
                        href={sellerInfo.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="truncate font-medium text-primary"
                      >
                        {decodeHtmlEntities(sellerInfo.name)}
                      </a>
                      <span class="text-sm text-muted-foreground">·</span>
                      <span class="text-sm text-muted-foreground truncate">{sellerInfo.type}</span>
                      {#if sellerInfo.registrationDate}
                        <span class="text-sm text-muted-foreground">·</span>
                        <span class="text-sm text-muted-foreground truncate">{sellerInfo.registrationDate}</span>
                      {/if}
                    </div>
                    
                    {#if sellerInfo.rating}
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="font-medium">{sellerInfo.rating}</span>
                        <div class="flex">
                          {#each Array(5) as _, i}
                            <Star
                              class="h-4 w-4 {i < Math.round(parseFloat(sellerInfo.rating.replace(',', '.')))
                                ? 'fill-primary text-primary'
                                : 'fill-muted text-muted'}"
                            />
                          {/each}
                        </div>
                        {#if sellerInfo.reviewsCount}
                          <button
                            class="text-sm text-primary"
                            on:click={() => showReviews = true}
                          >
                            {sellerInfo.reviewsCount} отзывов
                          </button>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>

                {#if sellerInfo.badges && sellerInfo.badges.length > 0}
                  <div class="flex flex-wrap gap-2 py-2">
                    {#each sellerInfo.badges as badge}
                      <span class="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary md:px-4 md:py-2">
                        {decodeHtmlEntities(badge)}
                      </span>
                    {/each}
                  </div>
                {/if}

                <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {#if sellerInfo.itemsCount}
                    <a
                      href={sellerInfo.itemsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary hover:underline"
                    >
                      {sellerInfo.itemsCount} объявлений
                    </a>
                  {/if}
                  {#if sellerInfo.responseTime}
                    <span>{sellerInfo.responseTime}</span>
                  {/if}
                </div>
              </div>
            {/if}

            <div class="flex items-center gap-4 pb-20 md:pb-0">
              <a
                href="https://www.avito.ru{item.urlPath}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:px-6 md:py-3"
              >
                Открыть на Авито
                <ExternalLink class="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#if showReviews && sellerInfo && sellerInfo.ratingStat && sellerInfo.scoreFloat !== null}
  <ReviewsModal
    sellerName={sellerInfo.name}
    ratingStat={sellerInfo.ratingStat}
    scoreFloat={sellerInfo.scoreFloat}
    totalReviews={parseInt(sellerInfo.reviewsCount)}
    userId={sellerInfo.isCompany ? sellerInfo.sellerId || '' : sellerInfo.profileUrl.match(/\/user\/([^/?]+)/)?.[1] || ''}
    on:close={handleReviewsClose}
  />
{/if}

<style>

</style> 