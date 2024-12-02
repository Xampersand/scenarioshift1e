import { consumeActionPoints } from './ActionPointService.mjs';
// rolling skill acc
export function onRollSkillAccuracy(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  const skill = actor.items.get(itemId);
  if (!skill) {
    ui.notifications.warn('No skill found!');
    return;
  }

  // Define the roll formula for skill accuracy
  const playerAccuracy = actor.system.accuracyTotal;
  const skillAccuracy = skill.system.accuracy || 0;
  const totalAccuracy = playerAccuracy + skillAccuracy;
  const rollFormula = `1d100 + ${totalAccuracy}`;
  if (!rollFormula) {
    ui.notifications.warn('No accuracy formula found for the skill!');
    return;
  }
  if (skill.system.manaCost > actor.system.manaCurrent) {
    ui.notifications.warn('Not enough mana!');
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
  consumeActionPoints(actor, skill.system.apCost);
  actor.system.manaCurrent -= skill.system.manaCost;
  actor.sheet.render(true); // Trigger a render of the actor sheet to update the mana value
}

// Function to handle the skill damage roll
export function onRollSkillDamage(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;

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

  // Determine the stat requirement and use the corresponding actor's stat
  let skillDamageIncreaseTotal = 0;
  let additionalDice = 0;
  const statRequirement = skill.system.requirement.type || 'int'; // Default to 'int' if no requirement is specified
  if (statRequirement === 'str') {
    skillDamageIncreaseTotal = 1 + actor.system.damageIncreaseStrTotal;
    additionalDice = Math.floor(
      actor.system.strTotal / skill.system.upgradeThreshold
    );
  } else if (statRequirement === 'agi') {
    skillDamageIncreaseTotal = 1 + actor.system.damageIncreaseAgiTotal;
    additionalDice = Math.floor(
      actor.system.agiTotal / skill.system.upgradeThreshold
    );
  } else if (statRequirement === 'int') {
    skillDamageIncreaseTotal = 1 + actor.system.damageIncreaseIntTotal;
    additionalDice = Math.floor(
      actor.system.intTotal / skill.system.upgradeThreshold
    );
  } else if (statRequirement === 'con') {
    skillDamageIncreaseTotal = 1 + actor.system.damageIncreaseConTotal;
    additionalDice = Math.floor(
      actor.system.conTotal / skill.system.upgradeThreshold
    );
  } else {
    ui.notifications.warn('Unknown stat requirement for the skill!');
    return;
  }

  const totalDice = skill.system.diceNum + additionalDice;
  const damageFormula = `${totalDice}${skill.system.diceSize}+${skill.system.diceBonus}`;

  const rollFormula = `round((${damageFormula})*${skillDamageIncreaseTotal})`;

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
// non damage skill usage
export async function onSkillUse(event, actor) {
  event.preventDefault();
  const itemId = event.currentTarget.dataset.itemId;
  const skill = actor.items.get(itemId);
  if (!skill) {
    ui.notifications.warn('No skill found!');
    return;
  }
  if (skill.system.manaCost > actor.system.manaCurrent) {
    ui.notifications.warn('Not enough mana!');
    return;
  } else if (skill.system.skillType === 'healing') {
    // Healing skill
    const STRENGTH_HEALING_SCALING = 1;
    const AGILITY_HEALING_SCALING = 1;
    const INTELLIGENCE_HEALING_SCALING = 1;
    const CONSTITUTION_HEALING_SCALING = 1;

    let playerStatHealingIncrease = 0;
    let additionalDice = 0;
    const statRequirement = skill.system.requirement.type || 'int';
    if (statRequirement === 'str') {
      playerStatHealingIncrease =
        actor.system.strTotal / STRENGTH_HEALING_SCALING / 100;
      additionalDice = Math.floor(
        actor.system.strTotal / skill.system.upgradeThreshold
      );
    } else if (statRequirement === 'agi') {
      playerStatHealingIncrease =
        actor.system.agiTotal / AGILITY_HEALING_SCALING / 100;
      additionalDice = Math.floor(
        actor.system.agiTotal / skill.system.upgradeThreshold
      );
    } else if (statRequirement === 'int') {
      playerStatHealingIncrease =
        actor.system.intTotal / INTELLIGENCE_HEALING_SCALING / 100;
      additionalDice = Math.floor(
        actor.system.intTotal / skill.system.upgradeThreshold
      );
    } else if (statRequirement === 'con') {
      playerStatHealingIncrease =
        actor.system.conTotal / CONSTITUTION_HEALING_SCALING / 100;
      additionalDice = Math.floor(
        actor.system.conTotal / skill.system.upgradeThreshold
      );
    } else {
      ui.notifications.warn('Unknown stat requirement for the skill!');
      return;
    }
    const totalHealingIncrease = 1 + playerStatHealingIncrease;
    const totalDice = skill.system.diceNum + additionalDice;
    const healingFormula = `${totalDice}${skill.system.diceSize}+${skill.system.diceBonus}`;

    const rollFormula = `round((${healingFormula})*${totalHealingIncrease})`;

    if (skill.system.manaCost > actor.system.manaCurrent) {
      ui.notifications.warn('Not enough mana!');
      return;
    }
    try {
      const roll = new Roll(rollFormula, actor.getRollData());
      roll.roll().then((rolled) => {
        rolled.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: actor }),
          flavor: `Rolling healing for ${skill.name}`, // Optional flavor text
        });
      });
    } catch (error) {
      console.error('Error while rolling skill damage:', error);
    }
    consumeActionPoints(actor, skill.system.apCost);
    actor.system.manaCurrent -= skill.system.manaCost;
    actor.sheet.render(true); // Trigger a render of the actor sheet to update the mana value
    return;
  } else if (
    skill.system.skillType === 'buff' ||
    skill.system.skillType === 'debuff'
  ) {
    // Get the active effects present on the item
    const effects = skill.effects;
    // Apply the effects to the selected token
    const selectedToken = canvas.tokens.controlled[0];
    if (!selectedToken) {
      ui.notifications.warn('No token selected!');
      return;
    }
    for (let effect of effects) {
      await selectedToken.actor.createEmbeddedDocuments('ActiveEffect', [
        {
          ...effect.toObject(),
          disabled: false, // Enable the effect when applied
        },
      ]);
    }
    consumeActionPoints(actor, skill.system.apCost);
    actor.system.manaCurrent -= skill.system.manaCost;
    actor.sheet.render(true); // Trigger a render of the actor sheet to update the mana value
    return;
  }
}
// sending to chat
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