<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { selectedCity } from '$lib/stores';
	import { Sparkles, Home, X, ChevronRight } from 'lucide-svelte';
	import { fly, scale } from 'svelte/transition';
	import { elasticOut, cubicOut } from 'svelte/easing';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		reset: void;
	}>();

	export let title: string;
	export let isSearch: boolean;

	let showReset = false;

	function handleReset() {
		dispatch('reset');
		goto('/', { replaceState: true });
	}
</script>

<div
	class="sticky top-0 z-20 -mx-2 border-b border-border/50 bg-background/95 px-2 backdrop-blur-sm md:static md:z-auto md:mx-0 md:border-none md:bg-transparent md:px-0 md:backdrop-blur-none"
>
	<div class="relative">
		<div class="scrollbar-none flex items-center gap-3 overflow-x-auto py-2">
			<button
				class="flex flex-shrink-0 items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-primary transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
				on:click={handleReset}
				on:mouseenter={() => (showReset = true)}
				on:mouseleave={() => (showReset = false)}
			>
				{#if showReset}
					<div in:scale={{ duration: 200, easing: elasticOut }}>
						<X class="h-4 w-4" />
					</div>
				{:else}
					<div in:scale={{ duration: 200, easing: elasticOut }}>
						<Home class="h-4 w-4" />
					</div>
				{/if}
				<span class="text-sm font-medium">
					{$selectedCity.name}
				</span>
			</button>

			<ChevronRight class="h-4 w-4 flex-shrink-0 text-muted-foreground" />

			<div
				class="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-primary-foreground"
				in:fly={{ x: 20, duration: 300, opacity: 1, easing: cubicOut }}
			>
				<Sparkles class="h-4 w-4" />
				<span class="whitespace-nowrap text-sm font-medium">
					{#if isSearch}
						Поиск: {$page.url.searchParams.get('q')}
					{:else}
						{title}
					{/if}
				</span>
			</div>
		</div>

		<div
			class="pointer-events-none absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l from-background to-transparent"
		/>
	</div>
</div>

<style>
	.scrollbar-none {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}
</style>
