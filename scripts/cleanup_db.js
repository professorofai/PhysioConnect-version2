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

async function clean() {
  try {
    console.log("Cleaning dummy entries from database...");

    // 1. Clear application tables
    await sql`DELETE FROM public.assessment_submissions`;
    console.log("✓ Cleared public.assessment_submissions");

    await sql`DELETE FROM public.bookings`;
    console.log("✓ Cleared public.bookings");

    await sql`DELETE FROM public.profiles`;
    console.log("✓ Cleared public.profiles");

    // 2. Clear auth tables
    const deletedIdentities = await sql`DELETE FROM auth.identities`;
    console.log(`✓ Cleared auth.identities (${deletedIdentities.count} rows)`);

    const deletedSessions = await sql`DELETE FROM auth.sessions`;
    console.log(`✓ Cleared auth.sessions (${deletedSessions.count} rows)`);

    const deletedUsers = await sql`DELETE FROM auth.users RETURNING id, email`;
    console.log(`✓ Deleted auth.users:`, deletedUsers.map(u => u.email));

    console.log("Database dummy cleanup complete! Clean slate ready.");
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    await sql.end();
  }
}

clean();
