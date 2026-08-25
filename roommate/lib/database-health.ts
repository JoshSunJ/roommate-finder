export type DatabaseHealth = {
  reachable: boolean;
};

export async function probeDatabase(
  query: () => Promise<unknown>,
): Promise<DatabaseHealth> {
  try {
    await query();
    return { reachable: true };
  } catch {
    return { reachable: false };
  }
}
