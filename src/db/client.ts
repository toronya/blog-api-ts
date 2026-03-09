import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');

// DATABASE_URL が指定されていない場合はファイルベースの SQLite を使用
const databaseUrl = process.env.DATABASE_URL ?? `file:${path.join(dataDir, 'blog.db')}`;

// ファイルベースの場合のみ data ディレクトリを作成
if (databaseUrl.startsWith('file:') && !databaseUrl.startsWith('file::memory:')) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = createClient({ url: databaseUrl });

export const db = drizzle(sqlite);
export { sqlite };
