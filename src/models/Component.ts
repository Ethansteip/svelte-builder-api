import { Asset } from './Asset';

export interface Component {
  id?: number;
  href?: string;
  categoryId: number;
  categoryName: 'other';
  /**
   * Path inside Supabase Storage where the component content resides. This path
   * should not include the ui library or auth provider as those will be
   * prefixed when fetching the file.
   * Example: `/other/iPhoneMockup`.
   */
  bucketPath: string;
  name: string;
  assets?: Asset[];
}
