import { notFound } from "../../lib/errors.js";
import type { GeneratedImageRepository } from "../generation/generation.repository.js";
import { toApiCatalogItem } from "./catalog.helpers.js";
import type {
  CommitCatalogItemInput,
  CreateCatalogUploadInput,
} from "./catalog.types.js";
import type { CatalogRepository } from "./catalog.repository.js";

export type CatalogService = ReturnType<typeof createCatalogService>;

export function createCatalogService(deps: {
  catalogRepository: CatalogRepository;
  generatedImageRepository: GeneratedImageRepository;
}) {
  async function getCatalog() {
    return deps.catalogRepository.loadCatalog();
  }

  async function createUpload(input: CreateCatalogUploadInput) {
    const uploadUrl = await deps.catalogRepository.createUploadUrl(
      input.kind,
      input.fileName,
      input.mimeType,
    );

    return {
      uploadUrl,
      fileName: input.fileName,
      mimeType: input.mimeType,
      item: toApiCatalogItem(input.kind, {
        id: input.id,
        label: input.label,
        fileName: input.fileName,
        mimeType: input.mimeType,
      }),
    };
  }

  async function commit(input: CommitCatalogItemInput) {
    await deps.catalogRepository.assertUploaded(input.kind, input.fileName);
    const result = await deps.catalogRepository.upsertItem(input);
    return {
      created: result.created,
      item: toApiCatalogItem(input.kind, result.item),
    };
  }

  async function remove(input: { kind: "cars" | "wraps"; id: string }) {
    const removed = await deps.catalogRepository.removeItem(input.kind, input.id);
    if (!removed) {
      throw notFound("catalog item not found");
    }

    await Promise.all([
      deps.catalogRepository.deleteCatalogMedia(input.kind, removed.fileName),
      deps.generatedImageRepository.deleteForCatalogItem(input.kind, removed.label),
    ]);

    return {
      item: {
        id: removed.id,
        label: removed.label,
      },
    };
  }

  return {
    getCatalog,
    createUpload,
    commit,
    remove,
  };
}
