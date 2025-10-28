import { NextResponse } from "next/server"

export const GET = () => {
    return new NextResponse("Obtener itinerarios")
}

export const POST = () => {
    return new NextResponse("Crear itinerario")
}