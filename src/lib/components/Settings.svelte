<script lang="ts">
  import { avitoCookies } from '$lib/stores';
  
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
</script>

<div class="settings">
  <button class="settings-button" on:click={handleOpen}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  </button>

  {#if isOpen}
    <div class="settings-modal">
      <div class="settings-content">
        <h2>Настройки</h2>
        <div class="settings-field">
          <label for="cookies">Куки Авито:</label>
          <textarea
            id="cookies"
            bind:value={cookiesValue}
            placeholder="Вставьте сюда куки с авито.ру"
            rows="5"
          ></textarea>
          <p class="help-text">
            Если объявления не загружаются, вставьте сюда куки из вашего браузера.
            Как получить куки:
            1. Откройте авито.ру
            2. Войдите в аккаунт
            3. Откройте DevTools (F12)
            4. Перейдите во вкладку Network
            5. Найдите любой запрос к avito.ru
            6. В заголовках запроса найдите Cookie
            7. Скопируйте значение и вставьте сюда
          </p>
        </div>
        <div class="buttons">
          <button class="save-button" on:click={handleSave}>Сохранить</button>
          <button class="cancel-button" on:click={() => isOpen = false}>Отмена</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings {
    position: relative;
  }

  .settings-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: #666;
    transition: color 0.2s ease;
  }

  .settings-button:hover {
    color: #00aaff;
  }

  .settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .settings-content {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0 0 20px;
    font-size: 24px;
    color: #2b2b2b;
  }

  .settings-field {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }

  textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
    resize: vertical;
  }

  textarea:focus {
    border-color: #00aaff;
    outline: none;
  }

  .help-text {
    margin-top: 8px;
    font-size: 14px;
    color: #666;
    white-space: pre-line;
  }

  .buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .save-button,
  .cancel-button {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .save-button {
    background: #00aaff;
    color: white;
  }

  .save-button:hover {
    background: #0095e0;
  }

  .cancel-button {
    background: #f5f5f5;
    color: #666;
  }

  .cancel-button:hover {
    background: #eee;
  }
</style> 