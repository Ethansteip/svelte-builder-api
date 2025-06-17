import { Asset } from './Asset';
import { Component } from './Component';

export interface Page {
  id?: number;
  href?: string;
  categoryId: number;
  categoryName: 'landing' | 'auth' | 'account';
  storagePath: string;
  name: string;
  assets?: Asset[];
  components?: Component[];
}
