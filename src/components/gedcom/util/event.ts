import type { ValueDate, SelectionDate, } from 'read-gedcom';
import { toJsDate } from 'read-gedcom';

function isValidDate(dateObject){
    return dateObject.toString() !== 'Invalid Date';
}

export function displayDate(dateGedcom: SelectionDate, isShort = false) {
    const first = dateGedcom;
    const obj = first.valueAsDate()[0];
    if (obj !== null) {
        if (obj.isDatePunctual && obj.date.calendar.isGregorian && !obj.date.year.isDual) {
            const jsDate = toJsDate(obj.date);
            if(isValidDate(jsDate)) {
                return (
                    <>
                        {obj.isDateApproximate && (
                            <>
                                {'about '}
                            </>
                        )}
                        <FormattedDate
                            value={jsDate}
                            year="numeric"
                            month={!date.month || isShort ? undefined : 'long'}
                            day={!date.day || isShort ? undefined : 'numeric'}
                            timeZone="UTC"
                        />
                    </>
                );
            } else {
                return first[0].value;
            }

        } else {
            return first[0].value;
        }
    } else {
        return first[0].value;
    }
}

export function isEventEmpty(eventGedcom, withDate = true, withPlace = true) {
    return !(
        (eventGedcom.getDate().value()[0] && withDate)
        || (eventGedcom.getPlace().value()[0] && withPlace)
    );
}

export function displayDateExact(dateGedcom, withTime) {
    const date = dateGedcom.valueAsExactDate()[0];
    const time = dateGedcom.getExactTime().valueAsExactTime()[0];
    if(date) {
        const jsDate = new Date(
            parseInt(date.year),
            parseInt(date.month) - 1,
            parseInt(date.day)
        );
        if(isValidDate(jsDate)) {
            if(withTime && time) {
                jsDate.setHours(
                    parseInt(time.hours),
                    parseInt(time.minutes),
                    time.seconds !== undefined ? parseInt(time.seconds) : 0,
                    time.centiseconds !== undefined ? parseInt(time.centiseconds) * 10 : 0,
                );
                return (
                    <FormattedDate
                        value={jsDate}
                        year="numeric"
                        month="long"
                        day="numeric"
                        hour="numeric"
                        minute="numeric"
                        second="numeric"
                        timeZone="UTC"
                    />
                );
            } else {
                return (
                    <FormattedDate
                        value={jsDate}
                        year="numeric"
                        month="long"
                        day="numeric"
                        timeZone="UTC"
                    />
                );
            }
        } else {
            return dateGedcom.value()[0];
        }
    } else {
        return dateGedcom.value()[0];
    }
}
