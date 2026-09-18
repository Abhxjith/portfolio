export const BOOK_TYPES = [
  { title: "Zine", value: "zine" },
  { title: "Comic", value: "comic" },
  { title: "Magazine", value: "magazine" },
  { title: "Portfolio", value: "portfolio" },
  { title: "Sketchbook", value: "sketchbook" },
  { title: "Photobook", value: "photobook" },
  { title: "Other", value: "other" },
] as const;

export type BookTypeValue = (typeof BOOK_TYPES)[number]["value"];
