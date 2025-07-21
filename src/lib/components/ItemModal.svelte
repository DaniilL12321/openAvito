<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { AvitoItem } from '$lib/types';
  import { selectedCity, cities, avitoCookies } from '$lib/stores';

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

<div class="modal-backdrop" on:click={close}>
  <div class="modal" on:click|stopPropagation>
    <button class="close-button" on:click={close}>×</button>
    
    <div class="modal-content">
      <div class="images-section">
        <div class="main-image-container">
          {#if item.images && item.images.length > 0}
            <img src={item.images[currentImageIndex]['864x864']} alt={item.imagesAlt} />
            
            {#if currentImageIndex > 0}
              <button class="nav-button prev" on:click={prevImage}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            {/if}
            
            {#if item.images && currentImageIndex < item.images.length - 1}
              <button class="nav-button next" on:click={nextImage}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            {/if}

            <div class="image-counter">
              {currentImageIndex + 1} / {item.images.length}
            </div>
          {/if}
        </div>

        {#if item.images && item.images.length > 1}
          <div class="thumbnails">
            {#each item.images as image, i}
              <button 
                class="thumbnail" 
                class:active={i === currentImageIndex}
                on:click={() => selectImage(i)}
              >
                <img src={image['208x208']} alt={`${item.imagesAlt} ${i + 1}`} />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="info">
        <h2>{item.title}</h2>
        
        <div class="price-block">
          <p class="price">{item.priceDetailed.string} ₽</p>
          {#if item.priceDetailed.wasLowered}
            <span class="price-lowered">Цена снижена</span>
          {/if}
          {#if item.hasDiscount}
            <span class="discount-badge">Скидка</span>
          {/if}
        </div>
        
        {#if getLocationString(item)}
          <p class="location">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {getLocationString(item)}
          </p>
        {/if}

        {#if loadingDescription}
          <div class="description-placeholder">
            <div class="loading-text">Загрузка описания...</div>
          </div>
        {:else if description}
          <div class="description">
            <h3>Описание</h3>
            <p>{description}</p>
          </div>
        {:else if descriptionError}
          <div class="description-error">
            Не удалось загрузить описание
          </div>
        {/if}

        {#if sellerInfo}
          <div class="seller-info">
            <h3>Информация о продавце</h3>
            <div class="seller-header">
              {#if sellerInfo.avatar}
                <img src={sellerInfo.avatar} alt={sellerInfo.name} class="seller-avatar" />
              {/if}
              <div class="seller-main-info">
                <div class="seller-name-type">
                  <h4>
                    <a href={sellerInfo.profileUrl} 
                       target="_blank" 
                       rel="noopener noreferrer">{sellerInfo.name}</a>
                  </h4>
                  <span class="seller-type">{sellerInfo.type}</span>
                  {#if sellerInfo.registrationDate}
                    <span class="seller-registration">· {sellerInfo.registrationDate}</span>
                  {/if}
                </div>
                {#if sellerInfo.rating}
                  <div class="seller-rating">
                    <span class="rating-value">{sellerInfo.rating}</span>
                    <div class="stars">
                      {#each Array(5) as _, i}
                        <svg class="star {i < Math.round(parseFloat(sellerInfo.rating.replace(',', '.'))) ? 'filled' : ''}" 
                             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="m10 14.99-4.92 3.26a.55.55 0 0 1-.83-.6l1.58-5.7L1.2 8.29a.55.55 0 0 1 .31-.98l5.9-.25 2.07-5.53a.55.55 0 0 1 1.02 0l2.07 5.53 5.9.25a.55.55 0 0 1 .31.98l-4.62 3.68 1.58 5.69a.55.55 0 0 1-.83.6z"/>
                        </svg>
                      {/each}
                    </div>
                    {#if sellerInfo.reviewsCount}
                      <a href={sellerInfo.profileUrl}
                         target="_blank" 
                         rel="noopener noreferrer" 
                         class="reviews-count">{sellerInfo.reviewsCount} отзывов</a>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>

            {#if sellerInfo.badges && sellerInfo.badges.length > 0}
              <div class="seller-badges">
                {#each sellerInfo.badges as badge}
                  <span class="badge">{badge}</span>
                {/each}
              </div>
            {/if}

            <div class="seller-details">
              {#if sellerInfo.itemsCount}
                <a href={sellerInfo.itemsUrl}
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="seller-items-count">{sellerInfo.itemsCount} объявлений</a>
              {/if}
              {#if sellerInfo.responseTime}
                <span class="seller-response-time">{sellerInfo.responseTime}</span>
              {/if}
            </div>
          </div>
        {/if}

        <div class="details">
          {#if item.category}
            <div class="detail-item">
              <span class="detail-label">Категория:</span>
              <span class="detail-value">{item.category.slug.replace(/_/g, ' ')}</span>
            </div>
          {/if}

          {#if item.delivery}
            <div class="detail-item">
              <span class="detail-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                Доступна доставка
              </span>
            </div>
          {/if}
        </div>

        <div class="actions">
          <a href="https://www.avito.ru{item.urlPath}" target="_blank" rel="noopener noreferrer" class="view-on-avito">
            Посмотреть на Авито
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