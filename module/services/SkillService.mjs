export function onRollSkillAccuracy(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  const skill = actor.items.get(itemId);
  if (!skill) {
    ui.notifications.warn('No skill found!');
    return;
  }

  // Define the roll formula for skill accuracy
  const playerAccuracy = actor.system.derived.accuracy.value;
  const skillAccuracy = skill.system.accuracy || 0;
  const totalAccuracy = playerAccuracy + skillAccuracy;
  const rollFormula = `1d100 + ${totalAccuracy}`;
  if (!rollFormula) {
    ui.notifications.warn('No accuracy formula found for the skill!');
    return;
  }

  try {
    const roll = new Roll(rollFormula, actor.getRollData());
    roll.roll().then((rolled) => {
      rolled.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling Accuracy for ${skill.name}`, // Optional flavor text
      });
    });
  } catch (error) {
    console.error('Error while rolling skill accuracy:', error);
  }
  consumeActionPoints(actor, 2);
}
// Function to handle the melee skill roll
export function onRollSkillDamage(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  console.log(`Item ID: ${itemId}`); // Debugging statement

  if (!itemId) {
    console.error('No item ID found on the clicked button.');
    return;
  }

  const skill = actor.items.get(itemId);
  if (!skill) {
    console.warn(`No skill found with ID: ${itemId}`); // More detailed warning
    ui.notifications.warn('No skill found!');
    return;
  }
  console.log(`Skill found: ${skill.name}`); // Debugging statement

  // How much stat do you need to get 1% inc damage with the skill
  const STRENGTH_DAMAGE_SCALING = 1;
  const AGILITY_DAMAGE_SCALING = 1;
  const INTELLIGENCE_DAMAGE_SCALING = 1;

  // Determine the stat requirement and use the corresponding actor's stat
  let playerStatDamageIncrease = 0;
  let additionalDice = 0;
  const statRequirement = skill.system.requirement.type || 'int'; // Default to 'int' if no requirement is specified
  if (statRequirement === 'str') {
    playerStatDamageIncrease =
      actor.system.stats.str.value / STRENGTH_DAMAGE_SCALING / 100;
    additionalDice = Math.floor(
      actor.system.stats.str.value / skill.system.upgradeThreshold
    );
  } else if (statRequirement === 'agi') {
    playerStatDamageIncrease =
      actor.system.stats.agi.value / AGILITY_DAMAGE_SCALING / 100;
    additionalDice = Math.floor(
      actor.system.stats.agi.value / skill.system.upgradeThreshold
    );
  } else if (statRequirement === 'int') {
    playerStatDamageIncrease =
      actor.system.stats.int.value / INTELLIGENCE_DAMAGE_SCALING / 100;
    additionalDice = Math.floor(
      actor.system.stats.int.value / skill.system.upgradeThreshold
    );
  } else if (statRequirement === 'con') {
    playerStatDamageIncrease =
      actor.system.stats.con.value / CONSTITUTION_DAMAGE_SCALING / 100;
    additionalDice = Math.floor(
      actor.system.stats.con.value / skill.system.upgradeThreshold
    );
  } else {
    ui.notifications.warn('Unknown stat requirement for the skill!');
    return;
  }
  const totalDamageIncrease = 1 + playerStatDamageIncrease;
  const totalDice = skill.system.diceNum + additionalDice;
  const damageFormula = `${totalDice}${skill.system.diceSize}+${skill.system.diceBonus}`;

  const rollFormula = `round((${damageFormula})*${totalDamageIncrease})`;
  console.log(`Roll formula: ${rollFormula}`); // Debugging statement

  try {
    const roll = new Roll(rollFormula, actor.getRollData());
    roll.roll().then((rolled) => {
      rolled.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `Rolling Damage for ${skill.name}`, // Optional flavor text
      });
    });
  } catch (error) {
    console.error('Error while rolling skill damage:', error);
  }
}
export function onSendSkillToChat(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  const skill = actor.items.get(itemId);
  if (!skill) {
    ui.notifications.warn('No skill found!');
    return;
  }

  // send chat message with skill properties
  const messageContent = `
    <div class="skill-announce">&lt;SKILL - ${skill.name}&gt;</div><br>
    <div>Name: ${skill.name}</div>
    <div>Range: ${skill.system.range}</div>
    <div>Accuracy: ${skill.system.accuracy}</div>
    <div>Damage Roll: ${skill.system.damageFormula}</div>
    <div>Damage Type: ${skill.system.damageType}</div>
    <div>AP Cost: ${skill.system.apCost}</div>
    `;
  ChatMessage.create({
    content: messageContent,
    speaker: ChatMessage.getSpeaker({ actor: actor }),
  });
}
