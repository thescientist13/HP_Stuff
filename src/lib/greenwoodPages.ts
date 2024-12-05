const DEBUG = true;

export type Compilation = {
  graph: [];
  context: {};
  config: {};
  // TODO put resources into manifest
  resources: Map<any, any>;
  manifest: {
    apis: Map<any, any>;
  };
};

export type Page = {
  id: String;
  route: String;
  label: String;
  title?: String;
  data?: {
    sidebar?: {
      order?: number;
    };
    author?: String;
    description?: String;
    tableOfContents?: {
      minHeadingLevel?: Number;
      maxHeadingLevel?: Number;
    };
  };
};

export const sortPages = (a: Page, b: Page) => {
  return sortbyfrontmatter(a, b)
    ? sortbyfrontmatter(a, b)
    : sortbyTitle(a, b)
      ? sortbyTitle(a, b)
      : sortbylabel(a, b);
};

const sortbyfrontmatter = (a: Page, b: Page) => {
  if (
    a.data !== undefined &&
    a.data.sidebar !== undefined &&
    a.data.sidebar.order !== undefined
  ) {
    if (DEBUG) {
      console.log(`sorting by sidebar order`);
    }
    if (
      b.data !== undefined &&
      b.data.sidebar !== undefined &&
      b.data.sidebar.order !== undefined
    ) {
      return a.data.sidebar.order > b.data.sidebar.order
        ? 1
        : a.data.sidebar.order < b.data.sidebar.order
          ? -1
          : 0;
    }
    return -1;
  } else if (
    b.data !== undefined &&
    b.data.sidebar !== undefined &&
    b.data.sidebar.order !== undefined
  ) {
    if (DEBUG) {
      console.log(`sorting by sidebar order`);
    }
    return 1;
  }
  return 0;
};

const sortbyTitle = (a: Page, b: Page) => {
  if (a.title !== undefined) {
    if (b.title !== undefined) {
      return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    }
    return a.title.toLowerCase().localeCompare(b.label.toLowerCase());
  }
  if (b.title !== undefined) {
    return a.label.toLowerCase().localeCompare(b.title.toLowerCase());
  }
  return 0;
};

const sortbylabel = (a: Page, b: Page) => {
  return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
};
