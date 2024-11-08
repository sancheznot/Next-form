// this component is used to display the navbar when the user is logged in
// ./src/components/MainPage/Nav/NavClient.js
"use client";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@nextui-org/react";
import { AcmeLogo } from "./AcmeLogo";
import { ThemeSwitcher } from "@/components/NextTheme/ThemeSwitcher";
import { SignOut } from "./SignOut";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function NavClient({ initialSession }) {
  const { isAuthenticated, status } = useAuth(initialSession);

  return (
    <Navbar isBordered>
      <div className="flex flex-row justify-around lg:justify-between items-center w-full">
        <NavbarBrand>
          <AcmeLogo />
          <Link className="font-bold text-inherit" href="/">
            YourLogoAndName
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-2">
          {status !== "loading" && (
            <>
              {!isAuthenticated ? (
                <>
                  <NavbarItem className="flex">
                    <Link href="/login" className="sm:text-sm">
                      Login
                    </Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Button
                      as={Link}
                      color="primary"
                      href="/register"
                      variant="flat"
                      className="sm:text-sm">
                      Sign Up
                    </Button>
                  </NavbarItem>
                </>
              ) : (
                <NavbarItem>
                  <SignOut />
                </NavbarItem>
              )}
            </>
          )}

          <NavbarItem>
            <ThemeSwitcher />
          </NavbarItem>
        </NavbarContent>
      </div>
    </Navbar>
  );
}
