import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const AVITO_BASE_URL = 'https://www.avito.ru';

export const POST: RequestHandler = async ({ request }) => {
  const { url, cookies } = await request.json();
  
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL not provided' }), {
      status: 400
    });
  }

  try {
    const response = await fetch(`${AVITO_BASE_URL}${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cookie': cookies || ''
      }
    });

    const html = await response.text();
    
    const descriptionMatch = html.match(/<div[^>]*data-marker="item-view\/item-description"[^>]*>(.*?)<\/div>/s);
    let description = '';
    
    if (descriptionMatch) {
      description = descriptionMatch[1]
        .replace(/<p>/g, '\n')
        .replace(/<\/p>/g, '')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&mdash;/g, '—')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    const sellerInfo = {
      name: '',
      rating: '',
      reviewsCount: '',
      type: '',
      badges: [] as string[],
      registrationDate: '',
      avatar: '',
      responseTime: '',
      itemsCount: '',
      profileUrl: '',
      itemsUrl: '',
      isCompany: false
    };

    const nameMatch = html.match(/data-marker="seller-link\/link"[^>]*href="([^"]+)"[^>]*>.*?<span[^>]*>([^<]+)<\/span>/s);
    if (nameMatch) {
      const href = nameMatch[1];
      sellerInfo.name = nameMatch[2].trim();
      
      sellerInfo.profileUrl = href.startsWith('http') ? href : `${AVITO_BASE_URL}${href}`;
      
      if (href.includes('/brands/')) {
        sellerInfo.isCompany = true;
        sellerInfo.itemsUrl = sellerInfo.profileUrl;
      } else {
        sellerInfo.itemsUrl = `${sellerInfo.profileUrl}?page_from=from_item_card_button`;
      }
    }

    const ratingMatch = html.match(/<div class="Ww4IN seller-info-rating"><span class="Tdsqf">([0-9,]+)<\/span>/);
    if (ratingMatch) {
      sellerInfo.rating = ratingMatch[1];
    }

    const reviewsMatch = html.match(/data-marker="rating-caption\/rating"[^>]*>(\d+)\s+отзыв/);
    if (reviewsMatch) {
      sellerInfo.reviewsCount = reviewsMatch[1];
    }

    const typeMatch = html.match(/data-marker="seller-info\/label"[^>]*>([^<]+)(?:\s*·\s*([^<]+))?</);
    if (typeMatch) {
      sellerInfo.type = typeMatch[1].trim();
      if (typeMatch[2]) {
        sellerInfo.registrationDate = typeMatch[2].trim();
      }
    }

    const badgesMatches = html.matchAll(/data-marker="badge-title-[^"]*"[^>]*><span[^>]*>([^<]+)<\/span>/g);
    for (const match of badgesMatches) {
      sellerInfo.badges.push(match[1].trim());
    }

    const avatarMatch = html.match(/seller-info-avatar-image[^>]*style="background-image:url\('([^']+)'/);
    if (avatarMatch) {
      sellerInfo.avatar = avatarMatch[1];
    }

    const responseTimeMatch = html.match(/class="T7ujv[^"]*Gw0o7[^"]*"[^>]*>([^<]+)</);
    if (responseTimeMatch) {
      sellerInfo.responseTime = responseTimeMatch[1].trim();
    }

    const itemsCountMatch = html.match(/class="pUPB2[^"]*">(\d+)\s+объявлени/);
    if (itemsCountMatch) {
      sellerInfo.itemsCount = itemsCountMatch[1];
    }

    return json({ description, sellerInfo });
  } catch (error) {
    console.error('Error fetching item data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500
    });
  }
}; 