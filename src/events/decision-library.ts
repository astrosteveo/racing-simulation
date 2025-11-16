/**
 * Decision Library
 * Predefined decision templates for different race situations
 */

import type { Decision, DecisionOption, RaceContext, CONSTANTS } from '../types';
import { CONSTANTS as GameConstants } from '../types';

/**
 * Create a pit strategy decision
 */
export function createPitStrategyDecision(context: RaceContext): Decision {
  const options: DecisionOption[] = [
    {
      id: 'pit-full',
      label: 'Pit now (4 tires + fuel)',
      description: 'Full service stop - lose track position but get fresh equipment',
      riskLevel: 'low',
      skillRequirements: {
        pitStrategy: 50,
        racecraft: 40,
      },
    },
    {
      id: 'stay-out',
      label: 'Stay out',
      description: 'Maintain track position - risky if equipment is worn',
      riskLevel: context.tireWear < 40 || context.fuelLevel < 30 ? 'high' : 'medium',
      skillRequirements: {
        tireManagement: 60,
        fuelManagement: 60,
      },
    },
    {
      id: 'fuel-only',
      label: 'Fuel only (quick stop)',
      description: 'Quick splash of fuel - compromises tire strategy',
      riskLevel: 'medium',
      skillRequirements: {
        pitStrategy: 55,
        tireManagement: 50,
      },
    },
  ];

  const prompt = `Lap ${context.lap}: Pit window is open. Your tires are at ${context.tireWear.toFixed(0)}%, fuel at ${context.fuelLevel.toFixed(0)}%. Do you pit?`;

  return {
    id: `pit-decision-${context.lap}`,
    type: 'pit-strategy',
    prompt,
    options,
    timeLimit: GameConstants.ROUTINE_DECISION_TIME, // 12 seconds
    defaultOption: 'pit-full',
    context,
  };
}

/**
 * Create a passing opportunity decision
 */
export function createPassingDecision(context: RaceContext, lapsStuck: number): Decision {
  const frustration = context.mentalState.frustration;
  const isAngry = frustration > 60;

  const options: DecisionOption[] = [
    {
      id: 'aggressive-pass',
      label: 'Aggressive pass (dive inside)',
      description: isAngry
        ? 'Force the issue - high risk of contact'
        : 'Risky move - requires precision',
      riskLevel: 'high',
      skillRequirements: {
        racecraft: 70,
        aggression: 60,
        focus: 65,
      },
    },
    {
      id: 'patient-pass',
      label: 'Patient approach',
      description: 'Wait for a mistake or better opportunity',
      riskLevel: 'low',
      skillRequirements: {
        racecraft: 50,
        consistency: 55,
      },
    },
    {
      id: 'stay-behind',
      label: 'Stay behind and draft',
      description: 'Conserve equipment, wait for pit strategy',
      riskLevel: 'low',
      skillRequirements: {
        draftSense: 40,
        composure: 50,
      },
    },
  ];

  const prompt = `Lap ${context.lap}: You've been stuck in P${context.position} for ${lapsStuck} laps. Car ahead is vulnerable. Make a move?`;

  return {
    id: `passing-decision-${context.lap}`,
    type: 'passing',
    prompt,
    options,
    timeLimit: GameConstants.TACTICAL_DECISION_TIME, // 6 seconds
    defaultOption: 'patient-pass',
    context,
  };
}

/**
 * Create a mental state management decision
 */
export function createMentalStateDecision(context: RaceContext): Decision {
  const frustration = context.mentalState.frustration;
  const distraction = context.mentalState.distraction;

  const isFrustrated = frustration > 70;
  const isDistracted = distraction > 60;

  let prompt = `Lap ${context.lap}: `;

  if (isFrustrated && isDistracted) {
    prompt += `You're frustrated (${frustration.toFixed(0)}) and distracted (${distraction.toFixed(0)}). How do you respond?`;
  } else if (isFrustrated) {
    prompt += `Frustration building (${frustration.toFixed(0)}). How do you handle it?`;
  } else {
    prompt += `You're getting distracted (${distraction.toFixed(0)}). Refocus?`;
  }

  const options: DecisionOption[] = [
    {
      id: 'calm-down',
      label: 'Take a deep breath, calm down',
      description: 'Lose a bit of time, but recover mentally',
      riskLevel: 'low',
      skillRequirements: {
        composure: 55,
        focus: 50,
      },
    },
    {
      id: 'push-through',
      label: 'Push harder, fight through it',
      description: 'Maintain pace but risk mistakes',
      riskLevel: 'high',
      skillRequirements: {
        stamina: 65,
        focus: 70,
      },
    },
    {
      id: 'maintain-pace',
      label: 'Maintain current pace',
      description: 'No change in approach',
      riskLevel: 'medium',
      skillRequirements: {
        consistency: 50,
      },
    },
  ];

  return {
    id: `mental-decision-${context.lap}`,
    type: 'mental-state',
    prompt,
    options,
    timeLimit: GameConstants.TACTICAL_DECISION_TIME, // 6 seconds
    defaultOption: 'calm-down',
    context,
  };
}

/**
 * Create a tire management decision
 */
export function createTireManagementDecision(context: RaceContext): Decision {
  const lapsToGo = context.lapsToGo;
  const tireWear = context.tireWear;

  const prompt = `Lap ${context.lap}: Tires at ${tireWear.toFixed(0)}% with ${lapsToGo} laps to go. Adjust pace?`;

  const options: DecisionOption[] = [
    {
      id: 'conserve-tires',
      label: 'Slow down, conserve tires',
      description: 'Save tires for the end, lose positions now',
      riskLevel: 'low',
      skillRequirements: {
        tireManagement: 55,
        consistency: 60,
      },
    },
    {
      id: 'manage-carefully',
      label: 'Manage carefully',
      description: 'Balance speed and tire wear',
      riskLevel: 'medium',
      skillRequirements: {
        tireManagement: 70,
        racecraft: 60,
      },
    },
    {
      id: 'push-through-wear',
      label: 'Push through, maintain pace',
      description: 'Keep current pace, tires will degrade faster',
      riskLevel: 'high',
      skillRequirements: {
        tireManagement: 80,
        racecraft: 70,
      },
    },
  ];

  return {
    id: `tire-decision-${context.lap}`,
    type: 'tire-management',
    prompt,
    options,
    timeLimit: GameConstants.ROUTINE_DECISION_TIME, // 12 seconds
    defaultOption: 'manage-carefully',
    context,
  };
}

/**
 * Create a traffic management decision
 */
export function createTrafficDecision(context: RaceContext): Decision {
  const prompt = `Lap ${context.lap}: Heavy lapped traffic ahead in P${context.position}. How to navigate?`;

  const options: DecisionOption[] = [
    {
      id: 'aggressive-through-traffic',
      label: 'Push aggressively through',
      description: 'Risk contact, but maintain momentum',
      riskLevel: 'high',
      skillRequirements: {
        racecraft: 75,
        aggression: 65,
      },
    },
    {
      id: 'patient-through-traffic',
      label: 'Be patient, wait for clear path',
      description: 'Lose time but avoid risk',
      riskLevel: 'low',
      skillRequirements: {
        racecraft: 55,
        consistency: 60,
      },
    },
    {
      id: 'use-alternate-line',
      label: 'Use alternate racing line',
      description: 'Try different approach',
      riskLevel: 'medium',
      skillRequirements: {
        racecraft: 70,
        focus: 65,
      },
    },
  ];

  return {
    id: `traffic-decision-${context.lap}`,
    type: 'traffic-management',
    prompt,
    options,
    timeLimit: GameConstants.EMERGENCY_DECISION_TIME, // 3 seconds
    defaultOption: 'patient-through-traffic',
    context,
  };
}
