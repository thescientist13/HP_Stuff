import Alpine from 'alpinejs';
import  HPGC from "./HPGC/index";

console.log("loaded base typescript file");

Alpine.data('HPGC', HPGC );

Alpine.start();


