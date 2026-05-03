import { getCurrentUser } from "@/lib/actions/auth.actions";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json({
    user: user
      ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      : null,
  });
}
