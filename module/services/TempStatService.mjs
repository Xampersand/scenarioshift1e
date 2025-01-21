// Function to open a dialog for editing temporary stat bonuses
export function openEditTempStatDialog(actorId, statId, currentValue) {
	new Dialog({
		title: `Edit Temporary Bonus for ${statId}`,
		content: `
        <form>
          <div class="form-group temp-stat-bonus">
            <label for="temp-bonus-value">Value:</label>
            <input type="number" id="temp-bonus-value" name="temp-bonus-value" value="${currentValue}" />
          </div>
        </form>
      `,

		buttons: {
			save: {
				label: 'Save',
				callback: (html) => {
					const newValue = parseInt(
						html.find('[name="temp-bonus-value"]').val()
					);
					updateTempBonus(actorId, statId, newValue);
				},
			},
			cancel: {
				label: 'Cancel',
			},
		},
		default: 'save',
	}).render(true);
}

// Function to update the temporary bonus value
export function updateTempBonus(actorId, statId, newValue) {
	const actor = game.actors.get(actorId); // Use the passed actorId to get the actor

	const statCases = {};

	function camelCase(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}

	statCases['temp-evasion'] = 'system.evasionTempBonus';
	statCases['temp-armor'] = 'system.armorTempBonus';
	statCases['temp-accuracy'] = 'system.accuracyTempBonus';

	for (const [key, stat] of Object.entries(CONFIG.SS1E.stats)) {
		statCases["temp-" + stat.short] = 'system.' + stat.short + 'TempBonus';
		statCases["temp-" + stat.short + "-dmg"] = 'system.damageIncrease' + camelCase(stat.short) + 'TempBonus';
	}

	for (const [key, damageType] of Object.entries(CONFIG.SS1E.damageTypes)) {
		statCases["temp-" + damageType + "-dmg"] = 'system.' + damageType + 'DmgIncreaseTempBonus';
	}

	actor.update({ [statCases[statId]]: newValue });
}
