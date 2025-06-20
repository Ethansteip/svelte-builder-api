import fs from 'fs/promises';
import path from 'path';
import { Page } from '../models/Page';
import { StorageRepository } from '../repositories/StorageRepository';
import { AssetsUtils } from './AssetsUtils';
import { ComponentsUtils } from './ComponentsUtils';

const storageRepository = new StorageRepository();
const assetsUtils = new AssetsUtils();
const componentsUtils = new ComponentsUtils();

/**
 * Create the directory for a route and return the poath t it.
 */
export async function createRoute(
  projectPath: string,
  routeName: string
): Promise<string> {
  const routesPath = path.join(projectPath, 'src', 'routes');
  const routePath = path.join(routesPath, routeName);
  await fs.mkdir(routePath, { recursive: true });
  return routePath;
}

/**
 * Fetch the +page.svelte content for a given page from Supabase storage.
 */
export async function fetchPageContent(
  uiLibrary: string,
  page: Page,
  authProvider?: string
): Promise<string> {
  const storagePath = `${uiLibrary}/pages/${authProvider ?? 'base'}${
    page.bucketPath
  }`;
  const pageContent = await storageRepository.getFromStorage(
    storagePath,
    '+page.svelte'
  );

  if (!pageContent) {
    throw new Error(
      `Page content not found for ${page.categoryName}/${page.name}`
    );
  }

  return pageContent.text();
}

/**
 * Fetch the +page.server.ts content for a given page from Supabase storage.
 */

export async function fetchPageServerContent(
  uiLibrary: string,
  page: Page,
  authProvider?: string
): Promise<string> {
  const storagePath = `${uiLibrary}/pages/${
    authProvider ?? 'base'
  }${page.bucketPath.split('/').slice(0, -1).join('/')}`;
  const pageContent = await storageRepository.getFromStorage(
    storagePath,
    '+page.server.ts'
  );

  if (!pageContent) {
    throw new Error(
      `Page content not found for ${page.categoryName}/${page.name}`
    );
  }

  return pageContent.text();
}

/**
 * Write content to a +page.svelte file inside the provided directory.
 */
export async function writePageContent(
  targetDir: string,
  content: string
): Promise<void> {
  await fs.mkdir(targetDir, { recursive: true });
  const file = path.join(targetDir, '+page.svelte');
  await fs.writeFile(file, content, 'utf-8');
}

/**
 * Write content to a +page.server.ts file inside the provided directory.
 */
export async function writePageServerContent(
  targetDir: string,
  content: string
): Promise<void> {
  const file = path.join(targetDir, '+page.server.ts');
  await fs.writeFile(file, content, 'utf-8');
}

/**
 * Remove any variant folders that do not match the given page name.
 */
export async function cleanRouteVariants(
  routePath: string,
  keepName: string
): Promise<void> {
  const routeEntries = await fs.readdir(routePath, { withFileTypes: true });
  for (const entry of routeEntries) {
    if (entry.isDirectory() && entry.name !== keepName) {
      await fs.rm(path.join(routePath, entry.name), { recursive: true });
    }
  }
}

/**
 * Get the target directory for a page based on it being
 * either a landing page, authenticated page, or web page
 * and its route path.
 */
function getTargetDirectory(projectPath: string, page: Page): string {
  const basePath = path.join(projectPath, 'src', 'routes');
  const webPath = path.join(basePath, '(web)');
  const authenticatedPath = path.join(basePath, '(authenticated)');

  // if landing page, return web path
  if (page.landingPage) {
    return webPath;
  } else if (page.authenticatedPage) {
    return path.join(authenticatedPath, page.routePath?.join('/') ?? '');
  } else if (page.webPage) {
    return path.join(webPath, page.routePath?.join('/') ?? '');
  }

  throw new Error(
    `Invalid target directory for page: ${page.categoryName} ${
      page.routePath?.join('/') ?? ''
    }`
  );
}

/**
 * Add a single page to the project directory.
 */
export async function addPage(
  projectPath: string,
  uiLibrary: string,
  page: Page,
  authProvider?: 'supabase' | 'pocketbase'
): Promise<void> {
  const targetDir = getTargetDirectory(projectPath, page);
  const pageContent = await fetchPageContent(uiLibrary, page, authProvider);
  const pageServerContent = page.includePageServer
    ? await fetchPageServerContent(uiLibrary, page, authProvider)
    : '';

  // write +page.svelte content to project
  await writePageContent(targetDir, pageContent);

  // write +page.server.ts to project if it exists
  if (pageServerContent) {
    await writePageServerContent(targetDir, pageServerContent);
  }

  // add assets to project
  if (page.assets) {
    await assetsUtils.addAssets(projectPath, page.assets);
  }

  // add components to project
  if (page.components) {
    await componentsUtils.addComponents(
      projectPath,
      uiLibrary,
      page.components
    );
  }

  // Only clean variants if we're not using Supabase auth
  if (authProvider !== 'supabase' && page.categoryName !== 'landing') {
    await cleanRouteVariants(targetDir, page.name);
  }
}

/**
 * Add multiple pages to the project.
 */
export async function addPages(
  projectPath: string,
  uiLibrary: string,
  pages: Page[],
  authProvider?: 'supabase' | 'pocketbase'
): Promise<void> {
  for (const page of pages) {
    try {
      await addPage(projectPath, uiLibrary, page, authProvider);
    } catch (error) {
      console.error(`Error setting up ${page.categoryName} page:`, error);
    }
  }
}
