import {action, atom, map as nanoMap, computed, onMount, task} from 'nanostores'
import type {WritableAtom} from 'nanostores';
import {StoreController, withStores} from "@nanostores/lit";
import {logger} from '@nanostores/logger'

import {html} from 'lit';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {Task, initialState} from "@lit-labs/task";
import type {TaskStatus, StatusRenderer} from "@lit-labs/task";
import {provide} from '@lit-labs/context';

import {parseGedcom, readGedcom, selectGedcom, SelectionGedcom, SelectionIndividualRecord} from 'read-gedcom';
import type {TreeNodeRoot, GedcomReadingPhase, GedcomReadingOptions} from "read-gedcom";

import {
  computeAncestors,
  computeDescendants,
  computeRelated,
  createInitialSettings,
  topologicalSort,
} from '../util';

import {createContext} from '@lit-labs/context';

const gedcomUrl = atom<URL | null>(null);

const gedData = atom<SelectionGedcom | null>(null);

const gedRootIndividual = atom<number | string>(0);

const gedIndividualsStore = computed(gedData, data => {
  if (data) {
    const tn = new Map<string, SelectionIndividualRecord>();
    data.getIndividualRecord().arraySelect().forEach(i => {
      const id = i.pointer().toString();
      if (id) {
        tn.set(id, i);
      } else {
        console.error(`state/database gedIndividualsStore; null id`)
      }
    });
    if (!gedRootIndividual.value) {
      const i = data.getIndividualRecord()[0].pointer;
      if (i) {
        gedRootIndividual.set(i);
      }
    }
    return tn;
  }
})

export const gcDataContext = createContext<gedcomDataController>('gedcomDataController');

export class gedcomDataController implements ReactiveController {
  private host: ReactiveControllerHost;
  
  readonly gedcomStoreController
  
  private gedIndividualsListener
  
  private gedcomUrlListener
  
  private rootIndividualListener
  
  private Storelogger;
  
  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.Storelogger = logger({
      'Gedcom URL': gedcomUrl,
      'Gedcom Data': gedData,
      'IndividualRecords': gedIndividualsStore,
      'RootIndividual': gedRootIndividual,
    });
    
    this.gedcomUrlListener = gedcomUrl.listen((value) => {
      console.log(`state/database gedcomUrlListener listen; with url ${value}`)
      if (value) {
        this.dataFetcher(value);
      }
    })
    
    this.gedIndividualsListener = gedIndividualsStore.subscribe(value => {
      if (value) {
        this.host.requestUpdate();
      }
    });
    
    this.rootIndividualListener = gedRootIndividual.subscribe((value) => {
      if (value) {
        this.host.requestUpdate();
      }
    })
    
    this.gedcomStoreController = new StoreController(host, gedData);
    host.addController(this as ReactiveController);
  }
  
  private async dataFetcher (url: URL) {
      console.log(`dataFetcher started`);
      if (url) {
        console.log(`dataFetcher has url`);
        this.loadGedcomUrl(url)
          .then((b) => {
            if (typeof b !== 'undefined') {
              let rootSelection = this.readGedcomFromBuffer(b);
              if (rootSelection) {
                console.log(`root successfully populated in loadGedcomUrl`);
                this.host.requestUpdate();
              } else {
                console.log(`root not populated`)
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
        const result = await fetch(url);
        return await result.arrayBuffer();
      } catch (error) {
        console.error(error);
        return;
      }
    })
  };
  
  public readGedcomFromBuffer = action(gedData, 'readGedcomFromBuffer', (store, buffer: ArrayBuffer) => {
    const treeRoot = parseGedcom(buffer);
    const sg = selectGedcom(treeRoot);
    store.set(sg);
    return sg;
  });
  
  
  public setUrl(url: URL) {
    console.log(`state/database setUrl; new Url is ${url}`)
    gedcomUrl.set(url);
  }
  
  public getUrl() {
    const url = gedcomUrl.value;
    return url ? url : '';
  }
  
  public initializeAllFields() {
    const root = gedData.value;
    if (root) {
      console.log(`state/database initializeAllFields; root is type ${typeof root}; ${JSON.stringify(root).toString()}`)
      const settings = createInitialSettings(root);
      const rootIndividual = settings.rootIndividual;
      if (rootIndividual) {
        const gedId = rootIndividual.pointer()[0];
        if (gedId) {
          if (gedRootIndividual.value) {
            if (gedId.localeCompare(gedRootIndividual.value.toString())) {
              console.log(`state/database initializeAllFields; ${gedId}`)
              console.log(`state/database initializeAllFields; ${gedRootIndividual.value.toString()}`)
              gedRootIndividual.set(gedId.toString());
            }
          } else {
            console.log(`state/database initializeAllFields; gedRootIndividual had no value, setting it`);
            gedRootIndividual.set(gedId.toString());
          }
        }
      } else {
        console.error(`state/database initializeAllFields; could not find root individual`)
      }
      
      const {topologicalArray, topologicalOrdering} = topologicalSort(root);
      const inbreedingMap = new Map(), relatednessMap = new Map();
      const dependant = this.computeDependantFields(root, settings.rootIndividual);
      return {settings, topologicalArray, topologicalOrdering, inbreedingMap, relatednessMap, dependant};
    }
    return null;
  };
  
  public computeDependantFields(root: SelectionGedcom, rootIndividual: SelectionIndividualRecord | null) {
    const ancestors = rootIndividual ? computeAncestors(root, rootIndividual) : null;
    const descendants = rootIndividual ? computeDescendants(root, rootIndividual) : null;
    const related = rootIndividual ? ancestors ? computeRelated(root, ancestors) : null : null;
    const statistics = this.computeStatistics(root, ancestors, descendants, related);
    return {ancestors, descendants, related, statistics};
  };
  
  public computeStatistics(root: SelectionGedcom, ancestors: Set<string | null> | null, descendants: Set<string | null> | null, related: Set<string | null> | null) {
    const totalIndividuals = root.getIndividualRecord().length;
    const totalAncestors = ancestors !== null ? ancestors.size - 1 : null;
    const totalDescendants = descendants !== null ? descendants.size - 1 : null;
    const totalRelated = related !== null ? related.size - 1 : null;
    return {totalIndividuals, totalAncestors, totalDescendants, totalRelated};
  };
  
  public getIndividualRecord(id: string) {
    console.log(`state/database getIndividualRecord; entering getIndividualRecord`)
    if (gedIndividualsStore) {
      console.log(`state/database getIndividualRecord; and the store is defined`)
      const m = gedIndividualsStore.value;
      if (m) {
        const i = m.get(id)
        if (i) {
          console.log(`state/database getIndividualRecord; found ${i.toString()}`)
          return i;
        }
      }
      console.error(`state/database getIndividualRecord; gedIndividualsStore.value undefined or null `)
    }
    return null;
  }
  
  public getRootIndividual() {
    if (gedRootIndividual && gedRootIndividual.value) {
      return gedRootIndividual.value;
    } else {
      return 0;
    }
  }
  
  public setRootIndividual(newRoot: SelectionIndividualRecord) {
    if (newRoot && newRoot.pointer()) {
      const p = newRoot.pointer()[0];
      if (p) {
        gedRootIndividual.set(p);
      } else {
        console.error(`trying to set root to an individual with no pointer`)
      }
    } else {
      console.error(`trying to set root to an invalid individual`)
    }
  }
  
  hostConnected() {
    console.log(`state/database hostConnected; gedcomDataController url is ${this.getUrl()}`)
    return;
  }
  
  hostDisconnected() {
    return;
  }
  
  render() {
    return html``;
    
  }
}
