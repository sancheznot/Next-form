"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { WrapperMotion } from "./FrameMotion/WrapperMotion";
import { ChakraProvider } from "@chakra-ui/react";

const Provider = ({ children }) => {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <ChakraProvider>
            <WrapperMotion>{children}</WrapperMotion>
          </ChakraProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </SessionProvider>
  );
};

export default Provider;
