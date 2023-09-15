import {action, atom, computed, task} from 'nanostores'
import type {WritableAtom} from 'nanostores';
import {StoreController, withStores} from "@nanostores/lit";
import {logger} from '@nanostores/logger'

import {html} from 'lit';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {Task, initialState} from "@lit-labs/task";
import type {TaskStatus, StatusRenderer} from "@lit-labs/task";

import {parseGedcom, readGedcom, selectGedcom, SelectionGedcom, SelectionIndividualRecord} from 'read-gedcom';
import type {TreeNodeRoot, GedcomReadingPhase, GedcomReadingOptions} from "read-gedcom";

import {
    computeAncestors,
    computeDescendants,
    computeRelated,
    createInitialSettings,
    topologicalSort,
} from '../util';

type gedcomData = {
    url: URL,
    data: SelectionGedcom | null,
}

export const gedData = atom<SelectionGedcom | null>(null);

export class gedcomDataControler implements ReactiveController {
    private host: ReactiveControllerHost;
    private url: URL | null;

    private dataFetcher!: Task<[WritableAtom<SelectionGedcom | null>, URL]>;

    protected gedcomDataController

    private Storelogger;

    constructor(host: ReactiveControllerHost) {
      this.host = host;
      this.url = null;
      this.Storelogger = logger({
        'Gedcom Data': gedData,
      });
      this.gedcomDataController = new StoreController(host, gedData);
      host.addController(this as ReactiveController);

      this.dataFetcher = new Task<[WritableAtom<SelectionGedcom | null>, URL | null]>(host, async ([store, url]) => {
        console.log(`dataFetcher started`);
        if (url) {
          console.log(`dataFetcher has url`);
          this.loadGedcomUrl(url)
              .then((b) => {
                if (typeof b !== 'undefined') {
                  let rootSelection = this.readGedcomFromBuffer(b);
                  if (rootSelection) {
                    console.log(`root successfully populated in loadGedcomUrl`)
                    const other = this.initializeAllFields(rootSelection);
                  } else {
                    console.log(`root not populated`)
                  }
                }
              })
        } else {
          return initialState;
        }
      }, () => [gedData, this.url]
      );
    }
    public setUrl(url: URL) {
      this.url = url;
      this.host.requestUpdate();
    }

    public getUrl() {
      return this.url ? this.url : '';
    }

    public loadGedcomUrl = action(gedData, 'loadUrl', async (store, url: URL | string) => {
      try {
        const result = await fetch(url);
        return await result.arrayBuffer();
      } catch (error) {
        console.error(error);
        return;
      }
    });

    public readGedcomFromBuffer = action(gedData, 'readGedcomFromBuffer', (store, buffer: ArrayBuffer) => {
      let phase: GedcomReadingPhase | null = null;
      let phaseProgress: null | number = null;
      const progressCallback = (newPhase: GedcomReadingPhase, newPhaseProgress: null | number) => {
        phase = newPhase;
        phaseProgress = newPhaseProgress;
      }
      const treeRoot = parseGedcom(buffer);
      const sg = selectGedcom(treeRoot);
      store.set(sg);
      return sg;
    });

    protected initializeAllFields = (root: SelectionGedcom) => {
      console.log(`in initializeAllFields, root is type ${typeof root}; ${JSON.stringify(root).toString()}`)
      const settings = createInitialSettings(root);
      const {topologicalArray, topologicalOrdering} = topologicalSort(root);
      const inbreedingMap = new Map(), relatednessMap = new Map();
      const dependant = this.computeDependantFields(root, settings.rootIndividual);
      return {settings, topologicalArray, topologicalOrdering, inbreedingMap, relatednessMap, ...dependant};
    };
    protected computeDependantFields = (root: SelectionGedcom, rootIndividual: SelectionIndividualRecord | null) => {
      const ancestors = rootIndividual ? computeAncestors(root, rootIndividual) : null;
      const descendants = rootIndividual ? computeDescendants(root, rootIndividual) : null;
      const related = rootIndividual ? computeRelated(root, ancestors) : null;
      const statistics = this.computeStatistics(root, ancestors, descendants, related);
      return {ancestors, descendants, related, statistics};
    };

    protected computeStatistics = action(gedData, 'computeStatistics', (store, root, ancestors, descendants, related) => {
      const totalIndividuals = root.getIndividualRecord().length;
      const totalAncestors = ancestors !== null ? ancestors.size - 1 : null;
      const totalDescendants = descendants !== null ? descendants.size - 1 : null;
      const totalRelated = related !== null ? related.size - 1 : null;
      return {totalIndividuals, totalAncestors, totalDescendants, totalRelated};
    });

    hostConnected() {
      console.log(`gedcomDataController url is ${this.url}`)
      return;
    }

    hostDisconnected() {
      return;
    }

    render() {
      return this.dataFetcher.render({
        initial: () => html`loading...`,
        pending: () => html`fetching....`,
        complete: () => html`fetching complete`,
        error: () => html`something wrong`,
      });

    }
}
