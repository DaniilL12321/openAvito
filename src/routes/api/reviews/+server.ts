import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const AVITO_BASE_URL = 'https://www.avito.ru';

interface Review {
  avatar: string;
  id: number;
  itemTitle: string;
  rated: string;
  score: number;
  stageTitle: string;
  textSections: Array<{ text: string }>;
  title: string;
  titleCaption: string;
  images?: Array<{
    '1280x960': string;
    '180x135': string;
    '256x192': string;
    '640x480': string;
    originalSize: {
      width: number;
      height: number;
    };
  }>;
  deliveryTitle?: string;
}

interface ReviewsResponse {
  entries: Array<{
    type: string;
    value: Review | {
      sort?: {
        options: Array<{
          label: string;
          value: string;
        }>;
        paramName: string;
        selectedOption: string;
        updateLabel: string;
      };
    };
  }>;
  nextPage?: string;
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const offset = url.searchParams.get('offset') || '0';
    const { cookies } = await request.json();

    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    const isHash = /^[a-f0-9]{32}$/.test(userId);
    const apiUrl = `${AVITO_BASE_URL}/web/7/user/${userId}/ratings?limit=25&offset=${offset}&sortRating=date_desc&summary_redesign=1`;

    const response = await fetch(apiUrl, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'cookie': cookies,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const data = await response.json() as ReviewsResponse;
    const reviews: Review[] = [];

    for (const entry of data.entries) {
      if (entry.type === 'rating') {
        reviews.push(entry.value as Review);
      }
    }

    return json({
      reviews,
      nextPage: data.nextPage
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}; 