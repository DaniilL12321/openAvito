import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { cookies } = await request.json();
  
  try {
    const response = await fetch('https://www.avito.ru/web/1/category/tree', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'application/json',
        'Origin': 'https://www.avito.ru',
        'Referer': 'https://www.avito.ru/',
        'Cookie': cookies || ''
      }
    });

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500
    });
  }
}; 