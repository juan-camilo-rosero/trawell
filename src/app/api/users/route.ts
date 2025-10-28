import { NextResponse } from "next/server"

export const GET = () => {
    return new NextResponse("Hola, soy una ruta de la API :3")
}