/**
 * Character System Public API
 *
 * Exports all character/driver related functionality:
 * - Driver class
 * - Mental state management functions
 */

export { Driver } from './driver';
export {
  calculateMentalStateModifier,
  applyMentalStateEvent,
  applyMentalStateDecay,
  calculateMentalResilience,
} from './mental-state';
