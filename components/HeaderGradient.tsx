import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface HeaderGradientProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function HeaderGradient({ title, subtitle, children, rightAction }: HeaderGradientProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPad + 12,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textBlock}>
          {title && (
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {},
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
});
