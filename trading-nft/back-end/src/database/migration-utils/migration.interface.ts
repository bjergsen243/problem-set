export interface IMigration {
  up(): Promise<void>;
  down(): Promise<void>;
}

export interface IMigrationMeta {
  name: string;
  timestamp: number;
  description: string;
} 