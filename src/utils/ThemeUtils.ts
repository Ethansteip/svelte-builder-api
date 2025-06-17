import fs from 'fs/promises';
import path from 'path';
import { StorageRepository } from '../repositories/StorageRepository';

export class ThemeUtils {
  private storageRepository: StorageRepository;

  private static readonly SHAD_THEME_PATH = 'shad/themes';

  constructor() {
    this.storageRepository = new StorageRepository();
  }

  public async setupBaseTheme(
    projectPath: string,
    uiLibrary: string,
    theme: string
  ) {
    try {
      if (uiLibrary === 'shad') {
        await ThemeUtils.setupShadTheme(projectPath, theme);
        return true;
      } else if (uiLibrary === 'daisy') {
        await ThemeUtils.setupDaisyTheme(projectPath, theme);
        return true;
      } else {
        throw new Error(`Unsupported UI library: ${theme}`);
      }
    } catch (error) {
      console.error('Error setting up base theme:', error);
      throw new Error('Error setting up base theme');
    }
  }

  static async setupShadTheme(
    projectPath: string,
    theme: string
  ): Promise<void> {
    const storageRepository = new StorageRepository();

    // Fetch theme from storage
    const themeContent = await storageRepository.getFromStorage(
      this.SHAD_THEME_PATH,
      `${theme}.css`
    );

    // Convert Blob to string
    const themeContentString = await themeContent.text();

    // find the app.css file
    const appCssPath = path.join(projectPath, 'src', 'app.css');

    // Write theme content to app.css
    await fs.writeFile(appCssPath, themeContentString);
  }

  static async setupDaisyTheme(
    projectPath: string,
    theme: string
  ): Promise<void> {
    // Setup DaisyUI theme
    const appCssPath = path.join(projectPath, 'src', 'app.css');
    const existingCss = await fs.readFile(appCssPath, 'utf-8');
    const daisyThemeContent = `${existingCss}\n\n@plugin "daisyui" {\n\tthemes: ${theme} --default;\n}\n`;
    await fs.writeFile(appCssPath, daisyThemeContent);
  }
}
