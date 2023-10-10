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
