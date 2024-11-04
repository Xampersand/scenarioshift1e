export function onScenarioSubmit(event) {
	const name = $('#scenario-name').val(); // Get the input values
	const category = $('#scenario-category').val();
	const difficulty = $('#scenario-difficulty').val();
	const conditionText = $('#scenario-conditions').val();
	const timeLimit = $('#scenario-time-limit').val();
	const reward = $('#scenario-reward').val();
	const penalty = $('#scenario-fail').val();
	const notesText = $('#scenario-notes').val();

	// Create the message content based on form data
	const messageContent = `
        <strong>Scenario Name:</strong> ${name}<br>
        <strong>Category:</strong> ${category}<br>
        <strong>Difficulty:</strong> ${difficulty}<br>
        <strong>Conditions:</strong> ${conditionText}<br>
        <strong>Time Limit:</strong> ${timeLimit}<br>
        <strong>Reward:</strong> ${reward}<br>
        <strong>Failure Penalty:</strong> ${penalty}<br>
        <strong>Notes:</strong> ${notesText}
    `;
	// Send message to all users
	CONFIG.SS1E.socket.executeForEveryone('scenarioMessage', {
		content: messageContent,
	});

	// Define the journal entry page data
	const journalPageData = {
		_id: randomID(), // Generate a unique ID for the page
		name: 'Scenario Details', // Page name
		type: 'text', // Define the type as text for a text entry
		text: {
			content: `
			<h2>${name}</h2>
			<p><strong>Category:</strong> ${category}</p>
			<p><strong>Difficulty:</strong> ${difficulty}</p>
			<p><strong>Conditions:</strong> ${conditionText}</p>
			<p><strong>Time Limit:</strong> ${timeLimit}</p>
			<p><strong>Reward:</strong> ${reward}</p>
			<p><strong>Failure Penalty:</strong> ${penalty}</p>
			<p><strong>Notes:</strong> ${notesText}</p>
		`, // The content of the page
			format: 1, // Format (1 for HTML, 2 for Markdown)
		},
		sort: 0, // Sort order within the journal
		ownership: { default: 2 },
	};

	// Define the journal entry data, including the page
	const journalData = {
		name: `Scenario: ${name}`, // Journal entry name
		pages: [journalPageData], // Add pages as an array
		folder: null, // Folder can be set if needed
		ownership: { default: 2 }, // Set default permission level
		flags: {}, // Optional, for any specific flags
	};

	// Create the journal entry
	JournalEntry.create(journalData)
		.then((entry) => {
			console.log(`Journal Entry '${entry.name}' created successfully.`);
		})
		.catch((error) => {
			console.error('Error creating journal entry:', error);
		});
}
