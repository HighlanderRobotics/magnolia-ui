<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className = '', ...rest }: HTMLAttributes<HTMLHRElement> =
    $props();
</script>

<hr {...rest} class="mg2-divider {className}" />
