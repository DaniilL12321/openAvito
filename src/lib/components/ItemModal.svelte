<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { AvitoItem } from '$lib/types';
  import { selectedCity, cities, avitoCookies } from '$lib/stores';
  import { X, ChevronLeft, ChevronRight, MapPin, Star, ExternalLink } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

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
  }

  export let item: AvitoItem;
  
  const dispatch = createEventDispatcher();
  let currentImageIndex = 0;
  let description = '';
  let loadingDescription = false;
  let descriptionError = false;
  let sellerInfo: SellerInfo | null = null;

  onMount(async () => {
    loadingDescription = true;
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

  function nextImage() {
    if (item.images && currentImageIndex < item.images.length - 1) {
      currentImageIndex++;
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
    }
  }

  function selectImage(index: number) {
    currentImageIndex = index;
  }

  function getLocationString(item: AvitoItem): string {
    let location = '';
    const cityById = cities.find(c => c.id === item.locationId);
    const currentCity = cityById || $selectedCity;
    
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
    if (event.key === 'ArrowLeft') {
      prevImage();
    } else if (event.key === 'ArrowRight') {
      nextImage();
    } else if (event.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" on:click={close} transition:fly={{ duration: 200, opacity: 0 }}>
  <div
    class="fixed bottom-0 z-50 h-[85vh] w-full overflow-y-auto border bg-background p-4 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-6xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl md:p-6 lg:p-8"
    on:click|stopPropagation
    transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
  >
    <button
      class="absolute right-4 top-4 hidden h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:flex"
      on:click={close}
    >
      <X class="h-5 w-5" />
      <span class="sr-only">Закрыть</span>
    </button>

    <div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:hidden">
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        on:click={close}
      >
        <X class="h-5 w-5" />
        <span class="sr-only">Закрыть</span>
      </button>
    </div>

    <div class="grid min-w-0 gap-4 md:grid-cols-2 md:gap-6">
      <div class="space-y-4 min-w-0">
        <div class="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {#if item.images && item.images.length > 0}
            <img
              src={item.images[currentImageIndex]['864x864']}
              alt={item.imagesAlt}
              class="h-full w-full object-contain"
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

        {#if item.images && item.images.length > 1}
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
        <div>
          <h2 class="!text-foreground text-xl font-semibold leading-tight tracking-tight md:text-2xl">{item.title}</h2>
          
          <div class="mt-3 flex flex-wrap items-center gap-2 md:mt-4 md:gap-4">
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
          
          {#if getLocationString(item)}
            <p class="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin class="h-4 w-4" />
              {getLocationString(item)}
            </p>
          {/if}
        </div>

        {#if loadingDescription}
          <div class="rounded-2xl border bg-card p-4 text-card-foreground md:p-6">
            <div class="text-sm text-muted-foreground">Загрузка описания...</div>
          </div>
        {:else if description}
          <div class="rounded-2xl border bg-card p-4 text-card-foreground md:p-6">
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
          <div class="rounded-2xl bg-destructive/10 p-4 text-destructive md:p-6">
            Не удалось загрузить описание
          </div>
        {/if}

        {#if sellerInfo}
          <div class="rounded-2xl border bg-card p-4 text-card-foreground md:p-6">
            <h3 class="mb-3 font-semibold md:mb-4">Информация о продавце</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                {#if sellerInfo.avatar}
                  <img
                    src={sellerInfo.avatar}
                    alt={sellerInfo.name}
                    class="h-12 w-12 rounded-full object-cover md:h-16 md:w-16"
                  />
                {/if}
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-1 md:gap-2">
                    <a
                      href={sellerInfo.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="truncate font-medium text-primary hover:underline"
                    >
                      {sellerInfo.name}
                    </a>
                    <span class="text-sm text-muted-foreground">·</span>
                    <span class="text-sm text-muted-foreground truncate">{sellerInfo.type}</span>
                    {#if sellerInfo.registrationDate}
                      <span class="text-sm text-muted-foreground">·</span>
                      <span class="text-sm text-muted-foreground truncate">{sellerInfo.registrationDate}</span>
                    {/if}
                  </div>
                  
                  {#if sellerInfo.rating}
                    <div class="mt-2 flex flex-wrap items-center gap-2">
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
                        <a
                          href={sellerInfo.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-sm text-primary hover:underline"
                        >
                          {sellerInfo.reviewsCount} отзывов
                        </a>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>

              {#if sellerInfo.badges && sellerInfo.badges.length > 0}
                <div class="flex flex-wrap gap-2">
                  {#each sellerInfo.badges as badge}
                    <span class="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary md:px-4 md:py-2">
                      {badge}
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
          </div>
        {/if}

        <div class="flex items-center gap-4">
          <a
            href="https://www.avito.ru{item.urlPath}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:px-6 md:py-3"
          >
            Посмотреть на Авито
            <ExternalLink class="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    position: relative;
    overflow: hidden;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: white;
    border: none;
    font-size: 24px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 2;
  }

  .modal-content {
    display: flex;
    gap: 24px;
    padding: 24px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .images-section {
    flex: 2;
    max-width: 800px;
  }

  .main-image-container {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
    aspect-ratio: 1;
  }

  .main-image-container img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    background: #f5f5f5;
  }

  .nav-button.prev {
    left: 16px;
  }

  .nav-button.next {
    right: 16px;
  }

  .image-counter {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
  }

  .thumbnails {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 0;
    cursor: pointer;
    background: none;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .thumbnail.active {
    border-color: #00aaff;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 2px;
  }

  .info {
    flex: 1;
    min-width: 300px;
  }

  h2 {
    margin: 0 0 16px;
    font-size: 24px;
    color: #2b2b2b;
  }

  .price-block {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .price {
    font-size: 28px;
    font-weight: bold;
    margin: 0;
  }

  .price-lowered {
    background: #52c41a;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
  }

  .discount-badge {
    background: #ff4747;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    margin: 0 0 24px;
  }

  .details {
    margin: 24px 0;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .detail-item:last-child {
    margin-bottom: 0;
  }

  .detail-label {
    color: #666;
    font-size: 14px;
  }

  .detail-value {
    font-size: 14px;
    text-transform: capitalize;
  }

  .detail-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #e6f7ff;
    color: #0095e0;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
  }

  .actions {
    margin-top: 24px;
  }

  .view-on-avito {
    display: inline-block;
    background: #00aaff;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s ease;
  }

  .view-on-avito:hover {
    background: #0095e0;
  }

  .description {
    margin: 24px 0;
    padding: 16px;
    padding-top: 0;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
  }

  .description h3 {
    margin: 0 0 12px;
    font-size: 18px;
    color: #2b2b2b;
    position: sticky;
    top: 0;
    background: #fff;
    margin-top: -16px;
    margin-left: -16px;
    margin-right: -16px;
    padding: 8px 8px 8px;
    border-bottom: 1px solid #eee;
  }

  .description p {
    margin: 0;
    padding-top: 16px;
    line-height: 1.5;
    color: #444;
    white-space: pre-line;
    background: #fff;
  }

  .description-placeholder {
    margin: 24px 0;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;
  }

  .loading-text {
    color: #666;
    font-size: 14px;
  }

  .description-error {
    margin: 24px 0;
    padding: 12px;
    background: #fff1f0;
    border: 1px solid #ffccc7;
    border-radius: 8px;
    color: #cf1322;
    text-align: center;
    font-size: 14px;
  }

  .seller-info {
    margin: 24px 0;
    padding: 16px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
  }

  .seller-info h3 {
    margin: 0 0 16px;
    font-size: 18px;
    color: #2b2b2b;
    border-bottom: 1px solid #eee;
  }

  .seller-header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .seller-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
  }

  .seller-main-info {
    flex: 1;
  }

  .seller-name-type {
    margin-bottom: 8px;
  }

  .seller-name-type h4 {
    margin: 0;
    font-size: 16px;
    color: #00aaff;
    display: inline;
  }

  .seller-name-type h4 a {
    color: #00aaff;
    text-decoration: none;
  }

  .seller-name-type h4 a:hover {
    text-decoration: underline;
  }

  .seller-type {
    color: #666;
    font-size: 14px;
  }

  .seller-registration {
    color: #666;
    font-size: 14px;
  }

  .seller-rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rating-value {
    font-weight: 500;
    color: #2b2b2b;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .star {
    width: 16px;
    height: 16px;
    fill: #e0e0e0;
  }

  .star.filled {
    fill: #ffb021;
  }

  .reviews-count {
    color: #00aaff;
    text-decoration: none;
    font-size: 14px;
  }

  .reviews-count:hover {
    text-decoration: underline;
  }

  .seller-badges {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .badge {
    background: #ccecff;
    color: #000;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
  }

  .seller-details {
    margin-top: 16px;
    display: flex;
    gap: 16px;
    color: #666;
    font-size: 14px;
  }

  .seller-items-count {
    color: #00aaff;
    text-decoration: none;
  }

  .seller-items-count:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .modal-content {
      flex-direction: column;
      padding: 16px;
    }

    .info {
      min-width: auto;
    }

    h2 {
      font-size: 20px;
    }

    .price {
      font-size: 24px;
    }

    .nav-button {
      width: 32px;
      height: 32px;
    }

    .thumbnail {
      width: 60px;
      height: 60px;
    }

    .seller-header {
      flex-direction: column;
    }

    .seller-avatar {
      width: 48px;
      height: 48px;
    }

    .seller-badges {
      margin-top: 12px;
    }

    .seller-details {
      flex-direction: column;
      gap: 8px;
    }
  }
</style> 