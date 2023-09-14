import { z } from "zod";

export const GedcomTreeNodeType = z.object({
    tag: z.string().optional(),
    pointer: z.string().optional(),
    value: z.string().optional(),
    children: z.any().array(), // Lose type
});
