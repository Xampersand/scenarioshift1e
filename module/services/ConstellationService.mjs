export function onSendPresetMessage(event) {
	event.preventDefault();
	const message = event.currentTarget.dataset.message; // Get message from the button's data attribute
	const cost = Number(event.currentTarget.dataset.cost); // Get message cost
	const selectedCharacterId = this._getmessageRecipient(); // Ensure this gets the selected character ID
	if (!message) return;
	// Check if actor has enough coins (50 coins needed)
	if (this.actor.system.coins >= cost) {
		// Deduct 50 coins
		const updatedCoins = this.actor.system.coins - cost;
		this.actor.update({ 'system.coins': updatedCoins }).then(() => {
			// Check if the selectedCharacterId is 'public'
			if (selectedCharacterId === 'public') {
				// Send a public message
				CONFIG.SS1E.socket.executeForEveryone('constellationMessage', {
					content: message,
					constellation: this.actor.name,
				});
			} else {
				// Get the selected actor and check if it's defined
				const selectedActor = game.actors.get(selectedCharacterId);
				if (selectedActor) {
					// Get the user associated with the selected actor
					const ownerUser = game.users.find(
						(user) => user.character?.id === selectedActor.id
					);
					if (ownerUser) {
						CONFIG.SS1E.socket.executeAsUser(
							'constellationMessage',
							ownerUser._id,
							{
								content: message,
								constellation: this.actor.name,
							}
						);
					} else {
						console.warn('The selected character has no associated user.');
					}
				} else {
					console.warn('Selected character not found.');
				}
			}
		});
	} else {
		// Show error notification
		ui.notifications.error(
			'Not enough coins to send the message! (50 coins required)'
		);
	}
}

export function onSendCustomMessage(event) {
	event.preventDefault();
	const message = this._getMessage(); // Ensure this retrieves the correct message
	const selectedCharacterId = this._getmessageRecipient(); // Ensure this gets the selected character ID
	if (!message) return;
	// Check if actor has enough coins (50 coins needed)
	if (this.actor.system.coins >= 1000) {
		// Deduct 50 coins
		const updatedCoins = this.actor.system.coins - 1000;
		this.actor.update({ 'system.coins': updatedCoins }).then(() => {
			// Check if the selectedCharacterId is 'public'
			if (selectedCharacterId === 'public') {
				// Send a public message
				CONFIG.SS1E.socket.executeForEveryone('constellationMessage', {
					content: message,
					constellation: this.actor.name,
				});
			} else {
				// Get the selected actor and check if it's defined
				const selectedActor = game.actors.get(selectedCharacterId);
				if (selectedActor) {
					// Get the user associated with the selected actor
					const ownerUser = game.users.find(
						(user) => user.character?.id === selectedActor.id
					);
					if (ownerUser) {
						// Create a whisper message
						CONFIG.SS1E.socket.executeAsUser(
							'constellationMessage',
							ownerUser._id,
							{
								content: message,
								constellation: this.actor.name,
							}
						);
					} else {
						console.warn('The selected character has no associated user.');
					}
				} else {
					console.warn('Selected character not found.');
				}
			}
		});
	} else {
		// Show error notification
		ui.notifications.error(
			'Not enough coins to send the message! (200 coins required)'
		);
	}
}