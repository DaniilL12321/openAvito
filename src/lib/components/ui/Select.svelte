<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export let value: string;
  export let options: Array<{
    value: string;
    label: string;
  }>;
  export let placeholder = 'Выберите...';

  const dispatch = createEventDispatcher();
  let isOpen = false;
  let selectContainer: HTMLDivElement;

  function handleSelect(newValue: string) {
    value = newValue;
    isOpen = false;
    dispatch('change', value);
  }

  function handleClickOutside(event: MouseEvent) {
    if (selectContainer && !selectContainer.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  $: selectedOption = options.find(opt => opt.value === value);
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div 
  class="relative w-full"
  bind:this={selectContainer}
>
  <button
    type="button"
    class="flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    on:click={() => isOpen = !isOpen}
  >
    <span class="truncate">
      {selectedOption ? selectedOption.label : placeholder}
    </span>
    <ChevronDown class="h-4 w-4 opacity-50" />
  </button>

  {#if isOpen}
    <div
      class="absolute top-[calc(100%+4px)] left-0 z-50 w-full rounded-lg border bg-popover text-popover-foreground shadow-md"
      transition:fly={{ y: -5, duration: 150, opacity: 1, easing: cubicOut }}
    >
      <div class="p-1">
        {#each options as option}
          <button
            class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary data-[selected=true]:bg-accent/50"
            data-selected={option.value === value}
            on:click={() => handleSelect(option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div> 