import React from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import ThemedText from "./ThemedText";

type InputVariant = "default" | "filled" | "outlined" | "ghost";
type InputSize = "sm" | "md" | "lg";

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 text-base px-2 py-2", // 16px font, ~8px padding
  md: "h-12 text-base px-4 py-3", // 50px height, 16px font, 14px padding
  lg: "h-14 text-2xl px-4 py-4", // 55px height, 32px font, 16px padding
};

const getVariantStyle = (variant: InputVariant) => {
  const baseStyle = "rounded-xl bg-zinc-200 dark:bg-zinc-900";

  switch (variant) {
    case "filled":
      return `${baseStyle} bg-zinc-100 dark:bg-zinc-700`;
    case "outlined":
      return `${baseStyle} border border-zinc-200 dark:border-zinc-600`;
    case "ghost":
      return `${baseStyle} bg-transparent`;
    default:
      return baseStyle;
  }
};

const getTextColor = (disabled: boolean) => {
  return disabled
    ? "text-zinc-400 dark:text-zinc-500"
    : "text-zinc-900 dark:text-zinc-50";
};

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  variant = "default",
  size = "md",
  containerStyle,
  inputStyle,
  disabled = false,
  ...props
}) => {
  const inputSize = sizeStyles[size];
  const inputColor = getTextColor(disabled);

  return (
    <View style={[containerStyle]} className="mb-4">
      {label && <ThemedText className="mb-3">{label}</ThemedText>}
      <View className={`${getVariantStyle(variant)} disabled:opacity-50`}>
        <RNTextInput
          className={`${inputSize} ${inputColor}`}
          style={[inputStyle]}
          placeholderClassName="dark:color-zinc-500 color-zinc-400"
          editable={!disabled}
          {...props}
        />
      </View>
      {error && <ThemedText className="color-red-600 mt-4">{error}</ThemedText>}
    </View>
  );
};

export default TextInput;
