const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

try {
  let content = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    if (content.includes('provider = "sqlite"')) {
      content = content.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, content, 'utf8');
      console.log('[prepare-db] DATABASE_URL is PostgreSQL. Set provider to "postgresql".');
    }
  } else {
    if (content.includes('provider = "postgresql"')) {
      content = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, content, 'utf8');
      console.log('[prepare-db] Set provider to "sqlite" with Vercel /tmp mounting.');
    }
  }
} catch (err) {
  console.error('[prepare-db] Error adjusting schema provider:', err.message);
}
