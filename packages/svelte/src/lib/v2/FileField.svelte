<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    label,
    caption = 'Drop photos here or',
    helper = 'JPG or PNG, up to 10 MB each',
    error,
    maxBytes = 10 * 1024 * 1024,
    accept = 'image/jpeg,image/png',
    multiple = true,
    id = uid,
    onFiles,
    files: selections = $bindable<File[]>([]),
    ...rest
  }: Omit<HTMLInputAttributes, 'type' | 'onchange' | 'value' | 'files'> & {
    label: string;
    caption?: string;
    helper?: string;
    error?: string;
    maxBytes?: number;
    onFiles?: (files: File[]) => void;
    files?: File[];
  } = $props();
  let input = $state<HTMLInputElement>(),
    drag = $state(false),
    localError = $state('');
  let message = $derived(error || localError);
  $effect(() => {
    if (!input) return;
    const current = Array.from(input.files ?? []);
    if (
      current.length === selections.length &&
      current.every((file, i) => file === selections[i])
    )
      return;
    const transfer = new DataTransfer();
    selections.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  });
  function accepts(file: File) {
    if (!accept?.trim()) return true;
    return accept.split(',').some((part) => {
      const type = part.trim().toLowerCase();
      return type.startsWith('.')
        ? file.name.toLowerCase().endsWith(type)
        : type.endsWith('/*')
          ? file.type.toLowerCase().startsWith(type.slice(0, -1))
          : file.type.toLowerCase() === type;
    });
  }
  function select(files: File[], dropped = false) {
    if (rest.disabled) return;
    const chosen = multiple ? files : files.slice(0, 1);
    localError = '';
    const invalid = chosen.find(
      (file) => !accepts(file) || file.size > maxBytes,
    );
    if (invalid) {
      localError = !accepts(invalid)
        ? `${invalid.name} isn't a supported format`
        : `${invalid.name} exceeds the file size limit`;
      if (input) {
        input.value = '';
        input.setCustomValidity(localError);
      }
      return;
    }
    input?.setCustomValidity('');
    if (dropped && input) {
      const transfer = new DataTransfer();
      chosen.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    }
    selections = chosen;
    onFiles?.(chosen);
  }
  onMount(() => {
    const form = input?.form;
    const reset = () => {
      localError = '';
      input?.setCustomValidity('');
      selections = [];
      onFiles?.([]);
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  });
</script>

<div class="mg2-file-field" data-disabled={!!rest.disabled}>
  <label for={id}>{label}</label>
  <div
    class="mg2-file-zone"
    data-drag={drag}
    data-error={!!message}
    role="group"
    aria-label={label}
    ondragover={(event) => {
      if (rest.disabled) return;
      event.preventDefault();
      drag = true;
    }}
    ondragleave={(event) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !event.currentTarget.contains(event.relatedTarget)
      )
        drag = false;
    }}
    ondrop={(event) => {
      event.preventDefault();
      drag = false;
      if (rest.disabled) return;
      const files = event.dataTransfer?.files;
      if (files && input) {
        select(Array.from(files), true);
      }
    }}
  >
    <input
      {...rest}
      bind:this={input}
      {id}
      type="file"
      {accept}
      {multiple}
      aria-invalid={!!message}
      aria-describedby={`${id}-help${message ? ` ${id}-error` : ''}`}
      onchange={(event) => select(Array.from(event.currentTarget.files ?? []))}
    />
    <Glyph name="upload" /><span class="mg2-file-title"
      >{#if drag}Drop to upload{:else}{caption} <span>browse</span>{/if}</span
    ><span id={`${id}-help`} class="mg2-file-caption">{helper}</span>
  </div>
  {#if message}<span
      id={`${id}-error`}
      class="mg2-field-help"
      data-error="true"
      role="alert"><Glyph name="error" />{message}</span
    >{/if}
</div>
