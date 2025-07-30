import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SearchParams, SearchUrlParams, AvitoItem } from '$lib/types';
import { isAvitoError } from '$lib/utils/handleAvitoError';

function adaptItem(item: any): AvitoItem {
	return {
		id: item.id,
		category: {
			id: item.categoryId,
			slug: item.category?.slug || ''
		},
		images: (item.images || []).map((img: any) => ({
			'208x208': img['208x208'] || '',
			'236x236': img['236x236'] || '',
			'240x240': img['240x240'] || img['236x236'] || '',
			'416x416': img['416x416'] || '',
			'432x432': img['432x432'] || '',
			'472x472': img['472x472'] || '',
			'864x864': img['864x864'] || ''
		})),
		imagesAlt: item.title || '',
		imagesCount: item.imagesCount || 0,
		location: {
			id: item.locationId,
			name: item.location?.name || '',
			namePrepositional: item.location?.namePrepositional || ''
		},
		locationId: item.locationId,
		priceDetailed: {
			postfix: item.priceDetailed?.postfix || '',
			string: item.priceDetailed?.string || '',
			value: item.priceDetailed?.value || 0,
			valueOld: item.priceDetailed?.stringWithoutDiscount || '',
			wasLowered: item.priceDetailed?.wasLowered || false
		},
		title: item.title || '',
		urlPath: item.urlPath || '',
		hasDiscount: item.discountPercent !== null,
		delivery: item.delivery || null,
		isFavorite: item.isFavorite || false
	};
}

function parseDeeplink(deeplink: string, page?: number): string {
	try {
		let searchParams = deeplink.replace('ru.avito://1/items/search', '');
		searchParams = searchParams.replace(/%5B/g, '[').replace(/%5D/g, ']');

		if (page && page > 1) {
			if (searchParams.includes('&p=')) {
				searchParams = searchParams.replace(/&p=\d+/, `&p=${page}`);
			} else {
				searchParams += `&p=${page}`;
			}
		}

		return searchParams;
	} catch (error) {
		console.error('Error parsing deeplink:', error);
		return '';
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const { cookies, params } = await request.json();

	let apiUrl = 'https://www.avito.ru/web/1/js/items';

	if ('deeplink' in params) {
		const searchParams = params as SearchUrlParams;
		const searchQuery = parseDeeplink(searchParams.deeplink);
		apiUrl += searchQuery;
		console.log('Deeplink search URL:', apiUrl);
		if (searchParams.p && searchParams.p > 1) {
			apiUrl += `&p=${searchParams.p}`;
		}
	} else {
		const searchParams = params as SearchParams;
		const queryParams = new URLSearchParams({
			_: '',
			view: searchParams.view || 'gallery',
			p: (searchParams.p || 1).toString(),
			cd: '1',
			localPriority: '1'
		});

		if (searchParams.categoryId) {
			queryParams.set('categoryId', searchParams.categoryId.toString());
		}
		if (searchParams.verticalCategoryId) {
			queryParams.set('verticalCategoryId', searchParams.verticalCategoryId.toString());
		}
		if (searchParams.locationId) {
			queryParams.set('locationId', searchParams.locationId.toString());
		}
		if (searchParams.name) {
			queryParams.set('q', searchParams.name);
		}
		if (searchParams.geoCoords) {
			queryParams.set('geoCoords', searchParams.geoCoords.join(','));
		}
		if (searchParams.pmin) {
			queryParams.set('pmin', searchParams.pmin.toString());
		}
		if (searchParams.pmax) {
			queryParams.set('pmax', searchParams.pmax.toString());
		}
		if (searchParams.d) {
			queryParams.set('d', searchParams.d.toString());
		}
		if (searchParams.sort) {
			queryParams.set('sort', searchParams.sort);
		}

		apiUrl += `?${queryParams.toString()}`;
		console.log('Search URL:', apiUrl);
	}

	try {
		const response = await fetch(apiUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
				Accept: 'application/json',
				Origin: 'https://www.avito.ru',
				Referer: 'https://www.avito.ru/',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'cross-site',
				'X-Requested-With': 'XMLHttpRequest',
				Cookie: cookies || ''
			}
		});

		const data = await response.json();
		console.log('Avito API response:', data);

		if (isAvitoError(data)) {
			return json(data, { status: 403 });
		}

		if (data.error || !data.catalog?.items) {
			return json(
				{
					status: 'error',
					result: {
						message: 'Не удалось получить результаты поиска'
					}
				},
				{ status: 500 }
			);
		}

		return json({
			items: data.catalog.items.map(adaptItem) || []
		});
	} catch (error) {
		console.error('Error fetching search results:', error);
		return json(
			{
				status: 'error',
				result: {
					message: 'Ошибка при получении результатов поиска'
				}
			},
			{ status: 500 }
		);
	}
};
