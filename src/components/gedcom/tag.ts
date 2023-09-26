// https://wiki-en.genealogy.net/GEDCOM-Tags

import type { SelectionEvent, TreeNode} from "read-gedcom";

/**
 * All the standard Gedcom tags.
 */
export enum Tag {
  Abbreviation = 'ABBR',
  Address = 'ADDR',
  Address1 = 'ADR1',
  Address2 = 'ADR2',
  Address3 = 'ADR3',
  Adoption = 'ADOP',
  AdultChristening = 'CHRA',
  Age = 'AGE',
  Agency = 'AGNC',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  Alias = 'ALIA',
  Ancestors = 'ANCE',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  AncestorInterest = 'ANCI',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  AncestralFileNumber = 'AFN',
  Annulment = 'ANUL',
  Associates = 'ASSO',
  Author = 'AUTH',
  Baptism = 'BAPM',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  BaptismLDS = 'BAPL',
  BarMitzvah = 'BARM',
  BatMitzvah = 'BASM',
  BinaryObject = 'BLOB',
  Birth = 'BIRT',
  Blessing = 'BLES',
  Burial = 'BURI',
  CallNumber = 'CALN',
  Caste = 'CAST',
  Cause = 'CAUS',
  Census = 'CENS',
  Change = 'CHAN',
  Character = 'CHAR',
  Child = 'CHIL',
  ChildrenCount = 'NCHI',
  Christening = 'CHR',
  City = 'CITY',
  Concatenation = 'CONC',
  Confirmation = 'CONF',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  ConfirmationLDS = 'CONL',
  Continuation = 'CONT',
  Copyright = 'COPR',
  Corporate = 'CORP',
  Country = 'CTRY',
  Cremation = 'CREM',
  Data = 'DATA',
  Date = 'DATE',
  Death = 'DEAT',
  Descendants = 'DESC',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  DescendantInt = 'DESI',
  Destination = 'DEST',
  Divorce = 'DIV',
  DivorceFiled = 'DIVF',
  Education = 'EDUC',
  Email = 'EMAIL',
  Emigration = 'EMIG',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  Endowment = 'ENDL',
  Engagement = 'ENGA',
  Event = 'EVEN',
  Fact = 'FACT',
  Family = 'FAM',
  FamilyChild = 'FAMC',
  FamilyFile = 'FAMF',
  FamilySpouse = 'FAMS',
  Fax = 'FAX',
  File = 'FILE',
  FirstCommunion = 'FCOM',
  Format = 'FORM',
  Gedcom = 'GEDC',
  GivenName = 'GIVN',
  Graduation = 'GRAD',
  Header = 'HEAD',
  Husband = 'HUSB',
  IdentificationNumber = 'IDNO',
  Immigration = 'IMMI',
  Individual = 'INDI',
  Language = 'LANG',
  Latitude = 'LATI',
  Legatee = 'LEGA',
  Longitude = 'LONG',
  Map = 'MAP',
  Marriage = 'MARR',
  MarriageBan = 'MARB',
  MarriageContract = 'MARC',
  MarriageCount = 'NMR',
  MarriageLicense = 'MARL',
  MarriageSettlement = 'MARS',
  Media = 'MEDI',
  Name = 'NAME',
  NamePrefix = 'NPFX',
  NameSuffix = 'NSFX',
  Nationality = 'NATI',
  Naturalization = 'NATU',
  Nickname = 'NICK',
  Note = 'NOTE',
  Object = 'OBJE',
  Occupation = 'OCCU',
  Ordinance = 'ORDI',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  Ordination = 'ORDN',
  Page = 'PAGE',
  Pedigree = 'PEDI',
  Phone = 'PHON',
  Phonetic = 'FONE',
  PhysicalDescription = 'DSCR',
  Place = 'PLAC',
  PostalCode = 'POST',
  Probate = 'PROB',
  Property = 'PROP',
  Publication = 'PUBL',
  QualityOfData = 'QUAY',
  RecordFileNumber = 'RFN',
  RecordIdNumber = 'RIN',
  Reference = 'REFN',
  Relationship = 'RELA',
  Religion = 'RELI',
  Repository = 'REPO',
  Residence = 'RESI',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  Restriction = 'RESN',
  Retirement = 'RETI',
  Role = 'ROLE',
  Romanized = 'ROMN',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  SealingChild = 'SLGC',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  SealingSpouse = 'SLGS',
  Sex = 'SEX',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  SocialSecurityNumber = 'SSN',
  Source = 'SOUR',
  State = 'STAE',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  Status = 'STAT',
  /**
   * Obsoleted in Gedcom 5.5.5
   */
  Submission = 'SUBN',
  Submitter = 'SUBM',
  Surname = 'SURN',
  SurnamePrefix = 'SPFX',
  Temple = 'TEMP',
  Text = 'TEXT',
  Time = 'TIME',
  Title = 'TITL',
  Trailer = 'TRLR',
  Type = 'TYPE',
  Version = 'VERS',
  Web = 'WWW',
  Wife = 'WIFE',
  Will = 'WILL',
}

export function eventsWithKeys(e: TreeNode) {
  if (e && e.tag) {
    const t = e.tag.toString();
    switch (t) {
      case Tag.Birth:
        return 'birth';
      case Tag.Christening:
        return 'christening';
      case Tag.Death:
        return 'death';
      case Tag.Burial:
        return 'burial';
      case Tag.Cremation:
        return 'cremation';
      case Tag.Adoption:
        return 'adoption';
      case Tag.Baptism:
        return 'baptism';
      case Tag.BarMitzvah:
        return 'bar_mitzvah';
      case Tag.BatMitzvah:
        return 'bat_mitzvah';
      case Tag.AdultChristening:
        return 'adult_christening';
      case Tag.Confirmation:
        return 'confirmation';
      case Tag.FirstCommunion:
        return 'first_communion';
      case Tag.Naturalization:
        return 'naturalization';
      case Tag.Emigration:
        return 'emigration';
      case Tag.Immigration:
        return 'immigration';
      case Tag.Census:
        return 'census';
      case Tag.Probate:
        return 'probate';
      case Tag.Will:
        return 'will';
      case Tag.Graduation:
        return 'graduation';
      case Tag.Retirement:
        return 'retirement';
      case Tag.Occupation:
        return 'occupation'; // While originally defined as an attribute it is used as an event
      case Tag.Residence:
        return 'residence'; // Same here
      case Tag.Event:
        return 'event';
      default:
        return null;
    }
  }
  return null;
}

