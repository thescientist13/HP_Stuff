import type { ValueDate, SelectionDate, SelectionDateExact, SelectionEvent } from 'read-gedcom';
import { toJsDate } from 'read-gedcom';
import { DateTime as LuxDateTime } from 'luxon';
import { html } from 'lit';

function isValidDate(dateObject: Date){
    return dateObject.toString() !== 'Invalid Date';
}

export function displayDate(dateGedcom: SelectionDate, isShort = false) {
    const first = dateGedcom;
    const obj = first.valueAsDate()[0];
    if (obj !== null) {
        if (obj.isDatePunctual && obj.date.calendar.isGregorian && !obj.date.year.isDual) {
            const jsDate = toJsDate(obj.date);
            if(jsDate && isValidDate(jsDate)) {
              const luxDate = LuxDateTime.fromJSDate(jsDate, {});
              let template = html``;
              if (obj.isDateApproximated) {
                template = html`about `;
              }
              template = html`${template}<time datetime=${luxDate.toISO()} >${isShort ? luxDate.year : luxDate.toISODate()}</time>`;
              return template;
            } else {
                return html`first[0].value`;
            }

        } else {
            return html`first[0].value`;
        }
    } else {
        return html`first[0].value`;
    }
}

export function isEventEmpty(eventGedcom: SelectionEvent, withDate = true, withPlace = true) {
    return !(
        (eventGedcom.getDate().value()[0] && withDate)
        || (eventGedcom.getPlace().value()[0] && withPlace)
    );
}

export function displayDateExact(dateGedcom: SelectionDateExact, withTime: boolean) {
    const date = dateGedcom.valueAsExactDate()[0];
    const time = dateGedcom.getExactTime().valueAsExactTime()[0];
    if(date) {
        const jsDate = new Date(
          date.year,
          date.month - 1,
          date.day
        );
        if(isValidDate(jsDate)) {
            if(withTime && time) {
                jsDate.setHours(
                    time.hours,
                    time.minutes,
                    time.seconds !== undefined ? time.seconds : 0,
                    time.centiseconds !== undefined ? time.centiseconds * 10 : 0,
                );
                
            }
            const luxDate = LuxDateTime.fromJSDate(jsDate, {});
            return html`<time datetime=${luxDate.toISO()} >${luxDate.toRelative()}</time>`;
        } else {
            return html`dateGedcom.value()[0]`;
        }
    } else {
        return html`dateGedcom.value()[0]`;
    }
}
