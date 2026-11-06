import path from "node:path";

/** Portable data directory — default ./data relative to process cwd / monorepo root. */
export function getDataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);
  }
  return path.resolve(process.cwd(), "data");
}

export function getContentDir(): string {
  return path.join(getDataDir(), "content");
}

export function getContentFilePath(slug: string): string {
  return path.join(getContentDir(), `${slug}.md`);
}

export function getReplaysDir(): string {
  return path.join(getDataDir(), "replays");
}

export function getMapsDir(): string {
  return path.join(getDataDir(), "maps");
}
