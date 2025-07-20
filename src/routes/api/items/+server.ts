import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const locationId = url.searchParams.get('locationId') || '662810';
  const lastStamp = url.searchParams.get('lastStamp') || '';
  const limit = url.searchParams.get('limit') || '30';
  const offset = url.searchParams.get('offset') || '0';

  try {
    const response = await fetch(
      `https://www.avito.ru/web/1/main/items?forceLocation=false&locationId=${locationId}&lastStamp=${lastStamp}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500
    });
  }
}; 