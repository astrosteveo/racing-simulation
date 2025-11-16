import { describe, it, expect } from 'vitest';
import {
  formatLapTime,
  formatGap,
  formatDuration,
  formatPercentage,
  formatPosition,
  formatPositionChange,
} from '../../../src/ui/console/formatters/time-formatter';

describe('Time Formatter', () => {
  describe('formatLapTime', () => {
    it('should format short lap times (< 60s)', () => {
      expect(formatLapTime(15.412)).toBe('15.412s');
      expect(formatLapTime(28.567)).toBe('28.567s');
      expect(formatLapTime(0.123)).toBe('0.123s');
    });

    it('should format lap times over 1 minute', () => {
      expect(formatLapTime(91.234)).toBe('1:31.234');
      expect(formatLapTime(125.5)).toBe('2:05.500');
    });

    it('should format lap times over 1 hour', () => {
      expect(formatLapTime(3661.5)).toBe('1:01:01.500');
      expect(formatLapTime(7200)).toBe('2:00:00.000');
    });
  });

  describe('formatGap', () => {
    it('should show "Leader" for zero gap', () => {
      expect(formatGap(0)).toBe('Leader');
    });

    it('should format positive gaps with + sign', () => {
      expect(formatGap(1.234)).toBe('+1.234s');
      expect(formatGap(0.5)).toBe('+0.500s');
      expect(formatGap(10.123)).toBe('+10.123s');
    });

    it('should format negative gaps (edge case)', () => {
      expect(formatGap(-0.5)).toBe('-0.500s');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(5)).toBe('5s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(61)).toBe('1m 1s');
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
      expect(formatDuration(7200)).toBe('2h 0m 0s');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with default 1 decimal', () => {
      expect(formatPercentage(75.5)).toBe('75.5%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should respect custom decimal places', () => {
      expect(formatPercentage(75.567, 2)).toBe('75.57%');
      expect(formatPercentage(75.5, 0)).toBe('76%');
    });
  });

  describe('formatPosition', () => {
    it('should format 1st, 2nd, 3rd correctly', () => {
      expect(formatPosition(1)).toBe('1st');
      expect(formatPosition(2)).toBe('2nd');
      expect(formatPosition(3)).toBe('3rd');
    });

    it('should format most positions with "th"', () => {
      expect(formatPosition(4)).toBe('4th');
      expect(formatPosition(10)).toBe('10th');
      expect(formatPosition(20)).toBe('20th');
    });

    it('should handle 11th, 12th, 13th correctly', () => {
      expect(formatPosition(11)).toBe('11th');
      expect(formatPosition(12)).toBe('12th');
      expect(formatPosition(13)).toBe('13th');
    });

    it('should handle 21st, 22nd, 23rd correctly', () => {
      expect(formatPosition(21)).toBe('21st');
      expect(formatPosition(22)).toBe('22nd');
      expect(formatPosition(23)).toBe('23rd');
    });
  });

  describe('formatPositionChange', () => {
    it('should format positive changes with + sign', () => {
      expect(formatPositionChange(5)).toBe('+5');
      expect(formatPositionChange(1)).toBe('+1');
    });

    it('should format negative changes', () => {
      expect(formatPositionChange(-3)).toBe('-3');
      expect(formatPositionChange(-1)).toBe('-1');
    });

    it('should show "—" for no change', () => {
      expect(formatPositionChange(0)).toBe('—');
    });
  });
});
