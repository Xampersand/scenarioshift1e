export function onSendGmboardMessage(event) {
	event.preventDefault();
	const message = getGmboardMessage(); // Ensure this retrieves the correct message
	const selectedCharacterId = getGmboardMessageRecipient(); // Ensure this gets the selected character ID
	if (!message) return;

	// Check if the selectedCharacterId is 'public'
	if (selectedCharacterId === 'public') {
		// Send a public message
		CONFIG.SS1E.socket.executeForEveryone('starstreamMessage', {
			content: message,
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
				CONFIG.SS1E.socket.executeAsUser('starstreamMessage', ownerUser._id, {
					content: message,
				});
			} else {
				console.warn('The selected character has no associated user.');
			}
		} else {
			console.warn('Selected character not found.');
		}
	}
}
/**
 * Get the message from the input box
 * @private
 */
function getGmboardMessage() {
	const input = document.getElementById('gmboardMessageInput');
	return input.value.trim(); // Return the trimmed input value directly
}

/**
 * Get the selected character ID from the dropdown
 * @private
 */
function getGmboardMessageRecipient() {
	const selectElement = document.getElementById('gmboardMessageRecipient');
	return selectElement.value;
}
