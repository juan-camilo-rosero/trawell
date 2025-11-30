import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Itinerary, { ItineraryLean } from "@/models/itinerary/Itinerary";
import mongoose from "mongoose";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Helper para convertir strings a ObjectId recursivamente
function convertIdsToObjectId(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => convertIdsToObjectId(item));
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_id' && typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
      result[key] = new mongoose.Types.ObjectId(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertIdsToObjectId(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    console.log("📥 Recibiendo datos para crear itinerario...");
    console.log("  - Usuario:", body.userId);
    console.log("  - Título:", body.title);
    console.log("  - Días:", body.days?.length || 0);

    // Convertir todos los _id de string a ObjectId
    const processedDays = body.days ? convertIdsToObjectId(body.days) : [];

    console.log("🔄 IDs procesados y convertidos a ObjectId");

    const itinerary = await Itinerary.create({
      userId: body.userId,
      searchParams: body.searchParams,
      title: body.title,
      totalPrice: body.totalPrice,
      currency: body.currency,
      isPublic: body.isPublic ?? false,
      days: processedDays,
      lastViewedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Itinerario creado con ID:", itinerary._id);

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
    console.error("❌ POST /api/itineraries error:", error);
    
    // Mostrar más detalles del error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Error al crear itinerario",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}