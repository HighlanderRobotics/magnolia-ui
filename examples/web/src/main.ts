import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource-variable/material-symbols-rounded';
import { hydrate, mount } from 'svelte';
import App from './App.svelte';
import FigmaParity from './FigmaParity.svelte';
const target = document.getElementById('app')!;
if (target.dataset.ssr) hydrate(App, { target });
else mount(location.pathname === '/figma' ? FigmaParity : App, { target });
