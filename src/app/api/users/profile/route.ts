import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/db';
import User from '@/models/user/User';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, name, profileImage } = body;

    // Validaciones básicas
    if (!firebaseUid) {
      return NextResponse.json(
        { message: 'firebaseUid es requerido' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Preparar los datos a actualizar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name: name.trim(),
    };

    if (profileImage !== undefined) {
      updateData.profileImage = profileImage || null;
    }

    // Actualizar el usuario en la base de datos
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(updatedUser as any, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'JSON inválido en el cuerpo de la solicitud' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error al actualizar el perfil del usuario' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const firebaseUid = request.nextUrl.searchParams.get('firebaseUid');

    if (!firebaseUid) {
      return NextResponse.json(
        { message: 'firebaseUid es requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);

    return NextResponse.json(
      { message: 'Error al obtener el perfil del usuario' },
      { status: 500 }
    );
  }
}
