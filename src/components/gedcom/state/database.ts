import { action, atom, computed, task } from 'nanostores'
import { logger } from '@nanostores/logger'

import { readGedcom,SelectionGedcom } from 'read-gedcom';
import type * as rgc from 'read-gedcom';
import type { TreeNodeRoot,  } from "read-gedcom";

export const $gedcomUrl = atom<URL|null>(null);

export const $gedData = atom<SelectionGedcom|null>(null);

async function loadGedcomData() {

}

export const gedcomDataLoader = action($gedData, 'gedcomDataLoader', async (store) => {
  const url = $gedcomUrl.get();
  if (url) {
    const GedPromise = fetch(url)
      .then(response => {
        if (response.ok) {
          return response.arrayBuffer();
        } else {
          console.log(`in GedcomDb fetch failed`);
          throw new Error(`Fetch failed in GedcomDb`);
          
        }
      })
      .then(readGedcom)
      .catch(error => console.log(error));
    
    let r =  await GedPromise.then(sg => {
      if (sg) {
        console.log(`I have data to return`);
        store.set(sg);
      } else {
        console.error(`I have no data`);
        store.set(null);
      }
    });
    
  } else {
    store.set(null);
  }
  return store.get();
})

export const setGedcomUrl = action($gedcomUrl, 'setGedcomUrl',(store, url) => {
  store.set(url);
  return store.get();
});

