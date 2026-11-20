<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import Glyph from './Glyph.svelte';
  const uid = $props.id();
  let {
    value = $bindable(''),
    label,
    helper,
    error,
    id = uid,
    characterLimit,
    ...rest
  }: Omit<HTMLTextareaAttributes, 'value'> & {
    value?: string;
    label: string;
    helper?: string;
    error?: string;
    characterLimit?: number;
  } = $props();
  let input = $state<HTMLTextAreaElement>();
  $effect(() => {
    value;
    if (input) {
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;
      input.setCustomValidity(
        characterLimit !== undefined && value.length > characterLimit
          ? `Up to ${characterLimit} characters`
          : '',
      );
    }
  });
  let message = $derived(
    error ??
      (characterLimit !== undefined && value.length > characterLimit
        ? `Up to ${characterLimit} characters`
        : undefined),
  );
</script>

<div class="mg2-field mg2-textarea" data-disabled={!!rest.disabled}>
  <label for={id}>{label}</label>
  <textarea
    {...rest}
    {id}
    bind:this={input}
    bind:value
    aria-invalid={!!message}
    aria-errormessage={message ? `${id}-help` : undefined}
    aria-describedby={[
      rest['aria-describedby'],
      message || helper ? `${id}-help` : null,
      characterLimit !== undefined ? `${id}-count` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined}
  ></textarea>
  <div class="mg2-textarea-footer">
    {#if message || helper}<span
        class="mg2-field-help"
        data-error={!!message}
        id={`${id}-help`}
        >{#if message}<Glyph name="error" />{/if}{message || helper}</span
      >{/if}
    {#if characterLimit !== undefined}<span
        class="mg2-field-help"
        data-error={!!message}
        id={`${id}-count`}>{value.length} / {characterLimit}</span
      >{/if}
  </div>
</div>
