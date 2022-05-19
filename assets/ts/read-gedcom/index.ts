import Alpine from 'alpinejs';

import intersect from '@alpinejs/intersect'
import persist from '@alpinejs/persist'


window.Alpine = Alpine

Alpine.store('testmessage', {
	message: 'this is a test of alpine with typescript',
});

Alpine.start();


