<script lang="ts">
  import { avitoCookies } from '$lib/stores';
  import { Settings as SettingsIcon, X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { portal } from '$lib/actions/portal';
  
  let isOpen = false;
  let cookiesValue: string;
  
  $: cookiesValue = $avitoCookies;

  function handleSave() {
    avitoCookies.set(cookiesValue);
    isOpen = false;
  }

  function handleOpen() {
    isOpen = true;
  }

  function handleClose() {
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<button
  class="inline-flex items-center justify-center rounded-full w-10 h-10 hover:bg-accent hover:text-accent-foreground"
  on:click={handleOpen}
>
  <SettingsIcon class="h-5 w-5" />
  <span class="sr-only">Настройки</span>
</button>

{#if isOpen}
  <div use:portal>
    <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" on:click={handleClose} transition:fly={{ duration: 200, opacity: 0 }}>
      <div
        class="fixed bottom-0 z-50 h-[85vh] w-full overflow-y-auto border bg-background p-4 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[90vh] md:w-[calc(100vw-2rem)] md:max-w-lg md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl md:p-6 lg:p-8"
        on:click|stopPropagation
        transition:fly={{ y: 100, duration: 200, opacity: 1, easing: cubicOut }}
      >
        <button
          class="absolute right-4 top-4 hidden h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:flex"
          on:click={handleClose}
        >
          <X class="h-5 w-5" />
          <span class="sr-only">Закрыть</span>
        </button>

        <div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:hidden">
          <button
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            on:click={handleClose}
          >
            <X class="h-5 w-5" />
            <span class="sr-only">Закрыть</span>
          </button>
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <h2 class="!text-foreground text-xl font-semibold leading-tight tracking-tight md:text-2xl">Настройки</h2>
            <div class="space-y-4">
              <div class="space-y-2">
                <label
                  for="cookies"
                  class="block text-sm font-medium text-foreground"
                >
                  Куки Авито:
                </label>
                <textarea
                  id="cookies"
                  bind:value={cookiesValue}
                  placeholder="Вставьте сюда куки с авито.ру"
                  rows="5"
                  class="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                ></textarea>
                <div class="text-sm text-muted-foreground space-y-1">
                  <p class="font-medium">Если объявления не загружаются, вставьте сюда куки из вашего браузера.</p>
                  <p>Как получить куки:</p>
                  <ol class="list-decimal list-inside space-y-1 pl-1">
                    <li>Откройте авито.ру</li>
                    <li>Войдите в аккаунт</li>
                    <li>Откройте DevTools (F12)</li>
                    <li>Перейдите во вкладку Network</li>
                    <li>Найдите любой запрос к avito.ru</li>
                    <li>В заголовках запроса найдите Cookie</li>
                    <li>Скопируйте значение и вставьте сюда</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <button
              class="inline-flex h-10 items-center justify-center rounded-full bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 a"
              on:click={handleClose}
            >
              Отмена
            </button>
            <button
              class="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              on:click={handleSave}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if} 