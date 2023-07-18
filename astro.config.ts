import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

import lit from "@astrojs/lit";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Luke's HP Site",
      logo: {
        src: './src/assets/LukeHPSite.svg',
        replacesTitle: true,
      },
      sidebar: [{
        label: 'Guides',
        items: [
          // Each item here is one entry in the navigation menu.
          {
            label: 'Example Guide',
            link: '/guides/example/'
          }]
      }, {
        label: 'Fan Fiction',
        items: [
          {
            label: 'Harry Potter - Nephilim',
            items:[
              {
                label: 'Introduction',
                link: '/fanfiction/harry_potter_-_nephilim/introduction/'
              },
              {
                label: 'Prologue',
                link: '/fanfiction/harry_potter_-_nephilim/prologue/'
              },
              {
                label: 'Chapters',
                autogenerate: {
                  directory: 'FanFiction/Harry_Potter_-_Nephilim/Chapters',
                },
              },
              {
                label: 'Back Story',
                autogenerate: {
                  directory: 'FanFiction/Harry_Potter_-_Nephilim/backstory',
                },
                collapsed: true,
              },
              {
                label: 'Appendices',
                autogenerate: {
                  directory: 'FanFiction/Harry_Potter_-_Nephilim/Appendices',
                },
              },
            ]
          }
        ]
      }]
    }),
    lit()
  ],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});