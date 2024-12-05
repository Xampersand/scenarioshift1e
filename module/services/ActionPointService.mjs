// Function to consume action points
export function consumeActionPoints(actor, points) {
  // Check if the actor is in combat
  const combat = game.combat;
  const combatant = combat ? combat.getCombatantByActor(actor.id) : null;
  if (!combatant) {
    return;
  } else {
    if (actor.system.actionPointsCurrent >= points) {
      actor.system.actionPointsCurrent -= points;
      actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
    } else {
      ui.notifications.warn(`Not enough action points!`);
    }
  }
}
// Function to reset action points
export function resetActionPoints(actor) {
  actor.system.actionPointsCurrent = actor.system.actionPointsMax;
  actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
}

// Function to decrease action points
export function minusActionPoints(actor) {
  actor.system.actionPointsCurrent -= 1;
  actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
}

// Function to increase action points
export function addActionPoints(actor) {
  actor.system.actionPointsCurrent += 1;
  actor.sheet.render(true); // Trigger a render of the actor sheet to update the ap value
}
