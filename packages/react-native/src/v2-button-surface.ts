import { createContext } from 'react';
/** Source compositions can override a Button's resting fill without replacing its states. */
export const ButtonIdleSurface = createContext<
  Partial<Record<'primary' | 'secondary' | 'tertiary' | 'danger', string>>
>({});
