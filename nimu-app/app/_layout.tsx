import "../global.css";
import { Stack } from "expo-router";
import { View } from "react-native";
import FloatingUploadIndicator from "../src/components/common/FloatingUploadIndicator";
import PushNotificationManager from "../src/components/common/PushNotificationManager";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack />
      <FloatingUploadIndicator />
      <PushNotificationManager />
    </View>
  );
}
