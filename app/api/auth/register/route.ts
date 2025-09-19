import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Un utilisateur avec cet email existe déjà.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Utilisateur créé avec succès.' }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: 'Un utilisateur avec cet email existe déjà.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
