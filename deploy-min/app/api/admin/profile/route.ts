import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user profile data
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        doctorProfile: {
          select: { profileImage: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get profileImage from role-specific profile
    let profileImage: string | null = null;
    if (profile.doctorProfile?.profileImage) {
      profileImage = profile.doctorProfile.profileImage;
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        profileImage,
        role: profile.role,
        createdAt: profile.createdAt.toISOString(),
        lastLogin: profile.lastLogin?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phoneNumber, profileImage } = body;

    // Update user fields
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        doctorProfile: {
          select: { profileImage: true },
        },
      },
    });

    // Update profileImage in DoctorProfile if provided and user is a doctor
    let finalProfileImage: string | null =
      updated.doctorProfile?.profileImage || null;
    if (profileImage && user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctorProfile.update({
        where: { userId: user.id },
        data: { profileImage },
        select: { profileImage: true },
      });
      finalProfileImage = doctorProfile.profileImage;
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phoneNumber: updated.phoneNumber,
        profileImage: finalProfileImage,
        role: updated.role,
        createdAt: updated.createdAt.toISOString(),
        lastLogin: updated.lastLogin?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
