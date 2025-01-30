import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { useColorScheme, vars } from "nativewind";

export const Theme = ({ children }: PropsWithChildren) => {
  const { colorScheme } = useColorScheme();
  return (
    <View style={themes[colorScheme ?? "light"]} className="flex-1 bg-primary">
      {children}
    </View>
  );
};

export const themes = {
  light: vars({
    "--color-primary-default": "#fff",
    "--color-primary-light": "#5bd1e7",
    "--color-secondary-default": "#9b6cca",
    "--color-secondary-light": "#dfbeff",
    "--color-tertiary-default": "#ff88bd",
    "--color-tertiary-light": "#ffc2e6",
  }),
  dark: vars({
    "--color-primary-default": "#000",
    "--color-primary-light": "#5bd1e7",
    "--color-secondary-default": "#9b6cca",
    "--color-secondary-light": "#dfbeff",
    "--color-tertiary-default": "#ff88bd",
    "--color-tertiary-light": "#ffc2e6",
  }),
};
