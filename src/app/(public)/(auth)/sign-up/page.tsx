"use client";
import Header from "@/components/layout/header/Header";
import CustomInput from "@/components/ui/custom_input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { continueWithGoogle, signUpWithEmail } from "@/lib/auth_functions";

// Constants
const ERROR_MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Login popup closed",
  "auth/cancelled-popup-request": "Login cancelled",
  "auth/popup-blocked": "Popup blocked by browser",
  "auth/network-request-failed": "Connection error. Please check your internet",
  "auth/internal-error": "Internal error. Please try again",
  "auth/unauthorized-domain": "Unauthorized domain",
  "auth/invalid-email": "Invalid email",
  "auth/email-already-in-use": "An account already exists with this email",
  "auth/weak-password": "Password must be at least 6 characters long",
  "auth/operation-not-allowed": "Operation not allowed",
  "auth/missing-credentials": "Email and password are required",
  "auth/too-many-requests": "Too many attempts. Please try again later",
  default: "Error creating account",
};

function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showVerificationMessage, setShowVerificationMessage] =
    useState<boolean>(false);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const errorCode = error.message.match(/auth\/[\w-]+/)?.[0];
      return errorCode && ERROR_MESSAGES[errorCode]
        ? ERROR_MESSAGES[errorCode]
        : ERROR_MESSAGES.default;
    }
    return ERROR_MESSAGES.default;
  };

  const validateForm = (): boolean => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      await continueWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (): Promise<void> => {
    setError("");
    setShowVerificationMessage(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpWithEmail(email, password);

      // Always show verification message since needsVerification is always true
      if (result.needsVerification) {
        setShowVerificationMessage(true);
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !isLoading) {
      handleEmailSignUp();
    }
  };

  if (showVerificationMessage) {
    return (
      <>
        <div className="md:hidden">
          <Header />
        </div>
        <div className="bg-secondary-200 md:bg-secondary-100 min-h-screen flex">
          <div className="w-full hidden lg:flex items-center justify-center bg-secondary-200">
            <img
              src="static/trawell_ilustracion2.png"
              alt="Create account illustration"
              className="w-40 h-auto"
            />
          </div>
          <div className="w-screen custom-ph flex items-center justify-center flex-col pt-16 lg:pt-0 min-h-screen md:max-w-xl md:mx-auto lg:w-1/2 bg-secondary-100">
            <div className="w-full max-w-md">
              <div className="bg-secondary-100 rounded-lg p-6">
                <div className="text-center mb-4">
                  <img
                    src="static/logo.png"
                    alt="Trawell Logo"
                    className="h-16 mb-8 w-auto mx-auto"
                  />
                  <h2 className="text-2xl font-semibold text-muted-900 mb-2">
                    Account created!
                  </h2>
                  <p className="text-muted-500 mb-4">
                    We have sent a verification email to:
                  </p>
                  <p className="font-semibold text-muted-900 mb-4 text-lg">
                    {email}
                  </p>
                  <p className="text-sm text-muted-500">
                    Please check your inbox and click the verification link
                    to activate your account.{" "}
                    <span className="text-muted-900 font-semibold">
                      Check your spam folder just in case! 
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/login">
                  <Button className="primary-btn text-xl !h-auto !py-3 md:text-base w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="md:hidden">
        <Header />
      </div>
      <div className="bg-secondary-200 md:bg-secondary-100 min-h-screen flex">
        <div className="w-full hidden lg:flex items-center justify-center bg-secondary-200">
          <img
              src="static/trawell_ilustracion4.png"
              alt="Create account illustration"
              className="h-[100vh]"
            />
        </div>
        <div className="w-screen custom-ph flex items-center justify-center flex-col pt-16 lg:pt-0 min-h-screen md:max-w-xl md:mx-auto lg:w-1/2 bg-secondary-100">
          <div className="w-full">
            <Link href="/" className="flex justify-center">
              <img
                src="static/logo.png"
                alt="Trawell Logo"
                className="h-16 w-auto hidden md:flex cursor-pointer"
              />
            </Link>
            <h1 className="text-muted-900 font-semibold text-3xl text-center lg:mt-4">
              Create your account
            </h1>
            <h2 className="text-muted-500 mt-4 font-medium text-base text-center">
              Complete your details to start
            </h2>
          </div>
          <div className="w-full flex flex-col gap-6 mt-12 lg:mt-4">
            <CustomInput
              type="email"
              placeholder="Email"
              value={email}
              setValue={setEmail}
              onKeyPress={handleKeyPress}
            />
            <CustomInput
              type="password"
              placeholder="Password"
              value={password}
              setValue={setPassword}
              onKeyPress={handleKeyPress}
            />
            <CustomInput
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              setValue={setConfirmPassword}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="w-full flex flex-col gap-4 mt-12 lg:mt-8">
            <Button
              className="primary-btn text-xl !h-auto !py-3 md:text-base"
              onClick={handleEmailSignUp}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <Button
              className="third-btn text-xl !h-auto !py-3 md:text-base gap-4 flex items-center justify-center"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <FcGoogle size={24} />
              Continue with Google
            </Button>
          </div>

          {error && (
            <p className="text-primary text-sm mt-4 text-center">{error}</p>
          )}

          <Link
            href="/login"
            className="underline text-muted-500 mt-12 md:mt-8"
          >
            Already have an account?
          </Link>
        </div>
      </div>
    </>
  );
}

export default Page;
