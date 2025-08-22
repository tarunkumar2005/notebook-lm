import { NextRequest, NextResponse } from "next/server";
import { QdrantVectorStore } from "@langchain/qdrant";
import { CohereEmbeddings } from "@/lib/cohere";
import OpenAI from "openai"
import { CohereClient } from 'cohere-ai';

function getRandomToken(): string {
  const tokens = process.env.GITHUB_TOKEN?.split(",").map((token) => token.trim()) || []
  if (tokens.length === 0) {
    throw new Error("No GitHub tokens found in environment variables")
  }
  const randomIndex = Math.floor(Math.random() * tokens.length)
  return tokens[randomIndex]
}

function createOpenAIClient() {
  return new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: getRandomToken()
  })
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }

  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY!,
    model: "embed-v4.0",
  });

  const reranker = new CohereClient({
    token: process.env.COHERE_API_KEY!,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "knowledge-sources",
  });

  const initialResults = await vectorStore.similaritySearch(query, 5);

  if (initialResults.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "I couldn't find any relevant information to answer your question.",
        query,
        sources: []
      });
    }

  const rerankedDocs = await reranker.v2.rerank({
    documents: initialResults.map(doc => doc.pageContent),
    query,
    topN: 5,
    model: "rerank-v3.5"
  })

  const selectedDocuments = rerankedDocs.results.map(result => {
    const originalDoc = initialResults[result.index];
    return {
      document: originalDoc,
      score: result.relevanceScore,
    };
  });

  const context = selectedDocuments
      .map((item, index) => `[${index + 1}] ${item.document.pageContent}`)
      .join('\n\n');

  const SYSTEM_PROMPT=`You are a helpful AI assistant. Answer the user's question based on the provided context. 
      
  Guidelines:
  - Use only the information from the provided context
  - If the context doesn't contain enough information, say so
  - Be specific and cite relevant parts when possible
  - Keep your answer clear and concise`;

  Context: `${context}`
  const userPrompt = `Context: ${context}

  Question: ${query}

  Please provide a comprehensive answer based on the context above.`;

  const openai = createOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 4096,
    temperature: 0.1,
    stream: false,
  })

  let parsedCompletion = completion;
  if (typeof completion === 'string') {
    parsedCompletion = JSON.parse(completion);
  }

  const answer = parsedCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

  const sources = selectedDocuments.map((item, index) => ({
    index: index + 1,
    relevanceScore: item.score,
    preview: item.document.pageContent.substring(0, 200) + "...",
    metadata: {
      sourceName: item.document.metadata.sourceName,
      sourceType: item.document.metadata.sourceType,
      chunkIndex: item.document.metadata.chunkIndex
    }
  }));

  return NextResponse.json({
    success: true,
    answer,
    query,
    sources,
    totalSources: sources.length
  });
}