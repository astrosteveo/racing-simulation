/**
 * Menu Handler
 * Handles user input for menu selections
 */

import * as readline from 'readline';
import type { MenuOption } from '../../../types';

/**
 * Display a menu and get user selection
 *
 * @param options - Menu options to display
 * @param prompt - Optional custom prompt text
 * @returns Promise that resolves to the selected option ID
 */
export async function showMenu(
  options: MenuOption[],
  prompt: string = 'Select an option:'
): Promise<string> {
  // Filter out disabled options
  const availableOptions = options.filter(opt => !opt.disabled);

  if (availableOptions.length === 0) {
    throw new Error('No available menu options');
  }

  // Display menu
  console.log('\n' + prompt);
  console.log('');

  availableOptions.forEach((option, index) => {
    const number = index + 1;
    const description = option.description ? ` - ${option.description}` : '';
    console.log(`  ${number}. ${option.label}${description}`);
  });

  console.log('');

  // Get user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Your choice: ', (answer) => {
      rl.close();

      const choice = parseInt(answer.trim(), 10);

      if (isNaN(choice) || choice < 1 || choice > availableOptions.length) {
        console.log(`Invalid choice. Please select 1-${availableOptions.length}`);
        // Recursively ask again
        resolve(showMenu(options, prompt));
      } else {
        const selectedOption = availableOptions[choice - 1];
        if (selectedOption) {
          resolve(selectedOption.id);
        } else {
          // Should never happen, but handle gracefully
          resolve(showMenu(options, prompt));
        }
      }
    });
  });
}

/**
 * Display a yes/no prompt
 *
 * @param question - The question to ask
 * @param defaultAnswer - Default answer if user just presses Enter (true = yes, false = no)
 * @returns Promise that resolves to true for yes, false for no
 */
export async function confirm(
  question: string,
  defaultAnswer: boolean = false
): Promise<boolean> {
  const defaultStr = defaultAnswer ? '[Y/n]' : '[y/N]';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} ${defaultStr}: `, (answer) => {
      rl.close();

      const trimmed = answer.trim().toLowerCase();

      if (trimmed === '') {
        resolve(defaultAnswer);
      } else if (trimmed === 'y' || trimmed === 'yes') {
        resolve(true);
      } else if (trimmed === 'n' || trimmed === 'no') {
        resolve(false);
      } else {
        console.log('Please answer yes (y) or no (n)');
        resolve(confirm(question, defaultAnswer));
      }
    });
  });
}

/**
 * Wait for user to press Enter to continue
 *
 * @param message - Optional message to display
 */
export async function pressEnterToContinue(message: string = 'Press Enter to continue...'): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`\n${message}`, () => {
      rl.close();
      resolve();
    });
  });
}

/**
 * Get text input from user
 *
 * @param prompt - Prompt to display
 * @param defaultValue - Optional default value
 * @returns Promise that resolves to the user's input
 */
export async function getTextInput(
  prompt: string,
  defaultValue?: string
): Promise<string> {
  const defaultStr = defaultValue ? ` [${defaultValue}]` : '';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${prompt}${defaultStr}: `, (answer) => {
      rl.close();

      const trimmed = answer.trim();

      if (trimmed === '' && defaultValue) {
        resolve(defaultValue);
      } else if (trimmed === '') {
        console.log('Input required.');
        resolve(getTextInput(prompt, defaultValue));
      } else {
        resolve(trimmed);
      }
    });
  });
}

/**
 * Get numeric input from user
 *
 * @param prompt - Prompt to display
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param defaultValue - Optional default value
 * @returns Promise that resolves to the user's number input
 */
export async function getNumberInput(
  prompt: string,
  min?: number,
  max?: number,
  defaultValue?: number
): Promise<number> {
  const range = min !== undefined && max !== undefined ? ` (${min}-${max})` : '';
  const defaultStr = defaultValue !== undefined ? ` [${defaultValue}]` : '';

  const answer = await getTextInput(`${prompt}${range}${defaultStr}`, defaultValue?.toString());
  const num = parseFloat(answer);

  if (isNaN(num)) {
    console.log('Please enter a valid number.');
    return getNumberInput(prompt, min, max, defaultValue);
  }

  if (min !== undefined && num < min) {
    console.log(`Number must be at least ${min}`);
    return getNumberInput(prompt, min, max, defaultValue);
  }

  if (max !== undefined && num > max) {
    console.log(`Number must be at most ${max}`);
    return getNumberInput(prompt, min, max, defaultValue);
  }

  return num;
}

/**
 * Clear the console screen
 */
export function clearScreen(): void {
  // ANSI escape code to clear screen and move cursor to top-left
  console.log('\x1B[2J\x1B[0f');
}
