
import { XMLParser} from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import {unzip} from 'node:zlib';
import {type ZodError} from 'zod';
import { delay } from 'nanodelay'


import {type Export as zodExport, type Database, ExportSchema, type People} from '../lib/GrampsZodTypes.js';

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
    let toExport = new WeakSet();
    toExport.add(p);
    if(p.handle) {
        if(p.childof ) {
            const childof = [p.childof].flat();
            childof.forEach((fref) => {
                if(fref.hlink) {
                    const families = db.families.family.filter((f) => {
                        if(f.handle) {
                            return (!f.handle.localeCompare(fref.hlink, undefined, {sensitivity: 'base'}))
                        }
                        return false;
                    })
                    if(families.length > 0) {
                        toExport.add(families)
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
                        toExport.add(families)
                    }
                })
            }
        }
    }
    if(db.events) {
        toExport.add(db.events)
    }
    if(db.tags) {
        toExport.add(db.tags)
    }
    if(db.citations) {
        toExport.add(db.citations)
    }
    if(db.repositories) {
        toExport.add(db.repositories)
    }
    if(db.places) {
        toExport.add(db.places)
    }
    if(db.sources) {
        toExport.add(db.sources)
    }
    if(db.notes) {
        toExport.add(db.notes)
    }
    const personPath = path.join(root.CWD, 'src/content/gramps/people/', p.id, '.json');
    const personFile = fs.openSync(personPath, 'w', 0o600)
    fs.writeSync(personFile, JSON.stringify(toExport))
})