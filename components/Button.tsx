import {
  Text,
  TextStyle,
  ViewStyle,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { PropsWithChildren } from "react";

type ButtonVariant = "filled" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-14 px-5",
};
const textSizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const getVariantStyle = (variant: ButtonVariant) => {
  const baseStyle = "flex-row items-center justify-center rounded-xl ";

  switch (variant) {
    case "filled":
      return baseStyle + "dark:bg-zinc-50 bg-zinc-900";

    case "outline":
      return (
        baseStyle + "bg-transparent border dark:border-zinc-700 border-zinc-300"
      );
    case "ghost":
      return baseStyle + "bg-transparent";
  }
};

const getTextColor = (variant: ButtonVariant, disabled: boolean) => {
  if (disabled) {
    return "dark:color-zinc-500 color-zinc-400";
  }

  switch (variant) {
    case "filled":
      return "dark:color-zinc-900 color-zinc-50";
    case "outline":
    case "ghost":
      return "color-blue-500";
  }
};

const Button = ({
  onPress,
  variant = "filled",
  size = "md",
  disabled = false,
  loading = false,
  children,
  style,
  textStyle,
}: PropsWithChildren<ButtonProps>) => {
  const buttonSize = buttonSizeStyles[size];
  const textSize = textSizeStyles[size];
  const color = getTextColor(variant, disabled);

  return (
    <Pressable
      onPressIn={onPress}
      disabled={disabled || loading}
      className={`${getVariantStyle(variant)} ${buttonSize}  `}
      style={[style, { opacity: disabled ? 0.7 : 1 }]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text
          style={[textStyle]}
          className={`mb-0 font-bold text-center ${color} ${textSize}`}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;
