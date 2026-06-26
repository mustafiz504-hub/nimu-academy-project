import React, { useRef, useEffect, useState } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type TabName = "home" | "courses" | "schedule" | "profile";

interface BottomTabNavigatorProps {
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const TABS: TabName[] = ["home", "courses", "schedule", "profile"];

const TAB_ICONS: Record<TabName, { active: any; inactive: any }> = {
  home: { active: "home", inactive: "home-outline" },
  courses: { active: "compass", inactive: "compass-outline" },
  schedule: { active: "calendar", inactive: "calendar-outline" },
  profile: { active: "person", inactive: "person-outline" },
};

export default function BottomTabNavigator({ currentTab, onTabChange }: BottomTabNavigatorProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const tabX = useRef(new Animated.Value(0)).current;

  const scale0 = useRef(new Animated.Value(1)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;
  const scales = [scale0, scale1, scale2, scale3];

  useEffect(() => {
    const index = TABS.indexOf(currentTab);
    Animated.spring(tabX, { toValue: index, useNativeDriver: true, tension: 68, friction: 10 }).start();
    Animated.sequence([
      Animated.timing(scales[index], { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.spring(scales[index], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [currentTab]);

  const tabWidth = containerWidth / 4;
  const pillWidth = 54;
  const pillHeight = 44;

  const translateX = tabX.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: TABS.map((_, i) => tabWidth * i + (tabWidth - pillWidth) / 2),
  });

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{
        height: 64,
        backgroundColor: "#FFFFFF",
        borderRadius: 32,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#F0E6D8",
        marginHorizontal: 20,
        marginBottom: 8,
        position: "relative",
      }}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            width: pillWidth,
            height: pillHeight,
            borderRadius: 22,
            backgroundColor: "#FFF3E0",
            transform: [{ translateX }],
            zIndex: 1,
          }}
        />
      )}
      {TABS.map((tab, index) => {
        const isActive = currentTab === tab;
        const icons = TAB_ICONS[tab];
        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            style={{ flex: 1, height: "100%", justifyContent: "center", alignItems: "center", zIndex: 2 }}
            onPress={() => onTabChange(tab)}
          >
            <Animated.View style={{ transform: [{ scale: scales[index] }] }}>
              <Ionicons name={isActive ? icons.active : icons.inactive} size={22} color={isActive ? "#FF8A00" : "#94A3B8"} />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
