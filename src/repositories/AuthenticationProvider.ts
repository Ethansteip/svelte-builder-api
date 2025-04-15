import { PackageJsonUtils } from '../utils/PackageJsonUtils';
import { EnvUtils } from '../utils/EnvUtils';
import { StorageRepository } from './StorageRepository';
import fs from 'fs/promises';
import path from 'path';

export class AuthenticationProvider {
  private readonly projectPath: string;
  private readonly packageJsonUtils: PackageJsonUtils;
  private readonly envUtils: EnvUtils;
  private readonly storageRepository: StorageRepository;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.packageJsonUtils = new PackageJsonUtils();
    this.envUtils = new EnvUtils();
    this.storageRepository = new StorageRepository();
  }

  public async addSupabase() {
    // add dependencies
    // @supabase/ssr
    // @supabase/supabase-js
    await this.packageJsonUtils.addDependency(
      this.projectPath,
      '@supabase/ssr',
      '^0.5.2'
    );
    await this.packageJsonUtils.addDependency(
      this.projectPath,
      '@supabase/supabase-js',
      '^2.49.3'
    );
    // add .env variables to project
    // anaon key, supabase url, jwt secret, service role key
    await this.envUtils.addEnvVariable(
      this.projectPath,
      'PUBLIC_SUPABASE_URL',
      `""`
    );
    await this.envUtils.addEnvVariable(
      this.projectPath,
      'PUBLIC_SUPABASE_ANON_KEY',
      `""`
    );
    await this.envUtils.addEnvVariable(this.projectPath, 'JWT_SECRET', `""`);
    await this.envUtils.addEnvVariable(
      this.projectPath,
      'SUPABASE_SERVICE_ROLE_KEY',
      `""`
    );

    // 1. Create supabase folder and files
    const supabaseDir = path.join(this.projectPath, 'supabase');
    await fs.mkdir(supabaseDir, { recursive: true });

    // Create empty seed.sql
    await fs.writeFile(path.join(supabaseDir, 'seed.sql'), '');

    // Fetch and save config.toml
    const configToml = await this.storageRepository.getFromStorage(
      'shad/authentication',
      'config.toml'
    );
    await fs.writeFile(
      path.join(supabaseDir, 'config.toml'),
      await configToml.text()
    );

    // 2. Fetch and save hooks.server.ts
    const hooksServer = await this.storageRepository.getFromStorage(
      'shad/authentication',
      'hooks.server.ts'
    );
    await fs.writeFile(
      path.join(this.projectPath, 'src', 'hooks.server.ts'),
      await hooksServer.text()
    );

    // 3. Fetch and save app.d.ts
    const appDts = await this.storageRepository.getFromStorage(
      'shad/authentication',
      'app.d.ts'
    );
    await fs.writeFile(
      path.join(this.projectPath, 'src', 'app.d.ts'),
      await appDts.text()
    );

    // 4. Fetch and save +layout.server.ts
    const layoutServer = await this.storageRepository.getFromStorage(
      'shad/authentication',
      '+layout.server.ts'
    );
    const routesDir = path.join(this.projectPath, 'src', 'routes');
    await fs.mkdir(routesDir, { recursive: true });
    await fs.writeFile(
      path.join(routesDir, '+layout.server.ts'),
      await layoutServer.text()
    );

    // 5. Fetch and save +layout.ts
    const layout = await this.storageRepository.getFromStorage(
      'shad/authentication',
      '+layout.ts'
    );
    await fs.writeFile(path.join(routesDir, '+layout.ts'), await layout.text());

    // 6. Fetch and save events.ts
    const serverDir = path.join(this.projectPath, 'src', 'server');
    await fs.mkdir(serverDir, { recursive: true });
    const event = await this.storageRepository.getFromStorage(
      'shad/authentication',
      'event.ts'
    );
    await fs.writeFile(path.join(serverDir, 'event.ts'), await event.text());
  }
}
