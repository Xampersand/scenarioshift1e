// Function to consume action points
export function consumeActionPoints(actor, points) {
  // Check if the actor is in combat
  const combat = game.combat;
  const combatant = combat ? combat.getCombatantByActor(actor.id) : null;
  if (!combatant) {
    return;
  } else {
    const checkboxes = Array.from(
      document.querySelectorAll(
        '.action-point-container input[type="checkbox"]'
      )
    ).reverse(); // Reverse the order of checkboxes
    let uncheckedCount = 0;

    for (let checkbox of checkboxes) {
      if (uncheckedCount < points && checkbox.checked) {
        checkbox.checked = false;
        uncheckedCount++;
      }
    }

    if (uncheckedCount < points) {
      ui.notifications.warn(`Not enough action points!`);
    }
  }
}

// Hook to recheck all checkboxes at the start of each combat round
Hooks.on('combatRound', (combat, round) => {
  const checkboxes = document.querySelectorAll(
    '.action-point-container input[type="checkbox"]'
  );
  for (let checkbox of checkboxes) {
    checkbox.checked = true;
  }
});
