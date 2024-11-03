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
	console.log('Scenario Name:', name);
	console.log('Category:', category);
	console.log('Difficulty:', difficulty);
	console.log('Conditions:', conditionText);
	console.log('Time Limit:', timeLimit);
	console.log('Reward:', reward);
	console.log('Failure Penalty:', penalty);
	console.log('Notes:', notesText);
	console.log(messageContent); // Debugging line

	// Send message to all users
	CONFIG.SS1E.socket.executeForEveryone('scenarioMessage', {
		content: messageContent,
	});
}
