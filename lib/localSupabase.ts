import type { LocalDbOperation } from "./localDbServer";

type QueryResult = { data: Record<string, unknown>[] | null; error: Error | null };

class LocalQueryBuilder implements PromiseLike<QueryResult> {
  private operation: LocalDbOperation;

  constructor(table: string) {
    this.operation = { action: "select", table, filters: {} };
  }

  select() {
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation.action = "insert";
    this.operation.values = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.operation.action = "update";
    this.operation.values = values;
    return this;
  }

  delete() {
    this.operation.action = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.operation.filters = { ...this.operation.filters, [column]: value };
    return this;
  }

  order(column: string, options: { ascending: boolean }) {
    this.operation.order = { column, ascending: options.ascending };
    return this;
  }

  async maybeSingle() {
    const result = await this.execute();
    return { data: result.data?.[0] || null, error: result.error };
  }

  async single() {
    const result = await this.execute();
    return { data: result.data?.[0] || null, error: result.error };
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<QueryResult> {
    try {
      const response = await fetch("/api/local-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.operation),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Local database failed");
      return { data: payload.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Local database failed"),
      };
    }
  }
}

export function createLocalSupabaseClient() {
  return {
    from(table: string) {
      return new LocalQueryBuilder(table);
    },
  };
}
