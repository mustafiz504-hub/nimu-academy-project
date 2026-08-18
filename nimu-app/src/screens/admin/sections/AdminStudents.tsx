import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { adminService, type Student } from "../../../services/admin.service";
import { useCourseStore } from "../../../store/course.store";
import { API_BASE_URL } from "../../../constants/api";

// Server IP — derived dynamically from API_BASE_URL
const RAW_SERVER_URL = API_BASE_URL.endsWith("/api") ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
const CERT_IMAGE_URL = `${RAW_SERVER_URL}/public/certificate-template1.jpeg`;

// Fetch certificate template from Express server and convert to base64 data URI
// This is the most reliable method — no expo-file-system needed
const getCertTemplateUri = async (): Promise<string> => {
  const response = await fetch(CERT_IMAGE_URL);
  if (!response.ok) throw new Error(`Image fetch failed: HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Convert to base64 in chunks (btoa is available in React Native/Hermes)
  let binary = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
};

// ─── Certificate HTML — same layout as the website CertificateDownloader ───────
// Uses local asset: assets/certificate/certificate-template1.jpeg
// Text positions mirror CertificateDownloader.tsx pixel-for-pixel.

const formatCertDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  
  // If already in DD-MM-YYYY or DD/MM/YYYY format (e.g. "10-05-2026")
  const ddMmYyyyMatch = trimmed.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
  if (ddMmYyyyMatch) {
    const dd = ddMmYyyyMatch[1].padStart(2, '0');
    const mm = ddMmYyyyMatch[2].padStart(2, '0');
    const yyyy = ddMmYyyyMatch[3];
    return `${dd}-${mm}-${yyyy}`;
  }

  // If in YYYY-MM-DD format (e.g. "2026-05-10")
  const yyyyMmDdMatch = trimmed.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (yyyyMmDdMatch) {
    const yyyy = yyyyMmDdMatch[1];
    const mm = yyyyMmDdMatch[2].padStart(2, '0');
    const dd = yyyyMmDdMatch[3].padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
  }

  const months: { [key: string]: string } = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  // Match "DD Month YYYY" (e.g. "10 May 2026")
  const ddMonthYyyyMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (ddMonthYyyyMatch) {
    const dd = ddMonthYyyyMatch[1].padStart(2, '0');
    const monthStr = ddMonthYyyyMatch[2].toLowerCase();
    const mm = months[monthStr] || '01';
    const yyyy = ddMonthYyyyMatch[3];
    return `${dd}-${mm}-${yyyy}`;
  }

  // Match "Month DD, YYYY" or "Month DD YYYY" (e.g. "May 10, 2026")
  const monthDdYyyyMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthDdYyyyMatch) {
    const monthStr = monthDdYyyyMatch[1].toLowerCase();
    const mm = months[monthStr] || '01';
    const dd = monthDdYyyyMatch[2].padStart(2, '0');
    const yyyy = monthDdYyyyMatch[3];
    return `${dd}-${mm}-${yyyy}`;
  }

  try {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
  } catch {
    // ignore
  }

  return trimmed;
};

const getCertificateHtml = (s: Student, templateUri: string) => `
  <div style="
    page-break-after: always;
    break-after: page;
    page-break-inside: avoid;
    break-inside: avoid;
    display: block;
    width: 1123px;
    height: 794px;
    margin: 0;
    padding: 0;
    position: relative;
    background-image: url('${templateUri}');
    background-size: 1123px 794px;
    background-repeat: no-repeat;
  ">

    <!-- Student Name -->
    <div style="
      position: absolute;
      top: 330px;
      left: 0;
      width: 1123px;
      text-align: center;
    ">
      <span style="
        font-family: 'Great Vibes', cursive;
        font-size: 82px;
        color: #000000;
        line-height: 1;
        letter-spacing: 0.01em;
        white-space: nowrap;
      ">${s.student_name}</span>
    </div>

    <!-- Course & Academy Details -->
    <div style="
      position: absolute;
      top: 430px;
      left: 0;
      width: 1123px;
      font-family: 'Lora', serif;
      color: #2a3f5f;
      text-align: center;
      line-height: 1.55;
    ">
      <p style="font-size: 22px; font-weight: 500; margin: 0;">
        Has successfully completed <span style="font-weight: 700;">${s.course_name}</span> course
      </p>
      <p style="font-size: 22px; font-weight: 500; margin: 0;">
        conducted by <span style="font-weight: 700;">nimu cooking academy</span>
      </p>
      <p style="font-size: 20px; font-weight: 700; margin: 4px 0 0;">UDYAM-OD-30-0059753</p>
      <p style="font-size: 20px; font-weight: 700; margin: 2px 0 0;">Fssai no:22026032000151</p>
    </div>

    <!-- Date (bottom-right) -->
    <div style="
      position: absolute;
      bottom: 66px;
      right: 179px;
      font-size: 15px;
      color: #3f5a73;
      font-weight: 500;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 0.03em;
    ">${formatCertDate(s.completion_date || '')}</div>

  </div>
`;
const getFullHtmlDocument = (pagesHtml: string) => `
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap');
        @page { size: 842pt 595pt landscape; margin: 0; }
        * { box-sizing: border-box; }
        html, body {
          margin: 0; padding: 0;
          width: 1123px;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>
    <body>
      ${pagesHtml}
    </body>
  </html>
`;



export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  const { courses, fetchAllCourses } = useCourseStore();

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      await fetchAllCourses();
      setStudents(await adminService.getStudents());
    } catch { } finally { setLoading(false); setRefreshing(false); }
  }, [fetchAllCourses]);

  useEffect(() => { load(); }, [load]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  
  // Date Picker State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Course Picker State
  const [showCoursePicker, setShowCoursePicker] = useState(false);

  // Multi-select State
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllFiltered = () => {
    const filteredIds = students.filter(s => 
      s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.phone.includes(searchQuery) ||
      s.course_name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(s => s.id);
    
    // If all are selected, deselect all. Otherwise, select all filtered.
    if (filteredIds.every(id => selectedStudents.includes(id))) {
      setSelectedStudents(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedStudents(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    // Format: DD-MM-YYYY (e.g. 10-05-2026)
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const yyyy = currentDate.getFullYear();
    setCompletionDate(`${dd}-${mm}-${yyyy}`);
  };

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) return Alert.alert("Required", "Name and phone are required.");
    try {
      setSaving(true);
      await adminService.createStudent({ student_name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, course_name: courseName.trim(), completion_date: completionDate.trim() || undefined });
      await load(true);
      setShowForm(false); setName(""); setPhone(""); setEmail(""); setCourseName(""); setCompletionDate("");
    } catch (e: any) { Alert.alert("Error", e?.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  };

  const toggleApproved = async (s: Student) => {
    try {
      await adminService.updateStudent(s.id, { approved: !s.approved });
      setStudents(prev => prev.map(x => x.id === s.id ? { ...x, approved: !x.approved } : x));
    } catch (e: any) { Alert.alert("Error", "Update failed."); }
  };

  const handleDelete = (s: Student) => {
    Alert.alert("Delete", `Remove ${s.student_name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await adminService.deleteStudent(s.id); setStudents(prev => prev.filter(x => x.id !== s.id)); }
        catch { Alert.alert("Error", "Delete failed."); }
      }}
    ]);
  };

  const handleDownloadCertificate = async (s: Student) => {
    try {
      const templateUri = await getCertTemplateUri();
      const html = getFullHtmlDocument(getCertificateHtml(s, templateUri));
      const { uri: tempUri } = await Print.printToFileAsync({ html, width: 842, height: 595 });
      
      let shareUri = tempUri;
      if (Platform.OS !== 'web') {
        const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        if (baseDir) {
          // Create a clean file name without extra spaces or invalid characters
          const cleanName = `${s.student_name.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
          const newPath = `${baseDir}${cleanName}`;
          try {
            // Delete existing file if present so copyAsync does not fail with "File already exists"
            await FileSystem.deleteAsync(newPath, { idempotent: true });
            await FileSystem.copyAsync({ from: tempUri, to: newPath });
            shareUri = newPath;
          } catch (err: any) {
            console.error('Could not rename file, sharing original:', err);
            Alert.alert('Notice', 'Could not rename PDF to ' + cleanName + ': ' + (err?.message || String(err)));
          }
        }
      }

      await Sharing.shareAsync(shareUri, { 
        UTI: '.pdf', 
        mimeType: 'application/pdf',
        dialogTitle: `${s.student_name} Certificate`
      });
    } catch (error: any) {
      console.error('[Certificate Download]', error);
      Alert.alert('Error', error?.message || String(error));
    }
  };

  const handlePreviewCertificate = async (s: Student) => {
    try {
      const templateUri = await getCertTemplateUri();
      const html = getFullHtmlDocument(getCertificateHtml(s, templateUri));
      await Print.printAsync({ html });
    } catch (error: any) {
      const debugMsg = [
        'Type: ' + typeof error,
        'Msg: ' + (error?.message ?? 'NONE'),
        'Str: ' + String(error),
      ].join('\n');
      console.error('[Certificate Preview]', error);
      Alert.alert('Certificate Error', debugMsg);
    }
  };


  const handleBulkDownload = async () => {
    if (selectedStudents.length === 0) return;
    try {
      const selectedDocs = students.filter(s => selectedStudents.includes(s.id) && s.approved);
      if (selectedDocs.length === 0) {
        Alert.alert("Notice", "Selected students must have approved certificates.");
        return;
      }
      const templateUri = await getCertTemplateUri();
      const pagesHtml = selectedDocs.map(s => getCertificateHtml(s, templateUri)).join("");
      const html = getFullHtmlDocument(pagesHtml);
      const { uri: tempUri } = await Print.printToFileAsync({ html, width: 842, height: 595 });
      
      let shareUri = tempUri;
      if (Platform.OS !== 'web') {
        const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        if (baseDir) {
          const newPath = `${baseDir}Nimu_Certificates.pdf`;
          try {
            await FileSystem.deleteAsync(newPath, { idempotent: true });
            await FileSystem.copyAsync({ from: tempUri, to: newPath });
            shareUri = newPath;
          } catch (err: any) {
            console.error('Could not rename bulk file, sharing original:', err);
          }
        }
      }

      await Sharing.shareAsync(shareUri, { 
        UTI: '.pdf', 
        mimeType: 'application/pdf',
        dialogTitle: 'Nimu Certificates'
      });
      setSelectedStudents([]);
    } catch (error: any) { Alert.alert("Error", error?.message || "Could not generate certificates"); }
  };

  const inputStyle = { backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: "#1E1B18", borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 10 } as const;

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#FF8C00" size="large" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#FF8C00"]} tintColor="#FF8C00" />}
      >
      {/* Add button */}
      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{ backgroundColor: "#1E1B18", borderRadius: 14, paddingVertical: 13, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 16 }}
      >
        <Ionicons name={showForm ? "close" : "person-add"} size={18} color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>{showForm ? "Cancel" : "Add Student"}</Text>
      </TouchableOpacity>

      {/* Form */}
      {showForm && (
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#1E1B18", marginBottom: 12 }}>New Student</Text>
          <TextInput style={inputStyle} placeholder="Student name *" placeholderTextColor="#C0CADD" value={name} onChangeText={setName} />
          <TextInput style={inputStyle} placeholder="Phone *" placeholderTextColor="#C0CADD" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={inputStyle} placeholder="Email (optional)" placeholderTextColor="#C0CADD" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          
          {/* Course Dropdown */}
          <TouchableOpacity 
            style={[inputStyle, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]} 
            onPress={() => setShowCoursePicker(!showCoursePicker)}
          >
            <Text style={{ color: courseName ? "#1E1B18" : "#C0CADD" }}>{courseName || "Select Course"}</Text>
            <Ionicons name={showCoursePicker ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
          </TouchableOpacity>

          {showCoursePicker && (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 10, overflow: "hidden", maxHeight: 150 }}>
              <ScrollView nestedScrollEnabled>
                 {courses.map((c, i) => (
                  <TouchableOpacity key={c.id} onPress={() => { setCourseName(c.name); setShowCoursePicker(false); }}
                    style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: "#F1F5F9" }}>
                    <Text style={{ fontSize: 13, color: "#1E1B18" }}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Date Picker trigger */}
          <TouchableOpacity 
            style={[inputStyle, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: completionDate ? "#1E1B18" : "#C0CADD" }}>{completionDate || "Select Completion Date"}</Text>
            <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          <TouchableOpacity onPress={handleAdd} disabled={saving} style={{ backgroundColor: "#FF8C00", borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: "#FFF", fontWeight: "800" }}>Save Student</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 16 }}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput 
          style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 13, color: "#1E1B18" }} 
          placeholder="Search students, phone, or course..." 
          placeholderTextColor="#C0CADD"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#C0CADD" />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {students.filter(s => 
            s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.phone.includes(searchQuery) ||
            s.course_name.toLowerCase().includes(searchQuery.toLowerCase())
          ).length} Students
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {selectedStudents.length > 0 && (
            <TouchableOpacity onPress={handleBulkDownload} style={{ backgroundColor: "#FF8C00", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="download-outline" size={14} color="#FFFFFF" />
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#FFFFFF" }}>Download ({selectedStudents.length})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={selectAllFiltered} style={{ padding: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#FF8C00" }}>
              {selectedStudents.length > 0 && students.length > 0 && selectedStudents.length === students.length ? "Deselect All" : "Select All"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={{ gap: 10, paddingBottom: selectedStudents.length > 0 ? 80 : 0 }}>
        {students.filter(s => 
          s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          s.phone.includes(searchQuery) ||
          s.course_name.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((s) => {
          const isSelected = selectedStudents.includes(s.id);
          return (
          <TouchableOpacity 
            key={s.id} 
            activeOpacity={0.8}
            onPress={() => toggleSelection(s.id)}
            style={{ backgroundColor: isSelected ? "#FFFBF5" : "#FFFFFF", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: isSelected ? "#FF8C00" : "#F0E6D8" }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flexDirection: "row", flex: 1, alignItems: "flex-start" }}>
                {/* Checkbox */}
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isSelected ? "#FF8C00" : "#C0CADD", backgroundColor: isSelected ? "#FF8C00" : "transparent", justifyContent: "center", alignItems: "center", marginRight: 12, marginTop: 2 }}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B18" }}>{s.student_name}</Text>
                  <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{s.course_name}</Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{s.phone}{s.certificate_id ? ` · ID: ${s.certificate_id}` : (s.student_id ? ` · ID: ${s.student_id}` : "")}</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <View style={{ backgroundColor: s.approved ? "#DCFCE7" : "#FEF9C3", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: s.approved ? "#166534" : "#A16207" }}>{s.approved ? "APPROVED" : "PENDING"}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(s)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 }}>
              <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
                {s.approved && (
                  <>
                    <TouchableOpacity 
                      onPress={() => handlePreviewCertificate(s)}
                      style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 4 }}
                    >
                      <Ionicons name="eye-outline" size={14} color="#64748B" />
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B" }}>Preview</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => handleDownloadCertificate(s)}
                      style={{ backgroundColor: "#FFF3E0", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#FFE0B2", flexDirection: "row", alignItems: "center", gap: 4 }}
                    >
                      <Ionicons name="download-outline" size={14} color="#FF8C00" />
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#FF8C00" }}>Download</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              
              <Switch
                value={s.approved}
                onValueChange={() => toggleApproved(s)}
                trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                thumbColor={s.approved ? "#16A34A" : "#94A3B8"}
              />
            </View>
          </TouchableOpacity>
        )})}
      </View>
      
      </ScrollView>

      {/* Fixed Floating Action Bar for Bulk Download */}
      {selectedStudents.length > 0 && (
        <View style={{ position: "absolute", bottom: 16, left: 12, right: 12, backgroundColor: "#1E1B18", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
          <View style={{ flexShrink: 1, marginRight: 6 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>{selectedStudents.length} Selected</Text>
            <Text style={{ color: "#94A3B8", fontSize: 10, marginTop: 1 }} numberOfLines={1}>Combined PDF</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TouchableOpacity onPress={() => setSelectedStudents([])} style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
              <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "600" }}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBulkDownload} style={{ backgroundColor: "#FF8C00", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="download-outline" size={15} color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "800" }}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
