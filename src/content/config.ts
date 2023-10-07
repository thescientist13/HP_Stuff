import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import {type SchemaContext, z, defineCollection } from 'astro:content';
import { DatabaseSchema } from '@lib/GrampsZodTypes';

const originalHero = (ctx: SchemaContext) => docsSchema()(ctx).pick({ hero: true});

export const collections = {
  docs: defineCollection({
    schema: (ctx) =>
        docsSchema()(ctx).extend({
          // Add a new optional field to the schema.
          hero: z.union([z.string(),originalHero(ctx)]).optional(),
        }),
  }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
  gramps: defineCollection({type: 'data', schema: DatabaseSchema})
};
