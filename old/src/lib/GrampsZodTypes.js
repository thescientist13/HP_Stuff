//this file generated by app.quicktype.io
import * as z from "zod";
export const QualitySchema = z.enum([
    "calculated",
    "estimated",
]);
export const DatevalTypeSchema = z.enum([
    "about",
    "before",
]);
export const EventTypeSchema = z.enum([
    "Birth",
    "Death",
    "Education",
    "Elected",
    "Engagement",
    "Hogwarts Sorting",
    "Marriage",
    "Retirement",
]);
export const RoleSchema = z.enum([
    "Bride",
    "Family",
    "Groom",
    "Primary",
]);
export const RelTypeSchema = z.enum([
    "Civil Union",
    "Married",
    "Unknown",
    "Unmarried",
]);
export const GenderSchema = z.enum([
    "F",
    "M",
    "U",
]);
export const DerivationSchema = z.enum([
    "Given",
    "Location",
    "Taken",
    "Unknown",
]);
export const NameTypeSchema = z.enum([
    "Also Known As",
    "Birth Name",
    "Married Name",
    "Unknown",
]);
export const RepositoryTypeSchema = z.enum([
    "Library",
    "Web site",
]);
export const UrlTypeSchema = z.enum([
    "Web Home",
]);
export const MediumSchema = z.enum([
    "Electronic",
]);
export const XmlSchema = z.object({
    "version": z.number(),
    "encoding": z.string(),
});
export const TagSchema = z.object({
    "handle": z.string(),
    "change": z.number(),
    "name": z.string(),
    "color": z.string(),
    "priority": z.number(),
});
export const TagsSchema = z.object({
    "tag": z.array(TagSchema),
});
export const SourcerefSchema = z.object({
    "hlink": z.string(),
});
export const ReporefElementSchema = z.object({
    "hlink": z.string(),
    "medium": MediumSchema,
});
export const SourceSchema = z.object({
    "stitle": z.string(),
    "sauthor": z.string(),
    "spubinfo": z.union([z.null(), z.string()]).optional(),
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "reporef": z.union([z.array(ReporefElementSchema), ReporefElementSchema, z.null()]).optional(),
    "noteref": z.union([SourcerefSchema, z.null()]).optional(),
});
export const SourcesSchema = z.object({
    "source": z.array(SourceSchema),
});
export const UrlSchema = z.object({
    "href": z.string(),
    "type": UrlTypeSchema,
    "description": z.union([z.null(), z.string()]).optional(),
});
export const RepositorySchema = z.object({
    "rname": z.string(),
    "type": RepositoryTypeSchema,
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "url": z.union([UrlSchema, z.null()]).optional(),
});
export const RepositoriesSchema = z.object({
    "repository": z.array(RepositorySchema),
});
export const PnameSchema = z.object({
    "value": z.string(),
});
export const CoordSchema = z.object({
    "long": z.union([z.number(), z.string()]),
    "lat": z.union([z.number(), z.string()]),
});
export const PlaceobjSchema = z.object({
    "pname": PnameSchema,
    "coord": z.union([CoordSchema, z.null()]).optional(),
    "placeref": z.union([SourcerefSchema, z.null()]).optional(),
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "type": z.string(),
    "citationref": z.union([SourcerefSchema, z.null()]).optional(),
});
export const PlacesSchema = z.object({
    "placeobj": z.array(PlaceobjSchema),
});
export const PersonrefSchema = z.object({
    "hlink": z.string(),
    "rel": z.string(),
});
export const SurnameClassSchema = z.object({
    "#text": z.string(),
    "derivation": DerivationSchema,
});
export const NameElementSchema = z.object({
    "first": z.union([z.null(), z.string()]).optional(),
    "call": z.union([z.null(), z.string()]).optional(),
    "surname": z.union([SurnameClassSchema, z.string()]),
    "citationref": z.union([SourcerefSchema, z.null()]).optional(),
    "type": NameTypeSchema,
    "alt": z.union([z.number(), z.null()]).optional(),
    "suffix": z.union([z.null(), z.string()]).optional(),
    "nick": z.union([z.null(), z.string()]).optional(),
    "title": z.union([z.null(), z.string()]).optional(),
});
export const AddressSchema = z.object({
    "state": z.string(),
    "country": z.string(),
    "citationref": SourcerefSchema,
});
export const EventrefElementSchema = z.object({
    "hlink": z.string(),
    "role": RoleSchema,
});
export const PersonSchema = z.object({
    "gender": GenderSchema,
    "name": z.union([z.array(NameElementSchema), NameElementSchema]),
    "eventref": z.union([z.array(EventrefElementSchema), EventrefElementSchema, z.null()]).optional(),
    "childof": z.union([z.array(SourcerefSchema), SourcerefSchema, z.null()]).optional(),
    "parentin": z.union([z.array(SourcerefSchema), SourcerefSchema, z.null()]).optional(),
    "tagref": z.union([z.array(SourcerefSchema), SourcerefSchema, z.null()]).optional(),
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "noteref": z.union([SourcerefSchema, z.null()]).optional(),
    "citationref": z.union([z.array(SourcerefSchema), SourcerefSchema, z.null()]).optional(),
    "personref": z.union([PersonrefSchema, z.null()]).optional(),
    "address": z.union([AddressSchema, z.null()]).optional(),
});
export const PeopleSchema = z.object({
    "person": z.array(PersonSchema),
});
export const NoteSchema = z.object({
    "text": z.string(),
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "type": z.string(),
});
export const NotesSchema = z.object({
    "note": z.array(NoteSchema),
});
export const ResearcherSchema = z.object({
    "resname": z.string(),
    "resemail": z.string(),
});
export const CreatedSchema = z.object({
    "date": z.string(),
    "version": z.string(),
});
export const HeaderSchema = z.object({
    "created": CreatedSchema,
    "researcher": ResearcherSchema,
});
export const RelSchema = z.object({
    "type": RelTypeSchema,
});
export const PurpleChildrefSchema = z.object({
    "hlink": z.string(),
    "citationref": z.union([SourcerefSchema, z.null()]).optional(),
    "noteref": z.union([SourcerefSchema, z.null()]).optional(),
});
export const ChildrefElementSchema = z.object({
    "hlink": z.string(),
    "citationref": z.union([SourcerefSchema, z.null()]).optional(),
    "mrel": z.union([z.null(), z.string()]).optional(),
    "frel": z.union([z.null(), z.string()]).optional(),
});
export const FamilySchema = z.object({
    "rel": RelSchema,
    "father": z.union([SourcerefSchema, z.null()]).optional(),
    "mother": z.union([SourcerefSchema, z.null()]).optional(),
    "eventref": z.union([EventrefElementSchema, z.null()]).optional(),
    "childref": z.union([z.array(ChildrefElementSchema), PurpleChildrefSchema, z.null()]).optional(),
    "citationref": z.union([z.array(SourcerefSchema), SourcerefSchema, z.null()]).optional(),
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "noteref": z.union([SourcerefSchema, z.null()]).optional(),
    "tagref": z.union([SourcerefSchema, z.null()]).optional(),
});
export const FamiliesSchema = z.object({
    "family": z.array(FamilySchema),
});
export const EventDatevalSchema = z.object({
    "val": z.union([z.number(), z.string()]),
    "type": z.union([DatevalTypeSchema, z.null()]).optional(),
    "quality": z.union([QualitySchema, z.null()]).optional(),
});
export const DatestrSchema = z.object({
    "val": z.string(),
});
export const DaterangeClassSchema = z.object({
    "start": z.union([z.number(), z.string()]),
    "stop": z.union([z.number(), z.string()]),
    "quality": z.union([QualitySchema, z.null()]).optional(),
});
export const AttributeSchema = z.object({
    "citationref": SourcerefSchema,
    "type": z.string(),
    "value": z.number(),
});
export const EventSchema = z.object({
    "type": EventTypeSchema,
    "dateval": z.union([EventDatevalSchema, z.null()]).optional(),
    "citationref": z.union([z.array(SourcerefSchema), SourcerefSchema, z.null()]).optional(),
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "noteref": z.union([SourcerefSchema, z.null()]).optional(),
    "place": z.union([SourcerefSchema, z.null()]).optional(),
    "attribute": z.union([AttributeSchema, z.null()]).optional(),
    "datespan": z.union([DaterangeClassSchema, z.null()]).optional(),
    "daterange": z.union([DaterangeClassSchema, z.null()]).optional(),
    "description": z.union([z.null(), z.string()]).optional(),
    "tagref": z.union([SourcerefSchema, z.null()]).optional(),
    "datestr": z.union([DatestrSchema, z.null()]).optional(),
});
export const EventsSchema = z.object({
    "event": z.array(EventSchema),
});
export const CitationDatevalSchema = z.object({
    "val": z.union([z.number(), z.string()]),
});
export const CitationSchema = z.object({
    "page": z.union([z.number(), z.null(), z.string()]).optional(),
    "confidence": z.number(),
    "sourceref": SourcerefSchema,
    "handle": z.string(),
    "change": z.number(),
    "id": z.string(),
    "dateval": z.union([CitationDatevalSchema, z.null()]).optional(),
    "noteref": z.union([SourcerefSchema, z.null()]).optional(),
});
export const CitationsSchema = z.object({
    "citation": z.array(CitationSchema),
});
export const DatabaseSchema = z.object({
    "header": HeaderSchema,
    "tags": TagsSchema,
    "events": EventsSchema,
    "people": PeopleSchema,
    "families": FamiliesSchema,
    "citations": CitationsSchema,
    "sources": SourcesSchema,
    "places": PlacesSchema,
    "repositories": RepositoriesSchema,
    "notes": NotesSchema,
    "xmlns": z.string(),
});
export const ExportSchema = z.object({
    "?xml": XmlSchema,
    "database": DatabaseSchema,
});
