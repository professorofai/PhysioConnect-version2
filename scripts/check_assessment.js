import postgres from 'postgres';

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env'); } catch {}
}

const url = process.env.DATABASE_URL || process.env.LOVABLE_DB_MIGRATION_URL;
if (!url) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}
const sql = postgres(url);

async function main() {
  try {
    const assessments = await sql`SELECT * FROM public.assessment_submissions ORDER BY created_at DESC LIMIT 1`;
    console.log(JSON.stringify(assessments, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
