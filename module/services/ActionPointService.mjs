// Function to consume action points
export function consumeActionPoints(actor, points) {
	// Check if the actor is in combat
	const combat = game.combat;
	const combatant = combat ? combat.getCombatantByActor(actor.id) : null;
	if (!combatant) {
		return;
	} else {
		if (actor.system.actionPointsCurrent >= points) {
			console.log(
				`action points before action:`,
				actor.system.actionPointsCurrent
			);
			actor.system.actionPointsCurrent -= points;
			actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
			console.log(
				`action points after action:`,
				actor.system.actionPointsCurrent
			);
		} else {
			ui.notifications.warn(`Not enough action points!`);
		}
	}
}
// Function to reset action points
export function resetActionPoints(actor) {
	console.log(
		`action points before action:`,
		actor.system.actionPointsCurrent
	);
	actor.system.actionPointsCurrent = actor.system.actionPointsMax;
	actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
	console.log(
		`action points after action:`,
		actor.system.actionPointsCurrent
	);
}

// Function to decrease action points
export function minusActionPoints(actor) {
	console.log(
		`action points before action:`,
		actor.system.actionPointsCurrent
	);
	actor.system.actionPointsCurrent -= 1;
	actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
	console.log(
		`action points after action:`,
		actor.system.actionPointsCurrent
	);
}

// Function to increase action points
export function addActionPoints(actor) {
	console.log(
		`action points before action:`,
		actor.system.actionPointsCurrent
	);
	actor.system.actionPointsCurrent += 1;
	actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
	console.log(
		`action points after action:`,
		actor.system.actionPointsCurrent
	);
}
