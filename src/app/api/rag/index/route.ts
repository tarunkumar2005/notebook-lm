import { NextRequest, NextResponse } from "next/server";
import { Source } from "@/store/useSourcesStore";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf"
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CohereEmbeddings } from "@/lib/cohere";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import axios from "axios";

export async function POST(req: NextRequest) {
  const source: Source = await req.json();

  if (!source) {
    return NextResponse.json({ error: "Invalid source data" }, { status: 400 });
  }

  if (source.type === "pdf") {
    const response = await axios.get(source.content, { responseType: 'arraybuffer' });

    if (response.status !== 200) {
      return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
    }

    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

    const loader = new WebPDFLoader(pdfBlob);
    const documents = await loader.load();

    const textData = documents.map(doc => doc.pageContent).join("\n");

    const result = await processData(textData);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
    }
  }

  if (source.type === "text") {
    const result = await processData(source.content);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to process text" }, { status: 500 });
    }
  }

  if (source.type === "url") { 
    const compiledConvert = compile({ 
      wordwrap: 130,
      selectors: [
        { selector: 'nav', format: 'skip' },
        { selector: 'footer', format: 'skip' },
        { selector: '.sidebar', format: 'skip' },
        { selector: 'header', format: 'skip' },
      ]
    });

    const loader = new RecursiveUrlLoader(source.content, {
      extractor: compiledConvert,
      maxDepth: 3,
      excludeDirs: ['/admin', '/login', '/api'],
      timeout: 10000,
      preventOutside: true,
    })

    const documents = await loader.load();

    const textData = documents.map(doc => doc.pageContent).join("\n");

    const result = await processData(textData);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to process URL" }, { status: 500 });
    }
  }

  async function processData(textData: string) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitText(textData);

    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY!,
      model: "embed-v4.0",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "knowledge-sources",
    });

    const documents = chunks.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: {
        sourceId: source.id,
        sourceType: source.type,
        sourceName: source.name,
        chunkIndex: index,
        chunkCount: chunks.length,
        createdAt: new Date().toISOString(),
      }
    }));

    await vectorStore.addDocuments(documents);

    console.log(`Successfully added ${documents.length} vectors to Qdrant`);

    return {
      success: true,
      chunkCount: chunks.length,
      vectorIds: [],
      sourceId: source.id,
    };
  }

  return NextResponse.json({ error: "Invalid source type" }, { status: 400 });
}