export interface City {
	id: number;
	name: string;
	url: string;
}

export interface AvitoItem {
	category: {
		id: number;
		slug: string;
	};
	id: number;
	images: {
		'208x208': string;
		'236x236': string;
		'240x240': string;
		'416x416': string;
		'432x432': string;
		'472x472': string;
		'864x864': string;
	}[];
	imagesAlt: string;
	imagesCount: number;
	location: {
		id: number;
		name: string;
		namePrepositional: string;
	};
	locationId: number;
	priceDetailed: {
		postfix: string;
		string: string;
		value: number;
		valueOld: string;
		wasLowered: boolean;
	};
	title: string;
	urlPath: string;
	hasDiscount?: boolean;
	delivery?: Record<string, unknown>;
	bannerId?: string;
	isFavorite?: boolean;
	isActive?: boolean;
	isDeleted?: boolean;
}

export interface AvitoResponse {
	context: string;
	features: {
		imageAspectRatio: string;
	};
	items: AvitoItem[];
}

export interface AppState {
	selectedCity: City;
	recommendations: AvitoItem[];
	items: AvitoItem[];
}

export interface Category {
	id: number;
	name: string;
	deeplink: string;
	subcategories?: Category[];
}

export interface SearchParams {
	categoryId?: number;
	verticalCategoryId?: number;
	locationId?: number;
	name?: string;
	geoCoords?: [number, number];
	pmin?: number;
	pmax?: number;
	d?: 1 | 0;
	cd?: 1 | 0;
	view?: 'gallery' | 'list';
	p?: number;
	localPriority?: 1 | 0;
	sort?: string;
}

export const CATEGORIES: Category[] = [
	{
		id: 6,
		name: 'Электроника',
		subcategories: [
			{ id: 4, name: 'Компьютерная техника', verticalId: 4 },
			{ id: 5, name: 'Телефоны', verticalId: 4 },
			{ id: 7, name: 'Фото и видео', verticalId: 4 },
			{ id: 8, name: 'Аудио и видео', verticalId: 4 }
		]
	},
	{
		id: 24,
		name: 'Транспорт',
		subcategories: [
			{ id: 9, name: 'Автомобили', verticalId: 1 },
			{ id: 11, name: 'Мотоциклы', verticalId: 1 },
			{ id: 14, name: 'Спецтехника', verticalId: 1 }
		]
	},
	{
		id: 88,
		name: 'Недвижимость',
		subcategories: [
			{ id: 25, name: 'Квартиры', verticalId: 2 },
			{ id: 26, name: 'Дома', verticalId: 2 },
			{ id: 27, name: 'Комнаты', verticalId: 2 }
		]
	}
];

export interface AvitoCategory {
	id: number;
	name: string;
	parentId?: number;
	categoryId?: number;
	deeplink?: string;
	microcategoryId?: number;
	nodeType?: string;
	url?: string;
	image?: {
		'56x44': string;
	};
}

export interface SearchUrlParams {
	deeplink: string;
	locationId: number;
	p?: number;
}
