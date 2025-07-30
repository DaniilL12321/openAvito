<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let checked = false;
	export let label = '';
	export let disabled = false;

	const dispatch = createEventDispatcher();

	function handleChange() {
		checked = !checked;
		dispatch('change', checked);
	}
</script>

<label
	class="flex cursor-pointer items-center gap-2 {disabled ? 'cursor-not-allowed opacity-50' : ''}"
>
	<div
		class="relative h-[24px] w-[44px] cursor-pointer rounded-full transition-colors duration-200 ease-in-out {checked
			? 'bg-primary'
			: 'bg-input'}"
		on:click={disabled ? undefined : handleChange}
		on:keydown={(e) => e.key === 'Enter' && !disabled && handleChange()}
		role="switch"
		aria-checked={checked}
		tabindex={disabled ? -1 : 0}
	>
		<div
			class="absolute left-[2px] top-[2px] h-[20px] w-[20px] transform rounded-full bg-background transition-transform duration-200 ease-in-out {checked
				? 'translate-x-[20px]'
				: 'translate-x-0'}"
		/>
	</div>
	{#if label}
		<span class="text-sm">{label}</span>
	{/if}
</label>
