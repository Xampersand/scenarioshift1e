// functions to handle coin transactions and management
export function openCurrencyPanel(event) {
	event.preventDefault();

	new Dialog({
		title: 'Adjust Coins',
		content: `
				<p>Enter the number of coins to add or remove:</p>
				<input type="number" id="coin-input" value="0" />
			`,
		buttons: {
			add: {
				label: 'Add',
				callback: (html) => {
					const input = html.find('#coin-input').val();
					const amount = parseInt(input, 10) || 0;
					adjustCoins(this.actor, amount); // Add coins
				},
			},
			remove: {
				label: 'Remove',
				callback: (html) => {
					const input = html.find('#coin-input').val();
					const amount = parseInt(input, 10) || 0;
					adjustCoins(this.actor, -amount); // Remove coins
				},
			},
			cancel: {
				label: 'Cancel',
			},
		},
		default: 'cancel',
	}).render(true, { width: 400, height: 200 });
}

/**
 * Handle sending coins to another character
 * @param {Event} event   The originating click event
 * @private
 */
export function onSendCoins(event) {
	event.preventDefault();

	// Open a dialog to choose a recipient and amount of coins to send
	new Dialog({
		title: 'Send Coins',
		content: `
			<form>
				<div class="form-group">
					<label>Select Character:</label>
					<select id="target-character">
						${game.actors
				.filter((actor) => actor.hasPlayerOwner)
				.map(
					(actor) => `<option value="${actor.id}">${actor.name}</option>`
				)
				.join('')}
					</select>
				</div>
				<div class="form-group">
					<label>Amount:</label>
					<input type="number" id="coin-amount" value="0" min="1"/>
				</div>
			</form>
		`,
		buttons: {
			send: {
				label: 'Send',
				callback: (html) => {
					const targetCharacterId = html.find('#target-character').val();
					const amount = parseInt(html.find('#coin-amount').val(), 10);

					if (amount > 0) {
						transferCoins(this.actor, targetCharacterId, amount);
					} else {
						ui.notifications.error('You must send at least 1 coin!');
					}
				},
			},
			cancel: {
				label: 'Cancel',
			},
		},
	}).render(true, { width: 400, height: 200 });
}

/**
 * Transfer coins from the current actor to the target actor
 * @param {Actor} sender     The actor sending the coins
 * @param {String} targetId  The ID of the target actor
 * @param {Number} amount    The amount of coins to send
 * @private
 */
export function transferCoins(sender, targetId, amount) {
	const targetActor = game.actors.get(targetId);

	// Check if the sender has enough coins
	if (sender.system.coins >= amount) {
		// Deduct coins from sender
		const updatedSenderCoins = sender.system.coins - amount;

		// Add coins to target
		const updatedTargetCoins = (targetActor.system.coins || 0) + amount;

		// Update both actors' coins and re-render sheets
		sender.update({ 'system.coins': updatedSenderCoins });
		targetActor.update({ 'system.coins': updatedTargetCoins });

		// Get the user associated with the target actor
		const ownerUser = game.users.find(
			(user) => user.character?.id === targetActor.id
		);

		// Prepare a custom message based on the sender's type
		let customMessage = `${sender.name} sent you ${amount} coins.`;
		if (sender.type === 'constellation') {
			customMessage = `${sender.name} has sponsored you with ${amount} coins!`;
		} else if (sender.type === 'character') {
			customMessage = `${sender.name} sent you ${amount} coins.`;
		}
		// You can add more conditions based on your actor types

		// Send a whisper message to the target user if foundc
		if (ownerUser) {
			ChatMessage.create({
				content: customMessage,
				whisper: [ownerUser._id], // Whisper to the user ID
				speaker: ChatMessage.getSpeaker({ actor: sender }),
			});
		} else {
			console.warn('The selected character has no associated user.');
		}

		// Notification to confirm success
		ui.notifications.info(
			`${amount} coins sent to ${targetActor.name} successfully!`
		);
	} else {
		ui.notifications.error('Not enough coins to send!');
	}
}

export function adjustCoins(actor, amount) {
	const currentCoins = actor.system.coins || 0;
	const newCoins = Math.max(currentCoins + amount, 0); // Ensure it doesn't go below 0

	// Update the actor's currency
	actor
		.update({
			'system.coins': newCoins,
		})
		.then(() => this.render()); // Re-render the sheet after the update

	// Log the result or give feedback
	console.log(
		`Updated coins for ${actor.name}: ${currentCoins} → ${newCoins}`
	);
}