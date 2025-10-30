import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db/db";
import User from "@/models/user/User";
import { ILocation } from "@/models/types/index";

interface CreateUserBody {
  firebaseUid: string;
  email: string;
  name: string;
  originCity?: ILocation;
}

interface UpdateUserBody {
  firebaseUid: string;
  updates: {
    email?: string;
    name?: string;
    originCity?: ILocation | null;
  };
}

function validateCreateUserBody(body: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!body.firebaseUid || typeof body.firebaseUid !== "string") {
    errors.push("firebaseUid is required and must be a string");
  }

  if (
    !body.email ||
    typeof body.email !== "string" ||
    !isValidEmail(body.email)
  ) {
    errors.push("email is required and must be a valid email address");
  }

  if (
    !body.name ||
    typeof body.name !== "string" ||
    body.name.trim().length === 0
  ) {
    errors.push("name is required and must be a non-empty string");
  }

  if (body.originCity !== undefined && body.originCity !== null) {
    if (typeof body.originCity !== "object") {
      errors.push("originCity must be an object");
    } else {
      const originCity = body.originCity as Record<string, unknown>;
      
      if (!originCity.name || typeof originCity.name !== "string") {
        errors.push("originCity.name is required and must be a string");
      }

      if (
        !originCity.coordinates ||
        typeof originCity.coordinates !== "object"
      ) {
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
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get("firebaseUid");
    const email = searchParams.get("email");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, string> = {};
    if (firebaseUid) query.firebaseUid = firebaseUid;
    if (email) query.email = email.toLowerCase();

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-__v")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json() as Record<string, unknown>;

    const validation = validateCreateUserBody(body);
    if (!validation.valid) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    // Después de la validación, sabemos que body tiene la estructura correcta
    const typedBody = body as unknown as CreateUserBody;

    const existingUser = await User.findOne({
      $or: [
        { firebaseUid: typedBody.firebaseUid },
        { email: typedBody.email.toLowerCase() },
      ],
    });

    if (existingUser) {
      if (existingUser.firebaseUid === typedBody.firebaseUid) {
        return errorResponse("User with this firebaseUid already exists", 409);
      }
      if (existingUser.email === typedBody.email.toLowerCase()) {
        return errorResponse("User with this email already exists", 409);
      }
    }

    const userData: Record<string, unknown> = {
      firebaseUid: typedBody.firebaseUid,
      email: typedBody.email.toLowerCase(),
      name: typedBody.name.trim(),
    };

    if (typedBody.originCity) {
      userData.originCity = typedBody.originCity;
    }

    const user = await User.create(userData);

    const userObject = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __v, ...userWithoutVersion } = userObject;

    return successResponse(
      {
        user: userWithoutVersion,
        message: "User created successfully",
      },
      201
    );
  } catch (error) {
    console.error("POST /api/users error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return errorResponse("Validation failed", 400, [error.message]);
    }

    if (error instanceof Error && "code" in error && error.code === 11000) {
      return errorResponse(
        "User with this firebaseUid or email already exists",
        409
      );
    }

    return errorResponse("Failed to create user", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = (await request.json()) as UpdateUserBody;
    const { firebaseUid, updates } = body;

    if (!firebaseUid || typeof firebaseUid !== "string") {
      return errorResponse("firebaseUid is required in request body");
    }

    if (!updates || typeof updates !== "object") {
      return errorResponse("updates object is required in request body");
    }

    if ("firebaseUid" in updates) {
      return errorResponse("Cannot update firebaseUid");
    }

    if (
      updates.email &&
      (!isValidEmail(updates.email) || typeof updates.email !== "string")
    ) {
      return errorResponse("Invalid email format");
    }

    if (
      updates.name &&
      (typeof updates.name !== "string" || updates.name.trim().length === 0)
    ) {
      return errorResponse("name must be a non-empty string");
    }

    if (updates.originCity) {
      const validation = validateCreateUserBody({
        firebaseUid: "dummy",
        email: "dummy@test.com",
        name: "dummy",
        originCity: updates.originCity,
      });

      const originCityErrors = validation.errors.filter((err) =>
        err.includes("originCity")
      );
      if (originCityErrors.length > 0) {
        return errorResponse("Invalid originCity", 400, originCityErrors);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (updates.email) updateData.email = updates.email.toLowerCase();
    if (updates.name) updateData.name = updates.name.trim();
    if (updates.originCity !== undefined)
      updateData.originCity = updates.originCity;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({
      user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/users error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return errorResponse("Validation failed", 400, [error.message]);
    }

    if (error instanceof Error && "code" in error && error.code === 11000) {
      return errorResponse("Email already exists", 409);
    }

    return errorResponse("Failed to update user", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get("firebaseUid");

    if (!firebaseUid) {
      return errorResponse("firebaseUid query parameter is required");
    }

    const user = await User.findOneAndDelete({ firebaseUid });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({
      message: "User deleted successfully",
      deletedUser: {
        firebaseUid: user.firebaseUid,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return errorResponse("Failed to delete user", 500);
  }
}