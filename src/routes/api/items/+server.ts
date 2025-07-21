import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { cookies, params } = await request.json();
  
  let apiUrl = 'https://www.avito.ru/web/1/main/items';
  const searchParams = new URLSearchParams({
    forceLocation: 'true',
    ...params
  });

  apiUrl += `?${searchParams.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'application/json',
        'Origin': 'https://www.avito.ru',
        'Referer': 'https://www.avito.ru/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookies || ''
      }
    });

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500
    });
  }
}; 