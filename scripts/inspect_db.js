import postgres from 'postgres';

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env'); } catch {}
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(url);

async function inspect() {
  try {
    const users = await sql`SELECT id, email, confirmation_token, recovery_token, email_change_token_current, email_change_token_new, created_at FROM auth.users`;
    console.log("AUTH USERS:", JSON.stringify(users, null, 2));

    const logs = await sql`SELECT * FROM auth.audit_log_entries ORDER BY created_at DESC LIMIT 5`;
    console.log("RECENT AUDIT LOGS:", JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Inspect error:", err);
  } finally {
    await sql.end();
  }
}

inspect();
