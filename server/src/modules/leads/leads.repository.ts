import type { Firestore } from "@google-cloud/firestore";
import type { LeadRecord } from "./leads.types.js";

export type LeadsRepository = ReturnType<typeof createLeadsRepository>;

export function createLeadsRepository(input: {
  firestore: Firestore;
  collectionName: string;
}) {
  async function create(record: LeadRecord): Promise<{ id: string }> {
    const doc = await input.firestore.collection(input.collectionName).add(record);
    return { id: doc.id };
  }

  return {
    create,
  };
}
