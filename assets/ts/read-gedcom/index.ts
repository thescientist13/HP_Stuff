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
  myHPGC: null,
  myURL: null,
  init() {
    if ( ! this.myURL ){
      return;
    } else {
      this.myHPGC = new HPGC;
      this.myHPGC.initGedCom(this.myURL);
    }
  },

  bDay(id: string) {
    const individual = this.HPGC.myGedData.getIndividualRecord(id);
    return individual.getEventBirth(); // Birth
  }
});

export class HPGC {

  myGedFile: Blob;
  myGedData: rgc.readGedcom;

  private loadGedCom(url, timeout, callback) {
    var args = Array.prototype.slice.call(arguments, 3);
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = function () {
      console.error("The request for " + url + " timed out.");
    };

    xhr.onload = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          xhr.onload = function(e) {
            var arraybuffer = xhr.response; // not responseText
            myGedFile = rgc.readGedcom(arraybuffer);
          }
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.timeout = timeout;
    xhr.send();
  }

  public initGedCom(myURL: string) {

    console.log(myURL);
    this.loadGedCom(myURL, 2000, this._initGedCom);

  }
    
}

Alpine.start();

// vim: shiftwidth=2:tabstop=2:expandtab 

