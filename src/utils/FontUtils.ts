import fs from 'fs/promises';
import path from 'path';
import { Font } from '../models/Font';
import { PackageJsonUtils } from './PackageJsonUtils';

export class FontUtils {
  private readonly packageJsonUtils: PackageJsonUtils;

  constructor() {
    this.packageJsonUtils = new PackageJsonUtils();
  }

  public async setupFont(projectPath: string, font: Font): Promise<void> {
    if (!font.name) {
      throw new Error('Font is required');
    }

    // If the font is Cabin, return early as it's already set as default
    if (font.name.toLowerCase() === 'cabin') {
      return;
    }

    // Remove the default Cabin font dependency
    await this.packageJsonUtils.removeDependency(
      projectPath,
      '@fontsource-variable/cabin'
    );

    // Add new font dependency to package.json
    const fontPackageName = font.variable
      ? `@fontsource-variable/${font.name}`
      : `@fontsource/${font.name}`;

    await this.packageJsonUtils.addDependency(
      projectPath,
      fontPackageName,
      '^5.1.0'
    );

    // Add font import to app.css
    const appCssPath = path.join(projectPath, 'src', 'app.css');
    const fontImport = `@import '${fontPackageName}';\n`;
    const existingCss = await fs.readFile(appCssPath, 'utf-8');
    await fs.writeFile(appCssPath, fontImport + existingCss);

    // Add font-family to the :root in app.css
    const fontFamilyRule = `\n\n:root {\n  ${font.fontFamily}\n}\n`;
    await fs.appendFile(appCssPath, fontFamilyRule);
  }
}
