<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CategoryModal from './CategoryModal.svelte';
  import type { AvitoCategory } from '$lib/types';

  export let showModal = false;
  export let selectedCategory: AvitoCategory | undefined = undefined;
  export let selectedSubcategory: AvitoCategory | undefined = undefined;

  const dispatch = createEventDispatcher<{
    close: void;
    select: { category: AvitoCategory; subcategory?: AvitoCategory };
  }>();

  function handleClose() {
    dispatch('close');
  }

  function handleSelect(event: CustomEvent<{ category: AvitoCategory }>) {
    const { category } = event.detail;
    if (category.parentId) {
      dispatch('select', { 
        category: {
          categoryId: category.categoryId,
          id: category.parentId,
          name: category.name,
          deeplink: category.deeplink,
          microcategoryId: category.microcategoryId,
          nodeType: category.nodeType,
          url: category.url
        },
        subcategory: category 
      });
    } else {
      dispatch('select', { category });
    }
  }
</script>

<CategoryModal
  {showModal}
  on:close={handleClose}
  on:select={handleSelect}
/> 