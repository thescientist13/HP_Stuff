import Alpine from 'alpinejs';
import fetch from 'isomorphic-fetch';
import * as rgc from 'read-gedcom';

export class HPGC {
  
  public myURL: string | null;
  public isLoaded: boolean;
  public myGedFile: ArrayBuffer | null;
  public myGedData: rgc.SelectionGedcom | null;
  
  constructor() {
    this.isLoaded = false;
    this.myURL = null;
    this.myGedFile = null;
    this.myGedData = null;
  };

  public dDay(id: string) {
    if (typeof(this.myGedData) === 'undefined') { 
      console.log('dDay called before init');
      return;
   } else {
     console.log('fetching dday for ' + id);
     const individual = this.myGedData!.getIndividualRecord(id);
     const gedDate = individual.getEventDeath().getDate();
     return gedDate;
   }
  };

  public bDay(id: string) {
    if (typeof(this.myGedData) === 'undefined') { 
      console.log('bDay called before init');
      return;
    } else {
      console.log('fetching bday for ' + id);
      const individual = this.myGedData!.getIndividualRecord(id);
      console.log('individual ' + individual.toString());
      const gedDate = individual.getEventBirth().getDate();
      return gedDate;
    }
  };
  
  private setGedData(newFile: ArrayBuffer ) {
    this.myGedFile = newFile;
    console.log("called setter function");
    if (typeof(this.myGedFile) !== 'undefined') {
      var data = rgc.readGedcom(this.myGedFile);
      this.myGedData = data;
      if (typeof(this.myGedData) !== 'undefined') {
        this.isLoaded = true;
        dispatchEvent(new CustomEvent('GedLoaded'));
        console.log("set loaded value");
      }
    }
  };
  
  public initGedCom(url: string) {
    console.log('initGedCom with ' + url);
    this.loadGedCom(url, 2000);
  };
  
  private async initGC() {
    if ( typeof(this.myURL) === 'undefined' ) {
      console.log('initGC called before myURL set');
      return;
    }
    console.log("initGC called with url " + this.myURL);
    this.initGedCom(this.myURL!);
    
  };

  public computeGeneralStatistics(x: rgc.SelectionGedcom) {
    return {
      families: x.getFamilyRecord().length,
      individuals: x.getIndividualRecord().length,
      multimedia: x.getMultimediaRecord().length,
      notes: x.getNoteRecord().length,
      repositories: x.getRepositoryRecord().length,
      sources: x.getSourceRecord().length,
    }
  };
  
  private loadGedCom(url: string, timeout: number) {
    var args = Array.prototype.slice.call(arguments, 3);
    const reader = new FileReader();
    
    const GedPromise = fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.arrayBuffer();
    })
    .then(this.setGedData);
  };
  
};

// vim: shiftwidth=2:tabstop=2:expandtab

