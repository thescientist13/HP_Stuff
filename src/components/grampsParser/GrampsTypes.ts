export const prerender = false;
//this file generated by app.quicktype.io
// To parse this data:
//
//   import { Convert, Export } from "./file";
//
//   const export = Convert.toExport(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Export {
  "?xml": XML;
  database: Database;
}

export interface XML {
  version: number;
  encoding: string;
}

export interface Database {
  header: Header;
  tags: Tags;
  events: Events;
  people: People;
  families: Families;
  citations: Citations;
  sources: Sources;
  places: Places;
  repositories: Repositories;
  notes: Notes;
  xmlns: string;
}

export interface Citations {
  citation: Citation[];
}

export interface Citation {
  page?: Page;
  confidence: number;
  sourceref: Noteref;
  handle: string;
  change: number;
  id: string;
  dateval?: CitationDateval;
  noteref?: Noteref;
}

export interface CitationDateval {
  val: Val;
}

export type Val = Date | number;

export interface Noteref {
  hlink: string;
}

export type Page = number | string;

export interface Events {
  event: Event[];
}

export interface Event {
  type: EventType;
  dateval?: EventDateval;
  citationref?: Citationref;
  handle: string;
  change: number;
  id: string;
  noteref?: Noteref;
  place?: Noteref;
  attribute?: Attribute;
  datespan?: DaterangeClass;
  daterange?: DaterangeClass;
  description?: string;
  tagref?: Noteref;
  datestr?: Datestr;
}

export interface Attribute {
  citationref: Noteref;
  type: string;
  value: number;
}

export type Citationref = Noteref[] | Noteref;

export interface DaterangeClass {
  start: Start;
  stop: Val;
  quality?: Quality;
}

export type Quality = "estimated" | "calculated";

export type Start = number | string;

export interface Datestr {
  val: string;
}

export interface EventDateval {
  val: Start;
  type?: DatevalType;
  quality?: Quality;
}

export type DatevalType = "before" | "about";

export type EventType =
  | "Birth"
  | "Death"
  | "Marriage"
  | "Hogwarts Sorting"
  | "Education"
  | "Engagement"
  | "Elected"
  | "Retirement";

export interface Families {
  family: Family[];
}

export interface Family {
  rel: Rel;
  father?: Noteref;
  mother?: Noteref;
  eventref?: EventrefElement;
  childref?: ChildrefUnion;
  citationref?: Citationref;
  handle: string;
  change: number;
  id: string;
  noteref?: Noteref;
  tagref?: Noteref;
}

export type ChildrefUnion = ChildrefElement[] | PurpleChildref;

export interface ChildrefElement {
  hlink: string;
  citationref?: Noteref;
  mrel?: string;
  frel?: string;
}

export interface PurpleChildref {
  hlink: string;
  citationref?: Noteref;
  noteref?: Noteref;
}

export interface EventrefElement {
  hlink: string;
  role: Role;
}

export type Role = "Family" | "Primary" | "Groom" | "Bride";

export interface Rel {
  type: RelType;
}

export type RelType = "Married" | "Unknown" | "Unmarried" | "Civil Union";

export interface Header {
  created: Created;
  researcher: Researcher;
}

export interface Created {
  date: Date;
  version: string;
}

export interface Researcher {
  resname: string;
  resemail: string;
}

export interface Notes {
  note: Note[];
}

export interface Note {
  text: string;
  handle: string;
  change: number;
  id: string;
  type: string;
}

export interface People {
  person: Person[];
}

export interface Person {
  gender: Gender;
  name: NameUnion;
  eventref?: EventrefUnion;
  childof?: Citationref;
  parentin?: Citationref;
  tagref?: Citationref;
  handle: string;
  change: number;
  id: string;
  noteref?: Noteref;
  citationref?: Citationref;
  personref?: Personref;
  address?: Address;
}

export interface Address {
  state: string;
  country: string;
  citationref: Noteref;
}

export type EventrefUnion = EventrefElement[] | EventrefElement;

export type Gender = "M" | "F" | "U";

export type NameUnion = NameElement[] | NameElement;

export interface NameElement {
  first?: string;
  call?: string;
  surname: SurnameUnion;
  citationref?: Noteref;
  type: NameType;
  alt?: number;
  suffix?: string;
  nick?: string;
  title?: string;
}

export type SurnameUnion = SurnameClass | string;

export interface SurnameClass {
  "#text": string;
  derivation: Derivation;
}

export type Derivation = "Given" | "Taken" | "Location" | "Unknown";

export type NameType =
  | "Birth Name"
  | "Married Name"
  | "Also Known As"
  | "Unknown";

export interface Personref {
  hlink: string;
  rel: string;
}

export interface Places {
  placeobj: Placeobj[];
}

export interface Placeobj {
  pname: Pname;
  coord?: Coord;
  placeref?: Noteref;
  handle: string;
  change: number;
  id: string;
  type: string;
  citationref?: Noteref;
}

export interface Coord {
  long: Lat;
  lat: Lat;
}

export type Lat = number | string;

export interface Pname {
  value: string;
}

export interface Repositories {
  repository: Repository[];
}

export interface Repository {
  rname: string;
  type: RepositoryType;
  handle: string;
  change: number;
  id: string;
  url?: URL;
}

export type RepositoryType = "Web site" | "Library";

export interface URL {
  href: string;
  type: URLType;
  description?: string;
}

export type URLType = "Web Home";

export interface Sources {
  source: Source[];
}

export interface Source {
  stitle: string;
  sauthor: string;
  spubinfo?: string;
  handle: string;
  change: number;
  id: string;
  reporef?: ReporefUnion;
  noteref?: Noteref;
}

export type ReporefUnion = ReporefElement[] | ReporefElement;

export interface ReporefElement {
  hlink: string;
  medium: Medium;
}

export type Medium = "Electronic";

export interface Tags {
  tag: Tag[];
}

export interface Tag {
  handle: string;
  change: number;
  name: string;
  color: string;
  priority: number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toExport(json: string): Export {
    return cast(JSON.parse(json), r("Export"));
  }

  public static exportToJson(value: Export): string {
    return JSON.stringify(uncast(value, r("Export")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`,
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = "",
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any,
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty("props")
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  Export: o(
    [
      { json: "?xml", js: "?xml", typ: r("XML") },
      { json: "database", js: "database", typ: r("Database") },
    ],
    false,
  ),
  XML: o(
    [
      { json: "version", js: "version", typ: 0 },
      { json: "encoding", js: "encoding", typ: "" },
    ],
    false,
  ),
  Database: o(
    [
      { json: "header", js: "header", typ: r("Header") },
      { json: "tags", js: "tags", typ: r("Tags") },
      { json: "events", js: "events", typ: r("Events") },
      { json: "people", js: "people", typ: r("People") },
      { json: "families", js: "families", typ: r("Families") },
      { json: "citations", js: "citations", typ: r("Citations") },
      { json: "sources", js: "sources", typ: r("Sources") },
      { json: "places", js: "places", typ: r("Places") },
      { json: "repositories", js: "repositories", typ: r("Repositories") },
      { json: "notes", js: "notes", typ: r("Notes") },
      { json: "xmlns", js: "xmlns", typ: "" },
    ],
    false,
  ),
  Citations: o(
    [{ json: "citation", js: "citation", typ: a(r("Citation")) }],
    false,
  ),
  Citation: o(
    [
      { json: "page", js: "page", typ: u(undefined, u(0, "")) },
      { json: "confidence", js: "confidence", typ: 0 },
      { json: "sourceref", js: "sourceref", typ: r("Noteref") },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      {
        json: "dateval",
        js: "dateval",
        typ: u(undefined, r("CitationDateval")),
      },
      { json: "noteref", js: "noteref", typ: u(undefined, r("Noteref")) },
    ],
    false,
  ),
  CitationDateval: o([{ json: "val", js: "val", typ: u(Date, 0) }], false),
  Noteref: o([{ json: "hlink", js: "hlink", typ: "" }], false),
  Events: o([{ json: "event", js: "event", typ: a(r("Event")) }], false),
  Event: o(
    [
      { json: "type", js: "type", typ: r("EventType") },
      { json: "dateval", js: "dateval", typ: u(undefined, r("EventDateval")) },
      {
        json: "citationref",
        js: "citationref",
        typ: u(undefined, u(a(r("Noteref")), r("Noteref"))),
      },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      { json: "noteref", js: "noteref", typ: u(undefined, r("Noteref")) },
      { json: "place", js: "place", typ: u(undefined, r("Noteref")) },
      { json: "attribute", js: "attribute", typ: u(undefined, r("Attribute")) },
      {
        json: "datespan",
        js: "datespan",
        typ: u(undefined, r("DaterangeClass")),
      },
      {
        json: "daterange",
        js: "daterange",
        typ: u(undefined, r("DaterangeClass")),
      },
      { json: "description", js: "description", typ: u(undefined, "") },
      { json: "tagref", js: "tagref", typ: u(undefined, r("Noteref")) },
      { json: "datestr", js: "datestr", typ: u(undefined, r("Datestr")) },
    ],
    false,
  ),
  Attribute: o(
    [
      { json: "citationref", js: "citationref", typ: r("Noteref") },
      { json: "type", js: "type", typ: "" },
      { json: "value", js: "value", typ: 0 },
    ],
    false,
  ),
  DaterangeClass: o(
    [
      { json: "start", js: "start", typ: u(0, "") },
      { json: "stop", js: "stop", typ: u(Date, 0) },
      { json: "quality", js: "quality", typ: u(undefined, r("Quality")) },
    ],
    false,
  ),
  Datestr: o([{ json: "val", js: "val", typ: "" }], false),
  EventDateval: o(
    [
      { json: "val", js: "val", typ: u(0, "") },
      { json: "type", js: "type", typ: u(undefined, r("DatevalType")) },
      { json: "quality", js: "quality", typ: u(undefined, r("Quality")) },
    ],
    false,
  ),
  Families: o([{ json: "family", js: "family", typ: a(r("Family")) }], false),
  Family: o(
    [
      { json: "rel", js: "rel", typ: r("Rel") },
      { json: "father", js: "father", typ: u(undefined, r("Noteref")) },
      { json: "mother", js: "mother", typ: u(undefined, r("Noteref")) },
      {
        json: "eventref",
        js: "eventref",
        typ: u(undefined, r("EventrefElement")),
      },
      {
        json: "childref",
        js: "childref",
        typ: u(undefined, u(a(r("ChildrefElement")), r("PurpleChildref"))),
      },
      {
        json: "citationref",
        js: "citationref",
        typ: u(undefined, u(a(r("Noteref")), r("Noteref"))),
      },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      { json: "noteref", js: "noteref", typ: u(undefined, r("Noteref")) },
      { json: "tagref", js: "tagref", typ: u(undefined, r("Noteref")) },
    ],
    false,
  ),
  ChildrefElement: o(
    [
      { json: "hlink", js: "hlink", typ: "" },
      {
        json: "citationref",
        js: "citationref",
        typ: u(undefined, r("Noteref")),
      },
      { json: "mrel", js: "mrel", typ: u(undefined, "") },
      { json: "frel", js: "frel", typ: u(undefined, "") },
    ],
    false,
  ),
  PurpleChildref: o(
    [
      { json: "hlink", js: "hlink", typ: "" },
      {
        json: "citationref",
        js: "citationref",
        typ: u(undefined, r("Noteref")),
      },
      { json: "noteref", js: "noteref", typ: u(undefined, r("Noteref")) },
    ],
    false,
  ),
  EventrefElement: o(
    [
      { json: "hlink", js: "hlink", typ: "" },
      { json: "role", js: "role", typ: r("Role") },
    ],
    false,
  ),
  Rel: o([{ json: "type", js: "type", typ: r("RelType") }], false),
  Header: o(
    [
      { json: "created", js: "created", typ: r("Created") },
      { json: "researcher", js: "researcher", typ: r("Researcher") },
    ],
    false,
  ),
  Created: o(
    [
      { json: "date", js: "date", typ: Date },
      { json: "version", js: "version", typ: "" },
    ],
    false,
  ),
  Researcher: o(
    [
      { json: "resname", js: "resname", typ: "" },
      { json: "resemail", js: "resemail", typ: "" },
    ],
    false,
  ),
  Notes: o([{ json: "note", js: "note", typ: a(r("Note")) }], false),
  Note: o(
    [
      { json: "text", js: "text", typ: "" },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      { json: "type", js: "type", typ: "" },
    ],
    false,
  ),
  People: o([{ json: "person", js: "person", typ: a(r("Person")) }], false),
  Person: o(
    [
      { json: "gender", js: "gender", typ: r("Gender") },
      {
        json: "name",
        js: "name",
        typ: u(a(r("NameElement")), r("NameElement")),
      },
      {
        json: "eventref",
        js: "eventref",
        typ: u(undefined, u(a(r("EventrefElement")), r("EventrefElement"))),
      },
      {
        json: "childof",
        js: "childof",
        typ: u(undefined, u(a(r("Noteref")), r("Noteref"))),
      },
      {
        json: "parentin",
        js: "parentin",
        typ: u(undefined, u(a(r("Noteref")), r("Noteref"))),
      },
      {
        json: "tagref",
        js: "tagref",
        typ: u(undefined, u(a(r("Noteref")), r("Noteref"))),
      },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      { json: "noteref", js: "noteref", typ: u(undefined, r("Noteref")) },
      {
        json: "citationref",
        js: "citationref",
        typ: u(undefined, u(a(r("Noteref")), r("Noteref"))),
      },
      { json: "personref", js: "personref", typ: u(undefined, r("Personref")) },
      { json: "address", js: "address", typ: u(undefined, r("Address")) },
    ],
    false,
  ),
  Address: o(
    [
      { json: "state", js: "state", typ: "" },
      { json: "country", js: "country", typ: "" },
      { json: "citationref", js: "citationref", typ: r("Noteref") },
    ],
    false,
  ),
  NameElement: o(
    [
      { json: "first", js: "first", typ: u(undefined, "") },
      { json: "call", js: "call", typ: u(undefined, "") },
      { json: "surname", js: "surname", typ: u(r("SurnameClass"), "") },
      {
        json: "citationref",
        js: "citationref",
        typ: u(undefined, r("Noteref")),
      },
      { json: "type", js: "type", typ: r("NameType") },
      { json: "alt", js: "alt", typ: u(undefined, 0) },
      { json: "suffix", js: "suffix", typ: u(undefined, "") },
      { json: "nick", js: "nick", typ: u(undefined, "") },
      { json: "title", js: "title", typ: u(undefined, "") },
    ],
    false,
  ),
  SurnameClass: o(
    [
      { json: "#text", js: "#text", typ: "" },
      { json: "derivation", js: "derivation", typ: r("Derivation") },
    ],
    false,
  ),
  Personref: o(
    [
      { json: "hlink", js: "hlink", typ: "" },
      { json: "rel", js: "rel", typ: "" },
    ],
    false,
  ),
  Places: o(
    [{ json: "placeobj", js: "placeobj", typ: a(r("Placeobj")) }],
    false,
  ),
  Placeobj: o(
    [
      { json: "pname", js: "pname", typ: r("Pname") },
      { json: "coord", js: "coord", typ: u(undefined, r("Coord")) },
      { json: "placeref", js: "placeref", typ: u(undefined, r("Noteref")) },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      { json: "type", js: "type", typ: "" },
      {
        json: "citationref",
        js: "citationref",
        typ: u(undefined, r("Noteref")),
      },
    ],
    false,
  ),
  Coord: o(
    [
      { json: "long", js: "long", typ: u(3.14, "") },
      { json: "lat", js: "lat", typ: u(3.14, "") },
    ],
    false,
  ),
  Pname: o([{ json: "value", js: "value", typ: "" }], false),
  Repositories: o(
    [{ json: "repository", js: "repository", typ: a(r("Repository")) }],
    false,
  ),
  Repository: o(
    [
      { json: "rname", js: "rname", typ: "" },
      { json: "type", js: "type", typ: r("RepositoryType") },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      { json: "url", js: "url", typ: u(undefined, r("URL")) },
    ],
    false,
  ),
  URL: o(
    [
      { json: "href", js: "href", typ: "" },
      { json: "type", js: "type", typ: r("URLType") },
      { json: "description", js: "description", typ: u(undefined, "") },
    ],
    false,
  ),
  Sources: o([{ json: "source", js: "source", typ: a(r("Source")) }], false),
  Source: o(
    [
      { json: "stitle", js: "stitle", typ: "" },
      { json: "sauthor", js: "sauthor", typ: "" },
      { json: "spubinfo", js: "spubinfo", typ: u(undefined, "") },
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "id", js: "id", typ: "" },
      {
        json: "reporef",
        js: "reporef",
        typ: u(undefined, u(a(r("ReporefElement")), r("ReporefElement"))),
      },
      { json: "noteref", js: "noteref", typ: u(undefined, r("Noteref")) },
    ],
    false,
  ),
  ReporefElement: o(
    [
      { json: "hlink", js: "hlink", typ: "" },
      { json: "medium", js: "medium", typ: r("Medium") },
    ],
    false,
  ),
  Tags: o([{ json: "tag", js: "tag", typ: a(r("Tag")) }], false),
  Tag: o(
    [
      { json: "handle", js: "handle", typ: "" },
      { json: "change", js: "change", typ: 0 },
      { json: "name", js: "name", typ: "" },
      { json: "color", js: "color", typ: "" },
      { json: "priority", js: "priority", typ: 0 },
    ],
    false,
  ),
  Quality: ["calculated", "estimated"],
  DatevalType: ["about", "before"],
  EventType: [
    "Birth",
    "Death",
    "Education",
    "Elected",
    "Engagement",
    "Hogwarts Sorting",
    "Marriage",
    "Retirement",
  ],
  Role: ["Bride", "Family", "Groom", "Primary"],
  RelType: ["Civil Union", "Married", "Unknown", "Unmarried"],
  Gender: ["F", "M", "U"],
  Derivation: ["Given", "Location", "Taken", "Unknown"],
  NameType: ["Also Known As", "Birth Name", "Married Name", "Unknown"],
  RepositoryType: ["Library", "Web site"],
  URLType: ["Web Home"],
  Medium: ["Electronic"],
};
