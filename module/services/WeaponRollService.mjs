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
	const critMulti = actor.system.critMultiTotal || 2;
	const amplificationFactor = 1 + actor.system.amplification || 1;
	let rollFormula = `round((${weapon.system.damageFormula})*${weaponDamageIncreaseTotal}*${amplificationFactor})`;
	if (mode === 'crit') {
		rollFormula = `round((${weapon.system.damageFormula})*${weaponDamageIncreaseTotal}*${amplificationFactor}*${critMulti})`;
	} else if (mode === 'megaCrit') {
		rollFormula = `round((${weapon.system.damageRoll.diceNum}${weapon.system.damageRoll.diceSize}x+${weapon.system.damageRoll.diceBonus})*${weaponDamageIncreaseTotal}*${amplificationFactor}*${critMulti})`;
	}
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
				flavor: `Rolling Damage for ${weapon.name}`,
			});
		});
	} catch (error) {
		console.error('Error while rolling melee weapon damage:', error);
	}
}

// export function onRollRangedWeapon(actor, weaponId, ammoId, mode) {
// 	const weapon = actor.items.get(weaponId);
// 	const ammo = actor.items.get(ammoId);

// 	if (!weapon) {
// 		ui.notifications.warn('No equipped ranged weapon found!');
// 		return;
// 	}
// 	if (!ammo) {
// 		ui.notifications.warn('No equipped ammo found!');
// 		return;
// 	}

// 	let weaponDamageIncreaseTotal = 0;
// 	const statRequirement = weapon.system.requirement.type || 'agi';
// 	if (statRequirement === 'str') {
// 		weaponDamageIncreaseTotal = actor.system.damageIncreaseStrTotal;
// 	} else if (statRequirement === 'agi') {
// 		weaponDamageIncreaseTotal = actor.system.damageIncreaseAgiTotal;
// 	} else if (statRequirement === 'int') {
// 		weaponDamageIncreaseTotal = actor.system.damageIncreaseIntTotal;
// 	} else if (statRequirement === 'con') {
// 		weaponDamageIncreaseTotal = actor.system.damageIncreaseConTotal;
// 	} else {
// 		ui.notifications.warn('Unknown stat requirement for the weapon!');
// 		return;
// 	}

// 	const weaponDamageIncrease = weapon.system.damageIncrease || 0;
// 	const totalDamageIncrease =
// 		1 + weaponDamageIncreaseTotal + weaponDamageIncrease;
// 	let rollFormula = `round((${ammo.system.damageFormula})*${totalDamageIncrease})`;
// 	if (mode === 'crit') {
// 		rollFormula = `round((${ammo.system.damageFormula})*${totalDamageIncrease})*2`;
// 	} else if (mode === 'megaCrit') {
// 		rollFormula = `round((${ammo.system.damageRoll.diceNum}${ammo.system.damageRoll.diceSize}x+${ammo.system.damageRoll.diceBonus})*${totalDamageIncrease})*2`;
// 	}
// 	if (!rollFormula) {
// 		ui.notifications.warn('No damage formula found for the equipped ammo!');
// 		return;
// 	}

// 	try {
// 		const roll = new Roll(rollFormula, actor.getRollData());
// 		roll.roll().then((rolled) => {
// 			rolled.toMessage({
// 				speaker: ChatMessage.getSpeaker({ actor: actor }),
// 				flavor: `Rolling Damage for ${weapon.name} with ${ammo.name}`,
// 			});
// 		});
// 	} catch (error) {
// 		console.error('Error while rolling ranged weapon damage:', error);
// 	}
// }
export function onRollUnarmedDamage(actor, mode) {
	const unarmedStrengthRolls = Math.round(actor.system.strTotal / 10);
	const amplificationFactor = 1 + actor.system.amplification || 1;
	const critMulti = actor.system.critMultiTotal || 2;
	let rollFormula = `round((1d4+${unarmedStrengthRolls}d4)*${amplificationFactor})`;
	if (mode === 'crit') {
		rollFormula = `round((1d4+${unarmedStrengthRolls}d4)*${amplificationFactor}*${critMulti})`;
	} else if (mode === 'megaCrit') {
		rollFormula = `round((1d4x+${unarmedStrengthRolls}d4x)*${amplificationFactor}*${critMulti})`;
	}
	if (!rollFormula) {
		ui.notifications.warn('No unarmed damage formula found!');
		return;
	}

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
