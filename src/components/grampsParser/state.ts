import {action, atom, map as nanoMap, computed, onMount, task} from 'nanostores'
import type {WritableAtom} from 'nanostores';
import {StoreController, withStores} from "@nanostores/lit";
import {logger} from '@nanostores/logger'

import {type ReactiveController, type ReactiveControllerHost, html} from 'lit';
import {createContext} from '@lit-labs/context';
import {initialState} from "@lit-labs/task";

import { XMLParser, XMLValidator} from 'fast-xml-parser';

import { Convert, type Export } from './GrampsTypes.ts';

const grampsUrl = atom<URL | null>(null);

const grampsData = atom<any | null>(null);

import {type Export as zodExport, type Database, ExportSchema, type People} from './GrampsZodTypes';

const zodData = computed(grampsData, (v) => {
  if(v ){
    const result = ExportSchema.safeParse(v);
    if(result.success) {
      return (result.data.database as Database);
    } else {
      console.error(`zod safeParse failed ${result.error}` )
    }
  }
  return null;
})

const parsedData = computed(grampsData, (v) => {
  if(v) {
    const e: Export = Convert.toExport(JSON.stringify(v));
    if(e) {
      return e;
    }
  }
  return null;
})

export const gcDataContext = createContext<grampsDataController>('grampsDataController');

export class grampsDataController implements ReactiveController {
  private host: ReactiveControllerHost;

  private Storelogger;

  private grampsUrlListener

  readonly grampsStoreController;

  readonly  parsedStoreController;

  readonly zodStoreController;

  constructor(host: ReactiveControllerHost) {
    this.host = host;

    this.Storelogger = logger({
        'Gramps URL': grampsUrl,
        'Gramps Data': grampsData,
        'Parsed Data': parsedData,
        'zod Data': zodData,
    });

    this.grampsUrlListener = grampsUrl.listen((value) => {
      console.log(`state grampsUrlListener listen; with url ${value}`)
      if (value) {
        this.dataFetcher(value);
      }
    })

    this.grampsStoreController = new StoreController(host, grampsData);

    this.parsedStoreController = new StoreController(host, parsedData);

    this.zodStoreController = new StoreController(host, zodData);

    host.addController(this as ReactiveController);
  }

  private async dataFetcher (url: URL) {
    console.log(`state dataFetcher started`);
    if (url) {
      console.log(`state dataFetcher has url`);
      this.loadGedcomUrl(url)
        .then((t) => {
          if (typeof t !== 'undefined') {
            const options = {
              ignoreAttributes: false,
              attributeNamePrefix: '',
              parseAttributeValue: true,
              allowBooleanAttributes: true
            };
            const parser = new XMLParser(options);
            let jObj = parser.parse(t);
            if (jObj) {
              console.log(`state dataFetcher jObj populated ${JSON.stringify(jObj)}`);
              grampsData.set(jObj);
              this.host.requestUpdate();
            } else {
              console.log(`state dataFetcher jObj not populated`)
            }
          }
        })
    } else {
      return initialState;
    }
  }

  public loadGedcomUrl (url: URL | string){
    return task(async () => {
      try {
        const result = await fetch(url)
          .then(response => response.body)
          .then(rs => rs?.pipeThrough(new DecompressionStream('gzip')))
          .then(rs => new Response((rs)))
          .then(response => response.text())
          .catch(console.error);

        return await result
      } catch (error) {
        console.error(error);
        return;
      }
    })
  };

  public setUrl(url: URL) {
    console.log(`state setUrl; new Url is ${url}`)
    grampsUrl.set(url);
  }

  public getUrl() {
    const url = grampsUrl.value;
    return url ? url : null;
  }

  hostConnected() {
    console.log(`state hostConnected; grampsDataController url is ${this.getUrl()}`)
    return;
  }

  hostDisconnected() {
    return;
  }

  render() {
    return html``;

  }

}

