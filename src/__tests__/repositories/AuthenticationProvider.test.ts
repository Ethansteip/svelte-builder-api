import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { AuthenticationProvider } from '../../repositories/AuthenticationProvider';
import { Page } from '../../models/Page';
import { StorageRepository } from '../../repositories/StorageRepository';

// Mock dependencies
jest.mock('../../repositories/StorageRepository');
jest.mock('../../utils/EnvUtils');

describe('AuthenticationProvider', () => {
  let tempDir: string;
  let projectPath: string;
  let authProvider: AuthenticationProvider;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svelte-builder-test-'));
    projectPath = path.join(tempDir, 'test-project');
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src', 'routes'), {
      recursive: true
    });

    authProvider = new AuthenticationProvider(projectPath);
  });

  afterEach(async () => {
    // Clean up temporary directory after each test
    await fs.rm(tempDir, { recursive: true });
  });

  describe('addSupabase', () => {
    it('should add pages and env variables for Supabase auth', async () => {
      const mockPages: Page[] = [
        {
          categoryName: 'landing',
          bucketPath: '/landing/service',
          name: 'service',
          components: []
        },
        {
          categoryName: 'signin',
          bucketPath: '/auth/signin/standard-1',
          name: 'standard-1'
        },
        {
          categoryName: 'signup',
          bucketPath: '/auth/signup/standard-1',
          name: 'standard-1'
        },
        {
          categoryName: 'reset-password',
          bucketPath: '/auth/reset-password/standard-1',
          name: 'standard-1'
        },
        {
          categoryName: 'forgot-password',
          bucketPath: '/auth/forgot-password/standard-1',
          name: 'standard-1'
        },
        {
          categoryName: 'account',
          bucketPath: '/account/standard-1',
          name: 'standard-1'
        }
      ];

      // Mock the storage repository response
      (
        StorageRepository.prototype.getFromStorage as jest.Mock
      ).mockResolvedValue({
        text: () => '<script>console.log("test")</script>'
      });

      await authProvider.addSupabase('shad', mockPages);

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

      // Verify account page is in account directory
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
