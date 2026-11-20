<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import BaseTooltip from '../Tooltip.svelte';
  import Kbd from './Kbd.svelte';
  let {
    label,
    shortcut,
    modifier = false,
    trigger,
    delay = 500,
  }: {
    label: string;
    shortcut?: string;
    modifier?: boolean;
    trigger: Snippet<[HTMLButtonAttributes]>;
    delay?: number;
  } = $props();
</script>

<BaseTooltip text={label} {trigger} {delay} focusDelay={0} class="mg2-tooltip">
  {#snippet content()}<span>{label}</span>{#if shortcut}<Kbd
        key={shortcut}
        {modifier}
      />{/if}{/snippet}
</BaseTooltip>
