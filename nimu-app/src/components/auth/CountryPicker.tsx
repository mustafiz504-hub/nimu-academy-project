import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const ALL_COUNTRIES: Country[] = [
  // Top picks (shown first)
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dial: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", dial: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman", dial: "+968", flag: "🇴🇲" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰" },
  { code: "NP", name: "Nepal", dial: "+977", flag: "🇳🇵" },
  // More countries
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
  { code: "HK", name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "RU", name: "Russia", dial: "+7", flag: "🇷🇺" },
];

interface CountryPickerProps {
  selected: Country;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

const CountryPicker: React.FC<CountryPickerProps> = ({ selected, onSelect, disabled = false }) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_COUNTRIES;
    const q = search.toLowerCase();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setVisible(false);
    setSearch("");
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 14,
          backgroundColor: "#F8F9FA",
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: "#F0E6D8",
          borderRightWidth: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          minWidth: 90,
        }}
      >
        <Text style={{ fontSize: 20 }}>{selected.flag}</Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#475569" }}>{selected.dial}</Text>
        <Ionicons name="chevron-down" size={14} color="#94A3B8" />
      </TouchableOpacity>

      {/* Country List Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
          }}
        >
          {/* Modal Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F0E6D8",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>Select Country</Text>
            <TouchableOpacity
              onPress={() => { setVisible(false); setSearch(""); }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F8F9FA",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 16,
              marginVertical: 12,
              backgroundColor: "#F8F9FA",
              borderRadius: 14,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: "#F0E6D8",
            }}
          >
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country or dial code..."
              placeholderTextColor="#CBD5E1"
              style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: "#1E1B18" }}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>

          {/* Country List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#FFF3E0",
                  backgroundColor: selected.code === item.code ? "#FFF3E0" : "#FFFFFF",
                }}
              >
                <Text style={{ fontSize: 24, marginRight: 14 }}>{item.flag}</Text>
                <Text style={{ flex: 1, fontSize: 15, color: "#1E1B18", fontWeight: "500" }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600", fontFamily: "monospace" }}>
                  {item.dial}
                </Text>
                {selected.code === item.code && (
                  <Ionicons name="checkmark-circle" size={18} color="#FF8C00" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: "#94A3B8", fontSize: 14 }}>No countries found</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
};

export { ALL_COUNTRIES };
export default CountryPicker;
