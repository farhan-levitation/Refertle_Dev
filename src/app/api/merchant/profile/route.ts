// In /src/app/api/merchant/profile/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        shop_id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.shop_id) {
      return NextResponse.json(
        { error: "No shop associated with this user" },
        { status: 400 }
      );
    }

    // Find merchant by shop_id
    const merchant = await prisma.merchants.findUnique({
      where: { shop_id: user.shop_id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        shop_domain: true,
        shop_id: true,
      },
    });

    if (!merchant) {
      console.log("No merchant found for shop_id:", user.shop_id);
      return NextResponse.json(
        {
          error: "Merchant not found",
          userEmail: user.email,
          shopId: user.shop_id,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...merchant,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error("Merchant profile API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchant profile" },
      { status: 500 }
    );
  }
}
