import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // テスト用にインメモリ SQLite を使用
    env: {
      DATABASE_URL: ':memory:',
    },
    // テストファイルの対象パターン
    include: ['src/**/*.test.ts'],
    // テストを順番に実行（インメモリ DB の共有状態を安全に扱うため）
    fileParallelism: false,
  },
});
