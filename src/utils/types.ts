

export interface ConvertibleMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export interface PineconeMetadata {
  content: string;
  source?: string;
  [key: string]: unknown;
}

export interface QueryMatch {
  id: string;
  score: number;
  metadata: PineconeMetadata;
  values?: number[];
}