/**
 * Decision Evaluator
 * Calculates decision outcomes based on driver skills, mental state, and risk
 */

import type {
  Decision,
  DecisionOption,
  DecisionResult,
  DecisionOutcome,
  DecisionEffects,
  Driver,
  XPGain,
  RaceContext,
} from '../types';

/**
 * Evaluate a decision and calculate the outcome
 */
export function evaluateDecision(
  decision: Decision,
  choiceId: string,
  driver: Driver
): DecisionResult {
  const option = decision.options.find(opt => opt.id === choiceId);

  if (!option) {
    throw new Error(`Invalid choice ID: ${choiceId}`);
  }

  // Calculate success probability
  const successChance = calculateSuccessChance(option, driver, decision.context.mentalState);

  // Determine outcome
  const roll = Math.random() * 100;
  const outcome: DecisionOutcome =
    roll < successChance ? 'success' :
    roll < successChance + 20 ? 'neutral' :
    'failure';

  // Calculate effects based on decision type and outcome
  const effects = calculateEffects(decision.type, option, outcome, decision.context);

  // Calculate XP gained
  const xpGained = calculateXPGain(decision.type, option, outcome);

  // Generate outcome message
  const message = generateOutcomeMessage(decision.type, option, outcome);

  return {
    optionChosen: choiceId,
    outcome,
    effects,
    xpGained,
    message,
  };
}

/**
 * Calculate success probability for a decision
 */
function calculateSuccessChance(
  option: DecisionOption,
  driver: Driver,
  mentalState: { confidence: number; frustration: number; focus: number; distraction: number }
): number {
  // Base chance: 50%
  let chance = 50;

  // Skill modifier: Calculate average of required skills
  if (option.skillRequirements) {
    const requiredSkills = Object.entries(option.skillRequirements);
    if (requiredSkills.length > 0) {
      const avgDriverSkill = requiredSkills.reduce((sum, [skillName, _]) => {
        const driverSkillValue = driver.skills[skillName as keyof typeof driver.skills];
        return sum + (typeof driverSkillValue === 'number' ? driverSkillValue : 50);
      }, 0) / requiredSkills.length;

      // -25% to +25% based on skill (0 to 100 scale)
      chance += (avgDriverSkill - 50) * 0.5;
    }
  }

  // Mental state modifier: confidence helps, frustration hurts
  const mentalModifier = (mentalState.confidence - mentalState.frustration) * 0.1;
  chance += mentalModifier;

  // Risk penalty
  const riskPenalty =
    option.riskLevel === 'high' ? -15 :
    option.riskLevel === 'medium' ? -5 :
    0;
  chance += riskPenalty;

  // Clamp between 5% and 95%
  return Math.max(5, Math.min(95, chance));
}

/**
 * Calculate effects of the decision outcome
 */
function calculateEffects(
  decisionType: string,
  option: DecisionOption,
  outcome: DecisionOutcome,
  _context: RaceContext
): DecisionEffects {
  // Note: context parameter reserved for future context-aware effects
  const effects: DecisionEffects = {};

  switch (decisionType) {
    case 'pit-strategy':
      return calculatePitEffects(option.id, outcome);

    case 'passing':
      return calculatePassingEffects(option.id, outcome);

    case 'mental-state':
      return calculateMentalStateEffects(option.id, outcome);

    case 'tire-management':
      return calculateTireManagementEffects(option.id, outcome);

    case 'traffic-management':
      return calculateTrafficEffects(option.id, outcome);

    default:
      return effects;
  }
}

/**
 * Calculate pit strategy decision effects
 */
function calculatePitEffects(optionId: string, outcome: DecisionOutcome): DecisionEffects {
  const effects: DecisionEffects = {};

  if (optionId === 'pit-full') {
    // Full pit stop
    effects.tireWearChange = 100 - 0; // Reset to 100%
    effects.fuelChange = 100 - 0; // Reset to 100%
    effects.positionChange = outcome === 'success' ? -2 : -4; // Lose positions (less if timed well)
    effects.mentalStateChange = {
      confidence: outcome === 'success' ? 5 : 0,
    };
  } else if (optionId === 'stay-out') {
    // Stay out - risky
    effects.positionChange = outcome === 'success' ? 2 : -1;
    effects.mentalStateChange = {
      confidence: outcome === 'success' ? 10 : -5,
      frustration: outcome === 'failure' ? 15 : 0,
    };
  } else if (optionId === 'fuel-only') {
    // Fuel only - quick stop
    effects.fuelChange = 100 - 0; // Reset fuel
    effects.tireWearChange = -5; // Tires wear a bit more
    effects.positionChange = outcome === 'success' ? -1 : -2;
    effects.mentalStateChange = {
      confidence: outcome === 'success' ? 3 : -2,
    };
  }

  return effects;
}

/**
 * Calculate passing decision effects
 */
function calculatePassingEffects(optionId: string, outcome: DecisionOutcome): DecisionEffects {
  const effects: DecisionEffects = {};

  if (optionId === 'aggressive-pass') {
    if (outcome === 'success') {
      effects.positionChange = 1; // Gain 1 position
      effects.mentalStateChange = {
        confidence: 15,
        frustration: -10,
      };
    } else if (outcome === 'neutral') {
      effects.positionChange = 0;
      effects.mentalStateChange = {
        frustration: 5,
      };
    } else {
      effects.positionChange = -1; // Lost position from contact/mistake
      effects.damageChange = 10; // Minor damage
      effects.mentalStateChange = {
        confidence: -10,
        frustration: 20,
      };
    }
  } else if (optionId === 'patient-pass') {
    if (outcome === 'success') {
      effects.positionChange = 1;
      effects.mentalStateChange = {
        confidence: 10,
        frustration: -5,
        focus: 5,
      };
    } else {
      effects.positionChange = 0;
      effects.mentalStateChange = {
        frustration: 3,
      };
    }
  } else if (optionId === 'stay-behind') {
    effects.positionChange = 0;
    effects.mentalStateChange = {
      frustration: outcome === 'success' ? -5 : 5,
      focus: 3,
    };
  }

  return effects;
}

/**
 * Calculate mental state decision effects
 */
function calculateMentalStateEffects(optionId: string, outcome: DecisionOutcome): DecisionEffects {
  const effects: DecisionEffects = {};

  if (optionId === 'calm-down') {
    if (outcome === 'success') {
      effects.mentalStateChange = {
        confidence: 5,
        frustration: -20,
        focus: 10,
        distraction: -15,
      };
    } else {
      effects.mentalStateChange = {
        frustration: -10,
        distraction: -5,
      };
    }
  } else if (optionId === 'push-through') {
    if (outcome === 'success') {
      effects.mentalStateChange = {
        confidence: 10,
        frustration: -5,
      };
    } else {
      effects.mentalStateChange = {
        frustration: 15,
        focus: -10,
      };
      effects.damageChange = 5; // Minor mistake damage
    }
  } else if (optionId === 'maintain-pace') {
    effects.mentalStateChange = {
      frustration: outcome === 'success' ? -5 : 0,
    };
  }

  return effects;
}

/**
 * Calculate tire management decision effects
 */
function calculateTireManagementEffects(optionId: string, outcome: DecisionOutcome): DecisionEffects {
  const effects: DecisionEffects = {};

  if (optionId === 'conserve-tires') {
    effects.tireWearChange = outcome === 'success' ? 10 : 5; // Save tire wear
    effects.positionChange = -1; // Lose positions from being slow
    effects.mentalStateChange = {
      focus: 5,
    };
  } else if (optionId === 'manage-carefully') {
    effects.tireWearChange = outcome === 'success' ? 3 : -2;
    effects.positionChange = 0;
    effects.mentalStateChange = {
      focus: outcome === 'success' ? 5 : 0,
    };
  } else if (optionId === 'push-through-wear') {
    effects.tireWearChange = outcome === 'success' ? -5 : -10; // Accelerated wear
    effects.positionChange = outcome === 'success' ? 1 : 0;
    effects.mentalStateChange = {
      confidence: outcome === 'success' ? 5 : -5,
    };
  }

  return effects;
}

/**
 * Calculate traffic management decision effects
 */
function calculateTrafficEffects(optionId: string, outcome: DecisionOutcome): DecisionEffects {
  const effects: DecisionEffects = {};

  if (optionId === 'aggressive-through-traffic') {
    if (outcome === 'success') {
      effects.positionChange = 0; // Maintained position
      effects.mentalStateChange = { confidence: 10 };
    } else {
      effects.positionChange = -1;
      effects.damageChange = 15;
      effects.mentalStateChange = { frustration: 15 };
    }
  } else if (optionId === 'patient-through-traffic') {
    effects.positionChange = outcome === 'success' ? 0 : -1;
    effects.mentalStateChange = {
      frustration: outcome === 'success' ? -5 : 5,
    };
  } else if (optionId === 'use-alternate-line') {
    if (outcome === 'success') {
      effects.positionChange = 1; // Gained position
      effects.mentalStateChange = { confidence: 15, focus: 5 };
    } else {
      effects.tireWearChange = -3; // Extra tire wear from off-line
      effects.mentalStateChange = { frustration: 5 };
    }
  }

  return effects;
}

/**
 * Calculate XP gained from decision
 */
function calculateXPGain(
  decisionType: string,
  option: DecisionOption,
  outcome: DecisionOutcome
): XPGain {
  const xp: XPGain = {};

  const baseXP = outcome === 'success' ? 15 : outcome === 'neutral' ? 5 : 0;

  switch (decisionType) {
    case 'pit-strategy':
      xp.pitStrategy = baseXP;
      if (outcome === 'success') xp.racecraft = 5;
      break;

    case 'passing':
      xp.racecraft = baseXP;
      if (option.id === 'aggressive-pass') {
        xp.aggression = baseXP * 0.5;
      }
      break;

    case 'mental-state':
      xp.composure = baseXP;
      xp.focus = baseXP * 0.5;
      break;

    case 'tire-management':
      xp.tireManagement = baseXP;
      xp.consistency = baseXP * 0.3;
      break;

    case 'traffic-management':
      xp.racecraft = baseXP;
      break;
  }

  return xp;
}

/**
 * Generate outcome message for player feedback
 */
function generateOutcomeMessage(
  _decisionType: string,
  option: DecisionOption,
  outcome: DecisionOutcome
): string {
  const messages: Record<string, Record<DecisionOutcome, string>> = {
    'pit-full': {
      success: 'Great pit stop timing! You minimized the loss of track position.',
      neutral: 'Decent stop, but you lost a few positions.',
      failure: 'Poor timing - you fell back several positions.',
    },
    'stay-out': {
      success: 'Bold call! Staying out paid off - you gained positions.',
      neutral: 'Risky choice. You maintained position but equipment is struggling.',
      failure: 'That was too risky. Your worn tires cost you positions.',
    },
    'fuel-only': {
      success: 'Quick fuel stop worked perfectly!',
      neutral: 'Fuel stop completed, but tire strategy is compromised.',
      failure: 'The quick stop didn\'t save enough time.',
    },
    'aggressive-pass': {
      success: 'Excellent move! You made it stick and gained a position!',
      neutral: 'Aggressive attempt but no position change.',
      failure: 'Too aggressive - contact! You lost a position and took damage.',
    },
    'patient-pass': {
      success: 'Patience rewarded! Clean pass completed.',
      neutral: 'You waited, but no opportunity materialized.',
      failure: 'Waited too long - they got away.',
    },
    'stay-behind': {
      success: 'Smart move. You conserved equipment and stayed close.',
      neutral: 'Drafting, but still stuck in position.',
      failure: 'Staying behind cost you momentum.',
    },
    'calm-down': {
      success: 'Deep breath worked. You\'re back in the zone.',
      neutral: 'You calmed down a bit.',
      failure: 'Still struggling to focus.',
    },
    'push-through': {
      success: 'Gutsy call! You fought through and maintained pace.',
      neutral: 'You\'re pushing, but it\'s taking a toll.',
      failure: 'Pushing too hard - you made a mistake!',
    },
    'maintain-pace': {
      success: 'Steady approach kept you on track.',
      neutral: 'Nothing changed.',
      failure: 'Maintaining pace didn\'t help the situation.',
    },
    'conserve-tires': {
      success: 'Smart tire management! You\'re saving for later.',
      neutral: 'Conserving tires, but lost a position.',
      failure: 'Too slow - you lost positions.',
    },
    'manage-carefully': {
      success: 'Perfect balance of speed and tire conservation.',
      neutral: 'Managing tires carefully.',
      failure: 'Misjudged the balance - tires wearing faster.',
    },
    'push-through-wear': {
      success: 'Aggressive pace maintained! Tires holding up for now.',
      neutral: 'Fast pace, but tires degrading quickly.',
      failure: 'Pushed too hard - massive tire wear.',
    },
  };

  return messages[option.id]?.[outcome] || `Decision outcome: ${outcome}`;
}
