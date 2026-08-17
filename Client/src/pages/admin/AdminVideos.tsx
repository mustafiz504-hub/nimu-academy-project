import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video, Upload, Trash2, Plus, ChevronDown, X, CheckCircle,
  Loader2, AlertCircle, Play, Clock, Gift, Lock, ToggleLeft, ToggleRight, Edit2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { API_BASE_URL, getStoredToken } from '../../lib/api';
import { useGlobal } from '../../context/GlobalContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CourseVideo {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
}

// ── Global background upload store (singleton outside React) ──────────────────
interface BgUpload {
  id: string;
  title: string;
  progress: number;
  status: 'uploading' | 'saving' | 'done' | 'error';
  error?: string;
  message?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const authFetch = (path: string, opts: RequestInit = {}) => {
  const token = getStoredToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// ── Floating Upload Bubble ─────────────────────────────────────────────────────
function UploadBubble({ uploads, onDismiss }: { uploads: BgUpload[]; onDismiss: (id: string) => void }) {
  const active = uploads.filter((u) => u.status !== 'done' || true);
  if (active.length === 0) return null;

  return (
    <AnimatePresence>
      {active.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 min-w-[280px] max-w-xs"
        >
          {active.map((u) => {
            const isUploading = u.status === 'uploading' || u.status === 'uploading_to_cloud' || u.status === 'saving';
            return (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="relative flex items-center gap-3 bg-[#1a1610] border border-brand-gold/30 rounded-2xl px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden"
              >
                {/* Animated background glow */}
                {isUploading && (
                  <motion.div
                    className="absolute inset-0 bg-brand-gold/5"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Icon */}
                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  u.status === 'done' ? 'bg-emerald-500/20' :
                  !isUploading && u.status === 'error' ? 'bg-red-500/20' :
                  'bg-brand-gold/15'
                }`}>
                  {isUploading ? (
                    <div className="relative w-7 h-7">
                      {/* Circular progress ring */}
                      <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="11" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" fill="none" />
                        <circle
                          cx="14" cy="14" r="11"
                          stroke="#C9A84C"
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 11}`}
                          strokeDashoffset={`${2 * Math.PI * 11 * (1 - (u.progress || 0) / 100)}`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                        />
                      </svg>
                      <Video size={11} className="absolute inset-0 m-auto text-brand-gold" />
                    </div>
                  ) : u.status === 'done' ? (
                    <CheckCircle size={20} className="text-emerald-400" />
                  ) : (
                    <AlertCircle size={20} className="text-red-400" />
                  )}
                </div>

                {/* Text */}
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{u.title}</p>
                  <p className={`text-[11px] font-medium mt-0.5 truncate ${
                    u.status === 'done' ? 'text-emerald-400' :
                    !isUploading && u.status === 'error' ? 'text-red-400' :
                    'text-brand-cream/60'
                  }`}>
                    {u.message
                      ? u.message
                      : isUploading
                      ? `Uploading… ${u.progress || 0}%`
                      : u.status === 'done'
                      ? 'Upload complete!'
                      : u.error || 'Upload failed'}
                  </p>

                  {/* Progress bar */}
                  {isUploading && (
                    <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-gold to-[#f3cf65] rounded-full"
                        animate={{ width: `${u.status === 'saving' ? 100 : u.progress || 0}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>

                {/* Dismiss (only when done or error) */}
                {(!isUploading && (u.status === 'done' || u.status === 'error')) && (
                  <button
                    onClick={() => onDismiss(u.id)}
                  className="relative z-10 p-1 rounded-full hover:bg-white/10 text-brand-cream/40 hover:text-white transition-all"
                >
                  <X size={13} />
                </button>
              )}
            </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminVideos() {
  const { courses } = useGlobal();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveError, setSaveError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Background uploads state
  const [bgUploads, setBgUploads] = useState<BgUpload[]>([]);

  // Delete modal state
  const [videoToDelete, setVideoToDelete] = useState<CourseVideo | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [videoToEdit, setVideoToEdit] = useState<CourseVideo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsFree, setEditIsFree] = useState(false);
  const [updatingVideo, setUpdatingVideo] = useState(false);
  const [editError, setEditError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // ── Load videos ────────────────────────────────────────────────────────────
  const loadVideos = useCallback(async () => {
    if (!selectedCourseId) return;
    setVideosLoading(true);
    try {
      const res = await authFetch(`/courses/${selectedCourseId}/videos`);
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch { setVideos([]); }
    finally { setVideosLoading(false); }
  }, [selectedCourseId]);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  // ── File picker ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setSaveError('');

    // Auto-detect video duration
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    videoEl.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      if (videoEl.duration && !isNaN(videoEl.duration) && isFinite(videoEl.duration)) {
        const mins = Math.max(1, Math.ceil(videoEl.duration / 60));
        setDurationMinutes(mins.toString());
      }
    };
    videoEl.onerror = () => URL.revokeObjectURL(objectUrl);
    videoEl.src = objectUrl;
  };

  // ── Background upload via XHR to server (/upload/video) ────────────────
  const startBackgroundUpload = (
    file: File,
    videoTitle: string,
    videoDescription: string,
    videoDuration: string,
    videoIsFree: boolean,
    courseId: number
  ) => {
    const uploadId = `upload-${Date.now()}`;

    // Add bubble immediately
    setBgUploads((prev) => [
      ...prev,
      { id: uploadId, title: videoTitle, progress: 0, status: 'uploading', message: 'Starting upload...' },
    ]);

    // Close modal + reset form instantly
    setShowForm(false);
    setTitle('');
    setDescription('');
    setDurationMinutes('');
    setIsFree(false);
    setSelectedFile(null);
    setSaveError('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    // ─── Run upload in background (no await) ───────────────────────────────
    (async () => {
      let pollInterval: any = null;
      try {
        const token = getStoredToken();

        // Step 1: Upload to server via XHR (progress tracking)
        // Server will then stream chunked to R2 via multipart upload
        const r2VideoUrl = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;
          xhr.open('POST', `${API_BASE_URL}/upload/video?folder=courses&trackingId=${uploadId}`);
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          // Poller to check real-time cloud upload progress from server -> R2
          pollInterval = setInterval(async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/upload/progress?trackingId=${uploadId}`);
              if (res.ok) {
                const data = await res.json();
                if (data && (data.progress > 0 || data.message)) {
                  setBgUploads((prev) =>
                    prev.map((u) =>
                      u.id === uploadId
                        ? {
                            ...u,
                            progress: Math.max(u.progress, data.progress || 0),
                            status: (data.status === 'done' || data.status === 'uploading_to_cloud') ? 'uploading' : (data.status || u.status),
                            message: data.message || u.message,
                          }
                        : u
                    )
                  );
                }
              }
            } catch {}
          }, 400);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const localPct = Math.round((e.loaded / e.total) * 18); // Local transfer is 0% to 18% of total job
              setBgUploads((prev) =>
                prev.map((u) =>
                  u.id === uploadId
                    ? {
                        ...u,
                        progress: Math.max(u.progress, localPct),
                        message: `Sending to server (${Math.round((e.loaded / e.total) * 100)}%)...`,
                      }
                    : u
                )
              );
            }
          };

          xhr.onload = () => {
            if (pollInterval) clearInterval(pollInterval);
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.videoUrl) {
                  resolve(data.videoUrl);
                } else {
                  reject(new Error('No video URL returned from server'));
                }
              } catch {
                reject(new Error('Invalid response from server'));
              }
            } else {
              try {
                const errData = JSON.parse(xhr.responseText);
                reject(new Error(errData.message || `Upload failed (${xhr.status})`));
              } catch {
                reject(new Error(`Server upload failed (${xhr.status})`));
              }
            }
          };

          xhr.onerror = () => {
            if (pollInterval) clearInterval(pollInterval);
            reject(new Error('Network error during upload'));
          };

          const formData = new FormData();
          formData.append('video', file);
          xhr.send(formData);
        });

        if (pollInterval) clearInterval(pollInterval);

        // Step 2: Save metadata to DB
        setBgUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, status: 'saving', progress: 98, message: 'Saving course video to database...' } : u))
        );

        const res = await fetch(`${API_BASE_URL}/courses/${courseId}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: videoTitle,
            description: videoDescription || undefined,
            video_url: r2VideoUrl,
            duration_minutes: Number(videoDuration) || 0,
            is_free: videoIsFree,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to save video record');
        }

        // Done!
        setBgUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, status: 'done', progress: 100, message: 'Upload complete!' } : u))
        );

        // Refresh video list if same course is selected
        if (selectedCourseId === courseId) {
          await loadVideos();
        }

        // Auto-dismiss bubble after 5s
        setTimeout(() => {
          setBgUploads((prev) => prev.filter((u) => u.id !== uploadId));
        }, 5000);

      } catch (err: any) {
        if (pollInterval) clearInterval(pollInterval);
        setBgUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? { ...u, status: 'error', error: err.message || 'Upload failed', message: err.message || 'Upload failed' }
              : u
          )
        );
      }
    })();
  };

  // ── Start upload (closes modal immediately) ────────────────────────────────
  const handleSave = () => {
    if (!selectedCourseId || !title.trim()) {
      setSaveError('Please select a course and enter a video title.');
      return;
    }
    if (!selectedFile) {
      setSaveError('Please select a video file to upload.');
      return;
    }

    startBackgroundUpload(
      selectedFile,
      title.trim(),
      description.trim(),
      durationMinutes,
      isFree,
      selectedCourseId
    );
  };

  // ── Confirm Delete video ───────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!videoToDelete || !selectedCourseId) return;
    setDeleting(true);
    try {
      await authFetch(`/courses/${selectedCourseId}/videos/${videoToDelete.id}`, { method: 'DELETE' });
      setVideoToDelete(null);
      await loadVideos();
    } catch {
      alert('Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Handle Edit video ──────────────────────────────────────────────────────
  const openEditModal = (video: CourseVideo) => {
    setVideoToEdit(video);
    setEditTitle(video.title);
    setEditDescription(video.description || '');
    setEditIsFree(video.is_free);
    setEditError('');
  };

  const closeEditModal = () => {
    setVideoToEdit(null);
    setEditTitle('');
    setEditDescription('');
    setEditIsFree(false);
    setEditError('');
  };

  const handleUpdateVideo = async () => {
    if (!videoToEdit || !selectedCourseId) return;
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    
    setUpdatingVideo(true);
    try {
      const res = await authFetch(`/courses/${selectedCourseId}/videos/${videoToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          is_free: editIsFree
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }
      
      await loadVideos();
      closeEditModal();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update video');
    } finally {
      setUpdatingVideo(false);
    }
  };

  const resetForm = () => {
    // Only close if no active upload in progress
    setTitle(''); setDescription(''); setDurationMinutes('');
    setIsFree(false); setSelectedFile(null); setSaveError('');
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Floating upload bubbles */}
      <UploadBubble
        uploads={bgUploads}
        onDismiss={(id) => setBgUploads((prev) => prev.filter((u) => u.id !== id))}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {videoToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => !deleting && setVideoToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#181511] border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 p-7 text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                <Trash2 size={32} />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-white">Delete Lesson?</h3>
                <p className="text-sm text-brand-cream/60 leading-relaxed px-2">
                  Are you sure you want to delete <span className="text-white font-semibold">"{videoToDelete.title}"</span>? This action cannot be undone and will permanently remove the lesson and its video.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setVideoToDelete(null)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/5 text-brand-cream/70 font-bold text-sm hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} /> Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Video Modal */}
      <AnimatePresence>
        {videoToEdit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => !updatingVideo && closeEditModal()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-brand-dark border border-brand-gold/25 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-serif font-bold text-brand-gold">Edit Video Lesson</h2>
                  <p className="text-brand-cream/40 text-xs mt-1">Course: {selectedCourse?.title}</p>
                </div>
                <button onClick={() => !updatingVideo && closeEditModal()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-brand-cream/60 transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Form body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
                {editError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-3 text-red-300 text-sm">
                    <AlertCircle size={16} /> {editError}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest">Video Title *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Introduction to Baking"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-brand-gold/50 text-white placeholder:text-brand-cream/25 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of this lesson…"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-brand-gold/50 text-white resize-none placeholder:text-brand-cream/25 transition-colors"
                  />
                </div>

                {/* Free preview toggle */}
                <div
                  onClick={() => setEditIsFree(!editIsFree)}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/[0.07] transition-all select-none"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest block">Free Preview</span>
                    <p className="text-xs text-brand-cream/70 font-medium">
                      {editIsFree ? 'Unlocked (Free for all students)' : 'Locked (Requires Course Purchase)'}
                    </p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${editIsFree ? 'bg-emerald-500' : 'bg-white/20'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${editIsFree ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-white/10 flex gap-3 bg-white/5">
                <button
                  onClick={() => !updatingVideo && closeEditModal()}
                  disabled={updatingVideo}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-brand-cream/70 font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVideo}
                  disabled={updatingVideo || !editTitle.trim()}
                  className="flex-[2] py-3 rounded-2xl bg-brand-gold text-brand-dark font-bold shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingVideo ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {updatingVideo ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
            <Video size={28} className="text-brand-gold" /> Course Videos
          </h1>
          <p className="text-brand-cream/40 mt-1">Upload &amp; manage video lessons for each course</p>
        </div>
        {selectedCourseId && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-3 rounded-2xl font-bold hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20"
          >
            <Plus size={18} /> Upload Video
          </button>
        )}
      </div>

      {/* Course Selector */}
      <div className="mb-8">
        <label className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest mb-2 block">
          Select Course
        </label>
        <div className="relative w-full max-w-sm">
          <button
            onClick={() => setShowCourseDropdown(!showCourseDropdown)}
            className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 hover:border-brand-gold/40 px-5 py-3.5 rounded-2xl transition-all"
          >
            <span className="text-sm font-semibold text-white truncate">
              {selectedCourse?.title ?? 'Choose a course…'}
            </span>
            <ChevronDown size={16} className="text-brand-cream/40 shrink-0" />
          </button>
          <AnimatePresence>
            {showCourseDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCourseDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full mt-2 left-0 z-20 w-full bg-brand-dark border border-brand-gold/20 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {courses.map((course) => {
                      const isFreeC = Number(course.price) === 0;
                      const isSelected = course.id === selectedCourseId;
                      return (
                        <button
                          key={course.id}
                          onClick={() => { setSelectedCourseId(course.id); setShowCourseDropdown(false); resetForm(); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${isSelected ? 'bg-brand-gold/10 text-brand-gold' : 'hover:bg-white/5 text-brand-cream/80'}`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isFreeC ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                            {isFreeC ? <Gift size={13} className="text-emerald-400" /> : <Lock size={13} className="text-brand-cream/30" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{course.title}</p>
                            <p className="text-xs text-brand-cream/35">{isFreeC ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`}</p>
                          </div>
                          {isSelected && <CheckCircle size={15} className="text-brand-gold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-brand-dark border border-brand-gold/25 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-serif font-bold text-brand-gold">Upload Video</h2>
                  <p className="text-brand-cream/40 text-xs mt-1">Course: {selectedCourse?.title}</p>
                </div>
                <button onClick={resetForm} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-brand-cream/60 transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Form body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
                {saveError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-3 text-red-300 text-sm">
                    <AlertCircle size={16} /> {saveError}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest">Video Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Introduction to Baking"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-brand-gold/50 text-white placeholder:text-brand-cream/25 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description of this lesson…"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-brand-gold/50 text-white resize-none placeholder:text-brand-cream/25 transition-colors"
                  />
                </div>

                {/* Free preview toggle (iOS style) */}
                <div
                  onClick={() => setIsFree(!isFree)}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/[0.07] transition-all select-none"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest block">Free Preview</span>
                    <p className="text-xs text-brand-cream/70 font-medium">
                      {isFree ? 'Unlocked (Free for all students)' : 'Locked (Requires Course Purchase)'}
                    </p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isFree ? 'bg-emerald-500' : 'bg-white/20'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isFree ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* File picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/50 uppercase tracking-widest">Video File *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      selectedFile
                        ? 'border-brand-gold/50 bg-brand-gold/5'
                        : 'border-white/10 hover:border-brand-gold/30 bg-white/[0.02]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="space-y-1">
                        <Video size={28} className="mx-auto text-brand-gold" />
                        <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
                        <p className="text-xs text-brand-cream/40">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                          {durationMinutes ? ` • ${durationMinutes} min${Number(durationMinutes) > 1 ? 's' : ''} auto-detected` : ''}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={28} className="mx-auto text-brand-cream/30" />
                        <p className="text-sm text-brand-cream/50">Click to pick a video file</p>
                        <p className="text-xs text-brand-cream/30">MP4, MOV, AVI supported</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info about background upload */}
                {selectedFile && (
                  <div className="flex items-start gap-2.5 bg-brand-gold/5 border border-brand-gold/20 rounded-xl px-4 py-3">
                    <Upload size={14} className="text-brand-gold mt-0.5 shrink-0" />
                    <p className="text-xs text-brand-cream/60 leading-relaxed">
                      Upload starts in background. You can close this modal and continue browsing — a progress bubble will appear at the bottom right.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-white/10 flex gap-3 bg-white/5">
                <button onClick={resetForm} className="flex-1 py-3 rounded-2xl border border-white/10 text-brand-cream/70 font-bold hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedFile || !title.trim()}
                  className="flex-[2] py-3 rounded-2xl bg-brand-gold text-brand-dark font-bold shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={18} /> Upload &amp; Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Videos grid */}
      {!selectedCourseId ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-brand-cream/30">
          <Video size={52} />
          <p className="text-base font-medium">Select a course above to manage its videos</p>
        </div>
      ) : videosLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-brand-gold" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Video size={52} className="text-brand-cream/20" />
          <p className="text-brand-cream/40 font-medium">No videos yet for this course</p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-brand-gold/90 transition-all"
          >
            <Plus size={16} /> Upload First Video
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:border-brand-gold/20 transition-all group"
            >
              {/* Index */}
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-brand-cream/40">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Play icon */}
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center shrink-0">
                <Play size={16} className="text-brand-gold ml-0.5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{video.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-brand-cream/40">
                    <Clock size={11} /> {video.duration_minutes} min
                  </span>
                  {video.is_free && (
                    <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">FREE</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                <button
                  onClick={() => openEditModal(video)}
                  className="p-2 rounded-xl bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold transition-all"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setVideoToDelete(video)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
