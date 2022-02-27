import { parseDate, readGedcom } from 'read-gedcom';
import fs from 'fs';

/* example from https://docs.arbre.app/read-gedcom/pages/Getting%20Started/quickstart.html
fs.readFile('your_file_here.ged', (error, buffer) => {
  if (error) throw error;
  const gedcom = readGedcom(buffer);
  console.log(gedcom.getHeader().toString());
});
*/

function loadFile(myfile ) {
  if(myfile === undefined) {
    exit;
  }

	const promise = fetch(myfile)
		.then(r => r.arrayBuffer())
		.then(readGedcom);

    return gedcom;
}

export function BirthDay(myfile, id) {
  if(myfile === undefined) {
    return "no filename";
  }
  if(id === undefined) {
    return "no id";
  }

  gedcom = loadFile(myfile);
	if (gedcom === undefined) return "load failed";
  person = gedcom.getIndividualRecord(id);
	if (person === undefined) return "no person";
  return "asdf";
}


//vim: shiftwidth=2:tabstop=2:expandtab 
