import { z } from "zod";
import  {SelectionGedcom} from 'read-gedcom';

export const GedcomTreeNodeType = z.object({
    tag: z.string().optional(),
    pointer: z.string().optional(),
    value: z.string().optional(),
    children: z.any().array(), // Lose type
});

export const PropTypes = z.object({
    params: z.string(),
  });

export const IndividualProps = z.object({
    file: z.instanceof(SelectionGedcom),
    match: PropTypes,
});


