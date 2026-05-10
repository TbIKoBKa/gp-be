import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';

const MIGRATIONS_DIR = join(process.cwd(), 'src', 'migrations');
const MIGRATIONS_HISTORY_FILE = join(MIGRATIONS_DIR, '.migrations-history.json');
const BACKUP_DIR = '/var/backups/mysql';

interface MigrationHistory {
  executedMigrations: string[];
}

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.runPendingMigrations();
  }

  private getMigrationHistory(): MigrationHistory {
    if (!existsSync(MIGRATIONS_HISTORY_FILE)) {
      return { executedMigrations: [] };
    }

    try {
      const content = readFileSync(MIGRATIONS_HISTORY_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { executedMigrations: [] };
    }
  }

  private saveMigrationHistory(history: MigrationHistory): void {
    writeFileSync(MIGRATIONS_HISTORY_FILE, JSON.stringify(history, null, 2));
  }

  private getPendingMigrations(): string[] {
    if (!existsSync(MIGRATIONS_DIR)) {
      return [];
    }

    const history = this.getMigrationHistory();
    const allMigrations = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    return allMigrations.filter((m) => !history.executedMigrations.includes(m));
  }

  private createBackup(): string | null {
    const dbName = this.configService.get<string>('GP_DB_NAME');
    const dbHost = this.configService.get<string>('GP_DB_HOST');
    const dbUser = this.configService.get<string>('GP_DB_USER');
    const dbPassword = this.configService.get<string>('GP_DB_PASSWORD');
    const dbPort = this.configService.get<string>('GP_DB_PORT');

    // Use local backup dir for localhost, remote dir for production
    const isLocal = dbHost === 'localhost' || dbHost === '127.0.0.1';
    const backupDir = isLocal ? join(process.cwd(), 'backups') : BACKUP_DIR;

    try {
      mkdirSync(backupDir, { recursive: true });
    } catch {
      this.logger.warn(`Could not create backup directory: ${backupDir}`);
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace('T', '_').split('.')[0];
    const backupFile = join(backupDir, `backup_${timestamp}.sql.gz`);

    try {
      const cmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p'${dbPassword}' --single-transaction ${dbName} | gzip > ${backupFile}`;
      execSync(cmd, { stdio: 'pipe' });
      this.logger.log(`Backup created: ${backupFile}`);
      return backupFile;
    } catch (error) {
      this.logger.error('Failed to create backup', (error as Error).message);
      return null;
    }
  }

  private async executeMigration(migrationFile: string): Promise<boolean> {
    const filePath = join(MIGRATIONS_DIR, migrationFile);
    const sql = readFileSync(filePath, 'utf-8');

    // Split by semicolon but keep statements intact
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    try {
      for (const statement of statements) {
        await this.dataSource.query(statement);
      }
      return true;
    } catch (error) {
      this.logger.error(`Migration ${migrationFile} failed:`, (error as Error).message);
      return false;
    }
  }

  async runPendingMigrations(): Promise<void> {
    const pendingMigrations = this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      this.logger.log('No pending migrations');
      return;
    }

    this.logger.log(`Found ${pendingMigrations.length} pending migration(s): ${pendingMigrations.join(', ')}`);

    // Create backup before running migrations
    const backupFile = this.createBackup();
    if (backupFile) {
      this.logger.log(`Backup saved to: ${backupFile}`);
    }

    const history = this.getMigrationHistory();

    for (const migration of pendingMigrations) {
      this.logger.log(`Running migration: ${migration}`);

      const success = await this.executeMigration(migration);

      if (success) {
        history.executedMigrations.push(migration);
        this.saveMigrationHistory(history);
        this.logger.log(`Migration ${migration} completed successfully`);
      } else {
        this.logger.error(`Migration ${migration} failed. Stopping.`);
        if (backupFile) {
          this.logger.warn(`To restore: gunzip < ${backupFile} | mysql <dbname>`);
        }
        break;
      }
    }
  }
}
