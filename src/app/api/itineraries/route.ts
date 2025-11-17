import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Itinerary, { ItineraryLean } from "@/models/itinerary/Itinerary";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// GET — Obtener itinerarios
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get("public") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const userId = searchParams.get("userId");

    const query: Record<string, unknown> = {};

    if (isPublic) query.isPublic = true;
    else if (userId) query.userId = userId;

    // TIPADO EXPLÍCITO → evita error de any[]
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
    console.error("GET /api/itineraries error:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener itinerarios" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// POST — Crear itinerario
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const itinerary = await Itinerary.create({
      userId: body.userId,
      searchParams: body.searchParams,
      title: body.title,
      totalPrice: body.totalPrice,
      currency: body.currency,
      isPublic: body.isPublic ?? false,
      days: body.days,
      lastViewedAt: new Date(),
    });

    const itineraryObj: ItineraryLean = itinerary.toObject();

    return NextResponse.json(
      {
        success: true,
        data: {
          itinerary: itineraryObj,
          message: "Itinerario creado exitosamente",
        },
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/itineraries error:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear itinerario" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
