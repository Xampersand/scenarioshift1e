import { consumeActionPoints } from './ActionPointService.mjs';

export function onRollMeleeWeapon(actor, itemId, mode) {
	const weapon = actor.items.get(itemId);
	if (!weapon) {
		ui.notifications.warn('No equipped melee weapon found!');
		return;
	}

	let weaponDamageIncreaseTotal = 0;
	const statRequirement = weapon.system.requirement.type || 'str';
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

	weaponDamageIncreaseTotal += actor.system[weapon.system.damageType.toLowerCase() + "DmgIncreaseTotal"];

	const critMulti = actor.system.critMultiTotal || 2;
	const amplificationFactor = 1 + actor.system.amplification || 1;
	const flatDmgBonus = actor.system[weapon.system.damageType + "FlatDmgIncreaseTotal"] || 0;
	let rollFormula = `round((${flatDmgBonus}+${weapon.system.damageFormula})*${weaponDamageIncreaseTotal}*${amplificationFactor})`;
	if (mode === 'crit') {
		rollFormula = `round((${flatDmgBonus}+${weapon.system.damageFormula})*${weaponDamageIncreaseTotal}*${amplificationFactor}*${critMulti})`;
	} else if (mode === 'megaCrit') {
		rollFormula = `round((${flatDmgBonus} + ${weapon.system.damageRoll.diceNum}${weapon.system.damageRoll.diceSize}x+${weapon.system.damageRoll.diceBonus})*${weaponDamageIncreaseTotal}*${amplificationFactor}*${critMulti})`;
	}
	if (!rollFormula) {
		ui.notifications.warn(
			'No damage formula found for the equipped melee weapon!'
		);
		return;
	}

	// Update Last Attack Roll
	const updateData = {
		['system.lastAttackRoll']: weapon.id
	}
	actor.update(updateData).then(() => actor.sheet.render(true));

	try {
		const roll = new Roll(rollFormula, actor.getRollData());
		roll.roll().then((rolled) => {
			rolled.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: `Rolling Damage for ${weapon.name}`,
			});
		});
	} catch (error) {
		console.error('Error while rolling melee weapon damage:', error);
	}
}

export function onRollUnarmedDamage(actor, mode) {
	const unarmedStrengthRolls = Math.round(actor.system.strTotal / 10);
	const amplificationFactor = 1 + actor.system.amplification || 1;
	const critMulti = actor.system.critMultiTotal || 2;
	const flatDmgBonus = actor.system.flatDmgBonus || 0;
	let rollFormula = `round((${flatDmgBonus}+1d4+${unarmedStrengthRolls}d4)*${amplificationFactor})`;
	if (mode === 'crit') {
		rollFormula = `round((${flatDmgBonus}+1d4+${unarmedStrengthRolls}d4)*${amplificationFactor}*${critMulti})`;
	} else if (mode === 'megaCrit') {
		rollFormula = `round((${flatDmgBonus}+1d4x+${unarmedStrengthRolls}d4x)*${amplificationFactor}*${critMulti})`;
	}
	if (!rollFormula) {
		ui.notifications.warn('No unarmed damage formula found!');
		return;
	}

	// Update Last Attack Roll
	const updateData = {
		['system.lastAttackRoll']: "Unarmed"
	}
	actor.update(updateData).then(() => actor.sheet.render(true));

	try {
		const roll = new Roll(rollFormula, actor.getRollData());
		roll.roll().then((rolled) => {
			rolled.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: `Rolling Unarmed Damage`,
			});
		});
	} catch (error) {
		console.error('Error while rolling unarmed damage:', error);
	}
}

export function onRollAccuracy(actor, mode) {
	const accuracy = actor.system.accuracyTotal;

	if (typeof accuracy !== 'number') {
		console.error('Accuracy value is not a number:', accuracy);
		return;
	}

	let rollFormula = `1d100 + ${accuracy}`;
	if (mode === 'advantage') {
		rollFormula = `2d100kh + ${accuracy}`;
	} else if (mode === 'disadvantage') {
		rollFormula = `2d100kl + ${accuracy}`;
	}

	try {
		const roll = new Roll(rollFormula, actor.getRollData());

		roll.roll().then((rolled) => {
			rolled.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: `Rolling Accuracy: ${rollFormula}`,
			});
		});
	} catch (error) {
		console.error('Error while rolling accuracy:', error);
	}
	consumeActionPoints(actor, 2);
}
export function onRollWeaponAccuracy(actor, itemId, mode) {
	const weapon = actor.items.get(itemId);
	if (!weapon) {
		ui.notifications.warn('No equipped weapon found!');
		return;
	}

	const playerAccuracy = actor.system.accuracyTotal;
	const weaponAccuracy = weapon.system.accuracy || 0;
	const totalAccuracy = playerAccuracy + weaponAccuracy;
	let rollFormula = `1d100 + ${totalAccuracy}`;
	if (mode === 'advantage') {
		rollFormula = `2d100kh + ${totalAccuracy}`;
	} else if (mode === 'disadvantage') {
		rollFormula = `2d100kl + ${totalAccuracy}`;
	}
	if (!rollFormula) {
		ui.notifications.warn(
			'No accuracy formula found for the equipped weapon!'
		);
		return;
	}

	try {
		const roll = new Roll(rollFormula, actor.getRollData());
		roll.roll().then((rolled) => {
			rolled.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: `Rolling Accuracy for ${weapon.name}`,
			});
		});
	} catch (error) {
		console.error('Error while rolling weapon accuracy:', error);
	}
	consumeActionPoints(actor, 2);
}
