export type CatalogKind = "cars" | "wraps";

export type StoredCatalogItem = {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
};

export type ApiCatalogItem = {
  id: string;
  label: string;
  imagePath: string;
};

export type CatalogResponse = {
  cars: ApiCatalogItem[];
  wraps: ApiCatalogItem[];
};

export type CreateCatalogUploadInput = {
  kind: CatalogKind;
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
};

export type CommitCatalogItemInput = {
  kind: CatalogKind;
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
};
