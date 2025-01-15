// function to handle rollable attributes
export function onRollRP(event, actor, key) {
	event.preventDefault();
	const strRollBaseBonus = actor.system.strRollBaseBonus;
	const agiRollBaseBonus = actor.system.agiRollBaseBonus;
	const conRollBaseBonus = actor.system.conRollBaseBonus;
	const intRollBaseBonus = actor.system.intRollBaseBonus;
	const strRollBonus = actor.system.strRollBonus;
	const agiRollBonus = actor.system.agiRollBonus;
	const conRollBonus = actor.system.conRollBonus;
	const intRollBonus = actor.system.intRollBonus;

	// Define different formulas for each type of stat
	const formulas = {
		str: `1d100 + ${strRollBaseBonus} + ${strRollBonus}`,
		agi: `1d100 + ${agiRollBaseBonus} + ${agiRollBonus}`,
		con: `1d100 + ${conRollBaseBonus} + ${conRollBonus}`,
		int: `1d100 + ${intRollBaseBonus} + ${intRollBonus}`,
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
