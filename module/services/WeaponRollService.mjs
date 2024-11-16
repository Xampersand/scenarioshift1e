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
	let playerDamageIncrease = 0;
	const statRequirement = weapon.system.requirement?.stat || 'str'; // Default to 'str' if no requirement is specified
	if (statRequirement === 'str') {
		playerDamageIncrease = actor.system.stats.str.value / 100;
	} else if (statRequirement === 'agi') {
		playerDamageIncrease = actor.system.stats.agi.value / 100;
	} else {
		ui.notifications.warn(
			'Unknown stat requirement for the equipped melee weapon!'
		);
		return;
	}

	const rollFormula = `round((${weapon.system.damageFormula})*(1+${playerDamageIncrease}))`;
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
