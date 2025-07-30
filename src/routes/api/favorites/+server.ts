import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { action, ...body } = await request.json();

	if (action === 'add') {
		try {
			const { ids, cookies } = body;

			const response = await fetch('https://www.avito.ru/web/1/favorites/items/add', {
				method: 'POST',
				headers: {
					accept: '*/*',
					'content-type': 'application/json',
					cookie: cookies
				},
				body: JSON.stringify({
					ids,
					x: '0iPSQ9tztk2gfjrE',
					fromPage: 'main'
				})
			});

			const data = await response.json();
			return json(data);
		} catch (error) {
			console.error('Error adding to favorites:', error);
			return json({ error: 'Failed to add to favorites' }, { status: 500 });
		}
	}

	if (action === 'remove') {
		try {
			const { ids, cookies } = body;

			const response = await fetch('https://www.avito.ru/web/1/favorites/items/delete', {
				method: 'POST',
				headers: {
					accept: '*/*',
					'content-type': 'application/json',
					cookie: cookies
				},
				body: JSON.stringify({
					ids,
					x: '0iPSQ9tztk2gfjrE',
					fromPage: 'main'
				})
			});

			const data = await response.json();
			return json(data);
		} catch (error) {
			console.error('Error removing from favorites:', error);
			return json({ error: 'Failed to remove from favorites' }, { status: 500 });
		}
	}

	if (action === 'list') {
		try {
			const { cookies, page = 1 } = body;

			const response = await fetch(
				`https://www.avito.ru/web/1/favorites/items/list?order=added_at__desc&page=${page}`,
				{
					method: 'GET',
					headers: {
						accept: 'application/json, text/plain, */*',
						cookie: cookies
					}
				}
			);

			const data = await response.json();
			return json(data);
		} catch (error) {
			console.error('Error fetching favorites:', error);
			return json({ error: 'Failed to fetch favorites' }, { status: 500 });
		}
	}

	return json({ error: 'Invalid action' }, { status: 400 });
};
