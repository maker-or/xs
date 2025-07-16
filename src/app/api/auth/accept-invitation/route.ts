// app/api/accept-invitation/route.ts

import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { invitationId } = await req.json();

    if (!invitationId) {
      return NextResponse.json(
        { error: "Missing invitationId" },
        { status: 400 },
      );
    }

    const result = await clerkClient.organizations.acceptOrganizationInvitation(
      {
        invitationId,
      },
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("❌ Error accepting invitation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
