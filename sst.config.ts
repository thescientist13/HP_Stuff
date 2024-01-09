import type { SSTConfig } from "sst";
import { AstroSite } from "sst/constructs";
import { HPAstroSite } from "./stacks/AstroSite";

export default {
  config(_input) {
    return {
      name: "HP-Stuff",
      profile: "home",
      region: "us-east-2",
    };
  },
  stacks(app) {
    app.stack(HPAstroSite)
  },
}
