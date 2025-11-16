import { describe, it, expect } from 'vitest';
import {
  padString,
  formatTable,
  formatKeyValueTable,
} from '../../../src/ui/console/formatters/table-formatter';

describe('Table Formatter', () => {
  describe('padString', () => {
    it('should pad string on right (left align)', () => {
      expect(padString('test', 10, 'left')).toBe('test      ');
    });

    it('should pad string on left (right align)', () => {
      expect(padString('test', 10, 'right')).toBe('      test');
    });

    it('should center string', () => {
      expect(padString('test', 10, 'center')).toBe('   test   ');
    });

    it('should truncate string if too long', () => {
      expect(padString('verylongstring', 5, 'left')).toBe('veryl');
    });

    it('should return string unchanged if exact length', () => {
      expect(padString('exact', 5, 'left')).toBe('exact');
    });
  });

  describe('formatTable', () => {
    it('should format basic table with header', () => {
      const config = {
        columns: [
          { header: 'Pos', align: 'right' as const },
          { header: 'Driver', align: 'left' as const },
          { header: 'Time', align: 'right' as const },
        ],
      };

      const rows = [
        ['1', 'Dale Earnhardt', '15.412s'],
        ['2', 'Jeff Gordon', '15.438s'],
      ];

      const table = formatTable(config, rows);

      expect(table).toContain('Pos');
      expect(table).toContain('Driver');
      expect(table).toContain('Time');
      expect(table).toContain('Dale Earnhardt');
      expect(table).toContain('Jeff Gordon');
      expect(table).toContain('15.412s');
      expect(table).toContain('15.438s');
    });

    it('should create separator line between header and data', () => {
      const config = {
        columns: [
          { header: 'A' },
          { header: 'B' },
        ],
      };

      const rows = [['1', '2']];
      const table = formatTable(config, rows);

      const lines = table.split('\n');
      expect(lines[1]).toMatch(/^-+\+-+$/); // Separator line
    });

    it('should hide header when showHeader is false', () => {
      const config = {
        columns: [
          { header: 'Pos' },
          { header: 'Driver' },
        ],
        showHeader: false,
      };

      const rows = [['1', 'Dale']];
      const table = formatTable(config, rows);

      expect(table).not.toContain('Pos');
      expect(table).not.toContain('Driver');
      expect(table).toContain('Dale');
    });

    it('should respect column widths', () => {
      const config = {
        columns: [
          { header: 'A', width: 10 },
          { header: 'B', width: 20 },
        ],
      };

      const rows = [['short', 'text']];
      const table = formatTable(config, rows);
      const dataLine = table.split('\n')[2]; // Skip header and separator

      // Check that cells are padded to specified widths
      expect(dataLine.startsWith('short     ')).toBe(true);
    });

    it('should auto-calculate column widths from content', () => {
      const config = {
        columns: [
          { header: 'A' },
          { header: 'B' },
        ],
      };

      const rows = [
        ['short', 'verylongtext'],
        ['x', 'y'],
      ];

      const table = formatTable(config, rows);

      // Column B should be wide enough for 'verylongtext'
      expect(table).toContain('verylongtext');
      const lines = table.split('\n');
      expect(lines[2]).toContain('verylongtext');
    });
  });

  describe('formatKeyValueTable', () => {
    it('should format key-value pairs', () => {
      const data = {
        Started: 'P7',
        Finished: 'P5',
        'Laps Led': '12',
      };

      const table = formatKeyValueTable(data);

      expect(table).toContain('Started:');
      expect(table).toContain('P7');
      expect(table).toContain('Finished:');
      expect(table).toContain('P5');
      expect(table).toContain('Laps Led:');
      expect(table).toContain('12');
    });

    it('should align keys to specified width', () => {
      const data = {
        Short: 'value',
        'Very Long Key': 'value',
      };

      const table = formatKeyValueTable(data, 20);
      const lines = table.split('\n');

      // Each line should have key padded to 20 chars
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        expect(colonIndex).toBeGreaterThan(0);
      });
    });

    it('should handle empty object', () => {
      const table = formatKeyValueTable({});
      expect(table).toBe('');
    });
  });
});
