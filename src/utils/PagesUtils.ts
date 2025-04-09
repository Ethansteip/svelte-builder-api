import fs from 'fs/promises';
import path from 'path';

export interface Page {
  categoryName: string;
  name: string;
}

export class PagesUtils {
  static async setupLandingPage(
    projectPath: string,
    pages: Page[]
  ): Promise<void> {
    const routesPath = path.join(projectPath, 'src', 'routes');
    const landingPath = path.join(routesPath, 'landing');

    // Check if landing directory exists
    const landingExists = await fs
      .access(landingPath)
      .then(() => true)
      .catch(() => false);

    if (!landingExists) return;

    const landingEntries = await fs.readdir(landingPath, {
      withFileTypes: true
    });

    // If a landing page is selected, move it to root route
    const landingPage = pages.find((page) => page.categoryName === 'landing');
    if (landingPage) {
      const selectedVariant = landingPage.name;
      if (!selectedVariant) {
        throw new Error('Selected landing variant not found');
      }

      const selectedLandingPath = path.join(landingPath, selectedVariant);

      // Move the +page.svelte from selected landing variant to root route
      await fs.copyFile(
        path.join(selectedLandingPath, '+page.svelte'),
        path.join(routesPath, '+page.svelte')
      );

      // Remove the other components folder if not using mobile-app landing
      if (selectedVariant !== 'mobile-app') {
        const otherComponentsPath = path.join(
          projectPath,
          'src',
          'lib',
          'components',
          'other'
        );
        if (
          await fs
            .access(otherComponentsPath)
            .then(() => true)
            .catch(() => false)
        ) {
          await fs.rm(otherComponentsPath, { recursive: true });
        }
      }
    }

    // Clean up other landing variants
    for (const entry of landingEntries) {
      if (entry.isDirectory() && entry.name !== landingPage?.name) {
        await fs.rm(path.join(landingPath, entry.name), {
          recursive: true
        });
      }
    }

    // Remove the entire landing directory after moving the selected page to root
    await fs.rm(landingPath, { recursive: true });
  }

  static async setupAuthPage(
    projectPath: string,
    pages: Page[]
  ): Promise<void> {
    const routesPath = path.join(projectPath, 'src', 'routes');
    const authPath = path.join(routesPath, 'auth');

    // Check if auth directory exists
    const authExists = await fs
      .access(authPath)
      .then(() => true)
      .catch(() => false);

    if (!authExists) return;

    const authEntries = await fs.readdir(authPath, { withFileTypes: true });

    // If an auth page is selected, move it to root of auth directory
    const authPage = pages.find((page) => page.categoryName === 'auth');
    if (authPage) {
      const selectedVariant = authPage.name;
      if (!selectedVariant) {
        throw new Error('Selected auth variant not found');
      }

      const selectedAuthPath = path.join(authPath, selectedVariant);

      try {
        // First verify the source file exists and has content
        const sourcePath = path.join(selectedAuthPath, '+page.svelte');
        const sourceContent = await fs.readFile(sourcePath, 'utf-8');

        // Write the content to the destination
        const destPath = path.join(authPath, '+page.svelte');
        await fs.writeFile(destPath, sourceContent);
      } catch (err) {
        console.error('Error copying auth page:', err);
      }
    }

    // Clean up variant directories
    for (const entry of authEntries) {
      if (entry.isDirectory()) {
        await fs.rm(path.join(authPath, entry.name), { recursive: true });
      }
    }

    // Remove auth directory if no auth page was selected
    if (!authPage) {
      await fs.rm(authPath, { recursive: true });
    }
  }

  static async setupAccountPage(
    projectPath: string,
    pages: Page[]
  ): Promise<void> {
    const routesPath = path.join(projectPath, 'src', 'routes');
    const accountPath = path.join(routesPath, 'account');

    // Check if account directory exists
    const accountExists = await fs
      .access(accountPath)
      .then(() => true)
      .catch(() => false);

    if (!accountExists) return;

    const accountEntries = await fs.readdir(accountPath, {
      withFileTypes: true
    });

    // If an account page is selected, move it to root of account directory
    const accountPage = pages.find((page) => page.categoryName === 'account');
    if (accountPage) {
      const selectedVariant = accountPage.name;
      if (!selectedVariant) {
        throw new Error('Selected account variant not found');
      }

      const selectedAccountPath = path.join(accountPath, selectedVariant);

      try {
        // First verify the source file exists and has content
        const sourcePath = path.join(selectedAccountPath, '+page.svelte');
        const sourceContent = await fs.readFile(sourcePath, 'utf-8');

        // Write the content to the destination
        const destPath = path.join(accountPath, '+page.svelte');
        await fs.writeFile(destPath, sourceContent);
      } catch (err) {
        console.error('Error copying account page:', err);
      }
    }

    // Clean up variant directories
    for (const entry of accountEntries) {
      if (entry.isDirectory()) {
        await fs.rm(path.join(accountPath, entry.name), {
          recursive: true
        });
      }
    }

    // Remove account directory if no account page was selected
    if (!accountPage) {
      await fs.rm(accountPath, { recursive: true });
    }
  }
}
