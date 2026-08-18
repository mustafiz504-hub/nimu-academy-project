import { View, Image, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";

// Navigation
import { BottomTabNavigator } from "../src/navigation";
import type { TabName } from "../src/navigation";

// Auth Screens
import LoginScreen from "../src/screens/auth/LoginScreen";
import RegisterScreen from "../src/screens/auth/RegisterScreen";
import OtpVerificationScreen from "../src/screens/auth/OtpVerificationScreen";

// Main App Screens
import HomeScreen from "../src/screens/home/HomeScreen";
import CoursesScreen from "../src/screens/courses/CoursesScreen";
import LearnScreen from "../src/screens/schedule/LearnScreen";
import ProfileScreen from "../src/screens/profile/ProfileScreen";
import AdminScreen from "../src/screens/admin/AdminScreen";

// Stores
import { useAuthStore } from "../src/store/auth.store";
import { useCourseStore } from "../src/store/course.store";
import { AppAlertProvider } from "../src/components/common/AppAlert";

type AuthPage = "login" | "register" | "verify-otp";

/** OTP session passed from login/register screen to the shared OTP screen */
interface OtpSession {
  identifier: string;       // email (signup) or email/phone (login)
  maskedTarget: string;     // e.g. "j***@gmail.com" or "+91 98***210"
  purpose: "signup" | "login";
}

function AppBootLoadingScreen() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 140],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#FDF8F0", justifyContent: "center", alignItems: "center" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Clean circular logo: smaller size, no black/grey square shadow */}
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          borderWidth: 2,
          borderColor: "#FF8C00",
          shadowColor: "#FF8C00",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <Image
          source={require("../assets/images/logo-round.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      {/* Bottom loading progress bar matching App UI theme */}
      <View style={{ position: "absolute", bottom: 65, width: 180, alignItems: "center" }}>
        <View
          style={{
            width: "100%",
            height: 6,
            backgroundColor: "#FFE5C4",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              width: 70,
              height: "100%",
              backgroundColor: "#FF8C00",
              borderRadius: 3,
              transform: [{ translateX }],
            }}
          />
        </View>
      </View>
    </View>
  );
}

function AuthFlow() {
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [otpSession, setOtpSession] = useState<OtpSession | null>(null);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {authPage === "login" && (
        <LoginScreen
          onGoToRegister={() => {
            setOtpSession(null);
            setAuthPage("register");
          }}
          onOtpSent={(session) => {
            setOtpSession({
              identifier: session.identifier,
              maskedTarget: session.maskedTarget,
              purpose: "login",
            });
            setAuthPage("verify-otp");
          }}
        />
      )}

      {authPage === "register" && (
        <RegisterScreen
          onGoToLogin={() => {
            setOtpSession(null);
            setAuthPage("login");
          }}
          onSignupSuccess={(session) => {
            setOtpSession({
              identifier: session.email,
              maskedTarget: session.maskedEmail,
              purpose: "signup",
            });
            setAuthPage("verify-otp");
          }}
        />
      )}

      {authPage === "verify-otp" && otpSession && (
        <OtpVerificationScreen
          identifier={otpSession.identifier}
          maskedTarget={otpSession.maskedTarget}
          purpose={otpSession.purpose}
          onGoBack={() => {
            setOtpSession(null);
            setAuthPage(otpSession.purpose === "signup" ? "register" : "login");
          }}
        />
      )}
    </>
  );
}

export default function Index() {
  const { selectedCourseId: storeSelectedCourseId, setSelectedCourseId: setStoreSelectedCourseId } = useCourseStore();
  const [currentTab, setCurrentTab] = useState<TabName>(storeSelectedCourseId ? "schedule" : "home");
  const [isBooting, setIsBooting] = useState(true);

  const selectedCourseId = storeSelectedCourseId;
  const setSelectedCourseId = setStoreSelectedCourseId;

  const { isAuthenticated, user, loadFromStorage } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // On app launch — restore session from storage + validate with server
  useEffect(() => {
    loadFromStorage().finally(() => setIsBooting(false));
  }, []);

  // ── Splash / Loading ──────────────────────────────────────────────────────
  if (isBooting) {
    return <AppBootLoadingScreen />;
  }

  // ── Not Authenticated → Auth screens ─────────────────────────────────────
  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentTab("schedule");
  };

  // ── Authenticated → Main App ──────────────────────────────────────────────
  return (
    <AppAlertProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FDF8F0" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={{ flex: 1 }}>
        {/* Always mounted — display:none keeps screens alive so
            useEffect doesn't re-fire and Zustand cache works. */}
        <View style={{ flex: 1, display: currentTab === "home" ? "flex" : "none" }}>
          <HomeScreen onNavigateToTab={setCurrentTab} onCourseSelect={handleCourseSelect} />
        </View>
        <View style={{ flex: 1, display: currentTab === "courses" ? "flex" : "none" }}>
          <CoursesScreen onCourseSelect={handleCourseSelect} />
        </View>
        <View style={{ flex: 1, display: currentTab === "schedule" ? "flex" : "none" }}>
          <LearnScreen 
            isActive={currentTab === "schedule"} 
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
          />
        </View>
        <View style={{ flex: 1, display: currentTab === "profile" ? "flex" : "none" }}>
          <ProfileScreen />
        </View>
        {/* Admin tab — only mounted if user is admin/superadmin */}
        {isAdmin && (
          <View style={{ flex: 1, display: currentTab === "admin" ? "flex" : "none" }}>
            <AdminScreen />
          </View>
        )}
      </View>

      <BottomTabNavigator
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isAdmin={isAdmin}
      />
    </SafeAreaView>
    </AppAlertProvider>
  );
}
