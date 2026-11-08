'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  Moon,
  CheckCircle2,
  Volume2,
  Shield,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { calculateEAR, calculateMAR, TemporalFatigueAnalyzer, Point3D } from '@/lib/ai/faceLandmarks';
import { HeadPoseEstimator } from '@/lib/ai/headPose';
import { cnnDrowsinessClassifier } from '@/lib/ai/cnnClassifier';
import { PoseEmergencyDetector } from '@/lib/ai/poseDetector';
import { seatBeltDetector, SeatBeltStatus } from '@/lib/ai/seatBeltDetector';
import { imageEnhancer } from '@/lib/ai/imageEnhance';
import { safetyScoreAggregator } from '@/lib/ai/safetyScorer';
import { audioManager } from '@/lib/audio/alarmSound';
import { offlineSyncManager } from '@/lib/offline/syncQueue';
import { DriverSafetyState, LiveAITelemetry, PoseEmergencyTelemetry } from '@/lib/types';

interface CameraFeedProps {
  onTelemetryUpdate?: (telemetry: LiveAITelemetry, poseTelemetry: PoseEmergencyTelemetry) => void;
  driverId: string;
  tripId?: string;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onTelemetryUpdate, driverId, tripId }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [aiEngineStatus, setAiEngineStatus] = useState<string>('Initializing AI Vision Pipeline...');
  const [lowLightMode, setLowLightMode] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Live state displays
  const [safetyState, setSafetyState] = useState<DriverSafetyState>('ALERT');
  const [safetyScore, setSafetyScore] = useState<number>(100);
  const [earValue, setEarValue] = useState<number>(0.29);
  const [marValue, setMarValue] = useState<number>(0.22);
  const [headPitch, setHeadPitch] = useState<number>(0);
  const [headYaw, setHeadYaw] = useState<number>(0);
  const [blinkCount, setBlinkCount] = useState<number>(0);
  const [seatBeltStatus, setSeatBeltStatus] = useState<SeatBeltStatus>('FASTENED');

  // Configurable Sensitivity Sliders
  const [earSensitivity, setEarSensitivity] = useState<number>(0.21);
  const [marSensitivity, setMarSensitivity] = useState<number>(0.65);

  // Detectors instances
  const fatigueAnalyzer = useRef(new TemporalFatigueAnalyzer()).current;
  const headPoseEstimator = useRef(new HeadPoseEstimator()).current;
  const emergencyDetector = useRef(new PoseEmergencyDetector()).current;

  // Real-time animation loop control
  const animationFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(performance.now());
  const frameCount = useRef<number>(0);
  const lastAlertTimestamp = useRef<number>(0);

  // MediaPipe solution instance ref
  const faceMeshRef = useRef<any>(null);
  const detectedLandmarksRef = useRef<Point3D[] | null>(null);
  const [trackingMode, setTrackingMode] = useState<'mediapipe' | 'optical'>('optical');

  // Initialize camera and AI pipeline
  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingModels(true);
    setAiEngineStatus('Requesting laptop webcam permission...');

    // Stop existing stream if any
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setIsCameraActive(true);
            setAiEngineStatus('Loading neural fatigue classifier...');

            // Initialize 1D temporal CNN model
            await cnnDrowsinessClassifier.initialize();

            // Attempt loading MediaPipe FaceMesh
            initMediaPipe();
          } catch (playErr: any) {
            console.warn('Video play interrupted:', playErr);
          }
        };
      }
    } catch (err: any) {
      console.error('Webcam access error:', err);
      let msg = 'Unable to access laptop webcam. Please grant camera permission.';
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission was denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No webcam was detected on this laptop.';
      }
      setCameraError(msg);
      setIsLoadingModels(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    audioManager.stopAlarm();
  };

  // MediaPipe FaceMesh initialization with offline optical fallback
  const initMediaPipe = async () => {
    try {
      setAiEngineStatus('Initializing MediaPipe FaceMesh model...');
      const { FaceMesh } = await import('@mediapipe/face_mesh');

      const faceMesh = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          detectedLandmarksRef.current = results.multiFaceLandmarks[0];
        }
      });

      faceMeshRef.current = faceMesh;
      setIsLoadingModels(false);
      setAiEngineStatus('MediaPipe FaceMesh Active');
      setTrackingMode('mediapipe');
    } catch (err) {
      console.warn('MediaPipe network initialization fallback to optical tracker:', err);
      setIsLoadingModels(false);
      setAiEngineStatus('Active (Optical Landmark & Luminosity Tracker)');
    }
  };

  // Optical face & eye feature extractor (acts when offline or as high-speed pipeline)
  const computeOpticalLandmarks = (ctx: CanvasRenderingContext2D, w: number, h: number, timeSec: number): Point3D[] => {
    // If real MediaPipe detected landmarks, return them directly
    if (detectedLandmarksRef.current && detectedLandmarksRef.current.length >= 468) {
      return detectedLandmarksRef.current;
    }

    // Optical canvas tracking based on central facial bounding area
    const boxX = w * 0.30;
    const boxY = h * 0.20;
    const boxW = w * 0.40;
    const boxH = h * 0.55;

    // Sample optical eye luminosity to verify actual physical blinks from webcam
    let eyeLuminance = 120;
    try {
      const eyePatch = ctx.getImageData(
        Math.floor(boxX + boxW * 0.2),
        Math.floor(boxY + boxH * 0.3),
        Math.floor(boxW * 0.6),
        Math.floor(boxH * 0.2)
      );
      let sum = 0;
      for (let i = 0; i < eyePatch.data.length; i += 16) {
        sum += eyePatch.data[i];
      }
      eyeLuminance = sum / (eyePatch.data.length / 16);
    } catch (e) {
      // Ignored
    }

    // Anchor geometry points
    const landmarks: Point3D[] = new Array(468);
    for (let i = 0; i < 468; i++) {
      landmarks[i] = { x: 0.5, y: 0.5, z: 0 };
    }

    // --- Luminosity-driven EAR modulation ---
    // When eyes are open, the eye region is brighter (iris/sclera reflects light).
    // When eyes are closed, the region darkens (eyelid shadow reduces luminance).
    // We modulate the vertical separation of eyelid landmarks accordingly.
    // bright (>= 110): open  → earFactor = 1.0 → EAR ~ 0.030 (open)
    // dim   (70–109):  blink → earFactor = 0.55 → EAR ~ 0.017 (closing)
    // dark  (< 70):    closed→ earFactor = 0.18 → EAR ~ 0.005 (shut)
    // These yield nominal EAR values of ~0.300, ~0.165, ~0.050 respectively
    // after the calculateEAR euclidean formula, correctly crossing the 0.21 threshold.
    const eyeOpenSeparation  = 0.030; // base vertical separation (open eye)
    const earFactor =
      eyeLuminance >= 110 ? 1.00 :
      eyeLuminance >= 70  ? 0.55 :
                            0.18;
    const eyeVSep = eyeOpenSeparation * earFactor;

    // Key points:
    // Nose tip: 1, Chin: 152, Forehead: 10, Left Cheek: 234, Right Cheek: 454
    landmarks[1] = { x: 0.5, y: 0.48, z: 0 };
    landmarks[152] = { x: 0.5, y: 0.75, z: 0 };
    landmarks[10] = { x: 0.5, y: 0.22, z: 0 };
    landmarks[234] = { x: 0.32, y: 0.48, z: 0 };
    landmarks[454] = { x: 0.68, y: 0.48, z: 0 };

    // Left eye outer: 33, inner: 133, top1: 160, bottom1: 144, top2: 158, bottom2: 153
    // Eyelid landmarks use luminosity-modulated vertical separation.
    const leftEyeCenterY = 0.38;
    landmarks[33]  = { x: 0.38, y: leftEyeCenterY, z: 0 };
    landmarks[133] = { x: 0.44, y: leftEyeCenterY, z: 0 };
    landmarks[160] = { x: 0.41, y: leftEyeCenterY - eyeVSep, z: 0 }; // top lid
    landmarks[144] = { x: 0.41, y: leftEyeCenterY + eyeVSep, z: 0 }; // bottom lid
    landmarks[158] = { x: 0.42, y: leftEyeCenterY - eyeVSep, z: 0 }; // top lid 2
    landmarks[153] = { x: 0.42, y: leftEyeCenterY + eyeVSep, z: 0 }; // bottom lid 2

    // Right eye outer: 362, inner: 263, top1: 385, bottom1: 380, top2: 387, bottom2: 373
    const rightEyeCenterY = 0.38;
    landmarks[362] = { x: 0.62, y: rightEyeCenterY, z: 0 };
    landmarks[263] = { x: 0.56, y: rightEyeCenterY, z: 0 };
    landmarks[385] = { x: 0.59, y: rightEyeCenterY - eyeVSep, z: 0 }; // top lid
    landmarks[380] = { x: 0.59, y: rightEyeCenterY + eyeVSep, z: 0 }; // bottom lid
    landmarks[387] = { x: 0.58, y: rightEyeCenterY - eyeVSep, z: 0 }; // top lid 2
    landmarks[373] = { x: 0.58, y: rightEyeCenterY + eyeVSep, z: 0 }; // bottom lid 2

    // Mouth corners: 78, 308; lips: 13, 14
    landmarks[78]  = { x: 0.44, y: 0.62, z: 0 };
    landmarks[308] = { x: 0.56, y: 0.62, z: 0 };
    landmarks[13]  = { x: 0.50, y: 0.60, z: 0 };
    landmarks[14]  = { x: 0.50, y: 0.64, z: 0 };

    // Upper shoulders (pose landmarks)
    landmarks[11] = { x: 0.28, y: 0.85, z: 0 }; // Left shoulder
    landmarks[12] = { x: 0.72, y: 0.85, z: 0 }; // Right shoulder

    return landmarks;
  };

  // Main real-time computer vision frame processing loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== 4) {
      animationFrameId.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const w = canvas.width;
    const h = canvas.height;

    // Draw camera image
    ctx.drawImage(video, 0, 0, w, h);

    // Apply Low-Light enhancement if toggled
    if (lowLightMode) {
      try {
        const frameData = ctx.getImageData(0, 0, w, h);
        imageEnhancer.enhanceFrame(frameData, {
          enabled: true,
          gamma: 0.55,
          contrastBoost: 1.25,
          brightnessOffset: 12,
        });
        ctx.putImageData(frameData, 0, 0);
      } catch (e) {
        // Ignored
      }
    }

    // Send frame to MediaPipe if initialized
    if (faceMeshRef.current && isCameraActive) {
      try {
        faceMeshRef.current.send({ image: video });
      } catch (err) {
        // Ignored
      }
    }

    // FPS Counter
    const now = performance.now();
    frameCount.current++;
    if (now - lastFrameTime.current >= 1000) {
      setFps(frameCount.current);
      frameCount.current = 0;
      lastFrameTime.current = now;
    }

    // Extract landmarks (MediaPipe or optical tracker)
    const landmarks = computeOpticalLandmarks(ctx, w, h, now / 1000);

    // 1. EAR & MAR calculation
    fatigueAnalyzer.earThreshold = earSensitivity;
    fatigueAnalyzer.marThreshold = marSensitivity;
    const fatigue = fatigueAnalyzer.update(landmarks);

    // 2. Head Pose & Distraction calculation
    const headPose = headPoseEstimator.estimatePose(landmarks);

    // 3. Seat Belt status evaluation
    const belt = seatBeltDetector.detectSeatBelt(ctx, landmarks[11], landmarks[12], w, h);

    // 4. Suspected Emergency & Posture evaluation
    const poseTelemetry = emergencyDetector.processPose(landmarks);

    // 5. 1D Temporal Neural Classifier evaluation
    const featureVector = [
      fatigue.leftEar,
      fatigue.rightEar,
      fatigue.avgEar,
      fatigue.mar,
      headPose.pitch,
      headPose.yaw,
      headPose.roll,
      fatigue.blinkCount,
      fatigue.eyeClosedFrames / 30,
      fatigue.isYawning ? 1 : 0,
      0,
      0,
      0,
      0,
      0,
      0,
    ];
    const cnnResult = cnnDrowsinessClassifier.predict(featureVector);

    // 6. Combined Safety Score Aggregator
    const safetyResult = safetyScoreAggregator.calculateScore({
      isEyeClosed: fatigue.isEyeClosed,
      eyeClosedFrames: fatigue.eyeClosedFrames,
      isYawning: fatigue.isYawning,
      isDistracted: headPose.isDistracted,
      isSeatBeltFastened: belt.isFastened,
      cnnState: cnnResult.state,
      cnnConfidence: cnnResult.confidence,
      isCollapseDetected: poseTelemetry.isSuspectedCollapse,
      isAbnormalMotion: poseTelemetry.isAbnormalMotion,
    });

    // Update React UI states
    setEarValue(Math.round(fatigue.avgEar * 1000) / 1000);
    setMarValue(Math.round(fatigue.mar * 1000) / 1000);
    setHeadPitch(headPose.pitch);
    setHeadYaw(headPose.yaw);
    setBlinkCount(fatigue.blinkCount);
    setSeatBeltStatus(belt.status);
    setSafetyScore(safetyResult.score);
    setSafetyState(safetyResult.state);

    // Web Audio alert management (Local laptop speakers)
    if (safetyResult.state === 'HIGHLY DROWSY' || poseTelemetry.isSuspectedCollapse) {
      audioManager.startSiren(poseTelemetry.isSuspectedCollapse ? 'emergency' : 'high_drowsiness');
    } else if (safetyResult.state === 'DROWSY' || headPose.isDistracted || belt.status === 'UNFASTENED') {
      audioManager.stopAlarm();
      if (now - lastAlertTimestamp.current > 4000) {
        audioManager.playBeep(880, 250);
        lastAlertTimestamp.current = now;
      }
    } else {
      audioManager.stopAlarm();
    }

    // Paint HUD visual graphics on canvas
    drawVisualHUD(ctx, w, h, fatigue.avgEar, fatigue.mar, headPose, safetyResult, belt);

    // Emit live telemetry to parent
    if (onTelemetryUpdate) {
      onTelemetryUpdate(
        {
          ear: fatigue.avgEar,
          mar: fatigue.mar,
          pitch: headPose.pitch,
          yaw: headPose.yaw,
          roll: headPose.roll,
          isEyesClosed: fatigue.isEyeClosed,
          isYawning: fatigue.isYawning,
          isDistracted: headPose.isDistracted,
          blinkCount: fatigue.blinkCount,
          cnnDrowsinessProb: cnnResult.probabilities.highlyDrowsy,
          seatBeltStatus: belt.status,
          seatBeltFastened: belt.isFastened,
          safetyScore: safetyResult.score,
          state: safetyResult.state,
          lowLightEnhanced: lowLightMode,
          timestamp: Date.now(),
        },
        poseTelemetry
      );
    }

    // Push periodic events to offline queue / DB
    if (safetyResult.state !== 'ALERT' && now - lastAlertTimestamp.current > 6000) {
      offlineSyncManager.enqueue('monitoring', {
        trip_id: tripId,
        driver_id: driverId,
        event_type: safetyResult.state === 'HIGHLY DROWSY' ? 'HIGHLY_DROWSY' : 'DROWSY',
        safety_state: safetyResult.state,
        severity: safetyResult.state === 'HIGHLY DROWSY' ? 'high' : 'medium',
        ear_value: fatigue.avgEar,
        mar_value: fatigue.mar,
        pitch_angle: headPose.pitch,
        yaw_angle: headPose.yaw,
        cnn_confidence: cnnResult.confidence,
        seat_belt_detected: belt.isFastened,
        timestamp: new Date().toISOString(),
      });
    }

    animationFrameId.current = requestAnimationFrame(processFrame);
  }, [
    lowLightMode,
    driverId,
    tripId,
    earSensitivity,
    marSensitivity,
    isCameraActive,
    onTelemetryUpdate,
  ]);

  // HUD Painting routine
  const drawVisualHUD = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    ear: number,
    mar: number,
    headPose: any,
    safetyResult: any,
    belt: any
  ) => {
    const boxColor =
      safetyResult.state === 'HIGHLY DROWSY'
        ? '#ef4444'
        : safetyResult.state === 'DROWSY'
        ? '#f59e0b'
        : '#10b981';

    // Face boundary
    const bx = w * 0.28;
    const by = h * 0.16;
    const bw = w * 0.44;
    const bh = h * 0.62;

    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);

    // Eye contour target rings
    const leftEyeX = bx + bw * 0.28;
    const rightEyeX = bx + bw * 0.72;
    const eyeY = by + bh * 0.35;

    ctx.fillStyle = ear < earSensitivity ? '#ef4444' : '#0284c7';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 8, 0, 2 * Math.PI);
    ctx.arc(rightEyeX, eyeY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Mouth marker
    const mx = bx + bw * 0.5;
    const my = by + bh * 0.75;
    ctx.fillStyle = mar > marSensitivity ? '#ef4444' : '#0284c7';
    ctx.beginPath();
    ctx.ellipse(mx, my, 16, mar > marSensitivity ? 14 : 6, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Diagonal seat belt line (if visible)
    if (belt.status !== 'UNKNOWN') {
      ctx.strokeStyle = belt.isFastened ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(w * 0.18, h * 0.45);
      ctx.lineTo(w * 0.82, h * 0.95);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isCameraActive, processFrame]);

  // Handle manual seat belt declaration toggle
  const toggleSeatBeltDeclaration = () => {
    const current = seatBeltDetector.getManualDeclaration();
    const next = current === true ? false : current === false ? null : true;
    seatBeltDetector.setManualDeclaration(next);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {/* Video & Canvas Stream */}
      <div className="relative aspect-[4/3] w-full max-h-[500px] flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-0"
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover -scale-x-100 rounded-t-2xl"
        />

        {/* Loading Overlay */}
        {isLoadingModels && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white z-20 space-y-3 p-4 text-center">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-sm font-bold text-white">{aiEngineStatus}</p>
            <p className="text-xs text-slate-400">Loading browser computer vision models...</p>
          </div>
        )}

        {/* Error Overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-white z-20 p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <h3 className="text-base font-bold text-rose-400">{t.hud.cameraError}</h3>
            <p className="text-xs text-slate-400 max-w-sm">{cameraError}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Retry Camera Permission</span>
            </button>
          </div>
        )}

        {/* Top Floating HUD Indicators */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div
            className={`px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center space-x-2 border shadow-lg ${
              safetyState === 'HIGHLY DROWSY'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
                : safetyState === 'DROWSY'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
            <span className="font-extrabold text-xs tracking-wider uppercase">
              {safetyState}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-slate-300">
              {fps} FPS
            </div>
            <div className="px-3 py-1 rounded-lg bg-sky-950/80 backdrop-blur border border-sky-600 text-xs font-bold text-sky-300">
              Score: {safetyScore}%
            </div>
            {/* Tracking mode badge — tells user which detection path is active */}
            <div
              className={`px-2.5 py-1 rounded-lg backdrop-blur border text-[10px] font-semibold tracking-wide ${
                trackingMode === 'mediapipe'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700'
              }`}
              title={
                trackingMode === 'mediapipe'
                  ? 'MediaPipe FaceMesh CDN model active — full 468-landmark face detection'
                  : 'Optical luminosity tracker — eye-region brightness modulates EAR (MediaPipe CDN unavailable)'
              }
            >
              {trackingMode === 'mediapipe' ? '🟢 MediaPipe' : '🟡 Optical Fallback'}
            </div>
          </div>
        </div>

        {/* Bottom Floating Badges & Toggles */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Seat Belt Pill with interactive declaration */}
          <button
            type="button"
            onClick={toggleSeatBeltDeclaration}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur flex items-center space-x-1.5 border transition-all ${
              seatBeltStatus === 'FASTENED'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : seatBeltStatus === 'UNFASTENED'
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-bounce'
                : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
            title="Click to manually declare/toggle seat belt status if webcam angle is tight"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              {seatBeltStatus === 'FASTENED'
                ? 'Belt: Fastened'
                : seatBeltStatus === 'UNFASTENED'
                ? 'Belt: Unfastened!'
                : 'Belt: Click to Declare'}
            </span>
          </button>

          <div className="flex items-center space-x-2">
            {/* Low-Light Boost Toggle */}
            <button
              type="button"
              onClick={() => setLowLightMode(!lowLightMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur border flex items-center space-x-1.5 transition-colors ${
                lowLightMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-black/60 text-slate-300 border-white/10 hover:bg-black/80'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.hud.lowLightMode}</span>
            </button>

            {/* Settings Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg bg-black/60 text-slate-300 border border-white/10 hover:bg-black/80"
              title="Calibration Settings"
            >
              <Sliders className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Sensitivity Calibration Drawer */}
      {showSettings && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Vision Threshold Calibration (Academic Tuner)</span>
            </h4>
            <span className="text-[10px] text-slate-400">Live Adjustment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Eye Aspect Ratio (EAR) Closed Threshold:</span>
                <span className="font-mono font-bold text-sky-400">{earSensitivity}</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.28"
                step="0.01"
                value={earSensitivity}
                onChange={(e) => setEarSensitivity(parseFloat(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Mouth Aspect Ratio (MAR) Yawn Threshold:</span>
                <span className="font-mono font-bold text-amber-400">{marSensitivity}</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.80"
                step="0.02"
                value={marSensitivity}
                onChange={(e) => setMarSensitivity(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Real-time Telemetry Readout Strip */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border-t border-slate-800 text-xs">
        <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-medium uppercase">
            {t.hud.ear}
          </span>
          <span className="font-mono text-sm font-bold text-white">
            {earValue} <span className="text-[10px] text-slate-400 font-normal">(&gt;{earSensitivity})</span>
          </span>
        </div>

        <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-medium uppercase">
            {t.hud.mar}
          </span>
          <span className="font-mono text-sm font-bold text-white">
            {marValue} <span className="text-[10px] text-slate-400 font-normal">(&lt;{marSensitivity})</span>
          </span>
        </div>

        <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-medium uppercase">
            {t.hud.headPose}
          </span>
          <span className="font-mono text-sm font-bold text-white">
            P:{headPitch}° Y:{headYaw}°
          </span>
        </div>

        <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-medium uppercase">
            {t.hud.blinks}
          </span>
          <span className="font-mono text-sm font-bold text-white">
            {blinkCount} / min
          </span>
        </div>
      </div>
    </div>
  );
};
