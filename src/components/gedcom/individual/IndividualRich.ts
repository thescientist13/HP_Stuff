import { html} from 'lit';
import { z } from "zod";

import { SelectionIndividualRecord } from 'read-gedcom';

import { isEventEmpty } from '../util';
import { EventName } from '../EventName';
import { IndividualName } from './IndividualName';

export function IndividualRich(params: IndividualRichParams) {
  const { individual, gender, simpleDate, simplePlace, simpleRange, noDate, noPlace } = params;
  const props = { simpleDate, simplePlace, noDate, noPlace };
  const visible = !noDate || !noPlace;
  const birth = individual.getEventBirth(), death = individual.getEventDeath();
  const showBirth = visible && !isEventEmpty(birth, !noDate, !noPlace), showDeath = visible && (simpleRange ? !isEventEmpty(death, !noDate, !noPlace) : death.length > 0); // Birth is not shown if fruitless
  const hasSuffix = showBirth || showDeath;
  const sex = individual.getSex().value()[0];
  let t = html`<IndividualName individual=${individual} gender=${gender} />`;
  if(hasSuffix) {
    t = html`${t}<br/>`
    if(showBirth) {
      t = html`${t}<EventName event=${birth} name=${simpleRange ? '' : 'born'} ${props} />`
      if(showDeath) {
        t = html`${t}${simpleRange ? ' - ' : ', '}`;
      }
    } else if(showDeath) {
      if(simpleRange) {
        t = html`? - `;
      }
      t = html`${t}<EventName event=${death} name=${simpleRange ? '' : 'deceased'} {...props}  />`
    }
  }
  return t;
}

const individualRich  = z.object({
  individual: z.instanceof(SelectionIndividualRecord),
  gender: z.boolean().default(false),
  simpleDate: z.boolean().default(false),
  simplePlace: z.boolean().default(false),
  simpleRange: z.boolean().default(false),
  noDate: z.boolean().default(false),
  noPlace: z.boolean().default(false)
});

type IndividualRichParams = z.infer<typeof individualRich>;

              
            