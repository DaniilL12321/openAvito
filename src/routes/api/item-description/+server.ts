    import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const AVITO_API_URL = 'https://m.avito.ru/api/19/items';

interface AvitoError {
    code: number;
    error: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { id, cookies } = await request.json();
		
		const apiUrl = `${AVITO_API_URL}/${id}?key=af0deccbgcgidddjgnvljitntccdduijhdinfgjgfjir`;

		const response = await fetch(apiUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
				'Accept': 'application/json',
				'Cookie': cookies
			}
		});

		if (!response.ok) {
			const error = await response.json() as AvitoError;
			return json({ error: error.error || 'Ошибка API Avito' }, { status: response.status });
		}

		const data = await response.json();
		
		if (data.error) {
			console.log('Data error:', data.error);
			return json({ error: data.error }, { status: 400 });
		}

		return json(data);

	} catch (error) {
		console.error('Error fetching item description:', error);
		return json({ error: 'Failed to fetch item description' }, { status: 500 });
	}
};
