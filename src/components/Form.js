"use client";
import axios from "axios";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GoogleLogo from "@@/img/login/googleLogo.png";

const Form = () => {
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    if (pathname === "/register") {
      try {
        const res = await axios.post("/api/auth/signup", {
          email: formData.get("email")?.toLowerCase(),
          name: formData.get("name"),
          lastname: formData.get("lastname"),
          password: formData.get("password"),
        });

        setSuccess(res.data.message);

        const result = await signIn("credentials", {
          email: formData.get("email")?.toLowerCase(),
          password: formData.get("password"),
          redirect: false,
        });

        if (result?.error) {
          setErrors(result.error);
          return;
        }

        if (result?.ok) {
          // Check if 2FA verification is required
          if (result.url?.includes("2fa")) {
            router.push("/auth/verify-2fa");
            return;
          }
          router.push("/dashboard");
        }
      } catch (error) {
        setSuccess(null);
        setErrors(error.response?.data.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    }

    if (pathname === "/login") {
      try {
        const email = formData.get("email")?.toLowerCase();
        const password = formData.get("password");

        if (!email || !password) {
          setIsLoading(false);
          return setErrors("Email and password are required");
        }

        console.log("Attempting login with email:", email);
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        console.log("Sign in result:", result);

        if (result?.error) {
          setSuccess(null);
          setErrors(result.error);
          return;
        }

        if (result?.ok) {
          setSuccess("Login successful");

          // Check if 2FA verification is required
          if (result.url?.includes("2fa")) {
            router.push("/auth/verify-2fa");
            return;
          }

          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Login error:", error);
        setSuccess(null);
        setErrors("Login failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-row w-full justify-center items-center dark:bg-background">
      <div
        className={
          pathname === "/login"
            ? "flex flex-col justify-center items-center w-4/12 sm:w-11/12 rounded-lg text-black dark:text-white"
            : "flex flex-col justify-center w-6/12 sm:w-full sm:items-center"
        }>
        <div className="flex self-start items-center">
          {pathname === "/login" ? (
            <h2 className="text-5xl p-2 ml-10 font-thin">Sign In</h2>
          ) : (
            <div className="flex flex-col h-full dark:text-white">
              <h2 className="text-5xl p-2 font-thin">Sign Up</h2>
              <h3 className="text-xl sm:text-base p-2 ">
                slogan slogan slogan slogan slogan slogan slogan slogan slogan
              </h3>
            </div>
          )}
        </div>

        <div className="flex w-5/12 sm:w-11/12 sm:text-sm mt-28 sm:mt-1 ml-4 sm:ml-0 ">
          {errors && (
            <div className="bg-red-500 p-3 rounded-lg text-white w-full text-center">
              {errors}
            </div>
          )}
          {success && (
            <div className="bg-green-500 p-3 rounded-lg text-white w-full text-center">
              {success}
            </div>
          )}
        </div>

        <div
          className={
            pathname === "/login"
              ? "flex flex-col w-full items-center"
              : "flex flex-col w-11/12 h-full justify-around items-center"
          }>
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col justify-start items-center">
            {pathname === "/login" ? (
              <div className="w-8/12 sm:w-full">
                <label
                  htmlFor="email"
                  className="text-gray-700 dark:text-white text-md mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  className="border border-gray-300 rounded-lg p-3 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <label
                  htmlFor="password"
                  className="text-gray-700 dark:text-white text-md mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="border border-gray-300 rounded-lg p-3 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <>
                <div className="w-full">
                  <label
                    htmlFor="email"
                    className="text-gray-700 sm:text-sm sm:mb-0 dark:text-white text-md mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    disabled={isLoading}
                    className="border border-gray-300 rounded-lg p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  <label
                    htmlFor="name"
                    className="text-gray-700 sm:text-sm sm:mb-0 dark:text-white text-md mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    disabled={isLoading}
                    className="border border-gray-300 rounded-lg p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                  <label
                    htmlFor="lastname"
                    className="text-gray-700 dark:text-white sm:text-sm sm:mb-0 text-md mb-2">
                    Lastname
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    disabled={isLoading}
                    className="border border-gray-300 rounded-lg p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your lastname"
                  />
                  <label
                    htmlFor="password"
                    className="text-gray-700 dark:text-white sm:text-sm sm:mb-0 text-md mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="border border-gray-300 rounded-lg p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </>
            )}
            {pathname === "/login" ? (
              <button
                disabled={isLoading}
                className="w-5/12 sm:w-10/12 bg-gray-300 p-3 mt-2 rounded-xl text-xl hover:bg-blue-500 hover:text-white text-black disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            ) : (
              <button
                disabled={isLoading}
                className="w-5/12 sm:w-10/12 bg-gray-300 p-2 mt-2 rounded-xl text-xl hover:bg-blue-500 hover:text-white text-black disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            )}
          </form>

          <div className="flex flex-col w-full">
            {pathname === "/login" ? (
              <div className="w-full flex flex-col justify-center items-center">
                <p className="my-2">or</p>
                <div className="">
                  <button
                    onClick={() =>
                      signIn("google", {
                        redirect: true,
                        callbackUrl: "/dashboard",
                      })
                    }
                    disabled={isLoading}
                    className="w-full p-1 mt-2 rounded-lg text-xl bg-white border border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <div className="w-16">
                      <Image src={GoogleLogo} alt="logo_Google" />
                    </div>
                  </button>
                </div>
                <div className="mt-12 ml-3 self-start">
                  <Link
                    href="/register"
                    className="rounded-xl text-base hover:text-red-500 text-black dark:text-white">
                    Don&apos;t have an account? Sign Up
                  </Link>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col justify-center sm:p-0 items-start dark:text-white">
                <div className="w-full flex flex-col justify-center sm:p-0 items-center">
                  <p className="my-2 sm:hidden">or</p>
                  <h2 className="text-2xl sm:text-lg sm:p-0 p-2">
                    Sign up with google
                  </h2>
                  <div className="">
                    <button
                      onClick={() =>
                        signIn("google", {
                          redirect: true,
                          callbackUrl: "/dashboard",
                        })
                      }
                      disabled={isLoading}
                      className="w-full p-1 mt-2 rounded-lg text-xl bg-white border border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                      <div className="w-16 sm:w-14">
                        <Image src={GoogleLogo} alt="logo_Google" />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="mt-2 ml-3 self-end hover:scale-105">
                  <Link
                    href="/login"
                    className="rounded-md text-base sm:text-xs hover:text-blue-500 bg-white p-2 text-black">
                    Already have an account? Log in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
