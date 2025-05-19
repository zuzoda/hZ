export type PageTypes =
  | "catalog"
  | "in-house"
  | "purchase-house"
  | "furniture"
  | "create-house";

export type RouterProviderProps = {
  router: PageTypes;
  setRouter: (router: PageTypes) => void;
  page: React.ReactNode;
};
