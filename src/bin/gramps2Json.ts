
import { XMLParser} from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import {unzip} from 'node:zlib';
import {z, type ZodError} from 'zod';
import { delay } from 'nanodelay'


import {
    type Export as zodExport,
    type Database,
    ExportSchema,
    type People,
    DatabaseSchema
} from '../lib/GrampsZodTypes.js';

const partialDB = DatabaseSchema.deepPartial();
type partialDBType = z.infer<typeof partialDB>;

import root from '../lib/root.json' assert { type: "json" };
import * as process from "process";

const grampsPath = path.join(root.CWD, 'public/potter_universe.gramps');

console.log(`cwd is ${root.CWD}, path is ${grampsPath}`)
const buffer = fs.readFileSync(grampsPath);
let data: zodExport | null = null;
unzip(buffer, (err, buffer) => {
    console.log(`in the unzip callback`)
    if(err) {
        console.error(`an error has occured decompressing`, err);
        process.exit(1);
    }
    const gramps = buffer.toString();

    if(gramps !== '') {
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: '',
            parseAttributeValue: true,
            allowBooleanAttributes: true
        };
        const parser = new XMLParser(options);
        let jObj = parser.parse(gramps);
        if (jObj) {
            console.log(`state dataFetcher jObj populated ${JSON.stringify(jObj)}`);
            const result: { success: true; data: zodExport; } | { success: false; error: ZodError; } = ExportSchema.safeParse(jObj);
            if(result.success) {
                data = result.data;
                console.log(`successfully parsed`);
            } else{
                console.error(`zod safeParse failed`);
                process.exit(2);
            }
        } else {
            console.error`XML Parser failed`
            process.exit(3)
        }
    } else {
        console.log(`readsync did not error, but gramps is still empty`)
        process.exit(4)
    }

});
console.log(`zlib complete`)

let i = 0;
while(!data) {
    console.log(`waiting ${i++}`)
    await delay(300);
}

const db = (data as zodExport).database;

db.people.person.forEach((p) => {

    let toExport: Database = {
        header: db.header,
        tags: db.tags,
        events: db.events,
        families: {family: []},
        people: {person: [p]},
        citations: db.citations,
        sources: db.sources,
        places: db.places,
        repositories: db.repositories,
        notes: db.notes,
        xmlns: db.xmlns
    };
    if(p.handle) {
        if(p.childof ) {
            const childof = [p.childof].flat().map((c) => {return c.hlink});
            childof.forEach((fref) => {
                if(fref) {
                    const families = db.families.family.filter((f) => {
                        if(f.handle) {
                            return (!f.handle.localeCompare(fref, undefined, {sensitivity: 'base'}))
                        }
                        return false;
                    })
                    if(families.length > 0) {
                        families.forEach((nf) => {
                            if(nf.father) {
                                const fatherRef = [nf.father].flat().shift()
                                if(fatherRef && fatherRef.hlink) {
                                    const hlink = fatherRef.hlink;
                                    const toAdd = db.people.person.filter((p) => {
                                        if(p && p.handle) {
                                            return (!p.handle.localeCompare(hlink, undefined, {sensitivity: 'base'}));
                                        }
                                        return false;
                                    })
                                    toExport.people.person = toExport.people.person.concat(toAdd);
                                }
                            }
                            if(nf.mother) {
                                const motherRef = [nf.mother].flat().shift()
                                if(motherRef && motherRef.hlink) {
                                    const hlink = motherRef.hlink;
                                    const toAdd = db.people.person.filter((p) => {
                                        if(p && p.handle) {
                                            return (!p.handle.localeCompare(hlink, undefined, {sensitivity: 'base'}));
                                        }
                                        return false;
                                    })
                                    toExport.people.person = toExport.people.person.concat(toAdd);
                                }
                            }
                        })
                        toExport.families.family = toExport.families.family.concat(families);
                    }
                }
            })
        }
        if(p.parentin) {
            const parentin = [p.parentin].flat().map((p) => {return p.hlink})
            if(parentin && parentin.length > 0) {
                parentin.forEach((pref) => {
                    const families = db.families.family.filter((f) => {
                        if(f.handle) {
                            return (!f.handle.localeCompare(pref, undefined, {sensitivity: 'base'}))
                        }
                        return false;
                    })
                    if(families.length > 0) {
                        families.forEach((f) => {
                            if(f.childref ) {
                                const childref = [f.childref].flat().map((c) => {return c.hlink});
                                if(childref && childref.length > 0) {
                                    childref.forEach((c) => {
                                        const nc = db.people.person.filter((p) => {
                                            if(p && p.handle) {
                                                return (!p.handle.localeCompare(c,undefined,{sensitivity: 'base'}));
                                            }
                                            return false;
                                        })
                                        if(nc  && nc.length > 0) {
                                            toExport.people.person = toExport.people.person.concat(nc)
                                        }
                                    })
                                }
                            }
                        })
                        toExport.families.family = toExport.families.family.concat(families);
                    }
                })
            }
        }
    }
    const personPath = path.join(root.CWD, 'src/content/gramps/people/', p.id.concat('.json'));
    const personFile = fs.openSync(personPath, 'w', 0o600)
    fs.writeSync(personFile, JSON.stringify(toExport))
})