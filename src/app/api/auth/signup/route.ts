import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, tattooists } from '@/lib/db/schema';
import { signupSchema } from '@/lib/auth/schemas';
import { setAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }
    
    const { firstName, lastName, email, password, role } = result.data;
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await hash(password, saltRounds);
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email,
        passwordHash,
        role,
      })
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
      });

    // If user is signing up as a tattooist, create tattooist profile
    if (role === 'tattooist') {
      await db
        .insert(tattooists)
        .values({
          userId: newUser.id,
          approved: false, // Default to unapproved
        });
    }

    // Create session
    await setAuthCookie({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
    
    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}