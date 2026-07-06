import React, { useRef, useEffect, useState } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type TabName = "home" | "courses" | "schedule" | "profile" | "admin";

interface Tab {
  key: TabName;
  active: any;
  inactive: any;
}

interface BottomTabNavigatorProps {
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
  isAdmin?: boolean;
}

const BASE_TABS: Tab[] = [
  { key: "home",     active: "home",            inactive: "home-outline" },
  { key: "courses",  active: "compass",          inactive: "compass-outline" },
  { key: "schedule", active: "calendar",         inactive: "calendar-outline" },
  { key: "profile",  active: "person",           inactive: "person-outline" },
];

const ADMIN_TAB: Tab = { key: "admin", active: "shield", inactive: "shield-outline" };

export default function BottomTabNavigator({ currentTab, onTabChange, isAdmin = false }: BottomTabNavigatorProps) {
  const tabs = isAdmin ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;
  const tabCount = tabs.length;

  const [containerWidth, setContainerWidth] = useState(0);
  const tabX = useRef(new Animated.Value(0)).current;

  // One scale per tab — support up to 5
  const scales = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;

  useEffect(() => {
    const index = tabs.findIndex((t) => t.key === currentTab);
    if (index < 0) return;

    Animated.spring(tabX, {
      toValue: index,
      useNativeDriver: true,
      tension: 68,
      friction: 10,
    }).start();

    Animated.sequence([
      Animated.timing(scales[index], { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.spring(scales[index], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [currentTab, tabs.length]);

  const tabWidth = containerWidth / tabCount;
  const pillWidth = 44;
  const pillHeight = 44;

  const translateX = tabX.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => tabWidth * i + (tabWidth - pillWidth) / 2),
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
      {/* Sliding pill highlight */}
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

      {tabs.map((tab, index) => {
        const isActive = currentTab === tab.key;
        const isAdminTab = tab.key === "admin";
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            style={{ flex: 1, height: "100%", justifyContent: "center", alignItems: "center", zIndex: 2 }}
            onPress={() => onTabChange(tab.key)}
          >
            <Animated.View style={{ transform: [{ scale: scales[index] }] }}>
              <Ionicons
                name={isActive ? tab.active : tab.inactive}
                size={22}
                color={isActive ? (isAdminTab ? "#EF4444" : "#FF8A00") : "#94A3B8"}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
