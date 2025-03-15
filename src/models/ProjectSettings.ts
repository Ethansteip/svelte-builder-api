import { Page } from './Page';

export interface ProjectSettings {
  projectName: string;
  theme: string;
  font: { name: string; fontFamily: string; variable: boolean };
  uiLibrary: string;
  selectedPages: { landing: Page; auth: Page; account: Page };
}
