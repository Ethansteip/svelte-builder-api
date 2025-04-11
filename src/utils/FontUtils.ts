import fs from 'fs/promises';
import path from 'path';
import { PackageJsonUtils } from './PackageJsonUtils';

export interface Font {
  name: string;
  variable?: boolean;
  fontFamily: string;
}

export class FontUtils {
  static async setupFont(
    projectPath: string,
    font: Font,
    uiLibrary: 'shad' | 'daisy'
  ): Promise<void> {
    if (!font.name) {
      throw new Error('Font is required');
    }

    // Add font dependency to package.json
    const fontPackageName = font.variable
      ? `@fontsource-variable/${font.name}`
      : `@fontsource/${font.name}`;

    await PackageJsonUtils.addDependency(
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

    // If Shad, remove _comment from package.json
    if (uiLibrary === 'shad') {
      const packageJson = await PackageJsonUtils.readPackageJson(projectPath);
      // this is a placeholder to keep the devDependencies object in place
      // while there is nothin in it
      delete packageJson.dependencies['_comment'];
      await PackageJsonUtils.writePackageJson(projectPath, packageJson);
    }
  }
}
