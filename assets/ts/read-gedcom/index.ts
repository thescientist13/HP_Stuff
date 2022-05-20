import Alpine from 'alpinejs';
import * as rgc from 'read-gedcom';
import * as buffer from 'buffer';

interface CallbackType { (Arg: string): void }

//window.Alpine = Alpine
//cannot have hte above without type tomfoolery that I have not figured out yet

Alpine.store('testmessage', {
	message: 'this is a test of alpine with typescript',
});

Alpine.start();

Alpine.initGedCom(myfile: string, callback: CallbackType, ErrText: string) {
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


