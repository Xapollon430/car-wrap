import type { Bucket } from "@google-cloud/storage";
import { getBucketObjectFile } from "../../lib/bucket.js";
import type { StreamableFile } from "../../lib/files.js";
import {
  extensionFromMime,
  inferMimeTypeFromFileName,
} from "../catalog/catalog.helpers.js";
import type { CatalogKind } from "../catalog/catalog.types.js";
import {
  combinationPrefix,
  deletePrefixForCatalogItem,
  generatedImageUrl,
  getBasename,
} from "./generation.helpers.js";

export type GeneratedImageRepository = ReturnType<
  typeof createGeneratedImageRepository
>;

export function createGeneratedImageRepository(bucket: Bucket) {
  async function write(
    carName: string,
    wrapName: string,
    bytes: Buffer,
    mimeType: string,
  ): Promise<string> {
    const prefix = combinationPrefix(carName, wrapName);
    const extension = extensionFromMime(mimeType);
    const fileName = `${prefix}${extension}`;
    const objectPath = `generated/${fileName}`;

    const [existingFiles] = await bucket.getFiles({
      prefix: `generated/${prefix}.`,
    });
    await Promise.all(
      existingFiles.map(async (existingFile) => {
        const existingFileName = getBasename(existingFile.name);
        if (existingFileName !== fileName) {
          await existingFile.delete({ ignoreNotFound: true });
        }
      }),
    );

    await bucket.file(objectPath).save(bytes, {
      resumable: false,
      contentType: mimeType,
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    return generatedImageUrl(fileName);
  }

  async function findExisting(
    carName: string,
    wrapName: string,
  ): Promise<string | null> {
    const prefix = combinationPrefix(carName, wrapName);
    const [files] = await bucket.getFiles({
      prefix: `generated/${prefix}.`,
      maxResults: 1,
    });

    const match = files[0];
    if (!match) {
      return null;
    }

    return generatedImageUrl(getBasename(match.name));
  }

  async function deleteForCatalogItem(
    kind: CatalogKind,
    label: string,
  ): Promise<void> {
    const { prefix, wrapSuffixPattern } = deletePrefixForCatalogItem(kind, label);
    const [files] = await bucket.getFiles({
      prefix,
    });

    const matches = wrapSuffixPattern
      ? files.filter((file) => wrapSuffixPattern.test(getBasename(file.name)))
      : files;

    await Promise.all(
      matches.map((file) =>
        file.delete({
          ignoreNotFound: true,
        }),
      ),
    );
  }

  async function getGeneratedFile(fileName: string): Promise<StreamableFile | null> {
    return getBucketObjectFile(
      bucket,
      `generated/${fileName}`,
      inferMimeTypeFromFileName(fileName),
    );
  }

  return {
    write,
    findExisting,
    deleteForCatalogItem,
    getGeneratedFile,
  };
}
