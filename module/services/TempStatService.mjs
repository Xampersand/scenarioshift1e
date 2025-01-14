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
	switch (statId) {
		case 'temp-evasion':
			actor.update({ 'system.evasionTempBonus': newValue });
			break;
		case 'temp-accuracy':
			actor.update({ 'system.accuracyTempBonus': newValue });
			break;
		case 'temp-armor':
			actor.update({ 'system.armorTempBonus': newValue });
			break;
		case 'temp-str':
			actor.update({ 'system.strTempBonus': newValue });
			break;
		case 'temp-agi':
			actor.update({ 'system.agiTempBonus': newValue });
			break;
		case 'temp-con':
			actor.update({ 'system.conTempBonus': newValue });
			break;
		case 'temp-int':
			actor.update({ 'system.intTempBonus': newValue });
			break;
		case 'temp-str-dmg':
			actor.update({ 'system.damageIncreaseStrTempBonus': newValue });
			break;
		case 'temp-agi-dmg':
			actor.update({ 'system.damageIncreaseAgiTempBonus': newValue });
			break;
		case 'temp-con-dmg':
			actor.update({ 'system.damageIncreaseConTempBonus': newValue });
			break;
		case 'temp-int-dmg':
			actor.update({ 'system.damageIncreaseIntTempBonus': newValue });
			break;
		case 'temp-initiative':
			actor.update({ 'system.initiativeTempBonus': newValue });
			break;
		// Add more cases as needed
	}
}
