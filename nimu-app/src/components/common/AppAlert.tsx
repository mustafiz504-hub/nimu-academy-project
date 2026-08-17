/**
 * AppAlert — Custom alert modal that matches the Nimu Academy design system.
 *
 * Drop-in replacement for React Native's Alert.alert().
 * Usage:
 *   const alert = useAppAlert();
 *   alert.show({ title: "Delete?", message: "This cannot be undone.", type: "danger",
 *     buttons: [{ text: "Cancel" }, { text: "Delete", onPress: () => ... }] });
 */
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ── Types ────────────────────────────────────────────────────────────────────
export type AlertType = "info" | "success" | "warning" | "danger";

export interface AppAlertButton {
  text: string;
  onPress?: () => void;
  /** "primary" = filled orange, "secondary" = ghost, "danger" = red-tinted */
  style?: "primary" | "secondary" | "danger";
}

export interface AppAlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AppAlertButton[];
  /** Optional icon name override */
  icon?: keyof typeof Ionicons.glyphMap;
}

interface AlertState extends AppAlertOptions {
  visible: boolean;
}

interface AlertContextValue {
  show: (options: AppAlertOptions) => void;
  hide: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────
const AlertContext = createContext<AlertContextValue>({
  show: () => {},
  hide: () => {},
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  AlertType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  info:    { icon: "information-circle", color: "#FF8C00", bg: "#FFF8F0" },
  success: { icon: "checkmark-circle",   color: "#22C55E", bg: "#F0FDF4" },
  warning: { icon: "warning",            color: "#F59E0B", bg: "#FFFBEB" },
  danger:  { icon: "trash-outline",      color: "#EF4444", bg: "#FEF2F2" },
};

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: "",
  });
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const show = useCallback((options: AppAlertOptions) => {
    scaleAnim.setValue(0.85);
    opacityAnim.setValue(0);
    setState({ ...options, visible: true });
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const hide = useCallback((onPress?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 140, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setState((s) => ({ ...s, visible: false }));
      onPress?.();
    });
  }, [scaleAnim, opacityAnim]);

  const type = state.type ?? "info";
  const cfg = TYPE_CONFIG[type];
  const icon = state.icon ?? cfg.icon;

  const buttons: AppAlertButton[] = state.buttons?.length
    ? state.buttons
    : [{ text: "OK", style: "primary" }];

  return (
    <AlertContext.Provider value={{ show, hide: () => hide() }}>
      {children}

      <Modal
        transparent
        visible={state.visible}
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => hide()}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.card,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            {/* Icon badge */}
            <View style={[styles.iconBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={icon} size={32} color={cfg.color} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{state.title}</Text>

            {/* Message */}
            {state.message ? (
              <Text style={styles.message}>{state.message}</Text>
            ) : null}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Buttons */}
            <View style={[styles.btnRow, buttons.length > 2 && { flexDirection: "column" }]}>
              {buttons.map((btn, i) => {
                const btnStyle = btn.style ?? (i === buttons.length - 1 ? "primary" : "secondary");
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => hide(btn.onPress)}
                    activeOpacity={0.75}
                    style={[
                      styles.btn,
                      buttons.length > 2 && { flex: undefined, width: "100%" },
                      btnStyle === "primary" && styles.btnPrimary,
                      btnStyle === "secondary" && styles.btnSecondary,
                      btnStyle === "danger" && styles.btnDanger,
                    ]}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        btnStyle === "primary" && styles.btnTextPrimary,
                        btnStyle === "secondary" && styles.btnTextSecondary,
                        btnStyle === "danger" && styles.btnTextDanger,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAppAlert() {
  return useContext(AlertContext);
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1B18",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E6D8",
    width: "100%",
    marginVertical: 16,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#FF8C00",
    shadowColor: "#FF8C00",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnSecondary: {
    backgroundColor: "#F8F4EF",
    borderWidth: 1,
    borderColor: "#F0E6D8",
  },
  btnDanger: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  btnTextPrimary: { color: "#FFFFFF" },
  btnTextSecondary: { color: "#64748B" },
  btnTextDanger: { color: "#EF4444" },
});
