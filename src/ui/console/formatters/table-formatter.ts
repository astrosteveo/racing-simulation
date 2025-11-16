/**
 * ASCII table formatting utilities
 */

export type Alignment = 'left' | 'right' | 'center';

export interface ColumnConfig {
  header: string;
  align?: Alignment;
  width?: number;
}

export interface TableConfig {
  columns: ColumnConfig[];
  showHeader?: boolean;
  borderStyle?: 'simple' | 'double';
}

/**
 * Pad a string to a specific length with alignment
 */
export function padString(str: string, length: number, align: Alignment = 'left'): string {
  if (str.length >= length) {
    return str.slice(0, length);
  }

  const padding = length - str.length;

  switch (align) {
    case 'left':
      return str + ' '.repeat(padding);
    case 'right':
      return ' '.repeat(padding) + str;
    case 'center': {
      const leftPad = Math.floor(padding / 2);
      const rightPad = Math.ceil(padding / 2);
      return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
    }
  }
}

/**
 * Calculate column widths based on content
 */
function calculateColumnWidths(
  config: TableConfig,
  rows: string[][]
): number[] {
  const widths = config.columns.map((col, i) => {
    // Start with configured width or header length
    let width: number = col.width !== undefined ? col.width : col.header.length;

    // Check all row values for this column
    rows.forEach(row => {
      if (row[i] && row[i].length > width) {
        width = row[i].length;
      }
    });

    return width;
  });

  return widths;
}

/**
 * Format a table row
 */
function formatRow(
  values: string[],
  widths: number[],
  alignments: Alignment[],
  separator: string = ' | '
): string {
  const cells = values.map((value, i) =>
    padString(value || '', widths[i] || 10, alignments[i] || 'left')
  );

  return cells.join(separator);
}

/**
 * Format a header separator line
 */
function formatSeparator(
  widths: number[],
  separator: string = '-+-'
): string {
  const parts = widths.map(width => '-'.repeat(width));
  return parts.join(separator);
}

/**
 * Format data as an ASCII table
 *
 * Example:
 * ```
 * const config = {
 *   columns: [
 *     { header: 'Pos', align: 'right', width: 3 },
 *     { header: 'Driver', align: 'left' },
 *     { header: 'Time', align: 'right' }
 *   ]
 * };
 * const rows = [
 *   ['1', 'Dale Earnhardt', '15.412s'],
 *   ['2', 'Jeff Gordon', '15.438s']
 * ];
 *
 * formatTable(config, rows)
 * ```
 *
 * Output:
 * ```
 * Pos | Driver         | Time
 * ----+----------------+---------
 *   1 | Dale Earnhardt | 15.412s
 *   2 | Jeff Gordon    | 15.438s
 * ```
 */
export function formatTable(
  config: TableConfig,
  rows: string[][]
): string {
  const widths = calculateColumnWidths(config, rows);
  const alignments = config.columns.map(col => col.align || 'left');
  const separator = ' | ';
  const separatorLine = '-+-';

  const lines: string[] = [];

  // Add header if enabled (default true)
  if (config.showHeader !== false) {
    const headers = config.columns.map(col => col.header);
    lines.push(formatRow(headers, widths, alignments, separator));
    lines.push(formatSeparator(widths, separatorLine));
  }

  // Add data rows
  rows.forEach(row => {
    lines.push(formatRow(row, widths, alignments, separator));
  });

  return lines.join('\n');
}

/**
 * Format a simple two-column key-value table
 *
 * Example:
 * ```
 * formatKeyValueTable({
 *   'Started': 'P7',
 *   'Finished': 'P5',
 *   'Laps Led': '12'
 * })
 * ```
 *
 * Output:
 * ```
 * Started:   P7
 * Finished:  P5
 * Laps Led:  12
 * ```
 */
export function formatKeyValueTable(
  data: Record<string, string>,
  keyWidth: number = 20
): string {
  const lines = Object.entries(data).map(([key, value]) => {
    const paddedKey = padString(`${key}:`, keyWidth, 'left');
    return `${paddedKey} ${value}`;
  });

  return lines.join('\n');
}
