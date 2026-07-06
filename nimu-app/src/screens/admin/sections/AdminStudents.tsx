import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { adminService, type Student } from "../../../services/admin.service";
import { useCourseStore } from "../../../store/course.store";

const getCertificateHtml = (s: Student) => `
  <div class="certificate-page" style="page-break-after: always; width: 100vw; height: 100vh; margin: 0; padding: 0;">
    <div class="container">
      <div class="border">
        <div class="inner-border">
          <div class="logo">NIMU ACADEMY</div>
          <div class="id-text">ID: ${s.student_id || s.id}</div>
          
          <h1>CERTIFICATE</h1>
          <h2>OF COMPLETION</h2>
          
          <div class="presented-to">This certificate is proudly presented to</div>
          <div class="student-name">${s.student_name}</div>
          
          <div class="course-text">for successfully completing the course</div>
          <div class="course-name">${s.course_name}</div>
          
          <div class="footer">
            <div class="footer-item">
              <div style="font-weight: normal; color: #64748B; font-size: 12px; margin-bottom: 5px;">Date</div>
              ${s.completion_date || new Date().toLocaleDateString()}
            </div>
            <div class="footer-item">
              <div style="font-weight: normal; color: #64748B; font-size: 12px; margin-bottom: 5px;">Signature</div>
              Nimu Academy
            </div>
          </div>
          
          <div class="badge">NIMU<br/>CERTIFIED</div>
        </div>
      </div>
    </div>
  </div>
`;

const getFullHtmlDocument = (pagesHtml: string) => `
  <html>
    <head>
      <style>
        @page { size: landscape; margin: 0; }
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fff; -webkit-print-color-adjust: exact; }
        .container { width: 100%; height: 100%; padding: 40px; box-sizing: border-box; }
        .border { border: 12px solid #1E1B18; width: 100%; height: 100%; padding: 10px; box-sizing: border-box; text-align: center; position: relative; }
        .inner-border { border: 4px double #FF8C00; width: 100%; height: 100%; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        h1 { font-size: 56px; color: #1E1B18; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 4px; }
        h2 { font-size: 20px; color: #FF8C00; margin-bottom: 40px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
        .presented-to { font-size: 16px; color: #64748B; margin-bottom: 10px; }
        .student-name { font-size: 48px; color: #1E1B18; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #FF8C00; padding-bottom: 10px; width: 70%; font-family: 'Georgia', serif; font-style: italic; }
        .course-text { font-size: 18px; color: #64748B; margin-bottom: 15px; }
        .course-name { font-size: 32px; color: #FF8C00; font-weight: bold; margin-bottom: 40px; }
        .footer { display: flex; justify-content: space-between; width: 80%; margin-top: 50px; }
        .footer-item { text-align: center; border-top: 1px solid #94A3B8; padding-top: 10px; width: 200px; font-size: 14px; font-weight: bold; color: #1E1B18; }
        .logo { position: absolute; top: 40px; left: 40px; font-size: 24px; font-weight: 900; color: #FF8C00; }
        .badge { position: absolute; bottom: 50px; right: 50px; width: 80px; height: 80px; background-color: #FF8C00; border-radius: 40px; display: flex; justify-content: center; align-items: center; color: #fff; font-weight: bold; font-size: 12px; text-align: center; border: 4px solid #fff; box-shadow: 0 0 0 2px #FF8C00; }
        .id-text { position: absolute; top: 40px; right: 40px; font-size: 12px; color: #94A3B8; }
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
    // Format: DD MMM YYYY (e.g. 20 May 2026)
    const formatted = currentDate.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    setCompletionDate(formatted);
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
      const html = getFullHtmlDocument(getCertificateHtml(s));
      const { uri } = await Print.printToFileAsync({ html, width: 842, height: 595 });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) { Alert.alert("Error", "Could not generate certificate"); }
  };

  const handlePreviewCertificate = async (s: Student) => {
    try {
      const html = getFullHtmlDocument(getCertificateHtml(s));
      await Print.printAsync({ html });
    } catch (error) { Alert.alert("Error", "Could not preview certificate"); }
  };

  const handleBulkDownload = async () => {
    if (selectedStudents.length === 0) return;
    try {
      const selectedDocs = students.filter(s => selectedStudents.includes(s.id) && s.approved);
      if (selectedDocs.length === 0) {
        Alert.alert("Notice", "Selected students must have approved certificates.");
        return;
      }
      const pagesHtml = selectedDocs.map(s => getCertificateHtml(s)).join("");
      const html = getFullHtmlDocument(pagesHtml);
      const { uri } = await Print.printToFileAsync({ html, width: 842, height: 595 });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      setSelectedStudents([]);
    } catch (error) { Alert.alert("Error", "Could not generate certificates"); }
  };

  const inputStyle = { backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: "#1E1B18", borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 10 } as const;

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#FF8C00" size="large" /></View>;

  return (
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
        <TouchableOpacity onPress={selectAllFiltered} style={{ padding: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#FF8C00" }}>Select All</Text>
        </TouchableOpacity>
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
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{s.phone}{s.student_id ? ` · ID: ${s.student_id}` : ""}</Text>
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
      
      {/* Floating Action Bar for Bulk Download */}
      {selectedStudents.length > 0 && (
        <View style={{ position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "#1E1B18", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>{selectedStudents.length} Selected</Text>
          <TouchableOpacity onPress={handleBulkDownload} style={{ backgroundColor: "#FF8C00", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>Bulk Download</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
