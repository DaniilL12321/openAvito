<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  export let lat: number;
  export let lon: number;
  export let zoom: number = 15;

  let map: mapboxgl.Map;
  let mapContainer: HTMLDivElement;

  const createMarkerElement = () => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    return el;
  };

  const isDarkTheme = () => document.documentElement.classList.contains('dark');

  const updateMapStyle = () => {
    if (map) {
      map.setStyle(isDarkTheme() 
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12'
      );
    }
  };

  onMount(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    map = new mapboxgl.Map({
      container: mapContainer,
      style: isDarkTheme() 
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12',
      center: [lon, lat],
      zoom: zoom
    });

    new mapboxgl.Marker({
      element: createMarkerElement()
    })
      .setLngLat([lon, lat])
      .addTo(map);

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateMapStyle();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true
    });

    onDestroy(() => {
      if (map) {
        observer.disconnect();
        map.remove();
      }
    });
  });
</script>

<div 
  bind:this={mapContainer}
  class="w-full h-[300px] rounded-b-xl overflow-hidden"
></div>

<style>
  :global(.mapboxgl-ctrl-logo) {
    display: none !important;
  }
  :global(.mapboxgl-ctrl-bottom-right) {
    display: none !important;
  }
  :global(.custom-marker) {
    width: 24px;
    height: 24px;
    background-color: hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 0 4px rgba(0,0,0,0.1);
  }
</style> 