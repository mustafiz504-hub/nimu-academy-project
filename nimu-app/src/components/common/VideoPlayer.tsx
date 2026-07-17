/**
 * VideoPlayer.tsx
 * YouTube-style custom video player for Nimu Academy
 * Features: play/pause, seek, speed, orientation lock, fullscreen, auto-hide controls
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';

// ─── Constants ────────────────────────────────────────────────────────────────
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const HIDE_DELAY = 3500;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(secs: number): string {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  autoPlay?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VideoPlayer({ videoUrl, title, autoPlay = true }: VideoPlayerProps) {
  // Player
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
    if (autoPlay) p.play();
  });

  // Player events
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: 0, currentOffsetTime: 0 });
  const { status } = useEvent(player, 'statusChange', { status: player.status, error: undefined });

  const duration = player.duration ?? 0;

  // Refs for fresh access inside PanResponder (prevents stale closure where seekBarWidth = 1)
  const playerRef = useRef(player);
  playerRef.current = player;
  const durationRef = useRef(duration);
  durationRef.current = duration;
  const seekBarWidthRef = useRef(1);

  // ── UI State ─────────────────────────────────────────────────────────────
  const [isLandscape, setIsLandscape] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(true);

  // Instantly show spinner right when user clicks any video from playlist (videoUrl changes)
  useEffect(() => {
    setIsBuffering(true);
  }, [videoUrl]);

  // Hide spinner once player is ready or actively playing
  useEffect(() => {
    if (status === 'readyToPlay' || isPlaying || currentTime > 0) {
      setIsBuffering(false);
    } else if (status === 'loading') {
      setIsBuffering(true);
    }
  }, [status, isPlaying, currentTime]);

  // Controls visibility
  const controlsVisible = useRef(true);
  const controlsAnim = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seek state
  const [seekBarWidth, setSeekBarWidthState] = useState(1);
  const setSeekBarWidth = (w: number) => {
    if (w > 0) {
      seekBarWidthRef.current = w;
      setSeekBarWidthState(w);
    }
  };

  const isSeeking = useRef(false);
  const seekRatio = useRef(new Animated.Value(0)).current;
  const grantRatio = useRef(0);

  // ── Sync seek bar with playback (only when not dragging) ─────────────────
  useEffect(() => {
    if (!isSeeking.current && duration > 0) {
      const ratio = Math.min(currentTime / duration, 1);
      seekRatio.setValue(ratio);
    }
  }, [currentTime, duration]);

  // ── Controls auto-hide ───────────────────────────────────────────────────
  const showControls = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!controlsVisible.current) {
      Animated.timing(controlsAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      controlsVisible.current = true;
    }
    hideTimer.current = setTimeout(() => {
      if (isPlaying) {
        Animated.timing(controlsAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
          controlsVisible.current = false;
        });
      }
    }, HIDE_DELAY);
  }, [isPlaying, controlsAnim]);

  const toggleControls = useCallback(() => {
    if (controlsVisible.current) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      Animated.timing(controlsAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        controlsVisible.current = false;
      });
    } else {
      showControls();
    }
  }, [showControls, controlsAnim]);

  useEffect(() => {
    showControls();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying]);

  // ── Orientation ──────────────────────────────────────────────────────────
  const toggleOrientation = useCallback(async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch (e) {
      console.warn('Orientation lock failed:', e);
    }
  }, [isLandscape]);

  // Restore portrait on unmount
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  // ── Seek PanResponder ────────────────────────────────────────────────────
  const seekPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        isSeeking.current = true;
        showControls();
        const w = seekBarWidthRef.current || 1;
        const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / w));
        grantRatio.current = ratio;
        seekRatio.setValue(ratio);
      },
      onPanResponderMove: (_, gestureState) => {
        const w = seekBarWidthRef.current || 1;
        const ratio = Math.max(0, Math.min(1, grantRatio.current + (gestureState.dx / w)));
        seekRatio.setValue(ratio);
      },
      onPanResponderRelease: (_, gestureState) => {
        const w = seekBarWidthRef.current || 1;
        const ratio = Math.max(0, Math.min(1, grantRatio.current + (gestureState.dx / w)));
        if (playerRef.current && durationRef.current > 0) {
          playerRef.current.currentTime = ratio * durationRef.current;
        }
        setTimeout(() => { isSeeking.current = false; }, 200);
      },
    })
  ).current;

  // ── Controls ─────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (isPlaying) player.pause(); else player.play();
    showControls();
  }, [isPlaying, player, showControls]);

  const skip = useCallback((delta: number) => {
    player.currentTime = Math.max(0, Math.min((player.currentTime ?? 0) + delta, player.duration ?? 0));
    showControls();
  }, [player, showControls]);

  const setSpeed = useCallback((s: number) => {
    setPlaybackRate(s);
    player.playbackRate = s;
    setShowSpeedMenu(false);
    showControls();
  }, [player, showControls]);

  // ── Interpolated widths ───────────────────────────────────────────────────
  const playedWidth = seekRatio.interpolate({ inputRange: [0, 1], outputRange: [0, seekBarWidth], extrapolate: 'clamp' });
  const thumbLeft = seekRatio.interpolate({ inputRange: [0, 1], outputRange: [0, seekBarWidth - 12], extrapolate: 'clamp' });

  // ── Render ────────────────────────────────────────────────────────────────
  const playerContent = (
    <View style={[styles.root, isLandscape && styles.landscapeRoot]}>
      {/* ── Video ── */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        nativeControls={false}
        allowsFullscreen={false}
        contentFit="contain"
      />

      {/* ── Tap area (toggle controls) ── */}
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        activeOpacity={1}
        onPress={toggleControls}
      />

      {/* ── Loading Spinner ── */}
      {(isBuffering || status === 'loading') && (
        <View style={styles.loadingWrap} pointerEvents="none">
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF8C00" />
          </View>
        </View>
      )}

      {/* ── Controls ── */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.controlsWrap, { opacity: controlsAnim }]} pointerEvents="box-none">

        {/* Top gradient bar */}
        <View style={styles.topBar} pointerEvents="box-none">
          {!!title && (
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          )}
          <View style={styles.topRight}>
            {/* Speed */}
            <TouchableOpacity onPress={() => { setShowSpeedMenu(true); showControls(); }} style={styles.chipBtn} activeOpacity={0.7}>
              <Ionicons name="speedometer-outline" size={14} color="#FFF" />
              <Text style={styles.chipText}>{playbackRate === 1 ? '1×' : `${playbackRate}×`}</Text>
            </TouchableOpacity>
            {/* Orientation */}
            <TouchableOpacity onPress={toggleOrientation} style={styles.chipBtn} activeOpacity={0.7}>
              <Ionicons name={isLandscape ? 'phone-portrait-outline' : 'phone-landscape-outline'} size={15} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center controls */}
        <View style={styles.centerRow} pointerEvents="box-none">
          <TouchableOpacity onPress={() => skip(-10)} style={styles.skipBtn} activeOpacity={0.7}>
            <Ionicons name="play-back" size={24} color="#FFF" />
            <Text style={styles.skipLabel}>10</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={styles.playBtn} activeOpacity={0.85}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFF" style={isPlaying ? {} : { marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => skip(10)} style={styles.skipBtn} activeOpacity={0.7}>
            <Ionicons name="play-forward" size={24} color="#FFF" />
            <Text style={styles.skipLabel}>10</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom gradient bar */}
        <View style={styles.bottomBar} pointerEvents="box-none">
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

          {/* Seek bar — full width */}
          <View
            style={styles.seekTrack}
            onLayout={(e) => setSeekBarWidth(e.nativeEvent.layout.width)}
            {...seekPanResponder.panHandlers}
          >
            {/* Background track */}
            <View style={styles.trackBg} pointerEvents="none" />
            {/* Played */}
            <Animated.View style={[styles.trackPlayed, { width: playedWidth }]} pointerEvents="none" />
            {/* Thumb */}
            <Animated.View style={[styles.thumb, { left: thumbLeft }]} pointerEvents="none" />
          </View>

          <Text style={styles.timeText}>{formatTime(duration)}</Text>

          {/* Rotate/Fullscreen */}
          <TouchableOpacity onPress={toggleOrientation} style={styles.fsBtn} activeOpacity={0.7}>
            <Ionicons name={isLandscape ? 'contract-outline' : 'expand-outline'} size={19} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Speed Menu (Right Side Overlay) ── */}
      {showSpeedMenu && (
        <View style={styles.rightMenuOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowSpeedMenu(false)}
          />
          <View style={styles.rightMenuCard}>
            <View style={styles.rightMenuHeader}>
              <Text style={styles.rightMenuHeading}>Speed</Text>
              <TouchableOpacity onPress={() => setShowSpeedMenu(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            {SPEED_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSpeed(s)}
                style={[styles.rightMenuItem, playbackRate === s && styles.rightMenuItemActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.rightMenuText, playbackRate === s && styles.rightMenuTextActive]}>
                  {s === 1.0 ? 'Normal (1×)' : `${s}×`}
                </Text>
                {playbackRate === s && <Ionicons name="checkmark" size={16} color="#FF8C00" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>

  );

  // Landscape = fullscreen modal
  if (isLandscape) {
    return (
      <Modal visible animationType="fade" statusBarTranslucent onRequestClose={toggleOrientation}>
        <StatusBar hidden />
        <View style={styles.landscapeContainer}>
          {playerContent}
        </View>
      </Modal>
    );
  }

  return playerContent;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  landscapeRoot: {
    flex: 1,
    aspectRatio: undefined,
    width: '100%',
    height: '100%',
  },
  landscapeContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Loading
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingBox: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 36,
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Transparent controls wrapper — NO background, just a container
  controlsWrap: {
    // transparent — video shows through
  },

  // Top bar — gradient from top only
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 28,
    // Simulated top-to-transparent gradient
    backgroundColor: 'transparent',
  },
  title: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
    marginRight: 8,
  },
  topRight: {
    flexDirection: 'row',
    gap: 6,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chipText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Center controls
  centerRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  skipBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipLabel: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: -2,
  },
  playBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,140,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },

  // Bottom bar — gradient from bottom only
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 28,
    gap: 6,
    // Transparent — no dark overlay on video
    backgroundColor: 'transparent',
  },
  timeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 36,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },

  // Seek bar — fills all remaining space with comfortable touch target height
  seekTrack: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 2,
  },
  trackPlayed: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
  },
  fsBtn: {
    padding: 4,
  },

  // Speed Menu (Right side compact overlay)
  rightMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  rightMenuCard: {
    width: 155,
    height: '100%',
    backgroundColor: 'rgba(18, 18, 30, 0.94)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.12)',
  },
  rightMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  rightMenuHeading: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  rightMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rightMenuItemActive: {
    // active state
  },
  rightMenuText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  rightMenuTextActive: {
    color: '#FF8C00',
    fontWeight: '700',
  },
});

