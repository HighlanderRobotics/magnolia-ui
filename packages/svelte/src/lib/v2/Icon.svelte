<script lang="ts">
  import { icons, type IconName } from './icons.generated.js';
  let {
    name,
    size = 'default',
    label,
    class: className = '',
    style = '',
  }: {
    name: IconName;
    size?: 'xs' | 'sm' | 'default' | 14 | 16 | 20 | 24;
    label?: string;
    class?: string;
    style?: string;
  } = $props();
  const sizes = { xs: [16, 14], sm: [20, 16], default: [24, 20] } as const;
  const asset = $derived(
      icons[name][typeof size === 'number' ? size : sizes[size][0]],
    ),
    compact = $derived(
      icons[name][typeof size === 'number' ? size : sizes[size][1]],
    );
</script>

<span
  class="mg2-icon {className}"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : true}
  data-icon={name}
  data-size={size}
  style={`--mg2-icon-image:url(${JSON.stringify(asset.src)});--mg2-icon-size:${asset.size}px;--mg2-icon-compact-image:url(${JSON.stringify(compact.src)});--mg2-icon-compact-size:${compact.size}px;${style}`}
></span>
