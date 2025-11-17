/**
 * MainMenu Tests
 *
 * Tests main game menu component
 */

import { describe, it, expect } from 'vitest';
import { MainMenu } from '../../../src/ui/console/components/MainMenu';

describe('MainMenu', () => {
  describe('getMenuOptions', () => {
    it('returns standard menu options', () => {
      const menu = new MainMenu();
      const options = menu.getMenuOptions();

      expect(options).toHaveLength(4);
      expect(options[0]?.id).toBe('quick-race');
      expect(options[1]?.id).toBe('career-mode');
      expect(options[2]?.id).toBe('settings');
      expect(options[3]?.id).toBe('quit');
    });

    it('all options have labels', () => {
      const menu = new MainMenu();
      const options = menu.getMenuOptions();

      options.forEach((option) => {
        expect(option.label).toBeTruthy();
        expect(typeof option.label).toBe('string');
      });
    });

    it('all options have descriptions', () => {
      const menu = new MainMenu();
      const options = menu.getMenuOptions();

      options.forEach((option) => {
        expect(option.description).toBeTruthy();
        expect(typeof option.description).toBe('string');
      });
    });

    it('no options are disabled by default', () => {
      const menu = new MainMenu();
      const options = menu.getMenuOptions();

      options.forEach((option) => {
        expect(option.disabled).toBeFalsy();
      });
    });
  });

  describe('getTitle', () => {
    it('returns game title', () => {
      const menu = new MainMenu();
      const title = menu.getTitle();

      expect(title).toBeTruthy();
      expect(typeof title).toBe('string');
      expect(title).toContain('NASCAR');
    });
  });

  describe('getPrompt', () => {
    it('returns menu prompt', () => {
      const menu = new MainMenu();
      const prompt = menu.getPrompt();

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });
  });
});
