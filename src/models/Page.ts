import { Asset } from './Asset';
import { Component } from './Component';

export interface Page {
  id?: number;
  href?: string;
  categoryId: number;
  categoryName: 'landing' | 'auth' | 'account';
  name: string;
  assets?: Asset[];
  components?: Component[];
}
