import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { cookies } = await request.json();

    if (!cookies) {
      return json({ error: 'Cookies are required' }, { status: 400 });
    }

    const response = await fetch('https://www.avito.ru/web/1/category/tree?locationId=662810', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Cookie': cookies
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}; 