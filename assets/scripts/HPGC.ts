import * as rgc from 'read-gedcom';
import * as buffer from 'buffer';

class HPGC {
  constructor() {
  }

	//from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#asynchronous_request
	function xhrSuccess() {
    this.callback.apply(this, this.arguments);
	}

	function xhrError() {
    console.error(this.statusText);
	}


	const BDayResponce = function(response) {
    if(!response) {
  		console.log("response is null");
        return;
    } else {
			console.log("response is not null");
      console.log(typeof(response));
    }
	}

	function loadFile(url, callback /*, opt_arg1, opt_arg2, ... */) {
  	var args = Array.prototype.slice.call(arguments, 3);
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = function () {
	    console.error("The request for " + url + " timed out.");
    };
    xhr.callback = callback;
    xhr.arguments = Array.prototype.slice.call(arguments, 2);
    xhr.onload = function() {
   		if (xhr.readyState === 4) {
      	if (xhr.status === 200) {
        	callback.apply(xhr.response);
        } else {
					console.error(xhr.statusText);
        }
			}
		};
    xhr.open("GET", url, true);
    xhr.timeout = 300;
    xhr.send(null);
	}

	function BirthDay (myfile, id) {
  	if(myfile === undefined) {
    	console.log("no file name provided");
    	return "no filename";
  	}
  	if(id === undefined) {
    	console.log("no id provided");
    	return "no id";
  	}
  	loadFile(myfile, BDayResponce, "Unknown Birthday");
	}	

}


// vim: shiftwidth=2:tabstop=2:expandtab 
