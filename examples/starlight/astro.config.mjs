import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({
  site: 'https://magnolia.example',
  integrations: [
    starlight({
      title: 'Magnolia docs',
      customCss: ['@highlanderrobotics/magnolia-starlight/theme.css'],
      sidebar: [
        { label: 'Guide', items: [{ label: 'Theme guide', slug: 'index' }] },
      ],
    }),
  ],
});
