import { describe, it, expect } from 'vitest';
import {
  renderProgressBar,
  renderTrend,
  renderDivider,
  renderTitle,
  renderLapProgressBar,
  renderLapProgressWithPercentage,
} from '../../../src/ui/console/formatters/progress-bar';

describe('Progress Bar Formatter', () => {
  describe('renderProgressBar', () => {
    it('should render full bar at 100%', () => {
      const bar = renderProgressBar(100, 100, 10);
      expect(bar).toContain('██████████');
      expect(bar).toContain('100%');
    });

    it('should render empty bar at 0%', () => {
      const bar = renderProgressBar(0, 100, 10);
      expect(bar).toContain('░░░░░░░░░░');
      expect(bar).toContain('0%');
    });

    it('should render partial bar at 75%', () => {
      const bar = renderProgressBar(75, 100, 16);
      expect(bar).toMatch(/█{12}░{4}/); // 12 filled, 4 empty
      expect(bar).toContain('75%');
    });

    it('should render partial bar at 50%', () => {
      const bar = renderProgressBar(50, 100, 20);
      expect(bar).toMatch(/█{10}░{10}/); // 10 filled, 10 empty
      expect(bar).toContain('50%');
    });

    it('should hide percentage when showPercentage is false', () => {
      const bar = renderProgressBar(75, 100, 16, false);
      expect(bar).not.toContain('%');
      expect(bar).toMatch(/█{12}░{4}/);
    });

    it('should handle different max values', () => {
      const bar = renderProgressBar(50, 200, 10);
      expect(bar).toContain('25%'); // 50/200 = 25%
    });

    it('should clamp values above 100%', () => {
      const bar = renderProgressBar(150, 100, 10);
      expect(bar).toContain('100%');
      expect(bar).toContain('██████████');
    });

    it('should clamp values below 0%', () => {
      const bar = renderProgressBar(-10, 100, 10);
      expect(bar).toContain('0%');
      expect(bar).toContain('░░░░░░░░░░');
    });
  });

  describe('renderTrend', () => {
    it('should show up arrow for positive change', () => {
      expect(renderTrend(5)).toBe('↑');
      expect(renderTrend(0.1)).toBe('↑');
    });

    it('should show down arrow for negative change', () => {
      expect(renderTrend(-3)).toBe('↓');
      expect(renderTrend(-0.1)).toBe('↓');
    });

    it('should show right arrow for no change', () => {
      expect(renderTrend(0)).toBe('→');
    });
  });

  describe('renderDivider', () => {
    it('should create divider of specified width', () => {
      expect(renderDivider(10)).toBe('═'.repeat(10));
      expect(renderDivider(60)).toBe('═'.repeat(60));
    });

    it('should use custom character', () => {
      expect(renderDivider(5, '-')).toBe('-----');
      expect(renderDivider(5, '=')).toBe('=====');
    });
  });

  describe('renderTitle', () => {
    it('should center title with dividers', () => {
      const title = renderTitle('TEST', 20);
      expect(title).toContain('TEST');
      expect(title.length).toBe(20);
      expect(title).toMatch(/═+ TEST ═+/);
    });

    it('should handle longer titles', () => {
      const title = renderTitle('BRISTOL MOTOR SPEEDWAY', 60);
      expect(title).toContain('BRISTOL MOTOR SPEEDWAY');
      expect(title.length).toBe(60);
    });

    it('should handle odd/even padding', () => {
      const title1 = renderTitle('ODD', 21);
      expect(title1.length).toBe(21);

      const title2 = renderTitle('EVEN', 20);
      expect(title2.length).toBe(20);
    });
  });

  describe('renderLapProgressBar', () => {
    it('should show car at start of lap (0% progress)', () => {
      const bar = renderLapProgressBar(0, 32);
      expect(bar).toBe('[>...............................]');
      expect(bar.length).toBe(34); // 32 + 2 brackets
    });

    it('should show car at 25% progress', () => {
      const bar = renderLapProgressBar(0.25, 32);
      expect(bar).toBe('[=======>........................]');
      expect(bar).toContain('>'); // Car position marker
    });

    it('should show car at 50% progress', () => {
      const bar = renderLapProgressBar(0.5, 32);
      expect(bar).toBe('[===============>................]');
      expect(bar).toContain('>');
    });

    it('should show car at 75% progress', () => {
      const bar = renderLapProgressBar(0.75, 32);
      expect(bar).toBe('[=======================>........]');
      expect(bar).toContain('>');
    });

    it('should show completed lap (100% progress)', () => {
      const bar = renderLapProgressBar(1.0, 32);
      expect(bar).toBe('[================================]');
      expect(bar).not.toContain('>'); // No marker at finish
    });

    it('should clamp progress above 100%', () => {
      const bar = renderLapProgressBar(1.5, 32);
      expect(bar).toBe('[================================]');
    });

    it('should clamp progress below 0%', () => {
      const bar = renderLapProgressBar(-0.1, 32);
      expect(bar).toBe('[>...............................]');
    });

    it('should handle different widths', () => {
      const bar = renderLapProgressBar(0.5, 20);
      expect(bar.length).toBe(22); // 20 + 2 brackets
      expect(bar).toContain('>');
    });
  });

  describe('renderLapProgressWithPercentage', () => {
    it('should show progress bar with percentage', () => {
      const bar = renderLapProgressWithPercentage(0.653, 32);
      expect(bar).toContain('[');
      expect(bar).toContain(']');
      expect(bar).toContain('65.3%');
    });

    it('should format percentage with one decimal place', () => {
      const bar = renderLapProgressWithPercentage(0.5, 32);
      expect(bar).toContain('50.0%');
    });

    it('should handle 0% progress', () => {
      const bar = renderLapProgressWithPercentage(0, 32);
      expect(bar).toContain('0.0%');
    });

    it('should handle 100% progress', () => {
      const bar = renderLapProgressWithPercentage(1.0, 32);
      expect(bar).toContain('100.0%');
    });
  });
});
