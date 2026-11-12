import { hydrate, mount } from 'svelte';
import App from './App.svelte';
const target = document.getElementById('app')!;
if (target.dataset.ssr) hydrate(App, { target });
else mount(App, { target });
