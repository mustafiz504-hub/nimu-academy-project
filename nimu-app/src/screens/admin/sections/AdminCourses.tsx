import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useCourseStore } from "../../../store/course.store";
import { adminService } from "../../../services/admin.service";
import { useUploadStore } from "../../../store/upload.store";

type SubTab = "video" | "course";

export default function AdminCourses() {
  const { courses, fetchAllCourses, refreshAllCourses, refreshCourseVideos } = useCourseStore();
  const [subTab, setSubTab] = useState<SubTab>("video");

  React.useEffect(() => { fetchAllCourses(); }, [fetchAllCourses]);

  // ── Video form ────────────────────────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [vTitle, setVTitle] = useState("");
  const [videoAsset, setVideoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [thumbnailAsset, setThumbnailAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [vDesc, setVDesc] = useState("");
  const [vDur, setVDur] = useState("");
  const [vFree, setVFree] = useState(false);
  const { addTask, updateProgress, completeTask, failTask } = useUploadStore();

  // ── Course form ───────────────────────────────────────────────────────────
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cDur, setCDur] = useState("");
  const [cMode, setCMode] = useState("");
  const [creatingC, setCreatingC] = useState(false);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setVideoAsset(asset);
      if (asset.duration) {
        setVDur(Math.ceil(asset.duration / 60000).toString());
      }
    }
  };

  const pickThumbnail = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setThumbnailAsset(result.assets[0]);
  };

  const handleAddVideo = useCallback(() => {
    if (!selectedCourseId) return Alert.alert("Required", "Select a course.");
    if (!vTitle.trim() || !videoAsset) return Alert.alert("Required", "Title and Video are required.");
    
    const taskId = Date.now().toString();
    const title = vTitle.trim();
    const courseId = selectedCourseId;
    const vAsset = videoAsset;
    const tAsset = thumbnailAsset;
    const desc = vDesc.trim();
    const duration = vDur ? +vDur : undefined;
    const isFree = vFree;
    
    // Add task to global store
    addTask({
      id: taskId,
      filename: title,
      progress: 0,
      status: 'uploading'
    });
    
    Alert.alert("Uploading", `"${title}" is uploading in the background. You can check the progress in the floating icon.`);
    
    // Clear form immediately
    setVTitle(""); setVideoAsset(null); setThumbnailAsset(null); setVDesc(""); setVDur(""); setVFree(false);
    
    // Background upload process
    (async () => {
      try {
        const videoUrl = await adminService.uploadMediaToCloudinary(vAsset.uri, 'video', 'courses', (prog) => {
          // Since video is usually 90% of the wait time, we'll map video upload progress to 0-90%
          updateProgress(taskId, Math.floor(prog * 0.9));
        });
        
        let thumbnailUrl;
        if (tAsset) {
          thumbnailUrl = await adminService.uploadMediaToCloudinary(tAsset.uri, 'image', 'courses');
        }
        
        updateProgress(taskId, 95); // Almost done
        
        await adminService.addVideo(courseId, { 
          title: title, 
          description: desc || undefined, 
          video_url: videoUrl, 
          thumbnail_url: thumbnailUrl, 
          duration_minutes: duration, 
          is_free: isFree 
        });
        
        await refreshCourseVideos(courseId);
        completeTask(taskId);
      } catch (e: any) {
        failTask(taskId, e?.message || e?.response?.data?.message || "Failed.");
      }
    })();
  }, [selectedCourseId, vTitle, videoAsset, thumbnailAsset, vDesc, vDur, vFree, addTask, updateProgress, completeTask, failTask, refreshCourseVideos]);

  const handleCreateCourse = useCallback(async () => {
    if (!cName.trim() || !cPrice.trim()) return Alert.alert("Required", "Name and price are required.");
    try {
      setCreatingC(true);
      await adminService.createCourse({ name: cName.trim(), description: cDesc.trim() || undefined, duration: cDur.trim() || undefined, price: parseFloat(cPrice), mode: cMode || undefined });
      await refreshAllCourses();
      Alert.alert("✅ Created", `Course "${cName}" created!`);
      setCName(""); setCDesc(""); setCPrice(""); setCDur(""); setCMode("");
    } catch (e: any) { Alert.alert("Error", e?.response?.data?.message || "Failed."); }
    finally { setCreatingC(false); }
  }, [cName, cDesc, cPrice, cDur, cMode, refreshAllCourses]);

  const inp = { backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: "#1E1B18", borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 10 } as const;
  const lbl = { fontSize: 11, fontWeight: "600" as const, color: "#64748B", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: 0.4 };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Sub-tab toggle */}
      <View style={{ flexDirection: "row", margin: 16, backgroundColor: "#F1F5F9", borderRadius: 14, padding: 4 }}>
        {(["video", "course"] as SubTab[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setSubTab(t)} style={{ flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10, backgroundColor: subTab === t ? "#FFFFFF" : "transparent" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: subTab === t ? "#FF8C00" : "#94A3B8" }}>
              {t === "video" ? "📹 Upload Video" : "📚 Add Course"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

        {subTab === "video" && (
          <>
            {/* Course picker */}
            <Text style={lbl}>Select Course *</Text>
            <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={[inp, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
              <Text style={{ fontSize: 13, color: selectedCourse ? "#1E1B18" : "#94A3B8" }}>{selectedCourse?.name ?? "Choose a course..."}</Text>
              <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={14} color="#94A3B8" />
            </TouchableOpacity>

            {showPicker && (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 10, overflow: "hidden" }}>
                {courses.map((c, i) => (
                  <TouchableOpacity key={c.id} onPress={() => { setSelectedCourseId(c.id); setShowPicker(false); }}
                    style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: "#F1F5F9", backgroundColor: selectedCourseId === c.id ? "#FFFBF5" : "#FFFFFF", flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B18" }}>{c.name}</Text>
                    {selectedCourseId === c.id && <Ionicons name="checkmark-circle" size={16} color="#FF8C00" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={lbl}>Video Title *</Text>
            <TextInput style={inp} placeholder="e.g. Intro to Baking" placeholderTextColor="#C0CADD" value={vTitle} onChangeText={setVTitle} />
            
            <Text style={lbl}>Video File *</Text>
            <TouchableOpacity onPress={pickVideo} style={{ backgroundColor: "#F8FAFC", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E2E8F0", borderStyle: "dashed", marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="videocam-outline" size={24} color={videoAsset ? "#16A34A" : "#94A3B8"} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: videoAsset ? "#16A34A" : "#64748B" }}>
                  {videoAsset ? "Video Selected" : "Tap to upload video"}
                </Text>
                {videoAsset && (
                  <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>
                    {videoAsset.fileName || "video.mp4"}{vDur ? ` • ${vDur} mins` : ''}
                  </Text>
                )}
              </View>
              {videoAsset && (
                <TouchableOpacity onPress={() => setVideoAsset(null)}>
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <Text style={lbl}>Thumbnail Image</Text>
            <TouchableOpacity onPress={pickThumbnail} style={{ backgroundColor: "#F8FAFC", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E2E8F0", borderStyle: "dashed", marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="image-outline" size={24} color={thumbnailAsset ? "#16A34A" : "#94A3B8"} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: thumbnailAsset ? "#16A34A" : "#64748B" }}>
                  {thumbnailAsset ? "Thumbnail Selected" : "Tap to upload thumbnail (optional)"}
                </Text>
                {thumbnailAsset && <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>{thumbnailAsset.fileName || "image.jpg"}</Text>}
              </View>
              {thumbnailAsset && (
                <TouchableOpacity onPress={() => setThumbnailAsset(null)}>
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            <Text style={lbl}>Description</Text>
            <TextInput style={[inp, { height: 70, textAlignVertical: "top", paddingTop: 10 }]} placeholder="Short description" placeholderTextColor="#C0CADD" value={vDesc} onChangeText={setVDesc} multiline />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B18" }}>Free Preview</Text>
                <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Allow users to watch without buying</Text>
              </View>
              <Switch value={vFree} onValueChange={setVFree} trackColor={{ false: "#E2E8F0", true: "#FFE0B2" }} thumbColor={vFree ? "#FF8C00" : "#94A3B8"} />
            </View>
            <TouchableOpacity onPress={handleAddVideo} style={{ backgroundColor: "#FF8C00", borderRadius: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <Ionicons name="cloud-upload" size={18} color="#FFF" />
              <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 14 }}>Upload Video to Course</Text>
            </TouchableOpacity>
          </>
        )}

        {subTab === "course" && (
          <>
            <Text style={lbl}>Course Name *</Text>
            <TextInput style={inp} placeholder="e.g. Advanced Cake Baking" placeholderTextColor="#C0CADD" value={cName} onChangeText={setCName} />
            <Text style={lbl}>Description</Text>
            <TextInput style={[inp, { height: 80, textAlignVertical: "top", paddingTop: 10 }]} placeholder="What will students learn?" placeholderTextColor="#C0CADD" value={cDesc} onChangeText={setCDesc} multiline />
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <View style={{ flex: 1 }}><Text style={lbl}>Price (₹) *</Text><TextInput style={[inp, { marginBottom: 0 }]} placeholder="2999" placeholderTextColor="#C0CADD" value={cPrice} onChangeText={setCPrice} keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Text style={lbl}>Duration</Text><TextInput style={[inp, { marginBottom: 0 }]} placeholder="4 weeks" placeholderTextColor="#C0CADD" value={cDur} onChangeText={setCDur} /></View>
            </View>
            <Text style={[lbl, { marginTop: 10 }]}>Mode</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {["Online", "Offline", "Hybrid"].map(m => (
                <TouchableOpacity key={m} onPress={() => setCMode(cMode === m ? "" : m)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: cMode === m ? "#FF8C00" : "#FFFFFF", borderWidth: 1, borderColor: cMode === m ? "#FF8C00" : "#F0E6D8" }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: cMode === m ? "#FFF" : "#64748B" }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={handleCreateCourse} disabled={creatingC} style={{ backgroundColor: creatingC ? "#E2E8F0" : "#1E1B18", borderRadius: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}>
              {creatingC ? <ActivityIndicator color="#FF8C00" /> : <Ionicons name="add-circle" size={18} color="#FFF" />}
              <Text style={{ color: creatingC ? "#FF8C00" : "#FFF", fontWeight: "800", fontSize: 14 }}>{creatingC ? "Creating..." : "Create Course"}</Text>
            </TouchableOpacity>

            {/* Existing courses */}
            <Text style={[lbl, { marginTop: 24, marginBottom: 10 }]}>All Courses ({courses.length})</Text>
            <View style={{ gap: 10 }}>
              {courses.map(c => (
                <View key={c.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#F0E6D8" }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                    <Ionicons name="book" size={18} color="#FF8C00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E1B18" }} numberOfLines={1}>{c.name}</Text>
                    <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>₹{c.price} · {c.mode || "Online"}</Text>
                  </View>
                  <View style={{ backgroundColor: c.active !== false ? "#DCFCE7" : "#FEE2E2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 9, fontWeight: "800", color: c.active !== false ? "#166534" : "#B91C1C" }}>{c.active !== false ? "ACTIVE" : "INACTIVE"}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
