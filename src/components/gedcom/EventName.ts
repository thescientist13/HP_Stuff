import { html} from 'lit';
import { z } from "zod";
import { SelectionEvent } from 'read-gedcom';

import { displayDate } from './util';

export function EventName(params: EventNameProps) {
    const { event, name, nameAlt, simpleDate, simplePlace, noDate, noPlace } = params;
    if(event.length === 0) {
        throw new Error('Event cannot be empty'); // TODO
    }
    const eventDate = !noDate && event.getDate().arraySelect().map(date => displayDate(date, simpleDate))[0];
    const eventPlace = !noPlace && event.getPlace().value().map(place => {
        //the noPlace flag is supposed to prevent this from being false, but check
        if(place) {
            return place.split(',').map(s => s.trim()).filter(s => s)
        } else {
            throw new Error('Event place unset and noPlace flag set to false')
        }
    }).map(parts => {
        if(simplePlace && parts) {
            return parts[0]
        } else {
            return parts.join(', ')
        }
    })[0]; // TODO improve
    const space = name ? ' ' : '';
    let strEvent;
    if (eventDate && eventPlace) {
        strEvent = html`
            ${space}
            ${eventDate}
            ${' - '}
            ${eventPlace}
          `
    } else if (eventDate) {
        strEvent = html`
            ${space}
            ${eventDate}
          `
    } else if (eventPlace) {
        strEvent = `${space}- ${eventPlace}`;
    } else {
        strEvent = '';
    }
    return html`
        ${strEvent || nameAlt === null ? name : nameAlt}
        ${strEvent}
    `
}

const eventName = z.object({
    event: z.instanceof(SelectionEvent),
    name: z.any().default(''),
    nameAlt: z.any().default(null),
    simpleDate: z.boolean().default(false),
    simplePlace: z.boolean().default(false),
    noDate: z.boolean().default(false),
    noPlace: z.boolean().default(false),
});

type EventNameProps = z.infer<typeof eventName>;
