"use client";
import { useState } from "react";
import axios from "axios";
import { Image } from "@nextui-org/react";

export default function Setup2FA() {
  // State management
  const [step, setStep] = useState("initial");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Initial setup - Get QR code and secret
  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/auth/2fa/setup");
      // console.log("Setup response:", data); // Debug log

      if (data.error) {
        setError(data.error);
        return;
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("verify");
    } catch (error) {
      console.error("Setup error:", error);
      setError("Failed to setup 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Enable 2FA with verification
  const handleEnable = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // console.log("Enabling 2FA with token:", token); // Debug log

      // Call the enable endpoint, not verify
      const { data } = await axios.post(
        "/api/auth/2fa/enable",
        {
          token: token,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("Enable response:", data); // Debug log

      if (data.success) {
        setStep("complete");
      } else {
        setError(data.error || "Failed to enable 2FA");
      }
    } catch (error) {
      console.error("Enable error full:", error);
      if (error.response) {
        // console.log("Error response:", error.response.data); // Debug log
        setError(error.response.data.error || "Failed to enable 2FA");
      } else {
        setError("An error occurred while enabling 2FA");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {step === "initial" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Enable Two-Factor Authentication
          </h2>
          <p className="text-gray-600">
            Add an extra layer of security to your account by enabling 2FA
          </p>
          <button
            onClick={handleSetup}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
            {isLoading ? "Setting up..." : "Setup 2FA"}
          </button>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Scan QR Code</h2>
            <p className="text-gray-600 mt-2">
              Scan this QR code with your authenticator app
            </p>
          </div>

          {qrCode && (
            <div className="w-64 h-64 relative mx-auto border p-2">
              <Image src={qrCode} alt="2FA QR Code" className="w-full h-full" />
            </div>
          )}

          <form onSubmit={handleEnable} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verify code from authenticator:
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 block w-full border rounded-md px-3 py-2"
                placeholder="000000"
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || token.length !== 6}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
              {isLoading ? "Enabling 2FA..." : "Enable 2FA"}
            </button>
          </form>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-900">Backup Secret:</p>
            <p className="mt-1 font-mono text-sm break-all bg-white p-2 rounded">
              {secret}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Save this secret in a secure place. You&apos;ll need it if you
              lose access to your authenticator app.
            </p>
          </div>
        </div>
      )}

      {step === "complete" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600">2FA Enabled!</h2>
          <p className="text-gray-600">
            Your account is now protected with two-factor authentication.
          </p>
        </div>
      )}
    </div>
  );
}
