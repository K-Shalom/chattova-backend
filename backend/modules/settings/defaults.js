// modules/settings/defaults.js
//
// Every field a user hasn't explicitly set yet falls back to these values.
// This means a brand-new user (with no row in user_settings) still gets a
// fully valid settings object back from GET /settings — no null-checking
// needed on the frontend.
//
// NOTE on "localMode": Chattova's true offline P2P mesh (Bluetooth/Wi-Fi
// Direct discovery) is out of scope for v1.0 (see SAD section 3 — deferred
// to Phase 11). This preference is stored so the UI/toggle can exist now,
// but "local" and "auto" modes have no functional effect yet — only
// "global" (normal online chat) actually does anything today.

const DEFAULT_PREFERENCES = {
  appearance: {
    theme: 'system',           // 'light' | 'dark' | 'system'
    fontSize: 'medium',        // 'small' | 'medium' | 'large'
    compactMode: false,
    chatWallpaper: null,
  },
  chats: {
    autoDownloadMedia: 'wifi_only', // 'never' | 'wifi_only' | 'wifi_and_mobile'
    enterToSend: true,
    keepMediaInGallery: true,
  },
  localMode: {
    preferredMode: 'auto',     // 'auto' | 'global' | 'local' — 'local' is not functional yet (Phase 11)
    discoverNearbyUsers: false,
    showMeToNearbyUsers: false,
    syncWhenInternetReturns: true,
    wifiOnlySync: false,
    offlineStorageLimitMb: 1024,
  },
  notifications: {
    privateMessages: true,
    groupMessages: true,
    incomingCalls: true,
    missedCalls: true,
    messageSound: true,
    callRingtone: true,
    vibration: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  },
  privacy: {
    lastSeen: 'everyone',      // 'everyone' | 'contacts' | 'nobody'
    onlineStatus: 'everyone',
    readReceipts: true,
    profilePhotoVisibility: 'everyone',
    bioVisibility: 'everyone',
    phoneNumberVisibility: 'contacts',
    whoCanAddMe: 'everyone',
  },
  security: {
    appLock: false,
    fingerprintUnlock: false,
    faceUnlock: false,
  },
  calls: {
    autoJoinGroupCalls: false,
    noiseSuppression: true,
    echoCancellation: true,
    lowDataMode: false,
  },
};

module.exports = { DEFAULT_PREFERENCES };
