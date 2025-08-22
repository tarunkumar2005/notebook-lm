import { Embeddings } from "@langchain/core/embeddings";
import OpenAI from "openai";

export class CohereEmbeddings extends Embeddings {
  private client: OpenAI;
  private model: string;

  constructor(config: { apiKey: string; model?: string }) {
    super({});
    this.client = new OpenAI({
      baseURL: "https://api.cohere.ai/compatibility/v1",
      apiKey: config.apiKey,
    });
    this.model = config.model || "embed-v4.0";
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      input: texts,
      model: this.model,
      encoding_format: "float",
    });

    return response.data.map((item) => item.embedding);
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      input: [text],
      model: this.model,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  }
}