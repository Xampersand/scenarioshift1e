import { consumeActionPoints } from './ActionPointService.mjs';

// Function to handle the melee weapon roll
export function onRollMeleeWeapon(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  const weapon = actor.items.get(itemId);
  if (!weapon) {
    ui.notifications.warn('No equipped melee weapon found!');
    return;
  }
  // Determine the stat requirement and use the corresponding actor's stat
  let weaponDamageIncreaseTotal = 0;
  const statRequirement = weapon.system.requirement.type || 'str'; // Default to 'str' if no requirement is specified
  if (statRequirement === 'str') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseStrTotal;
  } else if (statRequirement === 'agi') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseAgiTotal;
  } else if (statRequirement === 'int') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseIntTotal;
  } else if (statRequirement === 'con') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseConTotal;
  } else {
    ui.notifications.warn('Unknown stat requirement for the weapon!');
    return;
  }
  const rollFormula = `round((${weapon.system.damageFormula})*${weaponDamageIncreaseTotal})`;
  if (!rollFormula) {
    ui.notifications.warn(
      'No damage formula found for the equipped melee weapon!'
    );
    return;
  }

  try {
    const roll = new Roll(rollFormula, actor.getRollData());
    roll.roll().then((rolled) => {
      rolled.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling Damage for ${weapon.name}`, // Optional flavor text
      });
    });
  } catch (error) {
    console.error('Error while rolling melee weapon damage:', error);
  }
}

// Function to handle the ranged weapon roll
export function onRollRangedWeapon(event, actor) {
  event.preventDefault();
  const weaponId = event.currentTarget.dataset.weaponId;
  const ammoId = event.currentTarget.dataset.ammoId;
  const weapon = actor.items.get(weaponId);
  const ammo = actor.items.get(ammoId);

  if (!weapon) {
    ui.notifications.warn('No equipped ranged weapon found!');
    return;
  }
  if (!ammo) {
    ui.notifications.warn('No equipped ammo found!');
    return;
  }

  // Determine the stat requirement and use the corresponding actor's stat
  let weaponDamageIncreaseTotal = 0;
  const statRequirement = weapon.system.requirement.type || 'agi'; // Default to 'str' if no requirement is specified
  if (statRequirement === 'str') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseStrTotal;
  } else if (statRequirement === 'agi') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseAgiTotal;
  } else if (statRequirement === 'int') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseIntTotal;
  } else if (statRequirement === 'con') {
    weaponDamageIncreaseTotal = 1 + actor.system.damageIncreaseConTotal;
  } else {
    ui.notifications.warn('Unknown stat requirement for the weapon!');
    return;
  }

  const weaponDamageIncrease = weapon.system.damageIncrease || 0;
  const totalDamageIncrease =
    1 + weaponDamageIncreaseTotal + weaponDamageIncrease;
  const rollFormula = `round((${ammo.system.damageFormula})*${totalDamageIncrease})`;
  if (!rollFormula) {
    ui.notifications.warn('No damage formula found for the equipped ammo!');
    return;
  }

  try {
    const roll = new Roll(rollFormula, actor.getRollData());
    roll.roll().then((rolled) => {
      rolled.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling Damage for ${weapon.name} with ${ammo.name}`, // Optional flavor text
      });
    });
  } catch (error) {
    console.error('Error while rolling ranged weapon damage:', error);
  }
}
export function onRollUnarmedDamage(event, actor) {
  event.preventDefault();
  const unarmedStrengthDamage = actor.system.strTotal / 2;
  const rollFormula = `round(1+${unarmedStrengthDamage})`;
  if (!rollFormula) {
    ui.notifications.warn('No unarmed damage formula found!');
    return;
  }

  try {
    const roll = new Roll(rollFormula, actor.getRollData());
    roll.roll().then((rolled) => {
      rolled.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling Unarmed Damage`, // Optional flavor text
      });
    });
  } catch (error) {
    console.error('Error while rolling unarmed damage:', error);
  }
}
// Function to handle the accuracy roll
export function onRollAccuracy(event, actor) {
  event.preventDefault();

  // Get the accuracy value from the actor's data
  const accuracy = actor.system.accuracyTotal; // Adjust this path as necessary

  // Check if accuracy is a number
  if (typeof accuracy !== 'number') {
    console.error('Accuracy value is not a number:', accuracy);
    return;
  }

  // Define the roll formula
  const rollFormula = `1d100 + ${accuracy}`; // Ensure this is a valid formula
  try {
    // Create a new roll
    const roll = new Roll(rollFormula, actor.getRollData());

    // Roll and then send the result to chat
    roll.roll().then((rolled) => {
      rolled.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling Accuracy: ${rollFormula}`, // Optional flavor text
      });
    });
  } catch (error) {
    console.error('Error while rolling accuracy:', error);
  }
  consumeActionPoints(actor, 2);
}
// Function to handle the weapon accuracy roll
export function onRollWeaponAccuracy(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  const weapon = actor.items.get(itemId);
  if (!weapon) {
    ui.notifications.warn('No equipped weapon found!');
    return;
  }

  // Define the roll formula for weapon accuracy
  const playerAccuracy = actor.system.accuracyTotal;
  const weaponAccuracy = weapon.system.accuracy || 0;
  const totalAccuracy = playerAccuracy + weaponAccuracy;
  const rollFormula = `1d100 + ${totalAccuracy}`;
  if (!rollFormula) {
    ui.notifications.warn('No accuracy formula found for the equipped weapon!');
    return;
  }

  try {
    const roll = new Roll(rollFormula, actor.getRollData());
    roll.roll().then((rolled) => {
      rolled.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling Accuracy for ${weapon.name}`, // Optional flavor text
      });
    });
  } catch (error) {
    console.error('Error while rolling weapon accuracy:', error);
  }
  consumeActionPoints(actor, 2);
}
