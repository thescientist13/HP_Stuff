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

  bDay() {
  }
});

export class HPGC {

  private loadGedCom(url, timeout, callback) {
    var args = Array.prototype.slice.call(arguments, 3);
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = function () {
      console.error("The request for " + url + " timed out.");
    };

    xhr.onload = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback.apply(xhr, args);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.open("GET", url);
    xhr.timeout = timeout;
    xhr.send();
  }

  private _initGedCom( gedFile) {
    console.log("callback function called");
  }

  public initGedCom(myURL: string) {

    var gedFile = myURL + "Harrypedia/potter_universe.ged";
    this.loadGedCom(gedFile, 2000, this._initGedCom);

  }
    
}

Alpine.start();

// vim: shiftwidth=2:tabstop=2:expandtab 

