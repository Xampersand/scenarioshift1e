import {
	onManageActiveEffect,
	prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SS1EItemSheet extends ItemSheet {
	constructor(...args) {
		super(...args);
		this.isEditing = false; // Initialize edit mode state
	}
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['ss1e', 'sheet', 'item'],
			width: 520,
			height: 480,
			resizable: false,
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'description',
				},
			],
		});
	}

	/** @override */
	get template() {
		return `systems/ss1e/templates/item/item-${this.item.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Retrieve base data structure.
		const context = super.getData();

		// Use a safe clone of the item data for further operations.
		const itemData = context.data;

		//define editable context
		context.isEditing = this.isEditing;

		// Retrieve the roll data for TinyMCE editors.
		context.rollData = this.item.getRollData();

		// Include actor data if available
		context.actor = this.actor || null;

		// Add the item's data to context.data for easier access, as well as flags.
		context.system = itemData.system;
		context.flags = itemData.flags;

		// Prepare active effects for easier access
		context.effects = prepareActiveEffectCategories(this.item.effects);

		// Add choices for the key field
		context.effectChoices = SS1EEquippableItem.effectChoices;

		// Debugging: Log the context to ensure actor data is available
		console.log('Item Sheet Context:', context);

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		// Toggle edit mode when the button is clicked
		html.find('.edit-mode-toggle').click((ev) => {
			this.isEditing = !this.isEditing;
			this.render(); // Re-render the sheet with updated edit mode
		});

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Roll handlers, click handlers, etc. would go here.

		// Add effect
		html.find('.add-effect').click(this._onAddEffect.bind(this));

		// Delete effect
		html.find('.delete-effect').click(this._onDeleteEffect.bind(this));

		// Active Effect management
		html.on('click', '.effect-control', (ev) =>
			onManageActiveEffect(ev, this.item)
		);
	}
	/**
	 * Handle adding a new effect.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onAddEffect(event) {
		event.preventDefault();
		const activeEffects = this.item.system.activeEffects || [];
		activeEffects.push({
			label: '',
			changes: [{ key: '', value: 0, mode: 2, priority: 20 }],
			duration: {
				startTime: null,
				seconds: null,
				combat: null,
				rounds: null,
				turns: null,
				startRound: null,
				startTurn: null,
			},
			disabled: false,
			origin: this.item.uuid,
			tint: '',
			transfer: true,
		});
		this.item.update({ 'system.activeEffects': activeEffects });
	}

	/**
	 * Handle deleting an effect.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onDeleteEffect(event) {
		event.preventDefault();
		const index = event.currentTarget.dataset.index;
		const activeEffects = this.item.system.activeEffects || [];
		activeEffects.splice(index, 1);
		this.item.update({ 'system.activeEffects': activeEffects });
	}
}
