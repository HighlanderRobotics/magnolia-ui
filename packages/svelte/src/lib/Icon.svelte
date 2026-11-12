<script lang="ts">
  let {
    icon,
    size = 24,
    filled = false,
    transitionDuration = 0.1,
    color,
    grade = 0,
    label,
  }: {
    icon: string;
    size?: number;
    filled?: boolean;
    transitionDuration?: number;
    color?: string;
    grade?: number;
    label?: string;
  } = $props();
</script>

<span
  class="mg-icon"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : true}
  style:font-size="{size}px"
  style:color
  style:font-variation-settings="'FILL' {filled ? 1 : 0}, 'wght' 500, 'GRAD' {grade},
  'opsz' {size}"
  style:transition-duration="{transitionDuration}s">{icon}</span
>
