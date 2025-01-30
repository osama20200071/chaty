import { Text, TextProps } from "react-native";
import React from "react";

const ThemedText = ({ children, className, ...rest }: TextProps) => {
  return (
    <Text className={`dark:text-white text-black ${className}`} {...rest}>
      {children}
    </Text>
  );
};

export default ThemedText;
