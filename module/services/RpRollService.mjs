// function to handle rollable attributes
export function onRollRP(event, actor, key) {
	event.preventDefault();
	const strRollBonus = Math.round(actor.system.strTotal / 3);
	const agiRollBonus = Math.round(actor.system.agiTotal / 3);
	const conRollBonus = Math.round(actor.system.conTotal / 3);
	const intRollBonus = Math.round(actor.system.intTotal / 3);

	// Define different formulas for each type of stat
	const formulas = {
		str: `1d100 + ${strRollBonus}`,
		agi: `1d100 + ${agiRollBonus}`,
		con: `1d100 + ${conRollBonus}`,
		int: `1d100 + ${intRollBonus}`,
		// Add more formulas as needed
	};

	// Get the formula for the specified stat key
	const formula = formulas[key];
	if (!formula) {
		ui.notifications.warn(`No roll formula defined for stat: ${key}`);
		return;
	}

	// Create and roll the formula
	const roll = new Roll(formula, actor.getRollData());
	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: `Rolling ${key.toUpperCase()}`,
	});
}
