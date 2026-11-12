import type { Snippet } from 'svelte';
import type {
  HTMLAnchorAttributes,
  HTMLButtonAttributes,
} from 'svelte/elements';
export type Variant =
  'primary' | 'secondary' | 'danger' | 'text-only' | 'text-only-secondary';
export type ButtonProps = Omit<
  HTMLButtonAttributes & HTMLAnchorAttributes,
  'children' | 'onclick' | 'type'
> & {
  children?: Snippet;
  variant?: Variant;
  element?: 'button' | 'a';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  onclick?: (event: MouseEvent) => void;
  menuItem?: boolean;
};
