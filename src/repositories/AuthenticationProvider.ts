import { EnvUtils } from '../utils/EnvUtils';
import { addPages } from '../utils/PagesUtils';
import { Page } from '../models/Page';

export class AuthenticationProvider {
  private readonly projectPath: string;
  private readonly envUtils: EnvUtils;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.envUtils = new EnvUtils();
  }

  public async addSupabase(uiLibrary: string, pages: Page[]) {
    try {
      // Add pages with Supabase auth provider
      await addPages(this.projectPath, uiLibrary, pages, 'supabase');

      // Add .env variables to project
      await this.envUtils.addEnvVariable(
        this.projectPath,
        'PUBLIC_SUPABASE_URL',
        ''
      );
      await this.envUtils.addEnvVariable(
        this.projectPath,
        'PUBLIC_SUPABASE_ANON_KEY',
        ''
      );
      await this.envUtils.addEnvVariable(
        this.projectPath,
        'SUPABASE_SERVICE_ROLE_KEY',
        ''
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          message: 'Error on AuthenticationProvider.ts - addSupabase',
          error: error instanceof Error ? error.message : String(error)
        })
      );
    }
  }
}
