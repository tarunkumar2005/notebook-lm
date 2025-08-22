import { NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

// Define interfaces for your data structure
interface QdrantPayload {
  content?: string;
  metadata: {
    sourceId: string;
    sourceType?: string;
    sourceName?: string;
    chunkIndex?: number;
    chunkCount?: number;
    createdAt?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface QdrantPoint {
  id: string;
  payload: QdrantPayload;
  score?: number;
}

interface ScrollResult {
  points: QdrantPoint[];
  next_page_offset?: string;
}

export async function DELETE(req: NextRequest) {
  try {
    const { sourceId } = await req.json();

    if (!sourceId) {
      return NextResponse.json({ error: "Source ID is required" }, { status: 400 });
    }

    console.log(`Deindexing source: ${sourceId}`);

    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
    });

    let allPoints: QdrantPoint[] = [];
    let offset = null;
    let hasMore = true;

    // Get ALL points with pagination
    while (hasMore) {
      const scrollResult = await qdrantClient.scroll("knowledge-sources", {
        limit: 1000,
        offset: offset,
        with_payload: true,
        with_vector: false
      }) as ScrollResult;

      allPoints.push(...scrollResult.points);
      
      if (scrollResult.next_page_offset) {
        offset = scrollResult.next_page_offset;
      } else {
        hasMore = false;
      }
    }

    console.log(`Total points in collection: ${allPoints.length}`);

    // Now TypeScript knows about the structure
    const uniqueSourceIds = [...new Set(allPoints.map(p => p.payload.metadata.sourceId).filter(Boolean))];
    console.log("All sourceIds in database:", uniqueSourceIds);
    console.log(`Looking for sourceId: "${sourceId}"`);

    const pointsToDelete = allPoints.filter(point => {
      const pointSourceId = point.payload.metadata.sourceId;
      console.log(`Comparing "${pointSourceId}" === "${sourceId}":`, pointSourceId === sourceId);
      return pointSourceId === sourceId;
    });

    console.log(`Found ${pointsToDelete.length} points to delete for source ${sourceId}`);

    if (pointsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        sourceId,
        message: "No points found for this source",
        deletedCount: 0,
        availableSourceIds: uniqueSourceIds,
      });
    }

    // Delete by point IDs
    const pointIds = pointsToDelete.map(point => point.id);
    console.log(`Deleting points with IDs:`, pointIds);

    const deleteResult = await qdrantClient.delete("knowledge-sources", {
      points: pointIds
    });

    console.log(`Successfully deleted ${pointIds.length} points`);

    return NextResponse.json({
      success: true,
      sourceId,
      deletedCount: pointIds.length,
      pointIds: pointIds,
      operation_id: deleteResult.operation_id
    });

  } catch (error) {
    console.error("Error deindexing source:", error);
    return NextResponse.json({
      error: "Failed to deindex source",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}