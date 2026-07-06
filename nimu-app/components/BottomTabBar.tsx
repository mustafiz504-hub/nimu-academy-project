import React, { useRef, useEffect, useState } from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BottomTabBarProps {
  currentTab: "home" | "onboarding" | "lessons" | "profile";
  onTabChange: (tab: "home" | "onboarding" | "lessons" | "profile") => void;
}

const TABS = ["home", "onboarding", "lessons", "profile"] as const;

export default function BottomTabBar({ currentTab, onTabChange }: BottomTabBarProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const tabX = useRef(new Animated.Value(0)).current;
  
  // Icon spring scale values
  const scaleHome = useRef(new Animated.Value(1)).current;
  const scaleOnboarding = useRef(new Animated.Value(1)).current;
  const scaleLessons = useRef(new Animated.Value(1)).current;
  const scaleProfile = useRef(new Animated.Value(1)).current;
  
  const scales = [scaleHome, scaleOnboarding, scaleLessons, scaleProfile];

  useEffect(() => {
    const index = TABS.indexOf(currentTab);
    
    // Smooth sliding animation
    Animated.spring(tabX, {
      toValue: index,
      useNativeDriver: true,
      tension: 68,
      friction: 10,
    }).start();

    // Pulse select icon animation
    Animated.sequence([
      Animated.timing(scales[index], {
        toValue: 1.25,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scales[index], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentTab]);

  const tabWidth = containerWidth / 4;
  const pillWidth = 54;
  const pillHeight = 44;

  const translateX = tabX.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      (tabWidth - pillWidth) / 2,
      tabWidth + (tabWidth - pillWidth) / 2,
      tabWidth * 2 + (tabWidth - pillWidth) / 2,
      tabWidth * 3 + (tabWidth - pillWidth) / 2,
    ],
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
      {/* Sliding Background Pill */}
      {containerWidth > 0 && (
        <Animated.View 
          style={{
            position: "absolute",
            left: 0,
            width: pillWidth,
            height: pillHeight,
            borderRadius: 22,
            backgroundColor: "#FFF3E0", // Accent light peach background color
            transform: [{ translateX }],
            zIndex: 1,
          }}
        />
      )}

      {/* Tabs */}
      {TABS.map((tab, index) => {
        const isActive = currentTab === tab;
        const iconName = 
          tab === "home" ? (isActive ? "home" : "home-outline") :
          tab === "onboarding" ? (isActive ? "compass" : "compass-outline") :
          tab === "lessons" ? (isActive ? "calendar" : "calendar-outline") :
          (isActive ? "person" : "person-outline");

        return (
          <TouchableOpacity 
            key={tab}
            activeOpacity={0.7}
            style={{ flex: 1, height: "100%", justifyContent: "center", alignItems: "center", zIndex: 2 }}
            onPress={() => onTabChange(tab)}
          >
            <Animated.View style={{ transform: [{ scale: scales[index] }] }}>
              <Ionicons 
                name={iconName as any} 
                size={22} 
                color={isActive ? "#FF8A00" : "#94A3B8"} 
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
