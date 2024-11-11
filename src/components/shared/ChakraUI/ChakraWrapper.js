// components/shared/ChakraUI/ChakraWrapper.js
import React from 'react'
import { ChakraProvider } from "@chakra-ui/react";

const ChakraWrapper = ({ children }) => {
    return (
      <div className="chakra-scope">
        <ChakraProvider resetCSS={false}>{children}</ChakraProvider>
      </div>
    );
  };

export default ChakraWrapper