import { consumeActionPoints } from './ActionPointService.mjs';
import { spendManaCost } from './ManaCostService.mjs';
import { playAttackAnimation, playSkillAnimation } from './VFXService.mjs';
// rolling skill acc
export function onRollSkillAccuracy(actor, skillId, mode) {
	const skill = actor.items.get(skillId);
	if (!skill) {
		ui.notifications.warn('No skill found!');
		return;
	}

	// Define the roll formula for skill accuracy
	const playerAccuracy = actor.system.accuracyTotal;
	const skillAccuracy = skill.system.accuracy || 0;
	const totalAccuracy = playerAccuracy + skillAccuracy;
	let rollFormula = `1d100 + ${totalAccuracy}`;
	if (mode === 'advantage') {
		rollFormula = `2d100kh1 + ${totalAccuracy}`;
	} else if (mode === 'disadvantage') {
		rollFormula = `2d100kl1 + ${totalAccuracy}`;
	}
	if (!rollFormula) {
		ui.notifications.warn('No accuracy formula found for the skill!');
		return;
	}
	if (
		skill.system.manaCost &&
		skill.system.manaCost > actor.system.manaCurrent
	) {
		ui.notifications.warn('Not enough mana!');
		return;
	}
	let totalManaCost = skill.system.manaCost;
	let flavor = `Rolling Accuracy for ${skill.name}`;
	if (skill.system.isAttackSkill) {
		const usedWeapon = actor.items.get(actor.system.attackSkillWeapon);
		const usedWeaponAccuracy = usedWeapon.system.accuracy || 0;
		rollFormula = `1d100 + ${totalAccuracy} + ${usedWeaponAccuracy}`;
		flavor = `Rolling Accuracy for ${skill.name} with ${usedWeapon.name}`;
		if (mode === 'advantage') {
			rollFormula = `2d100kh1 + ${totalAccuracy} + ${usedWeaponAccuracy}`;
		} else if (mode === 'disadvantage') {
			rollFormula = `2d100kl1 + ${totalAccuracy} + ${usedWeaponAccuracy}`;
		}
	}

	try {
		const roll = new Roll(rollFormula, actor.getRollData());
		roll.roll().then((rolled) => {
			rolled.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: flavor, // Optional flavor text
			});
			spendManaCost(actor, totalManaCost);
			consumeActionPoints(actor, skill.system.apCost);
		});
	} catch (error) {
		console.error('Error while rolling skill accuracy:', error);
	}
}

// Function to handle the skill damage roll
export function onRollSkillDamage(actor, skillId, mode) {
	const skill = actor.items.get(skillId);
	if (!skill) {
		console.warn(`No skill found with ID: ${itemId}`); // More detailed warning
		ui.notifications.warn('No skill found!');
		return;
	}
	// Update Last Attack Roll
	const updateData = {
		['system.lastAttackRoll']: skill.id,
	};
	actor.update(updateData).then(() => actor.sheet.render(true));
	playSkillAnimation(actor, skill);
	if (skill.system.usesCustomMacro) {
		if (mode === 'crit') {
			game.macros.getName(`${skill.system.customMacro} CRIT`).execute();
			return;
		} else if (mode === 'megaCrit') {
			game.macros
				.getName(`${skill.system.customMacro} MEGACRIT`)
				.execute();
			return;
		} else {
			game.macros.getName(`${skill.system.customMacro}`).execute();
			return;
		}
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
	const { damageIncrease } = STAT_MAPPINGS[statRequirement];
	const amplificationFactor = 1 + actor.system.amplification;
	const critMulti = actor.system.critMultiTotal || 2;
	let skillDamageIncreaseTotal = 1 + damageIncrease;
	skillDamageIncreaseTotal +=
		actor.system[
			skill.system.damageType.toLowerCase() + 'DmgIncreaseTotal'
		];

	const totalDice = skill.system.diceNum;
	let damageFormula = `${totalDice}${skill.system.diceSize}+${skill.system.diceBonus}`;
	if (mode === 'megaCrit') {
		damageFormula = `${totalDice}${skill.system.diceSize}x+${skill.system.diceBonus}`;
	}
	let rollFormula = `round((${damageFormula})*${skillDamageIncreaseTotal}*${amplificationFactor})`;
	if (mode === 'crit' || mode === 'megaCrit') {
		rollFormula = `round((${damageFormula})*${skillDamageIncreaseTotal}*${amplificationFactor}*${critMulti})`;
	}
	if (!rollFormula) {
		ui.notifications.warn('No damage formula found for the skill!');
		return;
	}
	let flavor = `Rolling Damage for ${skill.name}`;
	if (skill.system.isAttackSkill) {
		const usedWeapon = actor.items.get(actor.system.attackSkillWeapon);
		let weaponRequirementType = usedWeapon.system.requirement.type;
		let weaponDamageFlatBonus = actor.system[weaponRequirementType + "Total"] / 5;
		if (!["agi", "str"].includes(weaponRequirementType)) {
			weaponDamageFlatBonus = 0;
		}
		flavor = `Rolling Damage for ${skill.name} with ${usedWeapon.name}`;
		rollFormula = `round(((${usedWeapon.system.damageFormula}+${damageFormula})*${skillDamageIncreaseTotal}+${weaponDamageFlatBonus})*${amplificationFactor})`;
		if (mode === 'crit') {
			rollFormula = `round(((${usedWeapon.system.damageFormula}+${damageFormula})*${skillDamageIncreaseTotal}+${weaponDamageFlatBonus})*${amplificationFactor}*${critMulti})`;
		} else if (mode === 'megaCrit') {
			usedWeaponDamageRollFormula = `${usedWeapon.system.damageRoll.diceNum}${usedWeapon.system.damageRoll.diceSize}x+${usedWeapon.system.diceBonus}`;
			rollFormula = `round(((${usedWeaponDamageRollFormula}+${damageFormula})*${skillDamageIncreaseTotal}+${weaponDamageFlatBonus})*${amplificationFactor}*${critMulti})`;
		}
	}

	try {
		const roll = new Roll(rollFormula, actor.getRollData());
		roll.roll().then((rolled) => {
			rolled.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: flavor,
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
	if (skill.system.usesCustomMacro) {
		playSkillAnimation(actor, skill);
		game.macros.getName(`${skill.system.customMacro}`).execute();
		return;
	}
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
		let totalHealingIncrease = 1 + playerStatHealingIncrease;
		const bonusHealingIncrease = actor.system.healingDmgIncreaseTotal;

		totalHealingIncrease += bonusHealingIncrease;
		const resonance = 1 + actor.system.resonance || 1;
		const totalDice = skill.system.diceNum;
		const healingFormula = `${totalDice}${skill.system.diceSize}+${skill.system.diceBonus}`;
		const rollFormula = `round((${healingFormula})*${totalHealingIncrease})*${resonance}`;
		const totalManaCost = skill.system.manaCost;
		try {
			const roll = new Roll(rollFormula, actor.getRollData());
			roll.roll().then((rolled) => {
				rolled.toMessage({
					speaker: ChatMessage.getSpeaker({ actor: actor }),
					flavor: `Rolling healing for ${skill.name}`, // Optional flavor text
				});
				spendManaCost(actor, totalManaCost);
				consumeActionPoints(actor, skill.system.apCost);
				actor.sheet.render(true);
			});
		} catch (error) {
			console.error('Error while rolling skill damage:', error);
		}

		return;
	} else if (skill.system.skillType === 'buff') {
		const totalManaCost = skill.system.manaCost;
		let updateData = {};
		if (skill.system.isActive === false) {
			updateData = {
				[`system.isActive`]: true,
			};
			await skill.update(updateData);
			for (let effect of skill.effects) {
				await effect.update({ disabled: false });
			}
			playSkillAnimation(actor, skill);
			spendManaCost(actor, totalManaCost);
			consumeActionPoints(actor, skill.system.apCost);
		} else {
			updateData = {
				[`system.isActive`]: false,
			};
			await skill.update(updateData);
			for (let effect of skill.effects) {
				await effect.update({ disabled: true });
			}
			const macro = game.macros.getName(
				'00 - A - Delete filters on Selected'
			);
			if (macro) {
				macro.execute();
			}
		}
		actor.sheet.render(true);
		return;
	} else if (
		skill.system.skillType === 'debuff' ||
		skill.system.skillType === 'other'
	) {
		const totalManaCost = skill.system.manaCost;
		playSkillAnimation(actor, skill);
		spendManaCost(actor, totalManaCost);
		consumeActionPoints(actor, skill.system.apCost);
		actor.sheet.render(true);
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
