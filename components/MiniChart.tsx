import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface MiniChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  showDots?: boolean;
  title?: string;
  currentValue?: string;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendPercent?: string;
}

export function MiniChart({
  data,
  labels,
  color,
  height = 80,
  showDots = true,
  title,
  currentValue,
  unit,
  trend,
  trendPercent,
}: MiniChartProps) {
  const colors = useColors();
  const chartColor = color ?? colors.primary;
  const width = 240;

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 20) + 10;
      const y = height - 10 - ((v - min) / range) * (height - 20);
      return `${x},${y}`;
    })
    .join(" ");

  const lastX = (((data.length - 1) / (data.length - 1)) * (width - 20)) + 10;
  const lastY = height - 10 - ((data[data.length - 1] - min) / range) * (height - 20);

  const trendColor =
    trend === "up" ? colors.success : trend === "down" ? colors.destructive : colors.mutedForeground;

  return (
    <View style={styles.container}>
      {(title || currentValue) && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              {title}
            </Text>
          )}
          <View style={styles.valueRow}>
            {currentValue && (
              <Text style={[styles.value, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {currentValue}
                {unit && (
                  <Text style={[styles.unit, { color: colors.mutedForeground }]}>
                    {" "}{unit}
                  </Text>
                )}
              </Text>
            )}
            {trendPercent && (
              <View style={[styles.trendBadge, { backgroundColor: trendColor + "15" }]}>
                <Text style={[styles.trendText, { color: trendColor, fontFamily: "Inter_600SemiBold" }]}>
                  {trend === "up" ? "+" : trend === "down" ? "-" : ""}{trendPercent}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={{ width: "100%", height }}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={chartColor} stopOpacity="0.2" />
              <Stop offset="1" stopColor={chartColor} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Polyline
            points={points}
            fill="none"
            stroke={chartColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showDots && data.map((v, i) => {
            const x = (i / (data.length - 1)) * (width - 20) + 10;
            const y = height - 10 - ((v - min) / range) * (height - 20);
            return (
              <Circle
                key={i}
                cx={x}
                cy={y}
                r={i === data.length - 1 ? 4 : 2.5}
                fill={i === data.length - 1 ? chartColor : colors.card}
                stroke={chartColor}
                strokeWidth={i === data.length - 1 ? 0 : 1.5}
              />
            );
          })}
        </Svg>
      </View>

      {labels && labels.length > 0 && (
        <View style={styles.labels}>
          {labels.map((l, i) => (
            <Text
              key={i}
              style={[styles.labelText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
            >
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
  unit: {
    fontSize: 13,
  },
  trendBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "600",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 10,
  },
});
