import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const sqlite = createClient({
	url: `file:${path.join(dataDir, 'blog.db')}`
});

export const db = drizzle(sqlite);
export { sqlite };
