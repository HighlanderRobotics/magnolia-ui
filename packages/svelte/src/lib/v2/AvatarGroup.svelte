<script lang="ts">
  import Avatar from './Avatar.svelte';
  let {
    people,
    max = 3,
    label = 'People',
  }: {
    people: { name: string; src?: string }[];
    max?: number;
    label?: string;
  } = $props();
  let visible = $derived(people.slice(0, Math.max(0, Math.floor(max))));
</script>

<span class="mg2-avatar-group" role="group" aria-label={label}>
  {#each visible as person, i}<span style={`z-index:${visible.length + 1 - i}`}
      ><Avatar {...person} /></span
    >{/each}
  {#if people.length > visible.length}<span
      ><Avatar
        name=""
        content="more"
        more={people.length - visible.length}
      /></span
    >{/if}
</span>
