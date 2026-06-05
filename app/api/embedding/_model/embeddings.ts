import {
  embedSearchDocument,
  embedSearchDocuments,
  embedSearchQuery,
} from "@/lib/ai/embedding-gemma";

export const embeddings = {
  async embedQuery(query: string): Promise<number[]> {
    return embedSearchQuery(query);
  },

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return embedSearchDocuments(documents);
  },

  async embedDocument(document: string): Promise<number[]> {
    return embedSearchDocument(document);
  },
};
