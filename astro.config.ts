import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import node from '@astrojs/node';
import db from '@astrojs/db';

/**
 * Takes care of excluded pages. In development,
 * pages with a '_'-prefix are not excluded.
 * @returns the integration
 */
function devRoutes(): AstroIntegration {
  return {
    name: 'dev-routes',
    hooks: {
      'astro:config:setup': (params) => {
        if (params.command === 'dev') {
			params.injectRoute(
				{
					pattern: '/_test',
					entrypoint: './src/pages/_test/index.astro'
				}
			);
			params.injectRoute(
				{
					pattern: '/_steam',
					entrypoint: './src/pages/_steam/index.astro'
				}
			);
			params.injectRoute(
				{
					pattern: '/_steam/[appid]',
					entrypoint: './src/pages/_steam/[appid].astro'
				}
			);
        }
      }
    }
  }
}

export default defineConfig({
  site: "https://dominicbrauer.dev",
  output: "server",

  devToolbar: {
      enabled: false
	},

  adapter: node({
      mode: 'standalone'
	}),

  image: {
    domains: [
      "shared.fastly.steamstatic.com/",
      "cdn.akamai.steamstatic.com"
    ]
  },

  integrations: [
  	db(),
   	devRoutes()
  ]
});
