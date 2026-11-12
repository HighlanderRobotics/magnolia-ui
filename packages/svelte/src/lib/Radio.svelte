<script lang="ts">
 import type { HTMLInputAttributes } from 'svelte/elements';
 const uid = $props.id();
 let {group = $bindable<string | null>(null), value, label, id = uid, onchange, ...rest}: Omit<HTMLInputAttributes,'type'|'value'|'checked'|'onchange'> & {group?: string | null; value: string; label: string; onchange?: (event: Event) => void} = $props();
</script>
<label class="mg-check" for={id}><input {...rest} {id} {value} type="radio" checked={group === value} onchange={(event)=>{if(event.currentTarget.checked) group = value; onchange?.(event);}} />{label}</label>
