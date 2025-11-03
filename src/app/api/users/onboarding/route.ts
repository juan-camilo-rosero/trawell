import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db/db";
import User from "@/models/user/User";
import { ILocation } from "@/models/types/index";

interface CompleteOnboardingBody {
  firebaseUid: string;
  name: string;
  originCity: ILocation;
}

function validateOnboardingBody(body: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!body.firebaseUid || typeof body.firebaseUid !== "string") {
    errors.push("firebaseUid is required and must be a string");
  }

  if (
    !body.name ||
    typeof body.name !== "string" ||
    body.name.trim().length === 0
  ) {
    errors.push("name is required and must be a non-empty string");
  }

  if (!body.originCity || typeof body.originCity !== "object") {
    errors.push("originCity is required and must be an object");
  } else {
    const originCity = body.originCity as Record<string, unknown>;

    if (!originCity.name || typeof originCity.name !== "string") {
      errors.push("originCity.name is required and must be a string");
    }

    if (!originCity.coordinates || typeof originCity.coordinates !== "object") {
      errors.push("originCity.coordinates is required and must be an object");
    } else {
      const coordinates = originCity.coordinates as Record<string, unknown>;

      if (
        typeof coordinates.lat !== "number" ||
        coordinates.lat < -90 ||
        coordinates.lat > 90
      ) {
        errors.push(
          "originCity.coordinates.lat must be a number between -90 and 90"
        );
      }

      if (
        typeof coordinates.lng !== "number" ||
        coordinates.lng < -180 ||
        coordinates.lng > 180
      ) {
        errors.push(
          "originCity.coordinates.lng must be a number between -180 and 180"
        );
      }
    }

    if (
      originCity.placeId !== undefined &&
      originCity.placeId !== null &&
      typeof originCity.placeId !== "string"
    ) {
      errors.push("originCity.placeId must be a string if provided");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function errorResponse(
  message: string,
  status: number = 400,
  errors?: string[]
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(errors && { errors }),
    },
    { status }
  );
}

function successResponse(data: Record<string, unknown>, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = (await request.json()) as Record<string, unknown>;

    const validation = validateOnboardingBody(body);
    if (!validation.valid) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const typedBody = body as unknown as CompleteOnboardingBody;

    const user = await User.findOne({ firebaseUid: typedBody.firebaseUid });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.hasCompletedOnboarding) {
      return errorResponse("User has already completed onboarding", 409);
    }

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: typedBody.firebaseUid },
      {
        $set: {
          name: typedBody.name.trim(),
          originCity: typedBody.originCity,
          hasCompletedOnboarding: true,
        },
      },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedUser) {
      return errorResponse("Failed to complete onboarding", 500);
    }

    return successResponse({
      user: updatedUser,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("POST /api/users/onboarding error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return errorResponse("Validation failed", 400, [error.message]);
    }

    return errorResponse("Failed to complete onboarding", 500);
  }
}