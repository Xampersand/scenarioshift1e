// function to handle stat leveling
export function onStatLevelUp(event) {
	event.preventDefault();

	const key = event.currentTarget.dataset.key;
	const statBaseKey = `${key}Base`;
	const statTotalKey = `${key}Total`;
	const statLabel = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the first letter for the label
	const statValue = this.actor.system[statBaseKey];
	const statTotalValue = this.actor.system[statTotalKey];
	const currentCoins = this.actor.system.coins;
	const cantAffordText = "not enough coins";
	
	const baseCost = 300;
	const costPerLevel = 100;

	let coinsRemaining = currentCoins - costToLevel(baseCost, costPerLevel, statValue, 1);

	new Dialog({
		title: 'Level Up!',
		content: `
      <div class='stat-dialog'>
        <p>Base ${statLabel} Lv. ${statValue} → ${statLabel} Lv. <span id="new-stat-value">${
			statValue + 1
		}</span> (${statTotalValue} ${statLabel} → <span id="new-stat-total-value">${
			statTotalValue + 1
		}</span> ${statLabel})</p>
        <p>Cost for <span id="levels-to-increase-display">1</span> level(s): 
          <span id="level-up-cost">${costToLevel(baseCost, costPerLevel, statValue, 1)} coins. (${coinsRemaining >= 0 ? coinsRemaining : cantAffordText} coins left)</span></p>
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
					let totalCost = costToLevel(baseCost, costPerLevel, statValue, levelsToIncrease);

					if (currentCoins >= totalCost) {
						const updatedCoins = currentCoins - totalCost;
						const newStatValue = this.actor.system[statBaseKey] + levelsToIncrease;

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
		render: (html) => {
			const input = html.find('#level-increase');
			const costDisplay = html.find('#level-up-cost');
			const levelsDisplay = html.find('#levels-to-increase-display');
			const newStatValue = html.find('#new-stat-value');
			const newStatTotalValue = html.find(`#new-stat-total-value`);

			// Update the cost dynamically when the input value changes
			input.on('input', (e) => {
				const levelsToIncrease = parseInt(e.target.value) || 1;
				const totalCost = costToLevel(baseCost, costPerLevel, statValue, levelsToIncrease);
				coinsRemaining = currentCoins - totalCost;
				levelsDisplay.text(levelsToIncrease);
				costDisplay.text(totalCost + " coins. (" + (coinsRemaining >= 0 ? (coinsRemaining + " coins left") : cantAffordText) + ")");
				newStatValue.text(statValue + levelsToIncrease);
				newStatTotalValue.text(statTotalValue + levelsToIncrease);
			});
		},
	}).render(true);
}

export function costToLevel(baseCost, costPerLevel, statValue, levelsToIncrease, breakpoint = 50, doubling = 25) {
    let totalCost = 0;

    for (let i = 0; i < levelsToIncrease; i++) {
        const currentLevel = statValue + i;

        let levelCost;
	
        if (currentLevel < breakpoint) {
            levelCost = baseCost + Math.floor(currentLevel / 10) * costPerLevel;
        } else {
            levelCost = (baseCost * 2 / 3 + Math.floor(currentLevel / 10) * costPerLevel) * 2 ** (Math.floor((currentLevel - breakpoint) / doubling) + 1);
        }

        totalCost += levelCost;
    }

    return totalCost;
}
