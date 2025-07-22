<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  export let lat: number;
  export let lon: number;
  export let zoom: number = 15;

  let map: mapboxgl.Map;
  let mapContainer: HTMLDivElement;

  onMount(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lon, lat],
      zoom: zoom
    });

    new mapboxgl.Marker()
      .setLngLat([lon, lat])
      .addTo(map);

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
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
</style> 