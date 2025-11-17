import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Itinerary, { ItineraryLean } from "@/models/itinerary/Itinerary";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "16");
    const skip = parseInt(searchParams.get("skip") || "0");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId es requerido" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const query = { userId };

    const itineraries: ItineraryLean[] = await Itinerary.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select("-__v")
      .lean();

    const total = await Itinerary.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: {
          itineraries,
          pagination: {
            total,
            limit,
            skip,
            hasMore: skip + limit < total,
          },
        },
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/itineraries/user/[userId] error:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener itinerarios del usuario" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}