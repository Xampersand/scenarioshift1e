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
      actor
        .update({
          'system.actionPointsCurrent': actor.system.actionPointsCurrent,
        })
        .catch((err) => {
          console.error(
            `Failed to update action points for actor: ${actor.name}`,
            err
          );
        });
    } else {
      ui.notifications.warn(`Not enough action points!`);
    }
  }
}
// Function to reset action points
export function resetActionPoints(actor) {
  actor.system.actionPointsCurrent = actor.system.actionPointsMax;
  actor
    .update({
      'system.actionPointsCurrent': actor.system.actionPointsMax,
    })
    .catch((err) => {
      console.error(
        `Failed to update action points for actor: ${actor.name}`,
        err
      );
    });
}

// Function to decrease action points
export function minusActionPoints(actor) {
  actor.system.actionPointsCurrent -= 1;
  actor
    .update({
      'system.actionPointsCurrent': actor.system.actionPointsCurrent,
    })
    .catch((err) => {
      console.error(
        `Failed to update action points for actor: ${actor.name}`,
        err
      );
    });
}

// Function to increase action points
export function addActionPoints(actor) {
  actor.system.actionPointsCurrent += 1;
  actor
    .update({
      'system.actionPointsCurrent': actor.system.actionPointsCurrent,
    })
    .catch((err) => {
      console.error(
        `Failed to update action points for actor: ${actor.name}`,
        err
      );
    });
}
