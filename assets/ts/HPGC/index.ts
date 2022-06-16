import Alpine from 'alpinejs';
import fetch from 'isomorphic-fetch';
import * as rgc from 'read-gedcom';

export default() => ({
  
  myURL: '',
  isLoaded: false,
  
  dDay(id: string, GedData: rgc.SelectionGedcom ): string {
    if (typeof(GedData) === 'undefined') { 
      console.log('dDay called before init');
      return 'Unknown date of Death';
    } else {
      console.log('fetching dday for ' + id);
      const individual = GedData!.getIndividualRecord(id);
      const gedDate = individual.getEventDeath().getDate();
      return gedDate.toString().replace('DATE ', '');
    }
  },
  
  bDay(id: string, GedData: rgc.SelectionGedcom): string {
    if (typeof(GedData) === 'undefined') { 
      console.log('bDay called before init');
      return 'Uknown Birthday';
    } else {
      console.log('fetching bday for ' + id);
      const individual = GedData!.getIndividualRecord(id);
      console.log('individual ' + individual.toString());
      const gedDate = individual.getEventBirth().getDate();
      return gedDate.toString().replace('DATE ', '');
    }
  },
  
  computeGeneralStatistics(x: rgc.SelectionGedcom) {
    return {
      families: x.getFamilyRecord().length,
      individuals: x.getIndividualRecord().length,
      multimedia: x.getMultimediaRecord().length,
      notes: x.getNoteRecord().length,
      repositories: x.getRepositoryRecord().length,
      sources: x.getSourceRecord().length,
    }
  },
  
  initGedCom(url: string) {
    console.log('initGedCom with ' + url);
    const GedPromise = fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.arrayBuffer();
    })
    .then(this.setGedData);
  },
  
  setGedData(newFile: ArrayBuffer ): rgc.SelectionGedcom | null {
    var myGedFile = newFile;
    console.log("called setter function");
    if (typeof(myGedFile) !== 'undefined') {
      var data = rgc.readGedcom(myGedFile);
      if (typeof(data) !== 'undefined') {
        this.isLoaded = true;
        dispatchEvent(new CustomEvent('GedLoaded'));
        console.log("set loaded value");
        return data;
      }
    }
    return null;
  },
  
});

// vim: shiftwidth=2:tabstop=2:expandtab

