import { Font } from './Font';
import { Page } from './Page';
import { ProjectName } from './ProjectName';

export interface ProjectSettings {
  name: ProjectName;
  theme: string;
  font: Font;
  uiLibrary: 'shad' | 'daisy';
  pages: Page[];
  authProvider?: 'supabase' | 'pocketbase';
}
