import { z } from "zod";

export const TopLevelSections = z.enum([
  "Harrypedia",
  "FanFiction",
  "Searches",
  "Book Marks",
]);

export type TopLevelSections = z.infer<typeof TopLevelSections>;
