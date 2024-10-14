import {onSet, atom, computed, onMount, task} from 'nanostores'
import type {WritableAtom} from 'nanostores';
import {logger} from '@nanostores/logger'

import { z } from 'zod';


import { XMLParser, XMLValidator} from 'fast-xml-parser';

import {type Export as zodExport,
  type Database,
  ExportSchema,
  type People,
  DatabaseSchema
} from '@lib/GrampsZodTypes';

export const primaryId = atom<string | null>(null);

export const zodData = atom<Database | null>(null);

const Storelogger = logger({
  'primary id': primaryId,
  'zod Data': zodData,
});

const DEBUG = false;

export async function fetchData (dbUrl: URL) {
  if (DEBUG) console.log(`fetchData onSet task; dbUrl is ${dbUrl.toString()}`)
  const result =  await task(async () => {
    const response = await fetch(dbUrl);
    const data = await response.json();
    const validation = DatabaseSchema.safeParse(data);
    if(validation.success) {
      if (DEBUG) console.log(`validation successful`)
      zodData.set(validation.data);
      if (DEBUG) console.log(`retrieved data `)
      if (DEBUG) console.log(`${validation.data.people.person.length} people`)
      if (DEBUG) console.log(`${validation.data.families.family.length} familes`)
      return true;
    } else {
      if (DEBUG) console.log(`validation failed`)
      if (DEBUG) console.log(JSON.stringify(validation.error))
    }
    return false;
  })
  if (DEBUG) console.log(`fetchData result was ${result}`)
  return result;
}
