import {
	onManageActiveEffect,
	prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SS1EActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["scenarioshift1e", "sheet", "actor"],
			width: 600,
			height: 800,
			resizable: false,
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "features",
				},
			],
		});
	}

	/** @override */
	get template() {
		return `systems/scenarioshift1e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		const context = super.getData();
		const actorData = context.data;

		// Prepare the character data and items
		if (actorData.type === "character") {
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

		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();

		// Prepare active effects
		context.effects = prepareActiveEffectCategories(
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
	_prepareItems(context) {
		// You can add any specific item preparation logic here if needed
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Render the item sheet for viewing/editing prior to the editable check.
		html.on("click", ".item-edit", (ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Add Inventory Item
		html.on("click", ".item-create", this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.on("click", ".item-delete", (ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		// Active Effect management
		html.on("click", ".effect-control", (ev) => {
			const row = ev.currentTarget.closest("li");
			const document =
				row.dataset.parentId === this.actor.id
					? this.actor
					: this.actor.items.get(row.dataset.parentId);
			onManageActiveEffect(ev, document);
		});

		// Rollable abilities.
		html.on("click", ".rollable", this._onRoll.bind(this));

		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find("li.item").each((i, li) => {
				if (li.classList.contains("inventory-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}

		// Send Public Message
		html.on("click", ".send-public", this._onSendPublicMessage.bind(this));

		// Send Whisper Message
		html.on("click", ".send-whisper", this._onSendWhisperMessage.bind(this));
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
		delete itemData.system["type"];

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
			if (dataset.rollType == "item") {
				const itemId = element.closest(".item").dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item) return item.roll();
			}
		}

		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			let label = dataset.label ? `[attribute] ${dataset.label}` : "";
			let roll = new Roll(dataset.roll, this.actor.getRollData());
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get("core", "rollMode"),
			});
			return roll;
		}
	}

	/**
	 * Handle sending a public message
	 * @private
	 */
	_onSendPublicMessage(event) {
		event.preventDefault();
		const message = this._getMessage();
		if (message) {
			ChatMessage.create({
				content: message,
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			});
		}
	}

	/**
	 * Handle sending a whisper message to the selected character
	 * @private
	 */
	_onSendWhisperMessage(event) {
		event.preventDefault();
		const message = this._getMessage();
		const selectedCharacterId = this._getSelectedCharacterId();

		if (message && selectedCharacterId) {
			const selectedActor = game.actors.get(selectedCharacterId);

			// Get the user associated with the selected actor
			const ownerUser = game.users.find(
				(user) => user.character?.id === selectedActor.id
			);

			if (ownerUser) {
				ChatMessage.create({
					content: message,
					whisper: [ownerUser._id], // Whisper to the user ID
					speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				});
			} else {
				console.warn("The selected character has no associated user.");
			}
		}
	}

	/**
	 * Get the message from the input box
	 * @private
	 */
	_getMessage() {
		return document.getElementById("messageInput").value.trim();
	}

	/**
	 * Get the selected character ID from the dropdown
	 * @private
	 */
	_getSelectedCharacterId() {
		const selectElement = document.getElementById("characterSelect");
		return selectElement.value;
	}
}
