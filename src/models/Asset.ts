export interface Asset {
  id?: number;
  name: string;
  storagePath: string;
  fileName: string;
  type?: 'image' | 'video' | 'audio' | 'other';
}
