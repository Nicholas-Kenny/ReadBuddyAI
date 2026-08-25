import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type LocalDbAction = "select" | "insert" | "update" | "delete";

export interface LocalDbOperation {
  action: LocalDbAction;
  table: string;
  values?: Record<string, unknown> | Record<string, unknown>[];
  filters?: Record<string, unknown>;
  order?: { column: string; ascending: boolean };
}

interface LocalDatabase {
  classes: Record<string, unknown>[];
  students: Record<string, unknown>[];
  stories: Record<string, unknown>[];
  assessments: Record<string, unknown>[];
  [table: string]: Record<string, unknown>[];
}

const dataDirectory = path.join(process.cwd(), ".local-data");
const dataFile = path.join(dataDirectory, "readbuddy.json");

const emptyDatabase = (): LocalDatabase => ({
  classes: [],
  students: [],
  stories: [],
  assessments: [],
});

async function readDatabase(): Promise<LocalDatabase> {
  try {
    const content = await readFile(dataFile, "utf8");
    return { ...emptyDatabase(), ...JSON.parse(content) };
  } catch {
    return emptyDatabase();
  }
}

async function writeDatabase(database: LocalDatabase) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

function matchesFilters(
  row: Record<string, unknown>,
  filters: Record<string, unknown> = {},
) {
  return Object.entries(filters).every(([column, value]) => row[column] === value);
}

export async function runLocalDbOperation(operation: LocalDbOperation) {
  const database = await readDatabase();
  const tableRows = database[operation.table];

  if (!tableRows) {
    throw new Error(`Unknown local table: ${operation.table}`);
  }

  if (operation.action === "select") {
    let rows = tableRows.filter((row) => matchesFilters(row, operation.filters));
    if (operation.order) {
      const { column, ascending } = operation.order;
      rows = [...rows].sort((left, right) => {
        const leftValue = String(left[column] ?? "");
        const rightValue = String(right[column] ?? "");
        return (ascending ? 1 : -1) * leftValue.localeCompare(rightValue);
      });
    }
    return rows;
  }

  if (operation.action === "insert") {
    const values = Array.isArray(operation.values)
      ? operation.values
      : [operation.values || {}];
    const createdAt = new Date().toISOString();
    const rows = values.map((value) => ({ created_at: createdAt, ...value }));
    database[operation.table] = [...tableRows, ...rows];
    await writeDatabase(database);
    return rows;
  }

  if (operation.action === "update") {
    const updatedRows: Record<string, unknown>[] = [];
    database[operation.table] = tableRows.map((row) => {
      if (!matchesFilters(row, operation.filters)) return row;
      const updated = { ...row, ...(operation.values || {}) };
      updatedRows.push(updated);
      return updated;
    });
    await writeDatabase(database);
    return updatedRows;
  }

  const deletedRows = tableRows.filter((row) =>
    matchesFilters(row, operation.filters),
  );
  database[operation.table] = tableRows.filter(
    (row) => !matchesFilters(row, operation.filters),
  );
  await writeDatabase(database);
  return deletedRows;
}
