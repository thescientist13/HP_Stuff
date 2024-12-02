import { greenwoodPluginTypeScript } from "@greenwood/plugin-typescript";
import { greenwoodPluginPostCss } from "@greenwood/plugin-postcss";
import { greenwoodPluginGoogleAnalytics } from "@greenwood/plugin-google-analytics";

//this plugin appears to do more than I first understood from the documentation. Once enabled, I *think* it fully replaces WCC and I *think* you can no longer use html components at all.
import { greenwoodPluginRendererLit } from "@greenwood/plugin-renderer-lit";

import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

export default {
  activeContent: true,
  isolation: true,
  // it appears the two pre-render flags ought to match.
  prerender: false,
  staticRouter: false,
  markdown: {
    plugins: ["remark-gfm"],
  },
  optimization: "none",
  plugins: [
    greenwoodPluginTypeScript({
      extendConfig: true,
    }),
    greenwoodPluginRendererLit({
      prerender: false,
    }),
    greenwoodPluginPostCss({
      extendConfig: true,
    }),
    greenwoodPluginGoogleAnalytics({
      analyticsId: "G-9KF1R3YFTZ",
    }),
  ],
};
