// ==============================================================================
// SAFE GUARD AI - Comprehensive Bilingual Dictionary (English & Telugu)
// Full translations for Auth, Navigation, AI HUD, Alerts, Dashboards, Tables, Reports
// ==============================================================================

export type SupportedLanguage = 'en' | 'te';

export interface TranslationDictionary {
  app: {
    title: string;
    subtitle: string;
    tagline: string;
    status: string;
  };
  nav: {
    dashboard: string;
    driverPortal: string;
    moderatorPortal: string;
    adminPortal: string;
    vehicles: string;
    reports: string;
    analytics: string;
    audits: string;
    login: string;
    logout: string;
    language: string;
    profile: string;
  };
  roles: {
    driver: string;
    moderator: string;
    admin: string;
  };
  safetyStates: {
    alert: string;
    drowsy: string;
    highlyDrowsy: string;
    safeDescription: string;
    drowsyDescription: string;
    dangerDescription: string;
  };
  hud: {
    liveCamera: string;
    cameraStarting: string;
    cameraError: string;
    cameraDisabled: string;
    requestPermission: string;
    safetyScore: string;
    ear: string;
    mar: string;
    headPose: string;
    blinks: string;
    gaze: string;
    distraction: string;
    seatBelt: string;
    seatBeltFastened: string;
    seatBeltUnfastened: string;
    lowLightMode: string;
    simulationMode: string;
    fps: string;
    tripStatus: string;
    startTrip: string;
    endTrip: string;
    tripInProgress: string;
    noActiveTrip: string;
  };
  emergencies: {
    medicalEmergency: string;
    suspectedCollapse: string;
    abnormalMotion: string;
    prolongedInactivity: string;
    cardiacAlert: string;
    collapseWarning: string;
    motionWarning: string;
    inactivityWarning: string;
    acknowledge: string;
    resolve: string;
    acknowledged: string;
    resolved: string;
    resolutionNotes: string;
  };
  alerts: {
    drowsinessWarning: string;
    highDrowsinessWarning: string;
    distractionWarning: string;
    seatBeltWarning: string;
    emergencyWarning: string;
    gpsWarning: string;
    alarmSounding: string;
    dismiss: string;
  };
  moderator: {
    assignedDrivers: string;
    activeDrivers: string;
    alertCount: string;
    drowsyCount: string;
    dangerCount: string;
    activeEmergencies: string;
    fleetMap: string;
    driverGrid: string;
    allDrivers: string;
    filterAlert: string;
    filterDrowsy: string;
    filterDanger: string;
    vehiclePlate: string;
    route: string;
    lastPing: string;
    actionRequired: string;
    monitorDetails: string;
  };
  admin: {
    fleetOverview: string;
    totalDrivers: string;
    totalModerators: string;
    totalVehicles: string;
    activeTripsCount: string;
    orgSafetyIndex: string;
    addDriver: string;
    addModerator: string;
    addVehicle: string;
    assignDriver: string;
    exportReports: string;
    auditLogs: string;
    systemHealth: string;
  };
  forms: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    plateNumber: string;
    make: string;
    model: string;
    save: string;
    cancel: string;
    submit: string;
    loading: string;
    success: string;
    error: string;
  };
  reports: {
    safetyReport: string;
    tripId: string;
    duration: string;
    distance: string;
    violations: string;
    overallScore: string;
    downloadCsv: string;
    printReport: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    app: {
      title: "SAFE GUARD",
      subtitle: "AI Public Transit Driver Safety & Emergency Platform",
      tagline: "Intelligent Real-Time Driver Alertness, Posture & Vehicle Telemetry",
      status: "System Active",
    },
    nav: {
      dashboard: "Dashboard",
      driverPortal: "Driver Portal",
      moderatorPortal: "Moderator Hub",
      adminPortal: "Admin Center",
      vehicles: "Vehicles",
      reports: "Safety Reports",
      analytics: "Fleet Analytics",
      audits: "Audit Logs",
      login: "Sign In",
      logout: "Sign Out",
      language: "Language",
      profile: "Profile",
    },
    roles: {
      driver: "Driver",
      moderator: "Fleet Moderator",
      admin: "Administrator",
    },
    safetyStates: {
      alert: "ALERT",
      drowsy: "DROWSY",
      highlyDrowsy: "HIGHLY DROWSY",
      safeDescription: "Driver is attentive and eyes are focused on the road.",
      drowsyDescription: "Slow eye blinks or yawning detected. Caution advised.",
      dangerDescription: "Prolonged eye closure or head drop! Immediate action required!",
    },
    hud: {
      liveCamera: "Driver Monitoring Feed",
      cameraStarting: "Initializing camera and computer vision models...",
      cameraError: "Unable to access camera. Please allow webcam permissions.",
      cameraDisabled: "Camera paused. Click Start Monitoring to begin.",
      requestPermission: "Enable Camera",
      safetyScore: "Safety Score",
      ear: "Eye Aspect Ratio (EAR)",
      mar: "Mouth Aspect Ratio (MAR)",
      headPose: "Head Pose Angle",
      blinks: "Blinks / min",
      gaze: "Gaze Direction",
      distraction: "Distraction Alert",
      seatBelt: "Seat Belt Status",
      seatBeltFastened: "Fastened",
      seatBeltUnfastened: "Unfastened!",
      lowLightMode: "Low-Light Boost (CLAHE)",
      simulationMode: "Bio-Sensor Sim Mode",
      fps: "Vision FPS",
      tripStatus: "Trip Status",
      startTrip: "Start Active Trip",
      endTrip: "Complete Trip",
      tripInProgress: "Active On Duty",
      noActiveTrip: "Vehicle Parked (Off Duty)",
    },
    emergencies: {
      medicalEmergency: "SUSPECTED MEDICAL EMERGENCY",
      suspectedCollapse: "Driver Collapse Detected",
      abnormalMotion: "Abnormal Involuntary Motion",
      prolongedInactivity: "Prolonged Driver Unresponsiveness",
      cardiacAlert: "Biometric Anomaly Alert",
      collapseWarning: "Sudden downward head or torso displacement recorded!",
      motionWarning: "Repeated erratic high-frequency convulsion pattern observed!",
      inactivityWarning: "Driver has displayed zero postural micro-movements on active route!",
      acknowledge: "Acknowledge Alert",
      resolve: "Resolve & Clear Event",
      acknowledged: "Acknowledged",
      resolved: "Resolved",
      resolutionNotes: "Resolution & Action Notes",
    },
    alerts: {
      drowsinessWarning: "Drowsiness Alert: Please pull over or take a break!",
      highDrowsinessWarning: "CRITICAL ALERT: Wake up! Audio warning activated!",
      distractionWarning: "Look Forward! Keep your eyes on the road ahead.",
      seatBeltWarning: "Fasten Seat Belt! Public transit safety regulation violation.",
      emergencyWarning: "EMERGENCY: Dispatch and Moderator notified!",
      gpsWarning: "GPS connectivity interrupted. Retrying satellite lock...",
      alarmSounding: "Audio Warning Siren Active",
      dismiss: "Dismiss Notification",
    },
    moderator: {
      assignedDrivers: "Assigned Drivers",
      activeDrivers: "Active on Route",
      alertCount: "Alert State",
      drowsyCount: "Drowsy State",
      dangerCount: "Critical Alerts",
      activeEmergencies: "Active Emergencies",
      fleetMap: "Live Fleet Geolocation Map",
      driverGrid: "Assigned Fleet Drivers",
      allDrivers: "All Drivers",
      filterAlert: "Filter Alert",
      filterDrowsy: "Filter Drowsy",
      filterDanger: "Filter Critical",
      vehiclePlate: "Vehicle Plate",
      route: "Route Assigned",
      lastPing: "Last AI Ping",
      actionRequired: "Action Required",
      monitorDetails: "Inspect Telemetry",
    },
    admin: {
      fleetOverview: "Transit Fleet Safety Command Center",
      totalDrivers: "Total Drivers",
      totalModerators: "Supervising Moderators",
      totalVehicles: "Registered Buses",
      activeTripsCount: "Active Dispatches",
      orgSafetyIndex: "Fleet Safety Index",
      addDriver: "Register New Driver",
      addModerator: "Create Moderator",
      addVehicle: "Register Vehicle",
      assignDriver: "Assign Driver to Moderator",
      exportReports: "Export Audit Reports",
      auditLogs: "Security Audit Log",
      systemHealth: "AI Infrastructure Status",
    },
    forms: {
      email: "Email Address",
      password: "Password",
      fullName: "Full Name",
      role: "Assigned Role",
      plateNumber: "Vehicle Plate Number (e.g. AP 29 TA 4421)",
      make: "Vehicle Make",
      model: "Vehicle Model",
      save: "Save Changes",
      cancel: "Cancel",
      submit: "Submit",
      loading: "Processing...",
      success: "Operation successful",
      error: "An error occurred",
    },
    reports: {
      safetyReport: "Driver Safety & Performance Report",
      tripId: "Trip Reference ID",
      duration: "Trip Duration",
      distance: "Distance Covered",
      violations: "Safety Violations",
      overallScore: "Driver Safety Grade",
      downloadCsv: "Download CSV Export",
      printReport: "Print Official Report",
    },
  },
  te: {
    app: {
      title: "సేఫ్ గార్డ్ (SAFE GUARD)",
      subtitle: "ప్రజా రవాణా డ్రైవర్ భద్రత & అత్యవసర స్పందన వ్యవస్థ",
      tagline: "కృత్రిమ మేధస్సు ఆధారిత డ్రైవర్ అప్రమత్తత మరియు వాహన పర్యవేక్షణ",
      status: "వ్యవస్థ చురుగ్గా ఉంది",
    },
    nav: {
      dashboard: "డాష్‌బోర్డ్",
      driverPortal: "డ్రైవర్ పోర్టల్",
      moderatorPortal: "మోడరేటర్ కేంద్రం",
      adminPortal: "అడ్మిన్ కేంద్రం",
      vehicles: "వాహనాలు",
      reports: "భద్రతా నివేదికలు",
      analytics: "ఫ్లీట్ విశ్లేషణ",
      audits: "ఆడిట్ లాగ్స్",
      login: "లాగిన్ అవ్వండి",
      logout: "లాగౌట్",
      language: "భాష (Language)",
      profile: "ప్రొఫైల్",
    },
    roles: {
      driver: "డ్రైవర్",
      moderator: "ఫ్లీట్ మోడరేటర్",
      admin: "అడ్మినిస్ట్రేటర్",
    },
    safetyStates: {
      alert: "అప్రమత్తంగా ఉన్నారు (ALERT)",
      drowsy: "నిద్రమత్తు (DROWSY)",
      highlyDrowsy: "తీవ్ర నిద్రమత్తు (HIGHLY DROWSY)",
      safeDescription: "డ్రైవర్ రోడ్డుపై పూర్తి ఏకాగ్రతతో ఉన్నారు.",
      drowsyDescription: "కనురెప్పల నెమ్మదింపు లేదా ఆవలించడం గమనించబడింది. జాగ్రత్త వహించండి.",
      dangerDescription: "కళ్ళు మూసుకుపోవడం లేదా తల వాలడం! తక్షణ హెచ్చరిక అవసరం!",
    },
    hud: {
      liveCamera: "డ్రైవర్ నిఘా కెమెరా",
      cameraStarting: "కెమెరా మరియు AI మోడల్స్ సిద్ధమవుతున్నాయి...",
      cameraError: "కెమెరాను యాక్సెస్ చేయడం సాధ్యపడలేదు. దయచేసి అనుమతి ఇవ్వండి.",
      cameraDisabled: "కెమెరా నిలిపివేయబడింది. ప్రారంభించడానికి క్లిక్ చేయండి.",
      requestPermission: "కెమెరాను ప్రారంభించండి",
      safetyScore: "భద్రతా స్కోరు",
      ear: "కంటి నిష్పత్తి (EAR)",
      mar: "నోటి నిష్పత్తి (MAR)",
      headPose: "తల స్థాన కోణం",
      blinks: "నిమిషానికి బ్లింక్స్",
      gaze: "చూపు దిశ",
      distraction: "దృష్టి మరలడం హెచ్చరిక",
      seatBelt: "సీట్ బెల్ట్ స్థితి",
      seatBeltFastened: "ధరించారు",
      seatBeltUnfastened: "ధరించలేదు!",
      lowLightMode: "తక్కువ వెలుతురు మెరుగుదల (CLAHE)",
      simulationMode: "బయో-సెన్సర్ సిమ్యులేషన్",
      fps: "విజన్ FPS",
      tripStatus: "ట్రిప్ స్థితి",
      startTrip: "ప్రయాణం ప్రారంభించండి",
      endTrip: "ప్రయాణం ముగించండి",
      tripInProgress: "విధి నిర్వహణలో ఉన్నారు",
      noActiveTrip: "వాహనం నిలిపివేయబడింది",
    },
    emergencies: {
      medicalEmergency: "అనుమానిత వైద్య అత్యవసర పరిస్థితి",
      suspectedCollapse: "డ్రైవర్ కుప్పకూలినట్లు గుర్తింపు",
      abnormalMotion: "అసాధారణ అసంకల్పిత కదలికలు",
      prolongedInactivity: "ఎటువంటి కదలిక లేని పరిస్థితి",
      cardiacAlert: "గుండె స్పందనల హెచ్చరిక",
      collapseWarning: "తల లేదా మొండెం అకస్మాత్తుగా పడిపోవడం రికార్డైంది!",
      motionWarning: "తీవ్రమైన వణుకు లేదా ఫిట్స్ తరహా కదలికలు గమనించబడ్డాయి!",
      inactivityWarning: "నడుస్తున్న బస్సులో డ్రైవర్ నుండి ఎటువంటి కదలికలు లేవు!",
      acknowledge: "హెచ్చరికను గుర్తించండి",
      resolve: "పరిష్కరించి క్లియర్ చేయండి",
      acknowledged: "గుర్తించబడింది",
      resolved: "పరిష్కరించబడింది",
      resolutionNotes: "పరిష్కార చర్యల వివరాలు",
    },
    alerts: {
      drowsinessWarning: "నిద్రమత్తు హెచ్చరిక: దయచేసి వాహనాన్ని ఆపండి లేదా విరామం తీసుకోండి!",
      highDrowsinessWarning: "తీవ్ర హెచ్చరిక: మేల్కొనండి! హెచ్చరిక సైరన్ మోగించబడింది!",
      distractionWarning: "ముందుకు చూడండి! రహదారిపై మాత్రమే దృష్టి పెట్టండి.",
      seatBeltWarning: "సీట్ బెల్ట్ ధరించండి! భద్రతా నిబంధనల ఉల్లంఘన.",
      emergencyWarning: "అత్యవసర పరిస్థితి: డిస్పాచ్ మరియు అధికారులకు సమాచారం పంపబడింది!",
      gpsWarning: "GPS కనెక్టివిటీ కోల్పోయింది. మళ్ళీ ప్రయత్నిస్తోంది...",
      alarmSounding: "హెచ్చరిక సైరన్ మోగుతోంది",
      dismiss: "హెచ్చరికను మూసివేయండి",
    },
    moderator: {
      assignedDrivers: "కేటాయించిన డ్రైవర్లు",
      activeDrivers: "ప్రయాణంలో ఉన్నవారు",
      alertCount: "అప్రమత్తమైన వారు",
      drowsyCount: "మత్తులో ఉన్నవారు",
      dangerCount: "ప్రమాదకర స్థితిలో ఉన్నవారు",
      activeEmergencies: "అత్యవసర సంఘటనలు",
      fleetMap: "లైవ్ బస్సుల లొకేషన్ మ్యాప్",
      driverGrid: "కేటాయించబడిన బస్సు డ్రైవర్లు",
      allDrivers: "అందరు డ్రైవర్లు",
      filterAlert: "అప్రమత్తం ఫిల్టర్",
      filterDrowsy: "నిద్రమత్తు ఫిల్టర్",
      filterDanger: "తీవ్ర నిద్రమత్తు ఫిల్టర్",
      vehiclePlate: "వాహన నంబరు",
      route: "కేటాయించిన రూట్",
      lastPing: "చివరి అప్‌డేట్",
      actionRequired: "చర్య అవసరం",
      monitorDetails: "పూర్తి వివరాలు చూడండి",
    },
    admin: {
      fleetOverview: "రవాణా సంస్థ భద్రతా నియంత్రణ కేంద్రం",
      totalDrivers: "మొత్తం డ్రైవర్లు",
      totalModerators: "పర్యవేక్షక మోడరేటర్లు",
      totalVehicles: "రిజిస్టర్డ్ బస్సులు",
      activeTripsCount: "నడుస్తున్న ట్రిప్పులు",
      orgSafetyIndex: "సంస్థ భద్రతా ఇండెక్స్",
      addDriver: "కొత్త డ్రైవరును చేర్చండి",
      addModerator: "మోడరేటరును చేర్చండి",
      addVehicle: "వాహనాన్ని నమోదు చేయండి",
      assignDriver: "డ్రైవరును మోడరేటరుకు కేటాయించండి",
      exportReports: "ఆడిట్ నివేదికలను ఎగుమతి చేయండి",
      auditLogs: "భద్రతా ఆడిట్ లాగ్స్",
      systemHealth: "సిస్టమ్ పనితీరు స్థితి",
    },
    forms: {
      email: "ఈమెయిల్ చిరునామా",
      password: "పాస్‌వర్డ్",
      fullName: "పూర్తి పేరు",
      role: "కేటాయించిన పాత్ర",
      plateNumber: "వాహనం నంబర్ (ఉదా: AP 29 TA 4421)",
      make: "వాహనం తయారీ సంస్థ",
      model: "మోడల్",
      save: "మార్పులను భద్రపరచండి",
      cancel: "రద్దు చేయండి",
      submit: "సమర్పించండి",
      loading: "లోడ్ అవుతోంది...",
      success: "విజయవంతమైంది",
      error: "లోపం సంభవించింది",
    },
    reports: {
      safetyReport: "డ్రైవర్ భద్రత & ప్రదర్శన నివేదిక",
      tripId: "ట్రిప్ గుర్తింపు సంఖ్య",
      duration: "ప్రయాణ సమయం",
      distance: "ప్రయాణించిన దూరం",
      violations: "భద్రతా ఉల్లంఘనలు",
      overallScore: "డ్రైవర్ భద్రతా గ్రేడ్",
      downloadCsv: "CSV ఫైల్ డౌన్‌లోడ్",
      printReport: "నివేదికను ప్రింట్ చేయండి",
    },
  },
};

