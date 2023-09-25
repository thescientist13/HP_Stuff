import { html} from 'lit';
import { z } from "zod";

import { SelectionIndividualRecord } from 'read-gedcom';

import { isEventEmpty } from '../util';
import { IndividualName } from './IndividualName';
import {IndividualEvents} from "./IndividualEvents";

export function IndividualRich(params: IndividualRichParams) {
  const { individual, gender, simpleDate, simplePlace, simpleRange, noDate, noPlace } = individualRich.parse(params);
  const props = { simpleDate, simplePlace, noDate, noPlace };
  const visible = !noDate || !noPlace;

  console.log(`IndividualRich; individual has id ${individual.pointer()}`)

  const birth = individual.getEventBirth(), death = individual.getEventDeath();
  const showBirth = visible && !isEventEmpty(birth, !noDate, !noPlace)  // Birth is not shown if fruitless
  const showDeath = visible && (simpleRange ? !isEventEmpty(death, !noDate, !noPlace) : death.length > 0);
  const hasSuffix = showBirth || showDeath;
  const sex = individual.getSex().value()[0];
  console.log(`IndividualRich; gedId: ${individual.pointer()}; showBirth: ${showBirth}; showDeath: ${showDeath}; hasSuffix: ${hasSuffix}; simpleDate: ${props.simpleDate}`)
  let t = html`<individual-name gedId=${individual.pointer()} link gender=${gender} />`;
  if(hasSuffix) {
    t = html`${t} <individual-events gedId=${individual.pointer()} showBDRange></individual-events>`
  }
  return t;
}

const individualRich  = z.object({
  individual: z.instanceof(SelectionIndividualRecord),
  gender: z.boolean().default(false).optional(),
  simpleDate: z.optional(z.boolean().default(false)),
  simplePlace: z.boolean().default(false).optional(),
  simpleRange: z.boolean().default(false).optional(),
  noDate: z.boolean().default(false).optional(),
  noPlace: z.boolean().default(false).optional()
});

export type IndividualRichParams = z.infer<typeof individualRich>;

              
            