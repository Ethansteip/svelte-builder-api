import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  createRoute,
  writePageContent,
  cleanRouteVariants,
  addPage,
  addPages
} from '../../utils/PagesUtils';
import { Page } from '../../models/Page';
import { StorageRepository } from '../../repositories/StorageRepository';
import { pages } from '../pages/pages';

// Mock dependencies
jest.mock('../../repositories/StorageRepository');
jest.mock('../../utils/AssetsUtils');
jest.mock('../../utils/ComponentsUtils');

describe('PagesUtils', () => {
  let tempDir: string;
  let projectPath: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svelte-builder-test-'));
    projectPath = path.join(tempDir, 'test-project');
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src', 'routes'), {
      recursive: true
    });
  });

  afterEach(async () => {
    // Clean up temporary directory after each test
    await fs.rm(tempDir, { recursive: true });
  });

  describe('createRoute', () => {
    it('should create a route directory and return its path', async () => {
      const routeName = 'test-route';
      const routePath = await createRoute(projectPath, routeName);

      const expectedPath = path.join(projectPath, 'src', 'routes', routeName);
      expect(routePath).toBe(expectedPath);

      const dirExists = await fs
        .access(routePath)
        .then(() => true)
        .catch(() => false);
      expect(dirExists).toBe(true);
    });
  });

  describe('writePageContent', () => {
    it('should write content to +page.svelte file', async () => {
      const targetDir = path.join(projectPath, 'src', 'routes', 'test-route');
      const content = '<script>console.log("test")</script>';

      await writePageContent(targetDir, content);

      const filePath = path.join(targetDir, '+page.svelte');
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      const writtenContent = await fs.readFile(filePath, 'utf-8');
      expect(writtenContent).toBe(content);
    });
  });

  describe('cleanRouteVariants', () => {
    it('should remove variant folders that do not match the given name', async () => {
      const routePath = path.join(projectPath, 'src', 'routes', 'test-route');
      await fs.mkdir(routePath, { recursive: true });

      // Create some variant folders
      await fs.mkdir(path.join(routePath, 'variant1'), { recursive: true });
      await fs.mkdir(path.join(routePath, 'variant2'), { recursive: true });
      await fs.mkdir(path.join(routePath, 'keep-me'), { recursive: true });

      await cleanRouteVariants(routePath, 'keep-me');

      const entries = await fs.readdir(routePath, { withFileTypes: true });
      const dirNames = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      expect(dirNames).toContain('keep-me');
      expect(dirNames).not.toContain('variant1');
      expect(dirNames).not.toContain('variant2');
    });
  });

  describe('addPage', () => {
    it('should add a signin page to the correct route path', async () => {
      const mockPage: Page = {
        name: 'login',
        categoryName: 'signin',
        bucketPath: '/auth/signin/login',
        assets: [],
        components: []
      };

      // Mock the storage repository response
      (
        StorageRepository.prototype.getFromStorage as jest.Mock
      ).mockResolvedValue({
        text: () => '<script>console.log("test")</script>'
      });

      await addPage(projectPath, 'shad', mockPage);

      // Check if the page was created in the correct location
      const expectedPath = path.join(
        projectPath,
        'src',
        'routes',
        'signin',
        '+page.svelte'
      );
      const fileExists = await fs
        .access(expectedPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should add a landing page to the root routes directory', async () => {
      const mockPage: Page = {
        name: 'landing',
        categoryName: 'landing',
        bucketPath: '/landing',
        landingPage: true,
        assets: [],
        components: []
      };

      // Mock the storage repository response
      (
        StorageRepository.prototype.getFromStorage as jest.Mock
      ).mockResolvedValue({
        text: () => '<script>console.log("landing")</script>'
      });

      await addPage(projectPath, 'shad', mockPage);

      // Check if the page was created in the root routes directory
      const expectedPath = path.join(
        projectPath,
        'src',
        'routes',
        '(web)',
        '+page.svelte'
      );
      const fileExists = await fs
        .access(expectedPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  describe('addPages', () => {
    it('should create correct directory structure for base projects', async () => {
      // Mock the storage repository response for all pages
      (
        StorageRepository.prototype.getFromStorage as jest.Mock
      ).mockResolvedValue({
        text: () => '<script>console.log("test")</script>'
      });

      // Add all pages to the project
      await addPages(projectPath, 'shad', pages);

      // Verify landing page is in root routes directory
      const landingPagePath = path.join(
        projectPath,
        'src',
        'routes',
        '(web)',
        '+page.svelte'
      );
      const landingPageExists = await fs
        .access(landingPagePath)
        .then(() => true)
        .catch(() => false);
      expect(landingPageExists).toBe(true);

      // Verify signin pages are in signin directory
      const signinPages = pages.filter(
        (page) => page.categoryName === 'signin'
      );
      if (signinPages.length > 0) {
        const signinPagePath = path.join(
          projectPath,
          'src',
          'routes',
          'signin',
          '+page.svelte'
        );
        const signinPageExists = await fs
          .access(signinPagePath)
          .then(() => true)
          .catch(() => false);
        expect(signinPageExists).toBe(true);
      }

      // Verify account pages are in account directory
      const accountPages = pages.filter(
        (page) => page.categoryName === 'account'
      );
      if (accountPages.length > 0) {
        const accountPagePath = path.join(
          projectPath,
          'src',
          'routes',
          'account',
          '+page.svelte'
        );
        const accountPageExists = await fs
          .access(accountPagePath)
          .then(() => true)
          .catch(() => false);
        expect(accountPageExists).toBe(true);
      }

      // Verify directory structure
      const routesDir = path.join(projectPath, 'src', 'routes');
      const entries = await fs.readdir(routesDir, { withFileTypes: true });
      const dirNames = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      // Should have signin and account directories
      expect(dirNames).toContain('signin');
      expect(dirNames).toContain('account');

      // Should have +page.svelte in root
      const rootFiles = await fs.readdir(routesDir);
      expect(rootFiles).toContain('+page.svelte');
    });

    it('should create correct directory structure for Supabase auth provider', async () => {
      // Mock the storage repository response for all pages
      (
        StorageRepository.prototype.getFromStorage as jest.Mock
      ).mockResolvedValue({
        text: () => '<script>console.log("test")</script>'
      });

      // Add all pages to the project with Supabase auth provider
      await addPages(projectPath, 'shad', pages, 'supabase');

      // Verify landing page is in root routes directory
      const landingPagePath = path.join(
        projectPath,
        'src',
        'routes',
        '+page.svelte'
      );
      const landingPageExists = await fs
        .access(landingPagePath)
        .then(() => true)
        .catch(() => false);
      expect(landingPageExists).toBe(true);

      // Verify signin page is in (web)/auth directory
      const signinPagePath = path.join(
        projectPath,
        'src',
        'routes',
        '(web)',
        'auth',
        '+page.svelte'
      );
      const signinPageExists = await fs
        .access(signinPagePath)
        .then(() => true)
        .catch(() => false);
      expect(signinPageExists).toBe(true);

      // Verify signup page is in auth/signup directory
      const signupPagePath = path.join(
        projectPath,
        'src',
        'routes',
        'auth',
        'signup',
        '+page.svelte'
      );
      const signupPageExists = await fs
        .access(signupPagePath)
        .then(() => true)
        .catch(() => false);
      expect(signupPageExists).toBe(true);

      // Verify reset-password page is in auth/reset-password directory
      const resetPasswordPagePath = path.join(
        projectPath,
        'src',
        'routes',
        'auth',
        'reset-password',
        '+page.svelte'
      );
      const resetPasswordPageExists = await fs
        .access(resetPasswordPagePath)
        .then(() => true)
        .catch(() => false);
      expect(resetPasswordPageExists).toBe(true);

      // Verify forgot-password page is in auth/forgot-password directory
      const forgotPasswordPagePath = path.join(
        projectPath,
        'src',
        'routes',
        'auth',
        'forgot-password',
        '+page.svelte'
      );
      const forgotPasswordPageExists = await fs
        .access(forgotPasswordPagePath)
        .then(() => true)
        .catch(() => false);
      expect(forgotPasswordPageExists).toBe(true);

      // Verify account pages are in account directory
      const accountPages = pages.filter(
        (page) => page.categoryName === 'account'
      );
      if (accountPages.length > 0) {
        const accountPagePath = path.join(
          projectPath,
          'src',
          'routes',
          'account',
          '+page.svelte'
        );
        const accountPageExists = await fs
          .access(accountPagePath)
          .then(() => true)
          .catch(() => false);
        expect(accountPageExists).toBe(true);
      }

      // Verify directory structure
      const routesDir = path.join(projectPath, 'src', 'routes');
      const entries = await fs.readdir(routesDir, { withFileTypes: true });
      const dirNames = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      // Should have (web), auth, and account directories
      expect(dirNames).toContain('(web)');
      expect(dirNames).toContain('auth');
      expect(dirNames).toContain('account');

      // Should have +page.svelte in root
      const rootFiles = await fs.readdir(routesDir);
      expect(rootFiles).toContain('+page.svelte');
    });
  });
});
