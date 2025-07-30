interface AvitoError {
	status: string;
	result?: {
		message: string;
		link?: string;
	};
}

interface AvitoResponse {
	status?: string;
	result?: any;
	error?: any;
	items?: any[];
	catalog?: {
		items?: any[];
	};
}

export function isAvitoError(data: AvitoResponse): data is AvitoError {
	if (data.status === 'too-many-requests' || data.status === 'error') {
		return true;
	}

	const hasItems = Array.isArray(data.items) || Array.isArray(data.catalog?.items);
	const hasResult = data.result && typeof data.result === 'object';

	if (!hasItems && !hasResult) {
		return true;
	}

	return false;
}

export function handleAvitoError(data: AvitoResponse): {
	error: string | null;
	needCookies: boolean;
} {
	if (!isAvitoError(data)) {
		return { error: null, needCookies: false };
	}

	if (data.status === 'too-many-requests') {
		return {
			error: data.result?.message || 'Доступ временно ограничен',
			needCookies: true
		};
	}

	if (data.status === 'error') {
		return {
			error: data.result?.message || 'Произошла ошибка',
			needCookies: false
		};
	}

	return {
		error: 'Не удалось получить данные',
		needCookies: false
	};
}
