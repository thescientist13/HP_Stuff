import  Alpine from 'alpinejs';
import * as rgc from 'read-gedcom';
import * as buffer from 'buffer';

interface CallbackType { 
  (Arg: string): void; 
}

//window.Alpine = Alpine
//cannot have hte above without type tomfoolery that I have not figured out yet

Alpine.store('testmessage', {
	message: 'this is a test of alpine with typescript',
});


Alpine.store('HPGedCom', {
  message: 'Stores must go before start',
  myURL: null,
  myHPGC: null,

  async initGC() {
    if ( ! this.myURL ) {
      console.log('initGC called before myURL set');
      return;
    }
    console.log("initGC called with url " + this.myURL);
    this.myHPGC = new HPGC;
    this.myHPGC.initGedCom(this.myURL);

  },

  isLoaded() {
    if ( this.myHPGC ) { 
      return this.myHPGC.isLoaded;
    } else {
      console.log('called before myHPGC exists');
      return false;
    }
  },

});

export class HPGC {

  myGedFile: rgc.readGedcom;
  public readonly isLoaded: boolean;

  constructor() {
    this.myGedData = null;
    this.myGedFile = null;
    this.isLoaded = false;
  };

  public bDay(id: string) {
    if (! this.myGedFile) { 
      console.log('bDay called before init');
      return;
    } else {
      var ged = <rgc.readGedcom>this.myGedFile;
      console.log('bday entry: ' + typeof(this.myGedFile));
      console.log('fetching bday for ' + id);
      const individual = ged.getIndividualRecord(id);
      console.log('individual ' + individual.toString());
      const gedDate = individual.getEventBirth().getDate();
      return gedDate;
    }
  }

  public dDay(id: string) {
    if (! this.myGedFile) { 
      console.log('dDay called before init');
      return;
    } else {
      var ged = <rgc.readGedcom>this.myGedFile;
      console.log('fetching dday for ' + id);
      const individual = ged.getIndividualRecord(id);
      const gedDate = individual.getEventDeath().getDate();
      return gedDate;
    }
  }

  public setGedFile(newFile: rgc.readGedcom) {
    this.myGedFile = newFile;
    console.log("called setter function");
    if (this.myGedFile) {
      Alpine.effect(() => {
        this.isLoaded = true;
        dispatchEvent(new CustomEvent('GedLoaded'));
        console.log("set loaded value");
      });
    }
  };

  private async loadGedCom(url, timeout, callback) {
    var args = Array.prototype.slice.call(arguments, 3);
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = function () {
      console.error("The request for " + url + " timed out.");
    };

    const computeGeneralStatistics = x => ({
      families: x.getFamilyRecord().length,
      individuals: x.getIndividualRecord().length,
      multimedia: x.getMultimediaRecord().length,
      notes: x.getNoteRecord().length,
      repositories: x.getRepositoryRecord().length,
      sources: x.getSourceRecord().length,
    });

    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.onload = function(e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log('xhr status 200');
          //console.error(xhr.statusText);
          var arraybuffer = xhr.response; // not responseText
          var GedFile = rgc.readGedcom(arraybuffer);
          console.log(computeGeneralStatistics(GedFile));
          Alpine.store('HPGedCom').myHPGC.setGedFile(GedFile);
        } else {
          console.log('xhr status not 200');
        }
      }
    };
    xhr.timeout = timeout;
    xhr.send();
  }

  public initGedCom(myURL: string) {

    console.log('initGedCom with ' + myURL);
    this.loadGedCom(myURL, 2000, this._initGedCom);

  }
    
}

Alpine.start();

// vim: shiftwidth=2:tabstop=2:expandtab 

