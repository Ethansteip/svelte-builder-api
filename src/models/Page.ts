import { Asset } from './Asset';
import { Component } from './Component';

export interface Page {
  id?: number;
  categoryId: number;
  categoryName:
    | 'landing'
    | 'signup'
    | 'signin'
    | 'forgot-password'
    | 'reset-password'
    | 'account';
  /**
   * Path inside Supabase Storage where the page content resides. This path
   * should not include the ui library or auth provider as those will be
   * prefixed when fetching the file.
   * Example: `/landing/service`.
   */
  bucketPath: string;
  name: string;
  assets?: Asset[];
  components?: Component[];
}
