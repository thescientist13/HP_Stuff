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

Alpine.start();

Alpine.directive('HPGedCom', el => {
  var GC = new HPGC;
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
    loadGedCom(gedFile, 2000, _initGedCom);

  }
    
}

// vim: shiftwidth=2:tabstop=2:expandtab 

