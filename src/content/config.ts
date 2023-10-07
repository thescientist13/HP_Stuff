import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import {  defineCollection } from 'astro:content';
import { z } from "zod";

import { DatabaseSchema } from '@lib/GrampsZodTypes';

export const collections = {
  docs: defineCollection({
    schema: (ctx) =>
        docsSchema()(ctx).extend({
          // Add a new optional field to the schema.
          grampsId: z.string().optional(),
        }),
  }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
  gramps: defineCollection({type: 'data', schema: DatabaseSchema})
};
