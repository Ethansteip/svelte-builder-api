import fs from 'fs/promises';
import path from 'path';

export class ThemeUtils {
  static async setupShadTheme(
    projectPath: string,
    theme: string
  ): Promise<void> {
    // find the themes directory
    const themesPath = path.join(projectPath, 'src', 'lib', 'themes');
    // find the selected theme file
    const selectedThemePath = path.join(themesPath, `${theme}.css`);
    // find the app.css file
    const appCssPath = path.join(projectPath, 'src', 'app.css');

    // Read the selected theme file
    const themeContent = await fs.readFile(selectedThemePath, 'utf-8');

    // Write theme content to app.css
    await fs.writeFile(appCssPath, themeContent);

    // Remove the themes directory
    await fs.rm(themesPath, { recursive: true });
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
