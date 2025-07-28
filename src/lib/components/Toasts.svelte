<script lang="ts">
  import { toasts } from '$lib/stores/toast';
  import Toast from './Toast.svelte';
</script>
 
{#each $toasts as toast (toast.id)}
  <Toast type={toast.type} message={toast.message} />
{/each} 