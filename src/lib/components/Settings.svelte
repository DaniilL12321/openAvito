<script lang="ts">
	import { avitoCookies } from '$lib/stores';
	import {
		Settings as SettingsIcon,
		X,
		Sun,
		Moon,
		Smartphone,
		Cookie,
		Trash2,
		Plus
	} from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { portal } from '$lib/actions/portal';
	import { onMount } from 'svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '$lib/stores/toast';
	import { createEventDispatcher } from 'svelte';

	export let showModal = false;
	const dispatch = createEventDispatcher();

	let isOpen = false;
	let showConfirmClear = false;
	let cookiesValue: string;
	let initialCookiesValue: string;
	let isDark = false;
	let isSystemTheme = true;
	let showColorPicker = false;
	let customHue = 217;
	let customSaturation = 91;
	let customLightness = 60;

	const colorSchemes = [
		{ name: 'Голубая', primary: '217.2 91.2% 59.8%', accent: '215 27.9% 16.9%' },
		{ name: 'Зелёная', primary: '142.1 76.2% 36.3%', accent: '143 47.9% 16.9%' },
		{ name: 'Фиолетовая', primary: '262.1 83.3% 57.8%', accent: '263 47.9% 16.9%' },
		{ name: 'Красная', primary: '346.8 77.2% 49.8%', accent: '345 47.9% 16.9%' },
		{ name: 'Оранжевая', primary: '24.6 95% 53.1%', accent: '25 47.9% 16.9%' }
	];

	let selectedColorScheme = colorSchemes[0];

	$: cookiesValue = $avitoCookies;
	$: cookiesChanged = cookiesValue !== initialCookiesValue;
	$: customColor = `${customHue} ${customSaturation}% ${customLightness}%`;
	$: customAccent = `${customHue} 47.9% 16.9%`;

	onMount(() => {
		initializeSettings();
	});

	function initializeSettings() {
		isDark = localStorage.getItem('theme') === 'dark';
		isSystemTheme = localStorage.getItem('themeMode') === 'system';

		const savedScheme = localStorage.getItem('colorScheme');
		if (savedScheme) {
			if (savedScheme === 'custom') {
				customHue = Number(localStorage.getItem('customHue')) || 217;
				customSaturation = Number(localStorage.getItem('customSaturation')) || 91;
				customLightness = Number(localStorage.getItem('customLightness')) || 60;
				applyCustomColor();
			} else {
				const scheme = colorSchemes.find((s) => s.name === savedScheme);
				if (scheme) {
					selectedColorScheme = scheme;
					applyColorScheme(scheme);
				}
			}
		} else {
			applyColorScheme(selectedColorScheme);
		}

		if (isSystemTheme) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			isDark = prefersDark;
		}
		document.documentElement.classList.toggle('dark', isDark);
	}

	function init() {
		initializeSettings();
		initialCookiesValue = $avitoCookies;
		isOpen = true;
	}

	function handleThemeChange(mode: 'light' | 'dark' | 'system') {
		isSystemTheme = mode === 'system';
		if (mode === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			isDark = prefersDark;
		} else {
			isDark = mode === 'dark';
		}
		document.documentElement.classList.toggle('dark', isDark);
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		localStorage.setItem('themeMode', mode);
	}

	function applyColorScheme(scheme: (typeof colorSchemes)[0]) {
		selectedColorScheme = scheme;
		document.documentElement.style.setProperty('--primary', scheme.primary);
		document.documentElement.style.setProperty('--accent', scheme.accent);
		localStorage.setItem('colorScheme', scheme.name);
	}

	function applyCustomColor() {
		document.documentElement.style.setProperty('--primary', customColor);
		document.documentElement.style.setProperty('--accent', customAccent);
		localStorage.setItem('colorScheme', 'custom');
		localStorage.setItem('customHue', customHue.toString());
		localStorage.setItem('customSaturation', customSaturation.toString());
		localStorage.setItem('customLightness', customLightness.toString());
	}

	function handleClearConfirm() {
		localStorage.clear();
		cookiesValue = '';
		avitoCookies.set('');
		initializeSettings();
		showConfirmClear = false;
	}

	function handleClearCancel() {
		showConfirmClear = false;
	}

	async function handleSaveCookies() {
		if (!cookiesChanged) {
			toasts.show('Cookies не были изменены', 'info');
			return;
		}

		try {
			avitoCookies.set(cookiesValue);
			await invalidateAll();
			initialCookiesValue = cookiesValue;
			toasts.show('Cookies успешно сохранены');
		} catch (error) {
			toasts.show('Не удалось обновить данные', 'error');
		}
	}

	function handleSave() {
		avitoCookies.set(cookiesValue);
		isOpen = false;
	}

	function handleOpen() {
		showModal = true;
		init();
	}

	function handleClose() {
		showModal = false;
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<button
	class="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
	on:click={handleOpen}
>
	<SettingsIcon class="h-6 w-6" />
	<span class="sr-only">Настройки</span>
</button>

{#if showModal}
	<div use:portal>
		<div
			class="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
			on:click|self={handleClose}
			transition:fly={{ duration: 200, opacity: 0 }}
		>
			<div
				class="fixed bottom-0 z-50 h-[85vh] w-full overflow-y-auto rounded-t-3xl border bg-background p-0 shadow-lg duration-200 md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-lg md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
				on:click|stopPropagation
				transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
			>
				<div class="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
					<div class="px-4 py-3 md:px-6 md:py-4">
						<div class="relative flex items-center justify-between gap-2">
							<h2
								class="text-lg font-semibold leading-tight tracking-tight md:text-2xl"
							>
								Настройки
							</h2>
							<button
								class="hidden h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:flex"
								on:click={handleClose}
							>
								<X class="h-5 w-5" />
								<span class="sr-only">Закрыть</span>
							</button>
						</div>
					</div>
				</div>

				<div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:hidden">
					<button
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
						on:click={handleClose}
					>
						<X class="h-5 w-5" />
						<span class="sr-only">Закрыть</span>
					</button>
				</div>

				<div class="p-4 lg:p-8">
					<div class="space-y-6">
						<div class="space-y-3">
							<h3 class="text-lg font-medium">Тема приложения</h3>
							<div class="grid grid-cols-3 gap-2">
								<button
									class="flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors
                    {!isDark && !isSystemTheme
										? 'border-primary bg-primary/5 dark:bg-primary/10'
										: 'hover:border-primary/20 hover:bg-primary/5 dark:hover:border-primary/30 dark:hover:bg-primary/10'}"
									on:click={() => handleThemeChange('light')}
								>
									<Sun class="h-5 w-5" />
									<span class="text-sm">Светлая</span>
								</button>
								<button
									class="flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors
                    {isDark && !isSystemTheme
										? 'border-primary bg-primary/5 dark:bg-primary/10'
										: 'hover:border-primary/20 hover:bg-primary/5 dark:hover:border-primary/30 dark:hover:bg-primary/10'}"
									on:click={() => handleThemeChange('dark')}
								>
									<Moon class="h-5 w-5" />
									<span class="text-sm">Тёмная</span>
								</button>
								<button
									class="flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors
                    {isSystemTheme
										? 'border-primary bg-primary/5 dark:bg-primary/10'
										: 'hover:border-primary/20 hover:bg-primary/5 dark:hover:border-primary/30 dark:hover:bg-primary/10'}"
									on:click={() => handleThemeChange('system')}
								>
									<Smartphone class="h-5 w-5" />
									<span class="text-sm">Системная</span>
								</button>
							</div>
						</div>

						<div class="space-y-3">
							<h3 class="text-lg font-medium">Цветовая схема</h3>
							<div class="grid grid-cols-2 gap-2">
								{#each colorSchemes as scheme}
									<button
										class="flex items-center gap-3 rounded-xl border p-3 transition-colors
                      {selectedColorScheme === scheme && !showColorPicker
											? 'border-primary bg-primary/5 dark:bg-primary/10'
											: 'hover:border-primary/20 hover:bg-primary/5 dark:hover:border-primary/30 dark:hover:bg-primary/10'}"
										on:click={() => {
											showColorPicker = false;
											applyColorScheme(scheme);
										}}
									>
										<div
											class="h-6 w-6 rounded-full shadow-sm"
											style="background: hsl({scheme.primary})"
										></div>
										<span class="text-sm">{scheme.name}</span>
									</button>
								{/each}
								<button
									class="flex items-center gap-3 rounded-xl border p-3 transition-colors
                    {showColorPicker
										? 'border-primary bg-primary/5 dark:bg-primary/10'
										: 'hover:border-primary/20 hover:bg-primary/5 dark:hover:border-primary/30 dark:hover:bg-primary/10'}"
									on:click={() => (showColorPicker = true)}
								>
									<div
										class="h-6 w-6 rounded-full shadow-sm"
										style="background: conic-gradient(
                      from 0deg,
                      hsl(0, 90%, 60%),
                      hsl(60, 90%, 60%),
                      hsl(120, 90%, 60%),
                      hsl(180, 90%, 60%),
                      hsl(240, 90%, 60%),
                      hsl(300, 90%, 60%),
                      hsl(360, 90%, 60%)
                    )"
									></div>
									<span class="text-sm">Свой цвет</span>
								</button>
							</div>

							{#if showColorPicker}
								<div
									class="mt-4 space-y-6"
									transition:fly={{
										y: 20,
										duration: 200,
										opacity: 1,
										easing: cubicOut
									}}
								>
									<div class="space-y-2">
										<label class="text-sm font-medium">Оттенок</label>
										<div
											class="relative h-11 overflow-hidden rounded-lg md:h-8"
										>
											<div
												class="absolute inset-0"
												style="background: linear-gradient(to right, 
                        hsl(0, {customSaturation}%, {customLightness}%),
                        hsl(60, {customSaturation}%, {customLightness}%),
                        hsl(120, {customSaturation}%, {customLightness}%),
                        hsl(180, {customSaturation}%, {customLightness}%),
                        hsl(240, {customSaturation}%, {customLightness}%),
                        hsl(300, {customSaturation}%, {customLightness}%),
                        hsl(360, {customSaturation}%, {customLightness}%)
                      )"
											></div>
											<input
												type="range"
												min="0"
												max="360"
												bind:value={customHue}
												on:input={applyCustomColor}
											/>
										</div>
									</div>

									<div class="space-y-2">
										<label class="text-sm font-medium">Насыщенность</label>
										<div
											class="relative h-11 overflow-hidden rounded-lg md:h-8"
										>
											<div
												class="absolute inset-0"
												style="background: linear-gradient(to right, 
                        hsl({customHue}, 0%, {customLightness}%),
                        hsl({customHue}, 100%, {customLightness}%)
                      )"
											></div>
											<input
												type="range"
												min="0"
												max="100"
												bind:value={customSaturation}
												on:input={applyCustomColor}
											/>
										</div>
									</div>

									<div class="space-y-2">
										<label class="text-sm font-medium">Яркость</label>
										<div
											class="relative h-11 overflow-hidden rounded-lg md:h-8"
										>
											<div
												class="absolute inset-0"
												style="background: linear-gradient(to right, 
                        hsl({customHue}, {customSaturation}%, 20%),
                        hsl({customHue}, {customSaturation}%, 80%)
                      )"
											></div>
											<input
												type="range"
												min="20"
												max="80"
												bind:value={customLightness}
												on:input={applyCustomColor}
											/>
										</div>
									</div>

									<div class="space-y-2">
										<label class="text-sm font-medium">Предпросмотр цвета</label
										>
										<div
											class="h-12 rounded-xl border shadow-sm"
											style="background: hsl({customColor})"
										></div>
									</div>
								</div>
							{/if}
						</div>

						<div class="space-y-3 pb-24 md:pb-0">
							<h3 class="text-lg font-medium">Данные</h3>
							<div class="space-y-4">
								<div class="space-y-2">
									<label for="cookies" class="flex items-center gap-2 text-sm">
										<Cookie class="h-4 w-4" />
										<span>Cookies авторизации</span>
									</label>
									<div class="space-y-3">
										<textarea
											id="cookies"
											bind:value={cookiesValue}
											class="h-24 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
											placeholder="Вставьте cookies здесь..."
										/>
										<div class="group relative">
											<button
												class="flex w-full items-center justify-center gap-2 rounded-xl p-3 transition-colors {cookiesChanged
													? 'bg-primary text-primary-foreground hover:bg-primary/90'
													: 'cursor-not-allowed bg-muted text-muted-foreground'}"
												on:click={handleSaveCookies}
												disabled={!cookiesChanged}
											>
												Сохранить
											</button>
											{#if !cookiesChanged}
												<div
													class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
												>
													Измените cookies для активации кнопки
													<div
														class="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[1px] border-8 border-transparent border-t-popover"
													></div>
												</div>
											{/if}
										</div>
									</div>
								</div>

								<button
									class="flex w-full items-center justify-between rounded-xl border p-3 transition-colors hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive dark:hover:border-destructive/30 dark:hover:bg-destructive/20"
									on:click={() => (showConfirmClear = true)}
								>
									<div class="flex items-center gap-3">
										<Trash2 class="h-5 w-5" />
										<span>Очистить данные</span>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if showConfirmClear}
	<ConfirmDialog
		title="Очистить данные"
		description="Это действие очистит все сохранённые настройки, включая цветовую схему, тему и cookies авторизации. Вы уверены?"
		confirmText="Очистить"
		destructive={true}
		on:confirm={handleClearConfirm}
		on:cancel={handleClearCancel}
	/>
{/if}

<style>
	textarea {
		font-family: monospace;
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 10;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px; /* Увеличили ширину */
		height: 32px;
		background: white;
		border: 2px solid white;
		border-radius: 12px; /* Увеличили скругление */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		margin-top: -2px; /* Компенсация для центрирования */
	}

	input[type='range']::-moz-range-thumb {
		width: 24px; /* Увеличили ширину */
		height: 32px;
		background: white;
		border: 2px solid white;
		border-radius: 12px; /* Увеличили скругление */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	input[type='range']:focus {
		outline: none;
	}

	/* Увеличиваем область захвата на мобильных */
	@media (max-width: 768px) {
		input[type='range'] {
			height: 44px; /* Увеличили высоту области */
		}

		input[type='range']::-webkit-slider-thumb {
			width: 32px; /* Ещё больше для мобильных */
			height: 44px;
		}

		input[type='range']::-moz-range-thumb {
			width: 32px; /* Ещё больше для мобильных */
			height: 44px;
		}
	}
</style>
