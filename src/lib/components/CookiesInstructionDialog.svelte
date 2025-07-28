<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Settings, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  const dispatch = createEventDispatcher<{
    close: void;
    openSettings: void;
  }>();

  function handleOpenSettings() {
    dispatch('openSettings');
    dispatch('close');
  }
</script>

<div 
  class="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm"
  on:click|self={() => dispatch('close')}
>
  <div
    class="fixed bottom-0 z-[80] w-full overflow-y-auto border bg-background p-0 shadow-lg duration-200 rounded-t-3xl md:bottom-auto md:left-[50%] md:top-[50%] md:h-auto md:w-[calc(100vw-2rem)] md:max-w-xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-3xl"
    on:click|stopPropagation
  >
    <div class="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-30">
      <div class="px-4 py-3 md:px-6 md:py-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 text-destructive">
            <AlertTriangle class="h-5 w-5" />
            <h2 class="text-lg font-semibold">Доступ ограничен</h2>
          </div>
          <button
            class="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-accent md:flex"
            on:click={() => dispatch('close')}
          >
            <X class="h-5 w-5" />
            <span class="sr-only">Закрыть</span>
          </button>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-6 pb-24 md:pb-8 lg:p-8">
      <div class="space-y-4">
        <div class="space-y-2">
          <h3 class="font-medium">Возможные причины:</h3>
          <div class="space-y-2 text-sm text-muted-foreground">
            <p class="flex items-start gap-2">
              <span class="text-foreground">1.</span>
              <span>Cookies устарели или были очищены. В этом случае нужно обновить их значение в настройках.</span>
            </p>
            <p class="flex items-start gap-2">
              <span class="text-foreground">2.</span>
              <span>Слишком много запросов с вашего IP. В этом случае нужно пройти капчу на сайте Авито.</span>
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="font-medium">Что делать:</h3>
          <div class="space-y-2 text-sm">
            <p class="flex items-start gap-2">
              <span class="text-foreground">1.</span>
              <span>
                Откройте Авито и пройдите капчу, если она появится. После этого вернитесь сюда и попробуйте снова.
              </span>
            </p>
            <p class="flex items-start gap-2">
              <span class="text-foreground">2.</span>
              <span>
                Если проблема повторяется:
              </span>
            </p>
            <ul class="ml-6 space-y-2 text-muted-foreground">
              <li>• Отключите VPN, если используете</li>
              <li>• Перезагрузите роутер</li>
              <li>• Проверьте компьютер на вирусы</li>
              <li>• Отключите подозрительные расширения браузера</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <a
          href="https://www.avito.ru"
          target="_blank"
          rel="noopener noreferrer"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Открыть Авито и пройти капчу
          <ExternalLink class="h-4 w-4" />
        </a>

        <button
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          on:click={handleOpenSettings}
        >
          Обновить cookies в настройках
          <Settings class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 md:hidden">
      <button
        class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        on:click={() => dispatch('close')}
      >
        <X class="h-5 w-5" />
        <span class="sr-only">Закрыть</span>
      </button>
    </div>
  </div>
</div> 

<style>
  /* Стилизуем скроллбар для лучшего вида */
  div::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  div::-webkit-scrollbar-track {
    background: transparent;
  }

  div::-webkit-scrollbar-thumb {
    background: hsl(var(--primary) / 0.2);
    border-radius: 4px;
  }

  div::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary) / 0.3);
  }

  /* Для Firefox */
  div {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--primary) / 0.2) transparent;
  }
</style> 