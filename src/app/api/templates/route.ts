import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle GET requests for /api/templates
export async function GET() {
  try {
    const platterTemplates = await prisma.platterTemplate.findMany({
      include: {
        department: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Return the templates as a JSON response
    return NextResponse.json(platterTemplates, { status: 200 });
  } catch (error) {
    console.error("Error fetching platter templates:", error);
    // Return an error response
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// You can add other handlers for different HTTP methods in the same file:
// export async function POST(request: Request) { ... }
// export async function PUT(request: Request) { ... }
// export async function DELETE(request: Request) { ... }
