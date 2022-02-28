import * as rgc from 'read-gedcom';
import * as buffer from 'buffer';

export class HPGC {

  BDayResponce(response) {
    if(!response) {
      console.log("response is null");
        return;
    } else {
      console.log("response is not null");
      console.log(typeof(response));
    }
  }

  loadFile(url, callback, ErrText: string /*, opt_arg1, opt_arg2, ... */) {
    var args = Array.prototype.slice.call(arguments, 3);
    var XMLHttpRequest = require("xmlhttprequest-ssl").XMLHttpRequest;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
        callback(this.responseText);
      }
    }

    xhr.open("GET", url);
    xhr.send();
  }

  BirthDay (myfile, id) {
    if(myfile === undefined) {
      console.log("no file name provided");
      return "no filename";
    }
    if(id === undefined) {
      console.log("no id provided");
      return "no id";
    }
    this.loadFile(myfile, this.BDayResponce, "Unknown Birthday");
  }  

}

// vim: shiftwidth=2:tabstop=2:expandtab 
