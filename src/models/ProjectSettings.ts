import { Page } from './Page';

export interface ProjectSettings {
  theme: string;
  font: { name: string; fontFamily: string; variable: boolean };
  uiLibrary: string;
  selectedPages: { landing: Page; auth: Page; account: Page };
}
