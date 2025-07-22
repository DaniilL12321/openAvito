<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { query } from '$lib/stores';

  $: isHome = $page.url.pathname === '/' && $page.url.search === '';

  function handleClick(e: MouseEvent) {
    if (isHome) {
      e.preventDefault();
      return;
    }
    
    if ($page.url.search) {
      e.preventDefault();
      query.set('');
      goto('/', { replaceState: true });
    }
  }
</script>

<a
  href="/"
  title="OpenAvito — альтернативный клиент"
  class="inline-flex items-center gap-3 hover:opacity-90 transition-opacity"
  class:pointer-events-none={isHome}
  on:click={handleClick}
>
  <div class="relative w-[40px] h-[40px]">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17.5" class="fill-primary/10 dark:fill-primary/20" />
      <circle cx="28.75" cy="11.25" r="7.5" class="fill-[#0AF] dark:fill-[#33BBFF]" />
      <circle cx="11.25" cy="28.75" r="7.5" class="fill-[#04E061] dark:fill-[#00FF6A]" />
      <circle cx="11.25" cy="11.25" r="3.75" class="fill-[#965EEB] dark:fill-[#A875FF]" />
      <circle cx="28.75" cy="28.75" r="3.75" class="fill-[#FF4053] dark:fill-[#FF5C6C]" />
      <circle cx="20" cy="20" r="8.75" stroke="currentColor" stroke-width="1.75" class="opacity-20 dark:opacity-30" fill="none" />
    </svg>
  </div>
  <span class="text-xl font-semibold tracking-tight text-foreground hidden sm:inline">OpenAvito</span>
</a> 