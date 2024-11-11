"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { WrapperMotion } from "@/components/shared/FrameMotion/WrapperMotion";

const Provider = ({ children }) => {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <WrapperMotion>{children}</WrapperMotion>
        </NextThemesProvider>
      </NextUIProvider>
    </SessionProvider>
  );
};

export default Provider;
