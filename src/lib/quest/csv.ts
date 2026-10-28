// A tolerant reader for the CSV files the final trials ask for. Students
// write these from C++ in many slightly different ways, so the reader
// accepts comment lines (# …), commas, semicolons or tabs, quoted cells,
// decimal commas in semicolon files, and column names in any case.

export interface Table {
  /** Normalised column names: lower case, spaces and dashes as underscores. */
  columns: string[];
  rows: string[][];
  /** Comment lines (without the leading #), for metadata. */
  comments: string[];
}

export function normaliseName(name: string): string {
  return name
    .trim()
    .replace(/^["']|["']$/g, '')
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, '')
    .trim()
    .replace(/[\s\-/]+/g, '_')
    .replace(/_+$/, '');
}

export function parseCsv(text: string): Table {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const comments: string[] = [];
  const body: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('#')) comments.push(t.slice(1).trim());
    else body.push(line);
  }
  if (!body.length) return { columns: [], rows: [], comments };
  const header = body[0];
  const counts = { ',': (header.match(/,/g) ?? []).length, ';': (header.match(/;/g) ?? []).length, '\t': (header.match(/\t/g) ?? []).length };
  const best = (Object.entries(counts) as [',' | ';' | '\t', number][]).sort((a, b) => b[1] - a[1])[0];
  const sep = best[1] > 0 ? best[0] : ',';
  const split = (line: string) => line.split(sep).map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
  const columns = split(header).map(normaliseName);
  const rows = body.slice(1).map((l) => {
    const cells = split(l);
    return sep === ';' ? cells.map((c) => c.replace(/^(-?\d+),(\d+)(e[+-]?\d+)?$/i, '$1.$2$3')) : cells;
  });
  return { columns, rows, comments };
}

/** Index of the first column whose name is one of `aliases`, or -1. */
export function findColumn(t: Table, aliases: readonly string[]): number {
  for (const a of aliases) {
    const i = t.columns.indexOf(a);
    if (i >= 0) return i;
  }
  return -1;
}

export function numbers(t: Table, index: number): number[] {
  return t.rows.map((r) => (r[index] === undefined || r[index] === '' ? NaN : Number(r[index])));
}

export function strings(t: Table, index: number): string[] {
  return t.rows.map((r) => r[index] ?? '');
}
