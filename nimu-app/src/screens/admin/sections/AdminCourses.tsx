import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Switch, KeyboardAvoidingView, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useCourseStore } from "../../../store/course.store";
import { adminService } from "../../../services/admin.service";
import { useUploadStore } from "../../../store/upload.store";
import { useAppAlert } from "../../../components/common/AppAlert";

type SubTab = "video" | "course";

export default function AdminCourses() {
  const { courses, courseVideos, fetchAllCourses, refreshAllCourses, refreshCourseVideos } = useCourseStore();
  const appAlert = useAppAlert();
  const [subTab, setSubTab] = useState<SubTab>("video");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);
  const [priceModal, setPriceModal] = useState<{ course: any } | null>(null);
  const [priceInput, setPriceInput] = useState("");

  React.useEffect(() => { fetchAllCourses(); }, [fetchAllCourses]);

  React.useEffect(() => {
    if (selectedCourseId) {
      refreshCourseVideos(selectedCourseId);
    }
  }, [selectedCourseId, refreshCourseVideos]);

  // Make Free: confirmation → API call
  const handleMakeFree = useCallback((course: any) => {
    appAlert.show({
      title: "Make Free",
      message: `Set "${course.name}" as a FREE course? The price will be changed to ₹0.`,
      type: "warning",
      icon: "gift-outline",
      buttons: [
        { text: "Cancel", style: "secondary" },
        {
          text: "Make Free",
          style: "danger",
          onPress: async () => {
            setTogglingCourseId(course.id);
            try {
              await adminService.updateCourse(course.id, { price: 0 });
              await refreshAllCourses();
            } catch (e: any) {
              appAlert.show({ title: "Error", message: e?.response?.data?.message || "Failed to update course.", type: "danger" });
            } finally {
              setTogglingCourseId(null);
            }
          }
        }
      ]
    });
  }, [refreshAllCourses, appAlert]);

  // Make Paid: open price input modal
  const handleMakePaid = useCallback((course: any) => {
    setPriceInput("");
    setPriceModal({ course });
  }, []);

  const handleConfirmPaid = useCallback(async () => {
    if (!priceModal) return;
    const price = parseFloat(priceInput);
    if (!priceInput || isNaN(price) || price <= 0) {
      appAlert.show({ title: "Invalid Price", message: "Please enter a valid price (e.g. 999).", type: "warning" });
      return;
    }
    const course = priceModal.course;
    setPriceModal(null);
    setTogglingCourseId(course.id);
    try {
      await adminService.updateCourse(course.id, { price });
      await refreshAllCourses();
    } catch (e: any) {
      appAlert.show({ title: "Error", message: e?.response?.data?.message || "Failed to update price.", type: "danger" });
    } finally {
      setTogglingCourseId(null);
    }
  }, [priceModal, priceInput, refreshAllCourses, appAlert]);

  const handleToggleFree = useCallback((course: any) => {
    const isFree = parseFloat(course.price) === 0;
    if (isFree) {
      handleMakePaid(course);
    } else {
      handleMakeFree(course);
    }
  }, [handleMakePaid, handleMakeFree]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const [videoToEdit, setVideoToEdit] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFree, setEditFree] = useState(false);
  const [updatingVideo, setUpdatingVideo] = useState(false);

  // ── Video form ────────────────────────────────────────────────────────────
  const [showPicker, setShowPicker] = useState(false);
  const [vTitle, setVTitle] = useState("");
  const [videoAsset, setVideoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
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
  const [cThumbnailAsset, setCThumbnailAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [creatingC, setCreatingC] = useState(false);


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

  const pickCourseThumbnail = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setCThumbnailAsset(result.assets[0]);
  };

  const handleAddVideo = useCallback(() => {
    if (!selectedCourseId) { appAlert.show({ title: "Required", message: "Please select a course first.", type: "warning" }); return; }
    if (!vTitle.trim() || !videoAsset) { appAlert.show({ title: "Required", message: "Title and video file are required.", type: "warning" }); return; }
    
    const taskId = Date.now().toString();
    const title = vTitle.trim();
    const courseId = selectedCourseId;
    const vAsset = videoAsset;
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
    
    appAlert.show({ title: "Upload Started", message: `"${title}" is uploading in the background. Check progress in the floating indicator.`, type: "info", icon: "cloud-upload-outline" });
    
    // Clear form immediately
    setVTitle(""); setVideoAsset(null); setVDesc(""); setVDur(""); setVFree(false);
    
    // Background upload process
    (async () => {
      try {
        const videoUrl = await adminService.uploadMediaToCloudinary(vAsset.uri, 'video', 'courses', (prog) => {
          // Since video is usually 90% of the wait time, we'll map video upload progress to 0-90%
          updateProgress(taskId, Math.floor(prog * 0.9));
        });
        
        updateProgress(taskId, 95); // Almost done
        
        await adminService.addVideo(courseId, { 
          title: title, 
          description: desc || undefined, 
          video_url: videoUrl, 
          duration_minutes: duration, 
          is_free: isFree 
        });
        
        await refreshCourseVideos(courseId);
        completeTask(taskId);
      } catch (e: any) {
        failTask(taskId, e?.message || e?.response?.data?.message || "Failed.");
      }
    })();
  }, [selectedCourseId, vTitle, videoAsset, vDesc, vDur, vFree, addTask, updateProgress, completeTask, failTask, refreshCourseVideos]);

  const handleCreateCourse = useCallback(async () => {
    if (!cName.trim() || !cPrice.trim()) { appAlert.show({ title: "Required", message: "Course name and price are required.", type: "warning" }); return; }
    try {
      setCreatingC(true);
      
      let thumbnailUrl;
      if (cThumbnailAsset) {
        thumbnailUrl = await adminService.uploadMediaToCloudinary(cThumbnailAsset.uri, 'image', 'courses');
      }

      await adminService.createCourse({ 
        name: cName.trim(), 
        description: cDesc.trim() || undefined, 
        duration: cDur.trim() || undefined, 
        price: parseFloat(cPrice), 
        mode: cMode || undefined,
        thumbnail_url: thumbnailUrl
      });
      await refreshAllCourses();
      appAlert.show({ title: "Course Created", message: `"${cName}" has been created successfully.`, type: "success" });
      setCName(""); setCDesc(""); setCPrice(""); setCDur(""); setCMode(""); setCThumbnailAsset(null);
    } catch (e: any) { appAlert.show({ title: "Error", message: e?.response?.data?.message || "Failed to create course.", type: "danger" }); }
    finally { setCreatingC(false); }
  }, [cName, cDesc, cPrice, cDur, cMode, cThumbnailAsset, refreshAllCourses, appAlert]);

  const handleUpdateVideo = useCallback(async () => {
    if (!videoToEdit || !selectedCourseId) return;
    if (!editTitle.trim()) { appAlert.show({ title: "Required", message: "Video title is required.", type: "warning" }); return; }
    try {
      setUpdatingVideo(true);
      await adminService.updateVideo(selectedCourseId, videoToEdit.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        is_free: editFree
      });
      await refreshCourseVideos(selectedCourseId);
      setVideoToEdit(null);
    } catch (e: any) {
      appAlert.show({ title: "Error", message: e?.response?.data?.message || e?.message || "Failed to update video.", type: "danger" });
    } finally {
      setUpdatingVideo(false);
    }
  }, [videoToEdit, selectedCourseId, editTitle, editDesc, editFree, refreshCourseVideos, appAlert]);

  const handleDeleteVideo = useCallback(async (videoId: string, title: string) => {
    if (!selectedCourseId) return;
    appAlert.show({
      title: "Delete Video",
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      type: "danger",
      buttons: [
        { text: "Cancel", style: "secondary" },
        { text: "Delete", style: "danger", onPress: async () => {
          try {
            await adminService.deleteVideo(selectedCourseId, videoId);
            await refreshCourseVideos(selectedCourseId);
          } catch (e: any) {
            appAlert.show({ title: "Error", message: e?.response?.data?.message || "Failed to delete video.", type: "danger" });
          }
        }}
      ]
    });
  }, [selectedCourseId, refreshCourseVideos, appAlert]);

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
            <TouchableOpacity onPress={() => { if (!showPicker) fetchAllCourses(); setShowPicker(!showPicker); }} style={[inp, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
              <Text style={{ fontSize: 13, color: selectedCourse ? "#1E1B18" : "#94A3B8" }}>{selectedCourse?.name ?? "Choose a course..."}</Text>
              <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={14} color="#94A3B8" />
            </TouchableOpacity>

            {showPicker && (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#F0E6D8", marginBottom: 10, overflow: "hidden" }}>
                {courses.length === 0 ? (
                  <View style={{ padding: 20, alignItems: "center", gap: 8 }}>
                    <Ionicons name="book-outline" size={28} color="#C0CADD" />
                    <Text style={{ fontSize: 13, color: "#94A3B8", textAlign: "center" }}>
                      Koi course nahi mila.{"\n"}Pehle "Add Course" tab se course banayein.
                    </Text>
                    <TouchableOpacity onPress={() => fetchAllCourses()} style={{ marginTop: 4, backgroundColor: "#FFF3E0", paddingVertical: 7, paddingHorizontal: 16, borderRadius: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#FF8C00" }}>🔄 Refresh</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  courses.map((c, i) => (
                    <TouchableOpacity key={c.id} onPress={() => { setSelectedCourseId(c.id); setShowPicker(false); }}
                      style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: "#F1F5F9", backgroundColor: selectedCourseId === c.id ? "#FFFBF5" : "#FFFFFF", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B18" }}>{c.name}</Text>
                        <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                          {parseFloat(c.price) === 0 ? "FREE" : `₹${c.price}`} · {c.mode || "Online"}
                        </Text>
                      </View>
                      {selectedCourseId === c.id && <Ionicons name="checkmark-circle" size={18} color="#FF8C00" />}
                    </TouchableOpacity>
                  ))
                )}
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

            {/* Course Videos List */}
            {selectedCourseId !== "" && (
              <>
                <Text style={[lbl, { marginTop: 24, marginBottom: 10 }]}>Uploaded Videos ({(courseVideos[selectedCourseId] || []).length})</Text>
                <View style={{ gap: 10 }}>
                  {(courseVideos[selectedCourseId] || []).map(v => (
                    <View key={v.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#F0E6D8" }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                          <Ionicons name="play" size={18} color="#FF8C00" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E1B18" }} numberOfLines={1}>{v.title}</Text>
                          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{v.duration_minutes || 0} mins {v.is_free ? '· FREE' : ''}</Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TouchableOpacity onPress={() => { setVideoToEdit(v); setEditTitle(v.title); setEditDesc(v.description || ""); setEditFree(v.is_free); }} style={{ padding: 8, backgroundColor: "#F1F5F9", borderRadius: 8 }}>
                            <Ionicons name="pencil" size={16} color="#3B82F6" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteVideo(v.id, v.title)} style={{ padding: 8, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
                            <Ionicons name="trash" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                  {(courseVideos[selectedCourseId] || []).length === 0 && (
                    <Text style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 10 }}>No videos uploaded for this course yet.</Text>
                  )}
                </View>
              </>
            )}
          </>
        )}

        {subTab === "course" && (
          <>
            <Text style={lbl}>Course Name *</Text>
            <TextInput style={inp} placeholder="e.g. Advanced Cake Baking" placeholderTextColor="#C0CADD" value={cName} onChangeText={setCName} />
            <Text style={lbl}>Course Thumbnail</Text>
            <TouchableOpacity onPress={pickCourseThumbnail} style={{ backgroundColor: "#F8FAFC", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E2E8F0", borderStyle: "dashed", marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="image-outline" size={24} color={cThumbnailAsset ? "#16A34A" : "#94A3B8"} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: cThumbnailAsset ? "#16A34A" : "#64748B" }}>
                  {cThumbnailAsset ? "Thumbnail Selected" : "Tap to upload course thumbnail"}
                </Text>
                {cThumbnailAsset && <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>{cThumbnailAsset.fileName || "image.jpg"}</Text>}
              </View>
              {cThumbnailAsset && (
                <TouchableOpacity onPress={() => setCThumbnailAsset(null)}>
                  <Ionicons name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
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
              {courses.map(c => {
                  const isFree = parseFloat(c.price) === 0;
                  const isToggling = togglingCourseId === c.id;
                  return (
                    <View key={c.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#F0E6D8" }}>
                      {/* Top row: icon + name + ACTIVE badge */}
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginRight: 12, overflow: "hidden" }}>
                          {c.thumbnail_url ? (
                            <Image source={{ uri: c.thumbnail_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                          ) : (
                            <Ionicons name="book" size={18} color="#FF8C00" />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E1B18" }} numberOfLines={1}>{c.name}</Text>
                          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                            {isFree ? "FREE" : `₹${c.price}`} · {c.mode || "Online"}
                          </Text>
                        </View>
                        <View style={{ backgroundColor: c.active !== false ? "#DCFCE7" : "#FEE2E2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ fontSize: 9, fontWeight: "800", color: c.active !== false ? "#166534" : "#B91C1C" }}>{c.active !== false ? "ACTIVE" : "INACTIVE"}</Text>
                        </View>
                      </View>

                      {/* Free / Paid toggle row */}
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: isFree ? "#DCFCE7" : "#FEF3C7" }}>
                            <Text style={{ fontSize: 10, fontWeight: "800", color: isFree ? "#166534" : "#92400E" }}>
                              {isFree ? "🆓 FREE" : `💰 PAID · ₹${c.price}`}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleToggleFree(c)}
                          disabled={isToggling}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            backgroundColor: isFree ? "#FF8C00" : "#16A34A",
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                            opacity: isToggling ? 0.6 : 1,
                          }}
                        >
                          {isToggling
                            ? <ActivityIndicator size="small" color="#FFF" />
                            : <Ionicons name={isFree ? "cash-outline" : "gift-outline"} size={14} color="#FFF" />
                          }
                          <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>
                            {isToggling ? "Updating..." : (isFree ? "Make Paid" : "Make Free")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit Video Modal */}
      {videoToEdit && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 100, padding: 20 }}>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, width: "100%", padding: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E1B18" }}>Edit Video</Text>
              <TouchableOpacity onPress={() => setVideoToEdit(null)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={lbl}>Video Title *</Text>
            <TextInput style={inp} value={editTitle} onChangeText={setEditTitle} />
            
            <Text style={lbl}>Description</Text>
            <TextInput style={[inp, { height: 70, textAlignVertical: "top" }]} value={editDesc} onChangeText={setEditDesc} multiline />
            
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B18" }}>Free Preview</Text>
                <Text style={{ fontSize: 11, color: "#94A3B8" }}>Allow users to watch without buying</Text>
              </View>
              <Switch value={editFree} onValueChange={setEditFree} trackColor={{ false: "#E2E8F0", true: "#FFE0B2" }} thumbColor={editFree ? "#FF8C00" : "#94A3B8"} />
            </View>
            
            <TouchableOpacity onPress={handleUpdateVideo} disabled={updatingVideo} style={{ backgroundColor: updatingVideo ? "#E2E8F0" : "#FF8C00", borderRadius: 14, paddingVertical: 14, alignItems: "center" }}>
              {updatingVideo ? <ActivityIndicator color="#FF8C00" /> : <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 14 }}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Price Input Modal (Make Paid) */}
      {priceModal && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", zIndex: 200, padding: 24 }}>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, width: "100%", padding: 24, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E1B18" }}>💰 Make Paid</Text>
              <TouchableOpacity onPress={() => setPriceModal(null)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }} numberOfLines={2}>
              "{priceModal.course.name}" ke liye price set karein
            </Text>

            {/* Price Input */}
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Price (₹) *</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#FF8C00", paddingHorizontal: 14, marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#FF8C00", marginRight: 6 }}>₹</Text>
              <TextInput
                style={{ flex: 1, fontSize: 22, fontWeight: "700", color: "#1E1B18", paddingVertical: 12 }}
                placeholder="0"
                placeholderTextColor="#C0CADD"
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Quick price chips */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {["499", "999", "1999", "2999"].map(p => (
                <TouchableOpacity key={p} onPress={() => setPriceInput(p)}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, backgroundColor: priceInput === p ? "#FF8C00" : "#F1F5F9", borderWidth: 1, borderColor: priceInput === p ? "#FF8C00" : "#E2E8F0" }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: priceInput === p ? "#FFF" : "#64748B" }}>₹{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setPriceModal(null)}
                style={{ flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center", backgroundColor: "#F1F5F9" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#64748B" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmPaid}
                style={{ flex: 2, paddingVertical: 13, borderRadius: 14, alignItems: "center", backgroundColor: "#FF8C00", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                <Ionicons name="cash-outline" size={16} color="#FFF" />
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFF" }}>Paid Karo ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
