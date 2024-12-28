// Function to consume action points
export function consumeActionPoints(actor, points) {
	// Check if the actor is in combat
	const combat = game.combat;
	const combatant = combat ? combat.getCombatantByActor(actor.id) : null;
	if (!combatant) {
		return;
	} else {
		if (actor.system.actionPointsCurrent >= points) {
			const updateData = {
				[`system.actionPointsCurrent`]:
					actor.system.actionPointsCurrent - points,
			};
			actor.update(updateData).then(() => actor.sheet.render(true)); // Apply the update and render the actor sheet
		} else {
			ui.notifications.warn(`Not enough action points!`);
		}
	}
}

// Function to reset action points
export function resetActionPoints(actor) {
	const updateData = {
		[`system.actionPointsCurrent`]: actor.system.actionPointsMax,
	};
	actor.update(updateData).then(() => actor.sheet.render(true)); // Apply the update and render the actor sheet
}

// Function to decrease action points
export function minusActionPoints(actor) {
	const updateData = {
		[`system.actionPointsCurrent`]: actor.system.actionPointsCurrent - 1,
	};
	actor.update(updateData).then(() => actor.sheet.render(true)); // Apply the update and render the actor sheet
}
