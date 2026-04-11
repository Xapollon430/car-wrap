import { Firestore } from "@google-cloud/firestore";

export function createFirestore(): Firestore {
  return new Firestore();
}
