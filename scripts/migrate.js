import fs from 'fs';
import postgres from 'postgres';

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env'); } catch {}
}

const url = process.env.DATABASE_URL || process.env.LOVABLE_DB_MIGRATION_URL;
if (!url) throw new Error("DATABASE_URL missing");

const sql = postgres(url);

async function main() {
  try {
    const file1 = fs.readFileSync('drizzle/migrations/0000_patient_accounts_records.sql', 'utf8');
    const file2 = fs.readFileSync('drizzle/migrations/0001_secure_patient_reports.sql', 'utf8');

    console.log("Running migration 0000...");
    await sql.unsafe(file1);
    console.log("Running migration 0001...");
    await sql.unsafe(file2);

    console.log("Migrations complete!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await sql.end();
  }
}

main();
