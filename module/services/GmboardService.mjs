// service to handle the GM board functionality
export async function onSendPresetGmboardMessage(
	event,
	message,
	cost,
	recipientId
) {
	event.preventDefault();
	if (!message) return;

	// Check if actor has enough coins
	if (this.actor.system.coins >= cost) {
		// Deduct coins
		const updatedCoins = this.actor.system.coins - cost;
		await this.actor.update({ 'system.coins': updatedCoins });

		// Check if the recipientId is 'public'
		if (recipientId === 'public') {
			// Send a public message
			CONFIG.SS1E.socket.executeForEveryone('constellationMessage', {
				content: message,
				constellation: this.actor.name,
			});
		} else {
			// Get the selected actor and check if it's defined
			const selectedActor = game.actors.get(recipientId);
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
					console.warn(
						'The selected character has no associated user.'
					);
				}
			} else {
				console.warn('Selected character not found.');
			}
		}
	} else {
		// Show error notification
		ui.notifications.error(
			`Not enough coins to send the message! (${cost} coins required)`
		);
	}
}
export async function onSendCustomStarstreamMessage(
	event,
	recipientId,
	message
) {
	event.preventDefault();
	if (!message) return;
	if (recipientId === 'public') {
		// Send a public message
		CONFIG.SS1E.socket.executeForEveryone('starstreamMessage', {
			content: message,
		});
	} else {
		// Get the selected actor and check if it's defined
		const selectedActor = game.actors.get(recipientId);
		if (selectedActor) {
			// Get the user associated with the selected actor
			const ownerUser = game.users.find(
				(user) => user.character?.id === selectedActor.id
			);
			if (ownerUser) {
				CONFIG.SS1E.socket.executeAsUser(
					'starstreamMessage',
					ownerUser._id,
					{
						content: message,
					}
				);
			} else {
				console.warn('The selected character has no associated user.');
			}
		} else {
			console.warn('Selected character not found.');
		}
	}
}
