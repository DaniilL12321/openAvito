import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { url, cookies } = await request.json();
  
  try {
    const response = await fetch(`https://www.avito.ru${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Cookie': cookies || ''
      }
    });

    const html = await response.text();
    
    let location = null;
    let foundMethod = '';
    
    const locationMatch = html.match(/"location":\s*{\s*"lat":\s*([\d.]+),\s*"lon":\s*([\d.]+)\s*}/);
    if (locationMatch) {
      location = {
        lat: parseFloat(locationMatch[1]),
        lon: parseFloat(locationMatch[2])
      };
      foundMethod = 'location_object';
    }

    if (!location) {
      const mapMatch = html.match(/coords":\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/);
      if (mapMatch) {
        location = {
          lat: parseFloat(mapMatch[2]),
          lon: parseFloat(mapMatch[1])
        };
        foundMethod = 'map_coords';
      }
    }

    if (!location) {
      const metaMatch = html.match(/data-map-lat="([\d.]+)"\s+data-map-lon="([\d.]+)"/);
      if (metaMatch) {
        location = {
          lat: parseFloat(metaMatch[1]),
          lon: parseFloat(metaMatch[2])
        };
        foundMethod = 'meta_data';
      }
    }

    if (!location) {
      const scriptMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
      if (scriptMatch) {
        try {
          const jsonLd = JSON.parse(scriptMatch[1]);
          if (jsonLd.geo?.latitude && jsonLd.geo?.longitude) {
            location = {
              lat: parseFloat(jsonLd.geo.latitude),
              lon: parseFloat(jsonLd.geo.longitude)
            };
            foundMethod = 'json_ld';
          }
        } catch (e) {
          console.error('Error parsing JSON-LD:', e);
        }
      }
    }

    if (!location) {
      console.log('No location found for URL:', url);
      return json({ location: null, address: null });
    }

    const mapboxResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lon},${location.lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=ru`
    );
    const mapboxData = await mapboxResponse.json();

    let address = null;
    if (mapboxData.features && mapboxData.features.length > 0) {
      const feature = mapboxData.features[0];
      const locality = feature.context?.find(c => c.id.startsWith('locality.'))?.text_ru;
      const place = feature.context?.find(c => c.id.startsWith('place.'))?.text_ru;
      
      if (locality && place) {
        address = `${place}, ${locality}`;
      } else if (place) {
        address = place;
      } else {
        address = feature.place_name_ru.split(',')[1]?.trim() || feature.place_name_ru;
      }
    }

    return json({ location, address });
  } catch (error) {
    console.error('Error fetching item location:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch item location' }), {
      status: 500
    });
  }
}; 