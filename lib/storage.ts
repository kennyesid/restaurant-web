// Generic localStorage utility with type safety

export interface StorageConfig {
  prefix?: string;
  version?: number;
}

const DEFAULT_PREFIX = 'yesid_';
const DEFAULT_VERSION = 1;

class StorageManager {
  private prefix: string;
  private version: number;

  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix || DEFAULT_PREFIX;
    this.version = config.version || DEFAULT_VERSION;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Get a single item from storage
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue || null;

    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return defaultValue || null;
    }
  }

  /**
   * Set a single item in storage
   */
  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
    }
  }

  /**
   * Get all items of a collection (array)
   */
  getCollection<T>(key: string, defaultValue: T[] = []): T[] {
    const value = this.getItem<T[]>(key, defaultValue);
    return Array.isArray(value) ? value : defaultValue;
  }

  /**
   * Set a collection (array)
   */
  setCollection<T>(key: string, items: T[]): void {
    this.setItem(key, items);
  }

  /**
   * Add an item to a collection
   */
  addToCollection<T extends { [key: string]: any }>(
    key: string,
    item: T,
    idField: string = 'id'
  ): void {
    const items = this.getCollection<T>(key);
    const exists = items.some(i => i[idField] === item[idField]);
    if (!exists) {
      items.push(item);
      this.setCollection(key, items);
    }
  }

  /**
   * Update an item in a collection
   */
  updateInCollection<T extends { [key: string]: any }>(
    key: string,
    id: string | number,
    updates: Partial<T>,
    idField: string = 'id'
  ): boolean {
    const items = this.getCollection<T>(key);
    const index = items.findIndex(i => String(i[idField]) === String(id));
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.setCollection(key, items);
      return true;
    }
    return false;
  }

  /**
   * Remove an item from a collection
   */
  removeFromCollection<T extends { [key: string]: any }>(
    key: string,
    id: string | number,
    idField: string = 'id'
  ): boolean {
    const items = this.getCollection<T>(key);
    const filtered = items.filter(i => String(i[idField]) !== String(id));
    if (filtered.length !== items.length) {
      this.setCollection(key, filtered);
      return true;
    }
    return false;
  }

  /**
   * Get a single item from a collection by ID
   */
  getFromCollection<T extends { [key: string]: any }>(
    key: string,
    id: string | number,
    idField: string = 'id'
  ): T | null {
    const items = this.getCollection<T>(key);
    return items.find(i => String(i[idField]) === String(id)) || null;
  }

  /**
   * Clear all items with a specific prefix
   */
  clear(prefix?: string): void {
    if (typeof window === 'undefined') return;

    const keyPrefix = prefix ? `${this.prefix}${prefix}` : this.prefix;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(keyPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Remove a specific key
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.getKey(key));
  }
}

export const storage = new StorageManager();
