// db/index.ts
import { DatabaseManager } from './database';

// Singleton instance
export const dbManager = new DatabaseManager();

// Re-export the class for type usage
export { DatabaseManager } from './database';