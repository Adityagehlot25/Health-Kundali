import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  hint?: string;
}

export function AppInput({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  hint,
  ...props
}: AppInputProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.destructive
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderColor,
            borderRadius: colors.radius - 4,
            borderWidth: focused ? 2 : 1,
          },
        ]}
      >
        {icon && (
          <Feather
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.mutedForeground}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          {...props}
          placeholderTextColor={colors.mutedForeground}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              paddingLeft: icon ? 0 : 4,
            },
          ]}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <Feather name={rightIcon} size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text
          style={[
            styles.error,
            { color: colors.destructive, fontFamily: "Inter_400Regular" },
          ]}
        >
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text
          style={[
            styles.hint,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 2,
    height: 52,
    gap: 10,
  },
  leftIcon: {},
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  rightIcon: {
    padding: 4,
  },
  error: {
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
  },
});
