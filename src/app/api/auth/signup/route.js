import { NextResponse } from "next/server";
import User from "@/infrastructure/database/models/User";
import { connectMongoDB } from "@/infrastructure/database/mongodb";
import bcrypt from "bcryptjs";

const profileImage =
  "https://upload.wikimedia.org/wikipedia/commons/5/50/User_icon-cp.svg";

export async function POST(request) {
  const { email, name, lastname, password } = await request.json();



  if (!email || !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    return NextResponse.json(
      { message: "Please add a valid email" },
      { status: 400 }
    );
  }

  if (!name || !lastname) {
    return NextResponse.json(
      { message: "Please add your name and lastname" },
      { status: 400 }
    );
  }

  if (!password || password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters long" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();

    // Verificar duplicados
    const [emailExists] = await Promise.all([
      User.findOne({ email }),
      
    ]);

    if (emailExists) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 400 }
      );
    }


    // Procesar el arte y encriptar la contraseña
    const salt = await bcrypt.genSalt(12);
    const passwordEncrypted = await bcrypt.hash(password, salt);

    // Crear el usuario
    const newUser = await User.create({
      email,
      name,
      lastname,
      password: passwordEncrypted,
      image: profileImage,
      accountStatus: "active",
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
