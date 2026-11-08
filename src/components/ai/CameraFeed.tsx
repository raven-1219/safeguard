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
  Eye,
  Compass,
  Boxes,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { calculateEAR, calculateMAR, TemporalFatigueAnalyzer, Point3D } from '@/lib/ai/faceLandmarks';
import { HeadPoseEstimator, HeadPoseResult } from '@/lib/ai/headPose';
import { cnnDrowsinessClassifier } from '@/lib/ai/cnnClassifier';
import { PoseEmergencyDetector } from '@/lib/ai/poseDetector';
import { seatBeltDetector, SeatBeltStatus } from '@/lib/ai/seatBeltDetector';
import { imageEnhancer } from '@/lib/ai/imageEnhance';
import { safetyScoreAggregator } from '@/lib/ai/safetyScorer';
import { audioManager } from '@/lib/audio/alarmSound';
import { offlineSyncManager } from '@/lib/offline/syncQueue';
import { DriverSafetyState, LiveAITelemetry, PoseEmergencyTelemetry } from '@/lib/types';
import { HeadPose3DGimbal } from './HeadPose3DGimbal';

interface CameraFeedProps {
  onTelemetryUpdate?: (telemetry: LiveAITelemetry, poseTelemetry: PoseEmergencyTelemetry) => void;
  driverId: string;
  tripId?: string;
  showEmbedded3DGimbal?: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  onTelemetryUpdate,
  driverId,
  tripId,
  showEmbedded3DGimbal = true,
}) => {
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
  const [show3DGimbalOverlay, setShow3DGimbalOverlay] = useState<boolean>(false);

  // Live state displays
  const [safetyState, setSafetyState] = useState<DriverSafetyState>('ALERT');
  const [safetyScore, setSafetyScore] = useState<number>(100);
  const [earValue, setEarValue] = useState<number>(0.29);
  const [marValue, setMarValue] = useState<number>(0.22);
  const [headPitch, setHeadPitch] = useState<number>(0);
  const [headYaw, setHeadYaw] = useState<number>(0);
  const [headRoll, setHeadRoll] = useState<number>(0);
  const [headDirection, setHeadDirection] = useState<'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UP'>('CENTER');
  const [isDistracted, setIsDistracted] = useState<boolean>(false);
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
  const lastDistractionAlertTimestamp = useRef<number>(0);

  // MediaPipe solution instance ref
  const faceMeshRef = useRef<any>(null);
  const detectedLandmarksRef = useRef<Point3D[] | null>(null);
  const isMediaPipeBusyRef = useRef<boolean>(false);
  const [trackingMode, setTrackingMode] = useState<'mediapipe' | 'optical'>('optical');

  // Exponential Moving Average (EMA) smoothed variables for silky-smooth rendering
  const sm = useRef({
    ear: 0.29,
    mar: 0.22,
    pitch: 0,
    yaw: 0,
    roll: 0,
    bx: 0,
    by: 0,
    bw: 0,
    bh: 0,
    initialized: false,
  }).current;

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

            // Initialize fatigue classifier
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
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
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
          setTrackingMode('mediapipe');
        } else {
          detectedLandmarksRef.current = null;
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
      setTrackingMode('optical');
    }
  };

  // Optical face & eye feature extractor (tracks face centroid & eye state)
  const computeOpticalLandmarks = (ctx: CanvasRenderingContext2D, w: number, h: number, timeSec: number): Point3D[] => {
    if (detectedLandmarksRef.current && detectedLandmarksRef.current.length >= 468) {
      return detectedLandmarksRef.current;
    }

    // Optical canvas tracking: compute face centroid by sampling skin tone pixels
    let sumX = 0;
    let sumY = 0;
    let skinPixelCount = 0;
    let eyeLuminance = 120;

    try {
      const step = 8;
      const sampleW = Math.floor(w * 0.7);
      const sampleH = Math.floor(h * 0.65);
      const startX = Math.floor(w * 0.15);
      const startY = Math.floor(h * 0.1);
      const imgData = ctx.getImageData(startX, startY, sampleW, sampleH);
      const d = imgData.data;

      for (let y = 0; y < sampleH; y += step) {
        for (let x = 0; x < sampleW; x += step) {
          const idx = (y * sampleW + x) * 4;
          const r = d[idx];
          const g = d[idx + 1];
          const b = d[idx + 2];
          if (r > 60 && g > 35 && b > 20 && r > g && r > b && (r - g) > 12) {
            sumX += startX + x;
            sumY += startY + y;
            skinPixelCount++;
          }
        }
      }

      const eyePatch = ctx.getImageData(
        Math.floor(w * 0.35),
        Math.floor(h * 0.30),
        Math.floor(w * 0.30),
        Math.floor(h * 0.15)
      );
      let eyeSum = 0;
      for (let i = 0; i < eyePatch.data.length; i += 16) {
        eyeSum += eyePatch.data[i];
      }
      eyeLuminance = eyeSum / (eyePatch.data.length / 16);
    } catch (e) {
      // Ignored
    }

    let faceCenterX = 0.5;
    let faceCenterY = 0.45;
    if (skinPixelCount > 40) {
      faceCenterX = sumX / skinPixelCount / w;
      faceCenterY = sumY / skinPixelCount / h;
    }

    const offsetX = Math.max(-0.25, Math.min(0.25, faceCenterX - 0.5));
    const offsetY = Math.max(-0.25, Math.min(0.25, faceCenterY - 0.45));

    const landmarks: Point3D[] = new Array(468);
    for (let i = 0; i < 468; i++) {
      landmarks[i] = { x: faceCenterX, y: faceCenterY, z: 0 };
    }

    const eyeOpenSeparation = 0.030;
    const earFactor = eyeLuminance >= 110 ? 1.00 : eyeLuminance >= 70 ? 0.55 : 0.18;
    const eyeVSep = eyeOpenSeparation * earFactor;

    landmarks[1] = { x: faceCenterX + offsetX * 0.6, y: faceCenterY + 0.03 + offsetY * 0.5, z: 0 };
    landmarks[10] = { x: faceCenterX, y: Math.max(0.06, faceCenterY - 0.22), z: 0 };
    landmarks[152] = { x: faceCenterX, y: Math.min(0.94, faceCenterY + 0.25), z: 0 };
    landmarks[234] = { x: Math.max(0.08, faceCenterX - 0.18), y: faceCenterY, z: 0 };
    landmarks[454] = { x: Math.min(0.92, faceCenterX + 0.18), y: faceCenterY, z: 0 };

    const leftEyeX = faceCenterX - 0.10;
    const leftEyeY = faceCenterY - 0.07;
    landmarks[33] = { x: leftEyeX - 0.04, y: leftEyeY, z: 0 };
    landmarks[133] = { x: leftEyeX + 0.04, y: leftEyeY, z: 0 };
    landmarks[160] = { x: leftEyeX, y: leftEyeY - eyeVSep, z: 0 };
    landmarks[144] = { x: leftEyeX, y: leftEyeY + eyeVSep, z: 0 };
    landmarks[158] = { x: leftEyeX + 0.01, y: leftEyeY - eyeVSep, z: 0 };
    landmarks[153] = { x: leftEyeX + 0.01, y: leftEyeY + eyeVSep, z: 0 };

    const rightEyeX = faceCenterX + 0.10;
    const rightEyeY = faceCenterY - 0.07;
    landmarks[362] = { x: rightEyeX + 0.04, y: rightEyeY, z: 0 };
    landmarks[263] = { x: rightEyeX - 0.04, y: rightEyeY, z: 0 };
    landmarks[385] = { x: rightEyeX, y: rightEyeY - eyeVSep, z: 0 };
    landmarks[380] = { x: rightEyeX, y: rightEyeY + eyeVSep, z: 0 };
    landmarks[387] = { x: rightEyeX - 0.01, y: rightEyeY - eyeVSep, z: 0 };
    landmarks[373] = { x: rightEyeX - 0.01, y: rightEyeY + eyeVSep, z: 0 };

    landmarks[78] = { x: faceCenterX - 0.06, y: faceCenterY + 0.15, z: 0 };
    landmarks[308] = { x: faceCenterX + 0.06, y: faceCenterY + 0.15, z: 0 };
    landmarks[13] = { x: faceCenterX, y: faceCenterY + 0.14, z: 0 };
    landmarks[14] = { x: faceCenterX, y: faceCenterY + 0.16, z: 0 };

    landmarks[11] = { x: 0.28, y: 0.85, z: 0 };
    landmarks[12] = { x: 0.72, y: 0.85, z: 0 };

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

    // Send frame to MediaPipe with concurrency lock to prevent frame queue choking
    if (faceMeshRef.current && isCameraActive && !isMediaPipeBusyRef.current) {
      isMediaPipeBusyRef.current = true;
      faceMeshRef.current
        .send({ image: video })
        .catch(() => {})
        .finally(() => {
          isMediaPipeBusyRef.current = false;
        });
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

    // 5. Exponential Moving Average (EMA) smoothing for silky, jitter-free telemetry
    if (!sm.initialized) {
      sm.ear = fatigue.avgEar;
      sm.mar = fatigue.mar;
      sm.pitch = headPose.pitch;
      sm.yaw = headPose.yaw;
      sm.roll = headPose.roll;
      sm.initialized = true;
    } else {
      sm.ear += (fatigue.avgEar - sm.ear) * 0.35;
      sm.mar += (fatigue.mar - sm.mar) * 0.35;
      sm.pitch += (headPose.pitch - sm.pitch) * 0.28;
      sm.yaw += (headPose.yaw - sm.yaw) * 0.28;
      sm.roll += (headPose.roll - sm.roll) * 0.28;
    }

    // 6. Physiological Fatigue Classifier evaluation
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

    // 7. Combined Safety Score Aggregator
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
    setEarValue(Math.round(sm.ear * 1000) / 1000);
    setMarValue(Math.round(sm.mar * 1000) / 1000);
    setHeadPitch(Math.round(sm.pitch * 10) / 10);
    setHeadYaw(Math.round(sm.yaw * 10) / 10);
    setHeadRoll(Math.round(sm.roll * 10) / 10);
    setHeadDirection(headPose.direction);
    setIsDistracted(headPose.isDistracted);
    setBlinkCount(fatigue.blinkCount);
    setSeatBeltStatus(belt.status);
    setSafetyScore(safetyResult.score);
    setSafetyState(safetyResult.state);

    // Responsive Web Audio alert management (Local laptop speakers)
    if (safetyResult.state === 'HIGHLY DROWSY' || poseTelemetry.isSuspectedCollapse) {
      audioManager.startSiren(poseTelemetry.isSuspectedCollapse ? 'emergency' : 'high_drowsiness');
    } else if (headPose.isDistracted) {
      audioManager.stopAlarm();
      // Dedicated distraction warning sound: triggers immediately and pulses every 1.2s while head turned
      if (now - lastDistractionAlertTimestamp.current > 1200) {
        audioManager.playBeep(980, 220); // Sharp alert tone
        lastDistractionAlertTimestamp.current = now;
      }
    } else if (safetyResult.state === 'DROWSY' || belt.status === 'UNFASTENED') {
      audioManager.stopAlarm();
      if (now - lastAlertTimestamp.current > 3000) {
        audioManager.playBeep(880, 250);
        lastAlertTimestamp.current = now;
      }
    } else {
      audioManager.stopAlarm();
    }

    // Paint Futuristic Cyber-Obsidian HUD visual graphics on canvas
    drawVisualHUD(ctx, w, h, fatigue.avgEar, fatigue.mar, headPose, safetyResult, belt, landmarks);

    // Emit live telemetry to parent
    if (onTelemetryUpdate) {
      onTelemetryUpdate(
        {
          ear: sm.ear,
          mar: sm.mar,
          pitch: sm.pitch,
          yaw: sm.yaw,
          roll: sm.roll,
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
        ear_value: sm.ear,
        mar_value: sm.mar,
        pitch_angle: sm.pitch,
        yaw_angle: sm.yaw,
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
    sm,
  ]);

  // Futuristic Aerospace / Cyber HUD Painting routine
  const drawVisualHUD = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    ear: number,
    mar: number,
    headPose: HeadPoseResult,
    safetyResult: any,
    belt: any,
    landmarks: Point3D[]
  ) => {
    const isCritical = safetyResult.state === 'HIGHLY DROWSY';
    const isDistractedWarn = headPose.isDistracted;
    const isDrowsy = safetyResult.state === 'DROWSY';

    const accentColor = isCritical
      ? '#f43f5e'
      : isDistractedWarn
      ? '#f97316'
      : isDrowsy
      ? '#f59e0b'
      : '#00f0ff';

    // 1. Compute Smoothed Dynamic Face Boundary
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    const keyIndices = [10, 152, 234, 454, 1, 33, 263];
    for (const idx of keyIndices) {
      const p = landmarks[idx];
      if (p) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }

    const padX = (maxX - minX) * 0.18;
    const padY = (maxY - minY) * 0.18;
    const targetBx = Math.max(0, (minX - padX) * w);
    const targetBy = Math.max(0, (minY - padY) * h);
    const targetBw = Math.min(w - targetBx, (maxX - minX + padX * 2) * w);
    const targetBh = Math.min(h - targetBy, (maxY - minY + padY * 2) * h);

    if (sm.bw === 0) {
      sm.bx = targetBx;
      sm.by = targetBy;
      sm.bw = targetBw;
      sm.bh = targetBh;
    } else {
      sm.bx += (targetBx - sm.bx) * 0.35;
      sm.by += (targetBy - sm.by) * 0.35;
      sm.bw += (targetBw - sm.bw) * 0.35;
      sm.bh += (targetBh - sm.bh) * 0.35;
    }

    const bx = sm.bx;
    const by = sm.by;
    const bw = sm.bw;
    const bh = sm.bh;

    // 2. Sleek Corner Reticle Brackets [ ] instead of a plain box
    const bracketLen = Math.min(24, bw * 0.22, bh * 0.22);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = isDistractedWarn ? 3.5 : 2;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = isCritical || isDistractedWarn ? 12 : 6;

    // Top-Left Corner
    ctx.beginPath();
    ctx.moveTo(bx, by + bracketLen);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + bracketLen, by);
    ctx.stroke();

    // Top-Right Corner
    ctx.beginPath();
    ctx.moveTo(bx + bw - bracketLen, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + bracketLen);
    ctx.stroke();

    // Bottom-Left Corner
    ctx.beginPath();
    ctx.moveTo(bx, by + bh - bracketLen);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bracketLen, by + bh);
    ctx.stroke();

    // Bottom-Right Corner
    ctx.beginPath();
    ctx.moveTo(bx + bw - bracketLen, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - bracketLen);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // 3. Biometric Target Reticles for Eyes
    const leftEye = landmarks[33] || { x: 0.41, y: 0.38 };
    const rightEye = landmarks[362] || { x: 0.59, y: 0.38 };
    const eyeColor = ear < earSensitivity ? '#f43f5e' : '#00f0ff';

    // Left Eye Reticle
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(leftEye.x * w, leftEye.y * h, 8, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(leftEye.x * w, leftEye.y * h, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Right Eye Reticle
    ctx.strokeStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(rightEye.x * w, rightEye.y * h, 8, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightEye.x * w, rightEye.y * h, 2, 0, 2 * Math.PI);
    ctx.fill();

    // 4. Subtle Mouth Tracking Marker
    const mouth = landmarks[13] || { x: 0.50, y: 0.62 };
    const mouthColor = mar > marSensitivity ? '#f43f5e' : 'rgba(0, 240, 255, 0.6)';
    ctx.strokeStyle = mouthColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(mouth.x * w, mouth.y * h, 14, mar > marSensitivity ? 14 : 5, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // 5. Artificial Horizon / Pitch Ladder (Fine Cockpit Aesthetic)
    const nose = landmarks[1] || { x: 0.5, y: 0.5 };
    const noseScreenX = nose.x * w;
    const noseScreenY = nose.y * h;

    // Center horizon cross
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(noseScreenX - 8, noseScreenY);
    ctx.lineTo(noseScreenX + 8, noseScreenY);
    ctx.moveTo(noseScreenX, noseScreenY - 8);
    ctx.lineTo(noseScreenX, noseScreenY + 8);
    ctx.stroke();

    // Directional Orientation Vector from nose
    const vectorLength = 46;
    const targetX = noseScreenX + (sm.yaw / 45) * vectorLength;
    const targetY = noseScreenY - (sm.pitch / 45) * vectorLength;

    ctx.strokeStyle = isDistractedWarn ? '#f97316' : '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(noseScreenX, noseScreenY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    ctx.fillStyle = isDistractedWarn ? '#f97316' : '#ffffff';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 3.5, 0, 2 * Math.PI);
    ctx.fill();

    // 6. High-Visibility Distraction Alert Banner on Canvas
    if (isDistractedWarn) {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.94)';
      ctx.fillRect(0, 0, w, 44);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`ATTENTION WARNING: LOOK AHEAD [${headPose.direction}]`, w / 2, 28);
    } else if (headPose.direction !== 'CENTER') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.fillRect(0, 0, w, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`HEAD POSE: ${headPose.direction}  YAW: ${Math.round(sm.yaw)}°  PITCH: ${Math.round(sm.pitch)}°`, w / 2, 21);
    }

    // 7. Diagonal Seat Belt Vector (if verified)
    if (belt.status !== 'UNKNOWN') {
      ctx.strokeStyle = belt.isFastened ? 'rgba(16, 185, 129, 0.65)' : 'rgba(244, 63, 94, 0.75)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(w * 0.16, h * 0.45);
      ctx.lineTo(w * 0.84, h * 0.95);
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
    <div className="relative rounded-3xl overflow-hidden bg-slate-950/90 border border-slate-800/90 shadow-2xl backdrop-blur-2xl transition-all">
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
          className="w-full h-full object-cover -scale-x-100 rounded-t-3xl"
        />

        {/* Loading Overlay */}
        {isLoadingModels && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-white z-20 space-y-3 p-4 text-center backdrop-blur-md">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm font-bold tracking-wide text-white font-mono">{aiEngineStatus}</p>
            <p className="text-xs text-slate-400 font-mono">Loading browser vision pipeline...</p>
          </div>
        )}

        {/* Error Overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-white z-20 p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <h3 className="text-base font-bold text-rose-400 font-mono">{t.hud.cameraError}</h3>
            <p className="text-xs text-slate-400 max-w-sm">{cameraError}</p>
            <button
              onClick={startCamera}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-cyan-600/30"
            >
              <Camera className="w-4 h-4" />
              <span>Retry Camera Permission</span>
            </button>
          </div>
        )}

        {/* Top Floating HUD Indicators */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center space-x-2">
            <div
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center space-x-2 border shadow-lg ${
                safetyState === 'HIGHLY DROWSY'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse'
                  : safetyState === 'DROWSY'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500'
                  : 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span className="font-mono font-black text-xs tracking-wider uppercase">
                {safetyState}
              </span>
            </div>

            {/* Distraction Pill */}
            {isDistracted && (
              <div className="px-2.5 py-1.5 rounded-xl bg-rose-950/95 text-rose-300 border border-rose-500 animate-bounce flex items-center space-x-1 shadow-lg font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  DISTRACTED ({headDirection})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
              {fps} FPS
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              SCORE: {safetyScore}%
            </div>
            <div
              className={`px-2.5 py-1 rounded-lg backdrop-blur-md border text-[10px] font-mono font-semibold tracking-wide ${
                trackingMode === 'mediapipe'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700'
              }`}
            >
              {trackingMode === 'mediapipe' ? '🟢 MediaPipe' : '🟡 Optical Tracker'}
            </div>
          </div>
        </div>

        {/* Embedded 3D Gimbal Overlay Toggle in Bottom-Left */}
        {showEmbedded3DGimbal && show3DGimbalOverlay && (
          <div className="absolute top-14 right-3 z-20 pointer-events-auto animate-fadeIn">
            <HeadPose3DGimbal
              pitch={headPitch}
              yaw={headYaw}
              roll={headRoll}
              direction={headDirection}
              isDistracted={isDistracted}
              className="w-[200px]"
            />
          </div>
        )}

        {/* Bottom Floating Badges & Toggles */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Seat Belt Pill with interactive declaration */}
          <button
            type="button"
            onClick={toggleSeatBeltDeclaration}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md flex items-center space-x-1.5 border transition-all ${
              seatBeltStatus === 'FASTENED'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700 hover:bg-emerald-900/90'
                : seatBeltStatus === 'UNFASTENED'
                ? 'bg-rose-950/90 text-rose-300 border-rose-600 animate-bounce'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800/90'
            }`}
            title="Click to manually declare/toggle seat belt status"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">
              {seatBeltStatus === 'FASTENED'
                ? 'Belt: Fastened'
                : seatBeltStatus === 'UNFASTENED'
                ? 'Belt: Unfastened!'
                : 'Belt: Click to Declare'}
            </span>
          </button>

          <div className="flex items-center space-x-2">
            {/* 3D Holo Gimbal Toggle */}
            <button
              type="button"
              onClick={() => setShow3DGimbalOverlay(!show3DGimbalOverlay)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium backdrop-blur-md border flex items-center space-x-1.5 transition-all ${
                show3DGimbalOverlay
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Toggle Real-Time 3D Holographic Gimbal"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>3D Gimbal</span>
            </button>

            {/* Low-Light Boost Toggle */}
            <button
              type="button"
              onClick={() => setLowLightMode(!lowLightMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md border flex items-center space-x-1.5 transition-colors ${
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
              className="p-1.5 rounded-xl bg-black/60 text-slate-300 border border-white/10 hover:bg-black/80 transition-colors"
              title="Calibration Settings"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Sensitivity Calibration Drawer */}
      {showSettings && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vision Threshold Calibration (Academic Tuner)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Live Adjustment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Eye Aspect Ratio (EAR) Closed Threshold:</span>
                <span className="font-bold text-cyan-400">{earSensitivity}</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.28"
                step="0.01"
                value={earSensitivity}
                onChange={(e) => setEarSensitivity(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Mouth Aspect Ratio (MAR) Yawn Threshold:</span>
                <span className="font-bold text-amber-400">{marSensitivity}</span>
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
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 border-t border-slate-800 text-xs">
        <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-mono font-medium uppercase">
            {t.hud.ear}
          </span>
          <span className="font-mono text-sm font-bold text-white">
            {earValue} <span className="text-[10px] text-slate-400 font-normal">(&gt;{earSensitivity})</span>
          </span>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-mono font-medium uppercase">
            {t.hud.mar}
          </span>
          <span className="font-mono text-sm font-bold text-white">
            {marValue} <span className="text-[10px] text-slate-400 font-normal">(&lt;{marSensitivity})</span>
          </span>
        </div>

        {/* Head Pose & Orientation with Live Direction Tag */}
        <div
          className={`p-2.5 rounded-2xl border transition-colors ${
            isDistracted
              ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
              : headDirection !== 'CENTER'
              ? 'bg-amber-950/70 border-amber-600 text-amber-300'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <span className="text-slate-400 text-[10px] block font-mono font-medium uppercase">
            Head Pose & Orientation
          </span>
          <span className="font-mono text-sm font-bold text-white flex items-center justify-between">
            <span>P:{headPitch}° Y:{headYaw}°</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                headDirection === 'CENTER'
                  ? 'text-cyan-400 bg-cyan-950/60'
                  : isDistracted
                  ? 'text-rose-200 bg-rose-900'
                  : 'text-amber-400 bg-amber-950'
              }`}
            >
              {headDirection}
            </span>
          </span>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-mono font-medium uppercase">
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
