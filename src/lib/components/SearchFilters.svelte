<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SearchParams } from '$lib/types';
	import { X } from 'lucide-svelte';

	export let searchParams: SearchParams = {};

	const dispatch = createEventDispatcher<{
		change: SearchParams;
	}>();

	let withDelivery = searchParams.d === 1;
	let minPrice = searchParams.pmin?.toString() || '';
	let maxPrice = searchParams.pmax?.toString() || '';

	function handleChange() {
		const params = { ...searchParams };

		if (withDelivery) {
			params.d = 1;
		} else {
			delete params.d;
		}

		if (minPrice) {
			params.pmin = parseInt(minPrice);
		} else {
			delete params.pmin;
		}

		if (maxPrice) {
			params.pmax = parseInt(maxPrice);
		} else {
			delete params.pmax;
		}

		dispatch('change', params);
	}

	function handleClear() {
		withDelivery = false;
		minPrice = '';
		maxPrice = '';
		dispatch('change', {});
	}
</script>

<div class="space-y-6">
	<div class="space-y-4">
		<div class="space-y-2">
			<label class="text-sm font-medium">Цена</label>
			<div class="flex items-center gap-2">
				<div class="relative flex-1">
					<input
						type="number"
						placeholder="От"
						bind:value={minPrice}
						on:input={handleChange}
						class="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
					/>
				</div>
				<div class="relative flex-1">
					<input
						type="number"
						placeholder="До"
						bind:value={maxPrice}
						on:input={handleChange}
						class="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
					/>
				</div>
			</div>
		</div>

		<button
			class="flex w-full items-center justify-between rounded-xl border p-3 transition-colors
        {withDelivery
				? 'border-primary bg-primary/5 dark:bg-primary/10'
				: 'hover:border-primary/20 hover:bg-primary/5 dark:hover:border-primary/30 dark:hover:bg-primary/10'}"
			on:click={() => {
				withDelivery = !withDelivery;
				handleChange();
			}}
		>
			<span class="text-sm">С доставкой</span>
			<div
				class="relative h-4 w-8 rounded-full transition-colors {withDelivery
					? 'bg-primary'
					: 'bg-muted'}"
			>
				<div
					class="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-background transition-transform {withDelivery
						? 'translate-x-4'
						: ''}"
				/>
			</div>
		</button>
	</div>

	<button
		class="flex w-full items-center justify-between rounded-xl border p-3 transition-colors hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive dark:hover:border-destructive/30 dark:hover:bg-destructive/20"
		on:click={handleClear}
	>
		<div class="flex items-center gap-3">
			<X class="h-5 w-5" />
			<span>Сбросить фильтры</span>
		</div>
	</button>
</div>
