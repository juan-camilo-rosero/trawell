import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/db';
import User from '@/models/user/User';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid } = body;

    if (!firebaseUid) {
      return NextResponse.json(
        { message: 'firebaseUid es requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Eliminar el usuario de la base de datos
    const deletedUser = await User.findOneAndDelete({ firebaseUid });

    if (!deletedUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Cuenta eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user account:', error);

    return NextResponse.json(
      { message: 'Error al eliminar la cuenta del usuario' },
      { status: 500 }
    );
  }
}
