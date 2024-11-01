export function onStatLevelUp(event) {
	event.preventDefault();

	const key = event.currentTarget.dataset.key;
	const stat = this.actor.system.stats[key];
	const cost = 300 + Math.floor(stat.value / 10) * 100;

	new Dialog({
		title: 'Level Up!',
		content: `
			  <p>${stat.label} Lv. ${stat.value} → ${stat.label} Lv. ${stat.value + 1}</p>
			  <p>Cost: ${cost} Coins</p>
			`,
		buttons: {
			yes: {
				icon: '<i class="fas fa-check"></i>',
				label: 'Yes',
				callback: () => {
					if (this.actor.system.coins >= cost) {
						const updatedCoins = this.actor.system.coins - cost;
						const newStatValue = stat.baseValue + 1;

						// Prepare the data object for updating
						let updateData = {
							[`system.coins`]: updatedCoins,
							[`system.stats.${key}.baseValue`]: newStatValue,
						}

						// Add health if Constitution is leveled up
						if (key === 'con') {
							const healthGain = Math.round(2.5); // Rounding the 2.5 heal
							updateData['system.resources.health.value'] =
								(this.actor.system.resources.health.value || 0) + healthGain;
						}

						// Add mana if Intelligence is leveled up
						if (key === 'int') {
							const manaGain = 5;
							updateData['system.resources.mana.value'] =
								(this.actor.system.resources.mana.value || 0) + manaGain;
						}

						// Apply updates to actor
						this.actor.update(updateData).then(() => this.render()); // Re-render the sheet
					} else {
						ui.notifications.error('Not enough coins to level up!');
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
		close: () => console.log('Dialog closed without choosing.'),
	}).render(true, { width: 400, height: 200 });
}