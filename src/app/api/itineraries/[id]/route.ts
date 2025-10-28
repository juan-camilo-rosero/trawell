import { NextResponse } from "next/server"

export const GET = () => {
    return new NextResponse("Obtener itinerario por ID")
}

export const PUT = () => {
    return new NextResponse("Modificar itinerario")
}

export const DELETE = () => {
    return new NextResponse("Eliminar itinerario")
}