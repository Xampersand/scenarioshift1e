// function to handle stat leveling
export function onStatLevelUp(event) {
	event.preventDefault();

	const key = event.currentTarget.dataset.key;
	const statBaseKey = `${key}Base`;
	const statTotalKey = `${key}Total`;
	const statLabel = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the first letter for the label
	const statValue = this.actor.system[statBaseKey];
	const statTotalValue = this.actor.system[statTotalKey];

	const baseCost = 300;
	const costPerLevel = 100;

	new Dialog({
		title: 'Level Up!',
		content: `
      <div class='stat-dialog'>
        <p>Base ${statLabel} Lv. ${statValue} → ${statLabel} Lv. <span id="new-stat-value">${
			statValue + 1
		}</span> (${statTotalValue} ${statLabel} → <span id="new-stat-total-value">${
			statTotalValue + 1
		}</span> ${statLabel})</p>
        <p>Cost per level: 	${
			baseCost + Math.floor(statValue / 10) * 100
		} coins. (${baseCost} + ${costPerLevel} every 10 levels.)</p>
        <label for="level-increase">Levels to increase:</label>
        <input type="number" id="level-increase" name="level-increase" value="1" min="1" style="width: 50px;">
      </div>`,
		buttons: {
			yes: {
				icon: '<i class="fas fa-check"></i>',
				label: 'Yes',
				callback: () => {
					const levelsToIncrease = parseInt(
						document.getElementById('level-increase').value
					);
					let totalCost = 0;

					// Calculate the total cost for each level increase
					for (let i = 0; i < levelsToIncrease; i++) {
						const currentLevel = statValue + i;
						const levelCost =
							baseCost +
							Math.floor(currentLevel / 10) * costPerLevel;
						totalCost += levelCost;
					}

					if (this.actor.system.coins >= totalCost) {
						const updatedCoins =
							this.actor.system.coins - totalCost;
						const newStatValue =
							this.actor.system[statBaseKey] + levelsToIncrease;

						// Prepare the data object for updating
						let updateData = {
							[`system.coins`]: updatedCoins,
							[`system.${statBaseKey}`]: newStatValue,
						};

						// Add health if Constitution is leveled up
						if (key === 'con') {
							const healthGain = 3 * levelsToIncrease;
							const manaGain = 1 * levelsToIncrease;
							updateData['system.healthCurrent'] =
								(this.actor.system.healthCurrent || 0) +
								healthGain;
							updateData['system.manaCurrent'] =
								(this.actor.system.manaCurrent || 0) + manaGain;
						}

						// Add mana if Intelligence is leveled up
						if (key === 'int') {
							const manaGain = 5 * levelsToIncrease;
							updateData['system.manaCurrent'] =
								(this.actor.system.manaCurrent || 0) + manaGain;
						}

						// Apply updates to actor
						this.actor.update(updateData).then(() => this.render());
					} else {
						ui.notifications.error('Not enough coins!');
					}
				},
			},
			no: {
				icon: '<i class="fas fa-times"></i>',
				label: 'No',
				callback: () => console.log('Level up canceled'),
			},
		},
		default: 'no',
	}).render(true);
}
