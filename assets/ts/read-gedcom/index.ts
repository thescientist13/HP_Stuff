import Alpine from 'alpinejs';

//window.Alpine = Alpine
//cannot have hte above without type tomfoolery that I have not figured out yet

Alpine.store('testmessage', {
	message: 'this is a test of alpine with typescript',
});

Alpine.start();


