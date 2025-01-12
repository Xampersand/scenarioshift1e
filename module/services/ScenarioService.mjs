export function onScenarioSubmit(event, recipientId) {
	event.preventDefault();

	const name = $('#scenario-name').val();
	const category = $('#scenario-category').val();
	const difficulty = $('#scenario-difficulty').val();
	const conditionText = $('#scenario-conditions').val();
	const timeLimit = $('#scenario-time-limit').val();
	const reward = $('#scenario-reward').val();
	const failureConditionText = $('#scenario-fail-condition').val();
	const penalty = $('#scenario-fail').val();
	const notesText = $('#scenario-notes').val();

	const messageContent = `
		<div class="scenario-announce">&lt;${category} SCENARIO - ${name}&gt;</div><br>
		<div>Scenario&nbsp;Name:&nbsp;${name}</div>
		<div>Category:&nbsp;${category}</div>
		<div>Difficulty:&nbsp;${difficulty}</div>
		<div>Clear&nbsp;conditions:<br>${conditionText}</div>
		<div>Time&nbsp;Limit:&nbsp;${timeLimit}</div>
		<div>Reward:&nbsp;${reward}</div>
		<div>Failure&nbsp;Condition:&nbsp;${failureConditionText}</div>
		<div>Failure&nbsp;Penalty:&nbsp;${penalty}</div>
		<div>${notesText}</div>
	`;

	const journalPageData = {
		_id: randomID(),
		name: 'Scenario Details',
		type: 'text',
		text: {
			content: `
				<h2>${name}</h2>
				<p><strong>Category:</strong>&nbsp;${category}</p>
				<p><strong>Difficulty:</strong>&nbsp;${difficulty}</p>
				<p><strong>Clear&nbsp;conditions:</strong><br>${conditionText}</p>
				<p><strong>Time Limit:</strong>&nbsp;${timeLimit}</p>
				<p><strong>Reward:</strong>&nbsp;${reward}</p>
				<p><strong>Failure Condition:</strong>&nbsp;${failureConditionText}</p>
				<p><strong>Failure Penalty:</strong>&nbsp;${penalty}</p>
				<p>${notesText}</p>
			`,
			format: 1,
		},
		sort: 0,
		ownership: { default: 2 },
	};

	const journalData = {
		name: `Scenario: ${name}`,
		pages: [journalPageData],
		folder: null,
		ownership: { default: 2 },
		flags: {},
	};

	if (recipientId === 'public') {
		// Send message to everyone
		CONFIG.SS1E.socket.executeForEveryone('scenarioMessage', {
			content: messageContent,
		});
	} else {
		// Private message to a specific user
		const selectedActor = game.actors.get(recipientId);
		if (selectedActor) {
			const ownerUser = game.users.find(
				(user) => user.character?.id === selectedActor.id
			);

			if (ownerUser) {
				CONFIG.SS1E.socket.executeAsUser(
					'scenarioMessage',
					ownerUser.id,
					{
						content: messageContent,
					}
				);
				// Adjust journal ownership for private access
				journalData.ownership = { [ownerUser.id]: 3 };
			} else {
				console.warn('The selected character has no associated user.');
			}
		} else {
			console.warn('Selected character not found.');
		}
	}

	// Create the journal entry
	JournalEntry.create(journalData)
		.then((entry) => {
			console.log(`Journal Entry '${entry.name}' created successfully.`);
		})
		.catch((error) => {
			console.error('Error creating journal entry:', error);
		});
}
