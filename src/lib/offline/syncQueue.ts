// ==============================================================================
// SAFE GUARD AI - IndexedDB-Backed Offline Event Queue & Idempotency Sync
// Stores safety events during connectivity loss and synchronizes without duplicates
// ==============================================================================

import { mockDb } from '../supabase/mockStore';

export interface QueuedItem {
  id: string;
  idempotency_key: string;
  type: 'monitoring' | 'emergency' | 'gps';
  payload: any;
  timestamp: number;
  retryCount: number;
}

const DB_NAME = 'safeguard_offline_db';
const STORE_NAME = 'event_queue';

class OfflineSyncManager {
  private queue: QueuedItem[] = [];
  private processedKeys = new Set<string>();
  private isOnline = true;
  private syncTimer: any = null;
  private db: IDBDatabase | null = null;
  private listeners: Array<(queueLength: number, isOnline: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.initIndexedDB().then(() => {
        this.loadQueue();
        this.startSyncLoop();
      });
    }
  }

  private async initIndexedDB(): Promise<void> {
    if (!('indexedDB' in window)) return;

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
        request.onsuccess = (e: any) => {
          this.db = e.target.result;
          resolve();
        };
        request.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    console.log(`SAFE GUARD: Network state changed to ${online ? 'ONLINE' : 'OFFLINE'}`);
    this.notifyListeners();
    if (online) {
      this.flushQueue();
    }
  }

  public subscribe(cb: (queueLength: number, isOnline: boolean) => void) {
    this.listeners.push(cb);
    cb(this.queue.length, this.isOnline);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.queue.length, this.isOnline);
      } catch (e) {
        // Ignored
      }
    });
  }

  private loadQueue() {
    // 1. Try IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            this.queue = req.result;
            this.notifyListeners();
            return;
          }
          this.loadFromLocalStorage();
        };
        req.onerror = () => this.loadFromLocalStorage();
        return;
      } catch (e) {
        this.loadFromLocalStorage();
      }
    } else {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('safeguard_offline_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (e) {
      this.queue = [];
    }
  }

  private saveQueue() {
    // Save to IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        this.queue.forEach((item) => store.put(item));
      } catch (e) {
        // Ignored
      }
    }

    // Save backup to LocalStorage
    try {
      localStorage.setItem('safeguard_offline_queue', JSON.stringify(this.queue));
    } catch (e) {
      // Storage quota exceeded
    }

    this.notifyListeners();
  }

  public enqueue(type: 'monitoring' | 'emergency' | 'gps', payload: any) {
    const timestamp = Date.now();
    const idempotency_key = `${type}_${payload.driver_id || 'unk'}_${payload.event_type || 'ev'}_${Math.floor(timestamp / 3000)}`;

    // Duplicate check within short window
    if (this.processedKeys.has(idempotency_key)) {
      return;
    }

    const item: QueuedItem = {
      id: 'queue-' + Math.random().toString(36).substring(2, 9),
      idempotency_key,
      type,
      payload,
      timestamp,
      retryCount: 0,
    };

    if (!this.isOnline) {
      this.queue.push(item);
      this.saveQueue();
      console.log(`SAFE GUARD: Event buffered offline (${this.queue.length} pending sync)`);
    } else {
      this.dispatchItem(item);
    }
  }

  private dispatchItem(item: QueuedItem) {
    if (this.processedKeys.has(item.idempotency_key)) {
      return; // Skip duplicate
    }

    try {
      if (item.type === 'monitoring') {
        mockDb.addMonitoringEvent(item.payload);
      } else if (item.type === 'emergency') {
        mockDb.addEmergencyEvent(item.payload);
      } else if (item.type === 'gps') {
        mockDb.updateGPS(item.payload);
      }

      this.processedKeys.add(item.idempotency_key);
      if (this.processedKeys.size > 200) {
        const arr = Array.from(this.processedKeys);
        this.processedKeys = new Set(arr.slice(50));
      }
    } catch (e) {
      console.error('Failed to dispatch item, re-queuing:', e);
      item.retryCount++;
      if (item.retryCount <= 5) {
        this.queue.push(item);
        this.saveQueue();
      }
    }
  }

  public flushQueue() {
    if (this.queue.length === 0) return;
    console.log(`SAFE GUARD: Synchronizing ${this.queue.length} offline events...`);
    const pending = [...this.queue];
    this.queue = [];
    this.saveQueue();

    pending.forEach((item) => {
      this.dispatchItem(item);
    });
  }

  private startSyncLoop() {
    this.syncTimer = setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.flushQueue();
      }
    }, 10000);
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }
}

export const offlineSyncManager = new OfflineSyncManager();
