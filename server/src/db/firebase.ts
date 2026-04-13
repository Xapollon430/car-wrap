import { Firestore } from "@google-cloud/firestore";

let firestore: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!firestore) {
    const databaseId = (process.env.FIRESTORE_DATABASE_ID ?? "(default)").trim();
    firestore = new Firestore({
      databaseId: databaseId || "(default)",
    });
  }

  return firestore;
}
