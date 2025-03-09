import { Page } from './Page';

export interface ProjectSettings {
  theme: string;
  font: string;
  uiLibrary: string;
  selectedPages: { landing: Page; auth: Page; account: Page };
}
