import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ChevronDown, Lock, Unlock, Gift, CheckCircle, Clock,
  BookOpen, Layers, ChevronRight, Loader2, Maximize, Minimize
} from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CourseVideo {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
}

interface ApiCourseVideo { id: number; course_id: number; title: string; description?: string; video_url: string; thumbnail_url?: string; duration_minutes: number; order_index: number; is_free: boolean; }

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatTime(secs: number): string {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Video Player Component ───────────────────────────────────────────────────
interface PlayerProps {
  videoUrl: string;
  title: string;
  onEnded?: () => void;
}

function VideoPlayer({ videoUrl, title, onEnded }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Reset when URL changes
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
  }, [videoUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || !!(document as any).webkitFullscreenElement
      );
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
    resetHideTimer();
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + delta, v.duration || 0));
    resetHideTimer();
  };

  const handleProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !videoRef.current || !duration) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = ratio * duration;
    resetHideTimer();
  };

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setShowSpeedMenu(false);
    resetHideTimer();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black group select-none flex items-center justify-center overflow-hidden ${
        isFullscreen ? 'h-screen' : duration ? 'min-h-[240px]' : 'aspect-video'
      }`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className={`w-full block mx-auto ${
          isFullscreen ? 'h-full object-contain' : 'h-auto max-h-[82vh] object-contain'
        }`}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onProgress={(e) => {
          const v = e.currentTarget;
          if (v.buffered.length > 0 && v.duration) {
            setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
          }
        }}
        onEnded={() => { setPlaying(false); setShowControls(true); onEnded?.(); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        muted={muted}
      />

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.75) 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top: title */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-white text-sm font-semibold drop-shadow line-clamp-1">{title}</p>
            </div>

            {/* Center: skip + play */}
            <div className="flex items-center justify-center gap-8">
              <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition">
                <SkipBack size={28} />
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-brand-gold/90 hover:bg-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/30 transition"
              >
                {playing
                  ? <Pause size={26} className="text-brand-dark" />
                  : <Play size={26} className="text-brand-dark ml-1" />}
              </button>
              <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition">
                <SkipForward size={28} />
              </button>
            </div>

            {/* Bottom: seek + controls */}
            <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
              {/* Seek bar */}
              <div
                ref={progressRef}
                className="relative h-1.5 rounded-full bg-white/20 cursor-pointer group/seek"
                onClick={handleProgress}
              >
                <div className="absolute h-full rounded-full bg-white/30" style={{ width: `${buffered}%` }} />
                <div className="absolute h-full rounded-full bg-brand-gold transition-all" style={{ width: `${progress}%` }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-brand-gold shadow border-2 border-white opacity-0 group-hover/seek:opacity-100 transition"
                  style={{ left: `calc(${progress}% - 7px)` }}
                />
              </div>

              {/* Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="text-white hover:text-brand-gold transition">
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button onClick={() => setMuted(!muted)} className="text-white/80 hover:text-white transition">
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <span className="text-white/70 text-xs font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Speed & Fullscreen */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="flex items-center gap-1 text-white/70 hover:text-white text-xs font-bold bg-black/40 px-2.5 py-1 rounded-full transition"
                    >
                      {speed === 1 ? '1×' : `${speed}×`}
                      <ChevronDown size={12} />
                    </button>
                    <AnimatePresence>
                      {showSpeedMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute bottom-9 right-0 bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[110px]"
                        >
                          {SPEEDS.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSpeedChange(s)}
                              className={`w-full px-4 py-2 text-left text-sm transition ${speed === s ? 'text-brand-gold font-bold bg-brand-gold/10' : 'text-white/80 hover:bg-white/5'}`}
                            >
                              {s === 1 ? 'Normal' : `${s}×`}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="text-white/80 hover:text-white transition p-1"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main LearnPage ───────────────────────────────────────────────────────────
export default function LearnPage() {
  const { courses, coursesLoading, user, myEnrollments } = useGlobal();
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Sort free courses first
  const sortedCourses = [...courses].sort((a, b) => {
    const aFree = Number(a.price) === 0 ? 0 : 1;
    const bFree = Number(b.price) === 0 ? 0 : 1;
    return aFree - bFree;
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;
  const isFreeCourse = Number(selectedCourse?.price) === 0;

  // Auto-select first free course
  useEffect(() => {
    if (courses.length === 0) return;
    if (selectedCourseId !== null) return;
    const first = sortedCourses[0];
    if (first) setSelectedCourseId(first.id);
  }, [courses]);

  // Fetch videos when course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    setVideos([]);
    setActiveVideo(null);
    setVideosLoading(true);

    const token = localStorage.getItem('nimu_auth_token');
    fetch(`${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000/api'}/courses/${selectedCourseId}/videos`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        const vids: CourseVideo[] = (data.videos ?? []).map((v: ApiCourseVideo) => ({
          id: v.id,
          course_id: v.course_id,
          title: v.title,
          description: v.description,
          video_url: v.video_url,
          thumbnail_url: v.thumbnail_url,
          duration_minutes: v.duration_minutes,
          order_index: v.order_index,
          is_free: v.is_free,
        }));
        setVideos(vids);
        if (vids.length > 0) setActiveVideo(vids[0]);
      })
      .catch(console.error)
      .finally(() => setVideosLoading(false));
  }, [selectedCourseId]);

  // Check enrollment status directly from DB confirmed enrollments
  const isEnrolled = myEnrollments.some(
    (e) => String(e.course_id) === String(selectedCourseId) && (e.status === 'confirmed' || e.status === 'completed')
  );
  const isUnlocked = isFreeCourse || isEnrolled;

  const handlePlayVideo = (video: CourseVideo) => {
    if (!isUnlocked && !video.is_free) {
      if (!user) {
        alert('Please sign in to access premium courses.');
        navigate('/auth');
      }
      // Set active video anyway so the lock screen renders for this video
      setActiveVideo(video);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!activeVideo) return;
    const idx = videos.findIndex((v) => v.id === activeVideo.id);
    if (idx < videos.length - 1) setActiveVideo(videos[idx + 1]);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream">
      <Nav />

      <div className="pt-20">
        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-b from-black/60 to-brand-dark border-b border-brand-gold/15 px-4 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={18} className="text-brand-gold" />
                  <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Learn</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                  Course <span className="text-brand-gold">Videos</span>
                </h1>
                <p className="text-brand-cream/50 mt-1 text-sm">
                  Watch & learn from Nimu Academy's expert-led lessons
                </p>
              </div>

              {/* Course switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                  className="flex items-center gap-3 bg-white/5 border border-brand-gold/20 hover:border-brand-gold/50 px-5 py-3 rounded-2xl transition-all max-w-xs"
                >
                  <Layers size={16} className="text-brand-gold shrink-0" />
                  <span className="text-sm font-semibold text-white truncate max-w-[160px]">
                    {selectedCourse?.title ?? 'Select Course'}
                  </span>
                  <ChevronDown size={16} className="text-brand-cream/40 shrink-0" />
                </button>

                <AnimatePresence>
                  {showCourseDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCourseDropdown(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full mt-2 right-0 z-20 w-72 bg-brand-dark border border-brand-gold/20 rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-[10px] uppercase tracking-widest text-brand-gold/70 font-black">Switch Course</p>
                        </div>
                        {coursesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 size={20} className="animate-spin text-brand-gold" />
                          </div>
                        ) : (
                          <div className="max-h-72 overflow-y-auto custom-scrollbar">
                            {sortedCourses.map((course) => {
                              const isFree = Number(course.price) === 0;
                              const isSelected = course.id === selectedCourseId;
                              return (
                                <button
                                  key={course.id}
                                  onClick={() => { setSelectedCourseId(course.id); setShowCourseDropdown(false); }}
                                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${isSelected ? 'bg-brand-gold/10 text-brand-gold' : 'hover:bg-white/5 text-brand-cream/80'}`}
                                >
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isFree ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                    {isFree
                                      ? <Gift size={14} className="text-emerald-400" />
                                      : <Lock size={14} className="text-brand-cream/30" />
                                    }
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{course.title}</p>
                                    <p className="text-xs text-brand-cream/40">
                                      {isFree ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`}
                                    </p>
                                  </div>
                                  {isFree && (
                                    <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full shrink-0">FREE</span>
                                  )}
                                  {isSelected && (
                                    <CheckCircle size={15} className="text-brand-gold shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {selectedCourse ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              {/* Left: Player + Info */}
              <div className="space-y-6">
                {/* Player */}
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  {videosLoading ? (
                    <div className="aspect-video bg-black flex flex-col items-center justify-center gap-3">
                      <Loader2 size={36} className="animate-spin text-brand-gold" />
                    </div>
                  ) : activeVideo ? (
                    !isUnlocked && !activeVideo.is_free ? (
                      // Lock Screen for Premium Lesson
                      <div className="aspect-video bg-[#1E1B18] flex flex-col items-center justify-center gap-4 p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-brand-gold/5" />
                        <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center mb-2 border border-brand-gold/20 relative z-10">
                          <Lock size={36} className="text-brand-gold" />
                        </div>
                        <h3 className="text-white text-2xl font-bold relative z-10 text-center">Premium Lesson</h3>
                        <p className="text-brand-cream/60 text-sm max-w-md text-center relative z-10">
                          This lesson is locked. Enroll in the full course to unlock all video lessons, premium materials, and earn your certificate.
                        </p>
                        <Link
                          to={`/courses/${selectedCourseId}`}
                          className="mt-4 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-8 py-3.5 rounded-xl font-bold transition shadow-lg shadow-brand-gold/20 flex items-center gap-2 relative z-10"
                        >
                          <Gift size={18} />
                          Enroll Now — ₹{Number(selectedCourse?.price).toLocaleString('en-IN')}
                        </Link>
                      </div>
                    ) : (
                      // Actual Video Player
                      <VideoPlayer
                        videoUrl={activeVideo.video_url}
                        title={activeVideo.title}
                        onEnded={handleNext}
                      />
                    )
                  ) : !isUnlocked ? (
                    // Lock Screen for Course (when no video is active/available)
                    <div className="aspect-video bg-[#1E1B18] flex flex-col items-center justify-center gap-4 p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-brand-gold/5" />
                      <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center mb-2 border border-brand-gold/20 relative z-10">
                        <Lock size={36} className="text-brand-gold" />
                      </div>
                      <h3 className="text-white text-2xl font-bold relative z-10 text-center">Course Locked</h3>
                      <p className="text-brand-cream/60 text-sm max-w-md text-center relative z-10">
                        Enroll in this course to unlock video lessons, premium materials, and earn your certificate.
                      </p>
                      <Link
                        to={`/courses/${selectedCourseId}`}
                        className="mt-4 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark px-8 py-3.5 rounded-xl font-bold transition shadow-lg shadow-brand-gold/20 flex items-center gap-2 relative z-10"
                      >
                        <Gift size={18} />
                        Enroll Now — ₹{Number(selectedCourse?.price).toLocaleString('en-IN')}
                      </Link>
                    </div>
                  ) : (
                    // Unlocked course, but no video selected/available
                    <div className="aspect-video bg-black flex flex-col items-center justify-center gap-3">
                      <Play size={48} className="text-brand-gold/30" />
                      <p className="text-brand-cream/30 text-sm">Select a video to play</p>
                    </div>
                  )}
                </div>

                {/* Now playing info */}
                {activeVideo && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1">{activeVideo.title}</h2>
                        <p className="text-brand-cream/50 text-sm leading-relaxed">
                          {activeVideo.description || selectedCourse.description || 'Learn from Nimu Academy experts.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-brand-cream/40 text-xs">
                        <Clock size={13} />
                        <span>{activeVideo.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course info */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6">
                  <h3 className="font-serif font-bold text-brand-gold text-lg mb-3">About this Course</h3>
                  <p className="text-brand-cream/60 text-sm leading-relaxed">{selectedCourse.description || 'Master baking with Chef Muskan Naz.'}</p>
                  {selectedCourse.topics && selectedCourse.topics.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCourse.topics.map((t) => (
                        <span key={t} className="text-[11px] bg-brand-gold/10 text-brand-gold/80 px-3 py-1 rounded-full border border-brand-gold/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Playlist */}
              <div className="space-y-4">
                {/* Stats bar */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Course Playlist</h3>
                  <span className="text-xs text-brand-cream/40 font-medium">{videos.length} videos</span>
                </div>

                {videosLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="animate-spin text-brand-gold" />
                  </div>
                ) : videos.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex flex-col items-center gap-3">
                    <BookOpen size={40} className="text-brand-cream/20" />
                    <p className="text-brand-cream/40 text-sm">No videos uploaded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {videos.map((video, idx) => {
                      const isActive = activeVideo?.id === video.id;
                      const isLocked = !isFreeCourse && !video.is_free && !user;
                      return (
                        <motion.button
                          key={video.id}
                          onClick={() => handlePlayVideo(video)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-brand-gold/10 border-brand-gold/40'
                              : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                          }`}
                        >
                          {/* Index / icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-brand-gold' : isLocked ? 'bg-white/5' : 'bg-white/5'
                          }`}>
                            {isActive && isUnlocked
                              ? <Play size={20} className="text-brand-dark ml-0.5" />
                              : isActive && !isUnlocked
                              ? <Lock size={20} className="text-brand-dark" />
                              : isLocked
                              ? <Lock size={16} className="text-brand-cream/25" />
                              : <span className="text-sm font-bold text-brand-cream/40">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                            }
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isActive ? 'text-brand-gold' : 'text-white'}`}>
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock size={11} className="text-brand-cream/30" />
                              <span className="text-xs text-brand-cream/40">{video.duration_minutes} min</span>
                              {video.is_free && (
                                <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">FREE</span>
                              )}
                            </div>
                          </div>

                          <ChevronRight size={14} className={isActive ? 'text-brand-gold' : 'text-brand-cream/20'} />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={36} className="animate-spin text-brand-gold" />
              <p className="text-brand-cream/40">Loading courses…</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
