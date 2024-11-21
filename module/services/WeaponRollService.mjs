// Function to handle the melee weapon roll
export function onRollMeleeWeapon(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  const weapon = actor.items.get(itemId);
  if (!weapon) {
    ui.notifications.warn('No equipped melee weapon found!');
    return;
  }
  // How much stat do you need to get 1% inc damage
  const STRENGTH_DAMAGE_SCALING = 1;
  const AGILITY_DAMAGE_SCALING = 2;
  const INTELLIGENCE_DAMAGE_SCALING = 1;

  // Determine the stat requirement and use the corresponding actor's stat
  let playerStatDamageIncrease = 0;
  const statRequirement = weapon.system.requirement.type || 'str'; // Default to 'str' if no requirement is specified
  if (statRequirement === 'str') {
    playerStatDamageIncrease =
      actor.system.stats.str.value / STRENGTH_DAMAGE_SCALING / 100;
  } else if (statRequirement === 'agi') {
    playerStatDamageIncrease =
      actor.system.stats.agi.value / AGILITY_DAMAGE_SCALING / 100;
  } else if (statRequirement === 'int') {
    playerStatDamageIncrease =
      actor.system.stats.int.value / INTELLIGENCE_DAMAGE_SCALING / 100;
  } else {
    ui.notifications.warn(
      'Unknown stat requirement for the equipped melee weapon!'
    );
    return;
  }
  const totalDamageIncrease = 1 + playerStatDamageIncrease;

  const rollFormula = `round((${weapon.system.damageFormula})*${totalDamageIncrease})`;
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

  // How much stat do you need to get 1% inc damage
  const STRENGTH_DAMAGE_SCALING = 1;
  const AGILITY_DAMAGE_SCALING = 2;
  const INTELLIGENCE_DAMAGE_SCALING = 1;

  // Determine the stat requirement and use the corresponding actor's stat
  let playerStatDamageIncrease = 0;
  const statRequirement = weapon.system.requirement.type || 'str'; // Default to 'str' if no requirement is specified
  if (statRequirement === 'str') {
    playerStatDamageIncrease =
      actor.system.stats.str.value / STRENGTH_DAMAGE_SCALING / 100;
  } else if (statRequirement === 'agi') {
    playerStatDamageIncrease =
      actor.system.stats.agi.value / AGILITY_DAMAGE_SCALING / 100;
  } else if (statRequirement === 'int') {
    playerStatDamageIncrease =
      actor.system.stats.int.value / INTELLIGENCE_DAMAGE_SCALING / 100;
  } else {
    ui.notifications.warn(
      'Unknown stat requirement for the equipped ranged weapon!'
    );
    return;
  }

  const weaponDamageIncrease = weapon.system.damageIncrease || 0;
  const totalDamageIncrease =
    1 + playerStatDamageIncrease + weaponDamageIncrease;
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
  const unarmedStrengthDamage = actor.system.stats.str.value / 2;
  // const playerStatUnarmedDamageIncrease = actor.system.stats.str.value / 100;
  // const totalDamageIncrease = 1 + playerStatUnarmedDamageIncrease;
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
  const accuracy = actor.system.derived.accuracy.value; // Adjust this path as necessary

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
  const playerAccuracy = actor.system.derived.accuracy.value;
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
  console.log(weaponAccuracy);
}
