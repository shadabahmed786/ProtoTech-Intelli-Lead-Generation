const fs = require('fs');
const path = require('path');

const target = process.argv[2]; // 'postgres' or 'sqlite'
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (!target || !['postgres', 'postgresql', 'sqlite'].includes(target)) {
  console.error('Usage: node scripts/switch-db.js [postgres|sqlite]');
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');

if (target === 'postgres' || target === 'postgresql') {
  content = content.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  console.log('Switched Prisma provider to "postgresql" for Supabase/PostgreSQL deployment.');
} else {
  content = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  console.log('Switched Prisma provider to "sqlite" for local/standalone deployment.');
}

fs.writeFileSync(schemaPath, content, 'utf8');
