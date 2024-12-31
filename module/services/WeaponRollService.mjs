import { consumeActionPoints } from './ActionPointService.mjs';

export function onRollMeleeWeapon(event, actor) {
	event.preventDefault();
	const itemId = event.currentTarget.dataset.itemId;
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
				flavor: `Rolling Damage for ${weapon.name}`,
			});
		});
	} catch (error) {
		console.error('Error while rolling melee weapon damage:', error);
	}
}

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

	let weaponDamageIncreaseTotal = 0;
	const statRequirement = weapon.system.requirement.type || 'agi';
	if (statRequirement === 'str') {
		weaponDamageIncreaseTotal = actor.system.damageIncreaseStrTotal;
	} else if (statRequirement === 'agi') {
		weaponDamageIncreaseTotal = actor.system.damageIncreaseAgiTotal;
	} else if (statRequirement === 'int') {
		weaponDamageIncreaseTotal = actor.system.damageIncreaseIntTotal;
	} else if (statRequirement === 'con') {
		weaponDamageIncreaseTotal = actor.system.damageIncreaseConTotal;
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
				flavor: `Rolling Damage for ${weapon.name} with ${ammo.name}`,
			});
		});
	} catch (error) {
		console.error('Error while rolling ranged weapon damage:', error);
	}
}
export function onRollUnarmedDamage(event, actor) {
	event.preventDefault();
	const unarmedStrengthDamage = actor.system.strTotal / 2;
	const rollFormula = `round(1d2+${unarmedStrengthDamage})`;
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

export function onRollAccuracy(event, actor) {
	event.preventDefault();

	const accuracy = actor.system.accuracyTotal;

	if (typeof accuracy !== 'number') {
		console.error('Accuracy value is not a number:', accuracy);
		return;
	}

	const rollFormula = `1d100 + ${accuracy}`;
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
export function onRollWeaponAccuracy(event, actor) {
	event.preventDefault();
	const itemId = event.currentTarget.dataset.itemId;
	const weapon = actor.items.get(itemId);
	if (!weapon) {
		ui.notifications.warn('No equipped weapon found!');
		return;
	}

	const playerAccuracy = actor.system.accuracyTotal;
	const weaponAccuracy = weapon.system.accuracy || 0;
	const totalAccuracy = playerAccuracy + weaponAccuracy;
	const rollFormula = `1d100 + ${totalAccuracy}`;
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
