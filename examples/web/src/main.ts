import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource-variable/material-symbols-rounded';
import { hydrate, mount } from 'svelte';
import App from './App.svelte';
import FigmaParity from './FigmaParity.svelte';
import Controls from './Controls.svelte';
import V2 from './V2.svelte';
const target = document.getElementById('app')!;
const component =
  location.pathname === '/v2'
    ? V2
    : location.pathname.includes('controls')
      ? Controls
      : location.pathname === '/figma'
        ? FigmaParity
        : App;
if (target.dataset.ssr) hydrate(component, { target });
else mount(component, { target });
