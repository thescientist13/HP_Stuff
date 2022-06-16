import Alpine from 'alpinejs';
import fetch from 'isomorphic-fetch';

interface CallbackType { 
  (Arg: string): void; 
}

//window.Alpine = Alpine
//cannot have the above without type tomfoolery that I have not figured out yet

Alpine.store('testmessage', {
	message: 'this is a test of alpine with typescript',
});

Alpine.start();

// vim: shiftwidth=2:tabstop=2:expandtab 

