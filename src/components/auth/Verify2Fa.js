import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

import { Button, Card, Input } from "@nextui-org/react";

const Verify2Fa = () => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingBackup, setIsUsingBackup] = useState(false);
  const { data: session, status } = useSession();

  // Single verification handler
  const handleVerify = async (e) => {
    e.preventDefault();
    if (isLoading || !session?.user?.email) return;

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting verification with:", {
        email: session.user.email,
        token,
        isUsingBackup,
      });

      // Sign in with credentials
      const result = await signIn("credentials", {
        email: session.user.email,
        twoFactorToken: token,
        isBackupCode: isUsingBackup.toString(), // Convert boolean to string
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        setError("Invalid verification code. Please try again.");
        return;
      }

      if (result?.ok) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with validation
  const handleTokenChange = (e) => {
    const value = e.target.value;
    if (isUsingBackup) {
      // For backup codes: allow alphanumeric, convert to uppercase, limit to 8
      setToken(
        value
          .replace(/[^A-Za-z0-9]/g, "")
          .toUpperCase()
          .slice(0, 8)
      );
    } else {
      // For 2FA codes: numbers only, limit to 6
      setToken(value.replace(/\D/g, "").slice(0, 6));
    }
  };

  // Toggle between 2FA and backup code
  const toggleVerificationMethod = () => {
    setIsUsingBackup(!isUsingBackup);
    setToken("");
    setError("");
  };

  // Early returns for various states
  if (status === "unauthenticated") {
    window.location.href = "/login";
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === "authenticated" && !session?.requiresTwoFactor) {
    window.location.href = "/dashboard";
    return null;
  }

  const toggleBackupCode = () => {
    setIsUsingBackup(!isUsingBackup);
    setToken("");
    setError("");
  };
  return (
    <div className="flex items-center justify-center mt-28">
      <Card className="max-w-md w-full space-y-8 p-8 bg-gray-100 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isUsingBackup
              ? "Enter your backup code"
              : "Enter the verification code from your authenticator app"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <Input
              type={isUsingBackup ? "text" : "text"}
              inputMode={isUsingBackup ? "text" : "numeric"}
              value={token}
              onChange={handleTokenChange}
              placeholder={
                isUsingBackup ? "Enter backup code" : "Enter 6-digit code"
              }
              autoComplete="one-time-code"
              maxLength={isUsingBackup ? 8 : 6}
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={
              isLoading ||
              !token ||
              (isUsingBackup ? token.length !== 8 : token.length !== 6)
            }
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></div>
                Verifying...
              </div>
            ) : (
              "Verify"
            )}
          </Button>

          <button
            type="button"
            onClick={toggleVerificationMethod}
            disabled={isLoading}
            className="w-full text-sm text-blue-600 hover:text-blue-500 focus:outline-none disabled:text-blue-300 disabled:cursor-not-allowed">
            {isUsingBackup
              ? "Use authenticator code instead"
              : "Use backup code instead"}
          </button>
        </form>

        {/* Info text */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          {isUsingBackup ? (
            <p>Backup codes are 8 characters long and can only be used once.</p>
          ) : (
            <p>Enter the 6-digit code from your authenticator app.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Verify2Fa;
