import { greenwoodPluginTypeScript } from "@greenwood/plugin-typescript";
import { greenwoodPluginRendererLit } from "@greenwood/plugin-renderer-lit";
import { greenwoodPluginPostCss } from "@greenwood/plugin-postcss";
import { greenwoodPluginGoogleAnalytics } from "@greenwood/plugin-google-analytics";

export default {
  activeContent: true,
  isolation: true,
  prerender: true,
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
