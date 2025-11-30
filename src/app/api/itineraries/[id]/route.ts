import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Itinerary, { ItineraryLean } from "@/models/itinerary/Itinerary";
import mongoose from "mongoose";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const itinerary: ItineraryLean | null = await Itinerary.findById(id)
      .select("-__v")
      .lean();

    if (!itinerary) {
      return NextResponse.json(
        { success: false, error: "Itinerario no encontrado" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    await Itinerary.findByIdAndUpdate(id, { lastViewedAt: new Date() });

    return NextResponse.json(
      { success: true, data: { itinerary } },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/itineraries/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener el itinerario" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body: Partial<ItineraryLean> = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updated: ItineraryLean | null = await Itinerary.findByIdAndUpdate(
      id,
      { ...body, lastViewedAt: new Date() },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: { itinerary: updated, message: "Itinerario actualizado" },
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("PUT /api/itineraries/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await Itinerary.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, data: { message: "Itinerario eliminado" } },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("DELETE /api/itineraries/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}