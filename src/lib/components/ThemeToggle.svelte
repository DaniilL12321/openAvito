<script lang="ts">
	import { onMount } from 'svelte';
	import { Sun, Moon } from 'lucide-svelte';

	let theme: 'light' | 'dark' = 'light';

	onMount(() => {
		const savedTheme = localStorage.getItem('theme') || 'light';
		theme = savedTheme as 'light' | 'dark';
		document.documentElement.classList.toggle('dark', theme === 'dark');
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem('theme', theme);
	}
</script>

<button
	class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
	on:click={toggleTheme}
>
	{#if theme === 'light'}
		<Moon class="h-5 w-5" />
		<span class="sr-only">Тёмная тема</span>
	{:else}
		<Sun class="h-5 w-5" />
		<span class="sr-only">Светлая тема</span>
	{/if}
</button>
