import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const AVITO_BASE_URL = 'https://www.avito.ru';

interface RatingEntry {
	count: number;
	score: number;
	title: string;
}

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
}

interface ScoreEntry {
	ratingAction?: {
		description: string;
		link: {
			title: string;
			url: string;
		};
		title: string;
		uri: string;
	};
	ratingStat?: RatingEntry[];
	reviewCount?: number;
	score?: number;
	scoreFloat?: number;
	subtitle?: string;
	title?: string;
}

interface ReviewsResponse {
	entries: Array<{
		type: string;
		value: ScoreEntry | Review;
	}>;
	nextPage?: string;
}

async function fetchReviewsData(
	userId: string,
	cookies: string,
	offset: number = 0
): Promise<{
	reviewCount: number;
	ratingStat: RatingEntry[] | null;
	scoreFloat: number | null;
	reviews: Review[];
	nextPage: string | null;
} | null> {
	try {
		const response = await fetch(
			`${AVITO_BASE_URL}/web/7/user/${userId}/ratings?limit=25&offset=${offset}&sortRating=date_desc&summary_redesign=1`,
			{
				headers: {
					accept: 'application/json, text/plain, */*',
					'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
					'cache-control': 'no-cache',
					pragma: 'no-cache',
					cookie: cookies,
					'user-agent':
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			}
		);

		const data = (await response.json()) as ReviewsResponse;
		const reviews: Review[] = [];
		let scoreEntry: ScoreEntry | null = null;

		for (const entry of data.entries) {
			if (entry.type === 'score') {
				scoreEntry = entry.value as ScoreEntry;
			} else if (entry.type === 'rating') {
				reviews.push(entry.value as Review);
			}
		}

		if (scoreEntry && scoreEntry.reviewCount !== undefined) {
			return {
				reviewCount: scoreEntry.reviewCount,
				ratingStat: scoreEntry.ratingStat || null,
				scoreFloat: scoreEntry.scoreFloat || null,
				reviews,
				nextPage: data.nextPage || null
			};
		}
		return null;
	} catch (error) {
		console.error('Error fetching reviews data:', error);
		return null;
	}
}

async function fetchSellerIdFromBrandPage(
	brandUrl: string,
	cookies: string
): Promise<string | null> {
	try {
		const response = await fetch(brandUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				Cookie: cookies
			}
		});

		const html = await response.text();
		const sellerIdMatch = html.match(/sellerId=([a-f0-9]{32})/);
		return sellerIdMatch ? sellerIdMatch[1] : null;
	} catch (error) {
		console.error('Error fetching seller ID:', error);
		return null;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url, cookies } = await request.json();

		const response = await fetch(`https://www.avito.ru${url}`, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
				Cookie: cookies
			}
		});

		const html = await response.text();

		if (
			html.includes('Объявление не найдено') ||
			html.includes('Объявление снято с публикации')
		) {
			const isDeleted = html.includes('Объявление не найдено');
			return json({
				error: isDeleted ? 'Объявление удалено' : 'Объявление закрыто',
				isDeleted,
				isClosed: !isDeleted
			});
		}

		const locationMatch = html.match(/data-map-lat="([^"]+)"[^>]*data-map-lon="([^"]+)"/);
		const location = locationMatch
			? {
					lat: parseFloat(locationMatch[1]),
					lon: parseFloat(locationMatch[2])
				}
			: null;

		const descriptionMatch = html.match(
			/<div[^>]*data-marker="item-view\/item-description"[^>]*>(.*?)<\/div>/s
		);
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
			isCompany: false,
			ratingStat: null as RatingEntry[] | null,
			scoreFloat: null as number | null,
			sellerId: null as string | null
		};

		const nameMatch = html.match(
			/data-marker="seller-link\/link"[^>]*href="([^"]+)"[^>]*>.*?<span[^>]*>([^<]+)<\/span>/s
		);
		if (nameMatch) {
			const href = nameMatch[1];
			sellerInfo.name = nameMatch[2].trim();

			sellerInfo.profileUrl = href.startsWith('http') ? href : `https://www.avito.ru${href}`;

			if (href.includes('/brands/')) {
				sellerInfo.isCompany = true;
				sellerInfo.itemsUrl = sellerInfo.profileUrl;
				sellerInfo.sellerId = await fetchSellerIdFromBrandPage(
					sellerInfo.profileUrl,
					cookies
				);
			} else {
				sellerInfo.itemsUrl = `${sellerInfo.profileUrl}?page_from=from_item_card_button`;
			}

			const userIdMatch = sellerInfo.isCompany
				? sellerInfo.sellerId
				: sellerInfo.profileUrl.match(/\/user\/([^/?]+)/)?.[1];

			if (userIdMatch) {
				const reviewsData = await fetchReviewsData(userIdMatch, cookies);
				if (reviewsData) {
					sellerInfo.reviewsCount = reviewsData.reviewCount.toString();
					sellerInfo.ratingStat = reviewsData.ratingStat;
					sellerInfo.scoreFloat = reviewsData.scoreFloat;
				}
			}
		}

		const ratingMatch = html.match(
			/<div class="Ww4IN seller-info-rating"><span class="Tdsqf">([0-9,]+)<\/span>/
		);
		if (ratingMatch) {
			sellerInfo.rating = ratingMatch[1];
		}

		const typeMatch = html.match(
			/data-marker="seller-info\/label"[^>]*>([^<]+)(?:\s*·\s*([^<]+))?</
		);
		if (typeMatch) {
			sellerInfo.type = typeMatch[1].trim();
			if (typeMatch[2]) {
				sellerInfo.registrationDate = typeMatch[2].trim();
			}
		}

		const badgesMatches = html.matchAll(
			/data-marker="badge-title-[^"]*"[^>]*><span[^>]*>([^<]+)<\/span>/g
		);
		for (const match of badgesMatches) {
			sellerInfo.badges.push(match[1].trim());
		}

		const avatarMatch = html.match(
			/seller-info-avatar-image[^>]*style="background-image:url\('([^']+)'/
		);
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

		return json({ description, sellerInfo, location });
	} catch (error) {
		console.error('Error fetching item description:', error);
		return json({ error: 'Failed to fetch item description' }, { status: 500 });
	}
};
