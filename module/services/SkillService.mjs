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

	const STAT_MAPPINGS = {
		str: { total: actor.system.strTotal },
		agi: { total: actor.system.agiTotal },
		int: { total: actor.system.intTotal },
		con: { total: actor.system.conTotal },
	};

	const statRequirement = skill.system.requirement.type || 'int';

	if (!STAT_MAPPINGS[statRequirement]) {
		ui.notifications.warn('Unknown stat requirement for the skill!');
		return;
	}
	const { total } = STAT_MAPPINGS[statRequirement];
	let additionalManaCost = Math.floor(
		(total - skill.system.requirement.value) / skill.system.upgradeThreshold
	);
	let totalManaCost = skill.system.manaCost * (1 + additionalManaCost);

	try {
		const roll = new Roll(rollFormula, actor.getRollData());
		roll.roll().then((rolled) => {
			rolled.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: `Rolling Accuracy for ${skill.name}`, // Optional flavor text
			});
			actor.system.manaCurrent -= totalManaCost;
			actor.sheet.render(true); // Trigger a render of the actor sheet to update the mana value
			consumeActionPoints(actor, skill.system.apCost);
		});
	} catch (error) {
		console.error('Error while rolling skill accuracy:', error);
	}
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
	const STAT_MAPPINGS = {
		str: {
			total: actor.system.strTotal,
			damageIncrease: actor.system.damageIncreaseStrTotal,
		},
		agi: {
			total: actor.system.agiTotal,
			damageIncrease: actor.system.damageIncreaseAgiTotal,
		},
		int: {
			total: actor.system.intTotal,
			damageIncrease: actor.system.damageIncreaseIntTotal,
		},
		con: {
			total: actor.system.conTotal,
			damageIncrease: actor.system.damageIncreaseConTotal,
		},
	};

	const statRequirement = skill.system.requirement.type || 'int';

	if (!STAT_MAPPINGS[statRequirement]) {
		ui.notifications.warn('Unknown stat requirement for the skill!');
		return;
	}
	const { total, damageIncrease } = STAT_MAPPINGS[statRequirement];

	let skillDamageIncreaseTotal = 1 + damageIncrease;
	let additionalDice = Math.floor(
		(total - skill.system.requirement.value) / skill.system.upgradeThreshold
	);

	const totalDice = skill.system.diceNum * (1 + additionalDice);
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
		const STAT_SCALINGS = {
			str: { total: actor.system.strTotal, scaling: 1 },
			agi: { total: actor.system.agiTotal, scaling: 1 },
			int: { total: actor.system.intTotal, scaling: 1 },
			con: { total: actor.system.conTotal, scaling: 1 },
		};

		const statRequirement = skill.system.requirement.type || 'int';

		if (!STAT_SCALINGS[statRequirement]) {
			ui.notifications.warn('Unknown stat requirement for the skill!');
			return;
		}
		const { total, scaling } = STAT_SCALINGS[statRequirement];
		const playerStatHealingIncrease = (total * scaling) / 100;
		const additionalDice = Math.floor(
			(total - skill.system.requirement.value) /
				skill.system.upgradeThreshold
		);
		const totalHealingIncrease = 1 + playerStatHealingIncrease;
		const totalDice = skill.system.diceNum * (1 + additionalDice);
		const healingFormula = `${totalDice}${skill.system.diceSize}+${skill.system.diceBonus}`;
		const rollFormula = `round((${healingFormula})*${totalHealingIncrease})`;
		const additionalManaCost = Math.floor(
			(total - skill.system.requirement.value) /
				skill.system.upgradeThreshold
		);
		const totalManaCost = skill.system.manaCost * (1 + additionalManaCost);
		try {
			const roll = new Roll(rollFormula, actor.getRollData());
			roll.roll().then((rolled) => {
				rolled.toMessage({
					speaker: ChatMessage.getSpeaker({ actor: actor }),
					flavor: `Rolling healing for ${skill.name}`, // Optional flavor text
				});
				console.log(
					`mana before spell cost:`,
					actor.system.manaCurrent
				);
				actor.system.manaCurrent -= totalManaCost;
				consumeActionPoints(actor, skill.system.apCost);
				actor.sheet.render(true); // Trigger a render of the actor sheet to update the mana value
			});
		} catch (error) {
			console.error('Error while rolling skill damage:', error);
		}

		return;
	} else if (
		skill.system.skillType === 'buff' ||
		skill.system.skillType === 'debuff' ||
		skill.system.skillType === 'other'
	) {
		if (skill.macroEffect !== 0) {
			const macro = `/macro ${skill.macroEffect}`;
			ChatMessage.create({
				content: macro,
				speaker: ChatMessage.getSpeaker({ actor: actor }),
			});
		}
	}
	// log current mana
	actor.system.manaCurrent -= skill.system.manaCost;
	consumeActionPoints(actor, skill.system.apCost);
	actor.sheet.render(true); // Trigger a render of the actor sheet to update the mana value
	return;
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
	let messageContent = ``;
	// send chat message with skill properties
	if (skill.system.skillType === 'offensive') {
		messageContent = `
  <div class="skill-message" style="display: flex; flex-direction: column;">
    <div class="skill-announce" style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
      <div class="skill-img" style="flex:1"><img src="${skill.img}" alt="${skill.name}" width="30" height="30" ></div>
        <div class"skill-name" style="flex:2"><span >&lt;${skill.name}&gt;</span></div>
    </div>
    <div>${skill.system.description}</div>
    <div>Base Damage: ${skill.system.diceNum}&nbsp;${skill.system.diceSize}&nbsp;+&nbsp;${skill.system.diceBonus}&nbsp;${skill.system.damageType}</div>
    <div>Range: ${skill.system.range}</div>
    <div>Accuracy: ${skill.system.accuracy}</div>
    <div>AP Cost: ${skill.system.apCost}</div>
    <div>Mana Cost: ${skill.system.manaCost}</div>
  </div>
  `;
	} else if (skill.system.skillType === 'healing') {
		messageContent = `
    <div class="skill-message" style="display: flex; flex-direction: column;">
      <div class="skill-announce" style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
        <div class="skill-img" style="flex:1"><img src="${skill.img}" alt="${skill.name}" width="30" height="30" ></div>
        <div class"skill-name" style="flex:2"><span >&lt;${skill.name}&gt;</span></div>
      </div>
      <div>${skill.system.description}</div><br>
      <div>Healing Roll: ${skill.system.diceNum}&nbsp;${skill.system.diceSize}&nbsp;+&nbsp;${skill.system.diceBonus}</div>
      <div>AP Cost: ${skill.system.apCost}</div>
      <div>Mana Cost: ${skill.system.manaCost}</div>
    </div>
    `;
	} else if (skill.system.skillType === 'buff') {
		messageContent = `
    <div class="skill-message" style="display: flex; flex-direction: column;">
      <div class="skill-announce" style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
        <div class="skill-img" style="flex:1"><img src="${skill.img}" alt="${skill.name}" width="30" height="30" ></div>
        <div class"skill-name" style="flex:2"><span >&lt;${skill.name}&gt;</span></div>
      </div>
      <div>${skill.system.description}</div><br>
      <div>AP Cost: ${skill.system.apCost}</div>
      <div>Mana Cost: ${skill.system.manaCost}</div>
    </div>
    `;
	} else if (skill.system.skillType === 'debuff') {
		messageContent = `
    <div class="skill-message" style="display: flex; flex-direction: column;">
      <div class="skill-announce" style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
        <div class="skill-img" style="flex:1"><img src="${skill.img}" alt="${skill.name}" width="30" height="30" ></div>
        <div class"skill-name" style="flex:2"><span >&lt;${skill.name}&gt;</span></div>
      </div>
      <div>${skill.system.description}</div><br>
      <div>AP Cost: ${skill.system.apCost}</div>
      <div>Mana Cost: ${skill.system.manaCost}</div>
    </div>
    `;
	} else if (skill.system.skillType === 'other') {
		messageContent = `
    <div class="skill-message" style="display: flex; flex-direction: column;">
      <div class="skill-announce" style="display: flex; flex-direction: row; justify-content: center; align-items: center;">
        <div class="skill-img" style="flex:1"><img src="${skill.img}" alt="${skill.name}" width="30" height="30" ></div>
        <div class"skill-name" style="flex:2"><span >&lt;${skill.name}&gt;</span></div>
      </div>
      <div>${skill.system.description}</div><br>
      <div>AP Cost: ${skill.system.apCost}</div>
      <div>Mana Cost: ${skill.system.manaCost}</div>
    </div>
    `;
	} else {
		ui.notifications.warn('Unknown skill type!');
		return;
	}
	ChatMessage.create({
		content: messageContent,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
	});
}
