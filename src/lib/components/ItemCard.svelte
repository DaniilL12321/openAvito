<script lang="ts">
  import type { AvitoItem } from '$lib/types';
  import { selectedCity, cities } from '$lib/stores';
  import ItemModal from './ItemModal.svelte';
  
  export let item: AvitoItem;
  let showModal = false;

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

  $: isValid = item && 
    item.title && 
    item.urlPath && 
    item.priceDetailed?.string &&
    (item.images?.length > 0 || item.locationId);

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    showModal = true;
  }
</script>

{#if isValid}
  <div class="card">
    <a href="https://www.avito.ru{item.urlPath}" on:click={handleClick}>
      <div class="image-container">
        {#if item.images && item.images.length > 0}
          <img src={item.images[0]['432x432']} alt={item.imagesAlt} loading="lazy" />
        {/if}
        {#if item.hasDiscount}
          <span class="discount">Скидка</span>
        {/if}
      </div>
      <div class="content">
        <h3 class="title">{item.title}</h3>
        <p class="price">{item.priceDetailed.string} ₽</p>
        {#if getLocationString(item)}
          <p class="location">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="location-icon">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {getLocationString(item)}
          </p>
        {/if}
      </div>
    </a>
  </div>

  {#if showModal}
    <ItemModal {item} on:close={() => showModal = false} />
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