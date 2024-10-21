import {
	onManageActiveEffect,
	prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SS1EActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['scenarioshift1e', 'sheet', 'actor'],
			width: 600,
			height: 800,
			resizable: false,
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'features',
				},
			],
		});
	}

	/** @override */
	get template() {
		return `systems/scenarioshift1e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
	}
	/** @override */
	get template() {
		return `systems/scenarioshift1e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */
	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Retrieve the data structure from the base sheet. You can inspect or log
		// the context variable to see the structure, but some key properties for
		// sheets are the actor object, the data object, whether or not it's
		// editable, the items array, and the effects array.
		const context = super.getData();

		// Use a safe clone of the actor data for further operations.
		const actorData = context.data;

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = actorData.system;
		context.flags = actorData.flags;

		// Prepare character data and items.
		if (actorData.type == 'character') {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		// Get all player characters
		context.players = game.actors
			.filter((actor) => actor.hasPlayerOwner)
			.map((actor) => ({
				id: actor.id,
				name: actor.name,
			}));

		context.system = actorData.system;
		context.flags = actorData.flags;
		// Prepare NPC data and items.
		if (actorData.type == 'npc') {
			this._prepareItems(context);
		}

		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();
		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();

		// Prepare active effects
		context.effects = prepareActiveEffectCategories(
			this.actor.allApplicableEffects()
		);
		// Prepare active effects
		context.effects = prepareActiveEffectCategories(
			// A generator that returns all effects stored on the actor
			// as well as any items
			this.actor.allApplicableEffects()
		);

		return context;
	}

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareCharacterData(context) {
		// This method can be used to prepare specific character data if needed
	}
	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareCharacterData(context) {}

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareItems(context) {
		// You can add any specific item preparation logic here if needed
	}

	/* -------------------------------------------- */
	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Render the item sheet for viewing/editing prior to the editable check.
		html.on('click', '.item-edit', (ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.sheet.render(true);
		});
		// Render the item sheet for viewing/editing prior to the editable check.
		html.on('click', '.item-edit', (ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.sheet.render(true);
		});

		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;
		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Add Inventory Item
		html.on('click', '.item-create', this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.on('click', '.item-delete', (ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		// Active Effect management
		html.on('click', '.effect-control', (ev) => {
			const row = ev.currentTarget.closest('li');
			const document =
				row.dataset.parentId === this.actor.id
					? this.actor
					: this.actor.items.get(row.dataset.parentId);
			onManageActiveEffect(ev, document);
		});

		// Rollable abilities.
		html.on('click', '.rollable', this._onRoll.bind(this));

		html
			.find('button[data-action="attributeLevelUp"]')
			.click(this._onStatLevelUp.bind(this));
		html
			.find('button[data-action="openCurrencyPanel"]')
			.click(this._openCurrencyPanel.bind(this));

		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find('li.item').each((i, li) => {
				if (li.classList.contains('inventory-header')) return;
				li.setAttribute('draggable', true);
				li.addEventListener('dragstart', handler, false);
			});
		}

		// Send Public Message
		html.on(
			'click',
			'.send-message',
			this._onSendPublicPresetMessage.bind(this)
		);

		// Send Whisper Message
		html.on('click', '.send-whisper', this._onSendWhisperMessage.bind(this));
		// Send Custom Public Message
		html.on('click', '.send-public', this._onSendPublicMessage.bind(this));
		// Handle sending coins to another character
		html
			.find('button[data-action="sendCoins"]')
			.click(this._onSendCoins.bind(this));
	}

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			system: data,
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.system['type'];

		// Finally, create the item!
		return await Item.create(itemData, { parent: this.actor });
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */

	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		// Handle item rolls.
		if (dataset.rollType) {
			if (dataset.rollType == 'item') {
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item) return item.roll();
			}
		}

		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			let label = dataset.label ? `[attribute] ${dataset.label}` : '';
			let roll = new Roll(dataset.roll, this.actor.getRollData());
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get('core', 'rollMode'),
			});
			return roll;
		}
	}

	/**
	 * Handle sending a public message
	 * Deduct 50 coins if successful.
	 * Show error if not enough coins.
	 * @private
	 */
	_onSendPublicPresetMessage(event) {
		event.preventDefault();
		const message = event.currentTarget.dataset.message; // Get message from the button's data attribute

		// Check if actor has enough coins (50 coins needed)
		if (this.actor.system.coins >= 50) {
			// Deduct 50 coins
			const updatedCoins = this.actor.system.coins - 50;
			this.actor.update({ 'system.coins': updatedCoins }).then(() => {
				// Create the chat message
				ChatMessage.create({
					content: message,
					speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				});
			});
		} else {
			// Show error notification
			ui.notifications.error(
				'Not enough coins to send the message! (50 coins required)'
			);
		}
	}
	_onSendPublicMessage(event) {
		event.preventDefault();
		const message = this._getMessage(); // Get message from the input box

		// Check if actor has enough coins (50 coins needed)
		if (this.actor.system.coins >= 50) {
			// Deduct 50 coins
			const updatedCoins = this.actor.system.coins - 50;
			this.actor.update({ 'system.coins': updatedCoins }).then(() => {
				// Create the chat message
				ChatMessage.create({
					content: message,
					speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				});
			});
		} else {
			// Show error notification
			ui.notifications.error(
				'Not enough coins to send the message! (50 coins required)'
			);
		}
	}

	/**
	 * Handle sending a whisper message to the selected character
	 * Deduct 50 coins if successful.
	 * Show error if not enough coins.
	 * @private
	 */
	_onSendWhisperMessage(event) {
		event.preventDefault();
		const message = this._getMessage(); // Ensure this retrieves the correct message
		const selectedCharacterId = this._getSelectedCharacterId(); // Ensure this gets the selected character ID

		if (!message || !selectedCharacterId) return;

		// Check if actor has enough coins (50 coins needed)
		if (this.actor.system.coins >= 50) {
			// Deduct 50 coins
			const updatedCoins = this.actor.system.coins - 50;
			this.actor.update({ 'system.coins': updatedCoins }).then(() => {
				const selectedActor = game.actors.get(selectedCharacterId);

				// Get the user associated with the selected actor
				const ownerUser = game.users.find(
					(user) => user.character?.id === selectedActor.id
				);

				if (ownerUser) {
					// Create a whisper message
					ChatMessage.create({
						content: message,
						whisper: [ownerUser._id], // Whisper to the user ID
						speaker: ChatMessage.getSpeaker({ actor: this.actor }),
					});
				} else {
					console.warn('The selected character has no associated user.');
				}
			});
		} else {
			// Show error notification
			ui.notifications.error(
				'Not enough coins to send the message! (50 coins required)'
			);
		}
	}

	_onStatLevelUp(event) {
		event.preventDefault();

		const key = event.currentTarget.dataset.key;
		const stat = this.actor.system.stats[key];

		new Dialog({
			title: 'Level Up!',
			content: `
				<p>${stat.label} Lv. ${stat.value} → ${stat.label} Lv. ${stat.value + 1}</p>
				<p>Cost: ${stat.value * 100} Coins</p>
			`,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: 'Yes',
					callback: () => {
						// Check if the actor has enough coins
						if (this.actor.system.coins >= stat.value * 100) {
							const cost = stat.value * 100;
							const updatedCoins = this.actor.system.coins - cost;
							const newStatValue = stat.value + 1;

							// Update the actor's coins and stat value
							this.actor
								.update({
									[`system.coins`]: updatedCoins, // Dynamically update coins
									[`system.stats.${key}.value`]: newStatValue, // Update the stat value
								})
								.then(() => this.render()); // Re-render the sheet after the update
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
		}).render(true);
	}

	_openCurrencyPanel(event) {
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
						this._adjustCoins(this.actor, amount); // Add coins
					},
				},
				remove: {
					label: 'Remove',
					callback: (html) => {
						const input = html.find('#coin-input').val();
						const amount = parseInt(input, 10) || 0;
						this._adjustCoins(this.actor, -amount); // Remove coins
					},
				},
				cancel: {
					label: 'Cancel',
				},
			},
			default: 'cancel',
		}).render(true);
	}

	/**
	 * Handle sending coins to another character
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onSendCoins(event) {
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
							this._transferCoins(this.actor, targetCharacterId, amount);
						} else {
							ui.notifications.error('You must send at least 1 coin!');
						}
					},
				},
				cancel: {
					label: 'Cancel',
				},
			},
		}).render(true);
	}

	/**
	 * Transfer coins from the current actor to the target actor
	 * @param {Actor} sender     The actor sending the coins
	 * @param {String} targetId  The ID of the target actor
	 * @param {Number} amount    The amount of coins to send
	 * @private
	 */
	_transferCoins(sender, targetId, amount) {
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
	/**
	 * Get the message from the input box
	 * @private
	 */
	_getMessage() {
		const input = document.getElementById('messageInput');
		return input.value.trim(); // Return the trimmed input value directly
	}

	/**
	 * Get the selected character ID from the dropdown
	 * @private
	 */
	_getSelectedCharacterId() {
		const selectElement = document.getElementById('characterSelect');
		return selectElement.value;
	}

	_adjustCoins(actor, amount) {
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
}
