import { Task, TimeSegment, Tag } from '../types';

export interface BackupData {
  id: string;
  timestamp: number;
  tasks: Task[];
  segments: TimeSegment[];
  tags: Tag[];
}

const BACKUP_KEY = 'mindflow_backups';
const MAX_BACKUPS = 48; // Store up to 48 backups

export const getBackups = (): BackupData[] => {
  try {
    const data = localStorage.getItem(BACKUP_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse backups', e);
    return [];
  }
};

export const saveBackup = (tasks: Task[], segments: TimeSegment[], tags: Tag[]) => {
  try {
    const backups = getBackups();
    const newBackup: BackupData = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      tasks,
      segments,
      tags,
    };

    backups.unshift(newBackup); // Add to the beginning

    // Keep only the latest MAX_BACKUPS
    const trimmedBackups = backups.slice(0, MAX_BACKUPS);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(trimmedBackups));
    console.log(`Backup created at ${new Date(newBackup.timestamp).toLocaleString()}`);
  } catch (e) {
    console.error('Failed to save backup', e);
  }
};

export const restoreBackup = (backupId: string): BackupData | null => {
  const backups = getBackups();
  const backup = backups.find(b => b.id === backupId);
  return backup || null;
};

// Check if a backup is needed based on the interval
export const checkAndPerformBackup = (
  tasks: Task[],
  segments: TimeSegment[],
  tags: Tag[],
  intervalHours: number
) => {
  if (intervalHours <= 0) return; // Allow disabling if interval is <= 0

  const backups = getBackups();
  const now = Date.now();
  
  if (backups.length === 0) {
    saveBackup(tasks, segments, tags);
    return;
  }

  const lastBackup = backups[0]; // The most recent backup
  const intervalMs = intervalHours * 60 * 60 * 1000;

  if (now - lastBackup.timestamp >= intervalMs) {
    saveBackup(tasks, segments, tags);
  }
};
