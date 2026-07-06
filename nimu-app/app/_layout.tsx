import "../global.css";
import { Stack } from "expo-router";
import { View } from "react-native";
import FloatingUploadIndicator from "../src/components/common/FloatingUploadIndicator";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack />
      <FloatingUploadIndicator />
    </View>
  );
}
