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
		//DONE
		context.possibleSlots = [
			'One Hand',
			'Two Hands',
			'Armor',
			'Helmet',
			'Boots',
			'Gloves',
			'Accessory',
			'Other',
			'None',
		];
		//DONE
		context.possibleStats = ['agi', 'str', 'int', 'con'];
		//done
		context.possibleDice = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
		//done
		context.possibleDamageTypes = [
			'bludgeoning',
			'piercing',
			'slashing',
			'fire',
			'cold',
			'lightning',
			'poison',
			'arcane',
			'necrotic',
			'true',
		];
		context.possibleSkillTypes = [
			'offensive',
			'healing',
			'buff',
			'debuff',
			'passive',
			'other',
		];
		context.possibleManaTypes = [
			'Transmutation',
			'Conjuration',
			'Enhancement',
			'Emission',
			'Manipulation',
			'Specialization',
		];
		//DONE
		context.possibleRatings = [
			'Common',
			'Uncommon',
			'Rare',
			'Heroic',
			'Legendary',
			'Mythical',
		];
		// Retrieve the roll data for TinyMCE editors.
		context.rollData = this.item.getRollData();

		// Include actor data if available
		context.actor = this.actor || null;

		// Add the item's data to context.data for easier access, as well as flags.
		context.system = itemData.system;
		context.flags = itemData.flags;

		// Prepare active effects for easier access
		context.effects = prepareActiveEffectCategories(this.item.effects);

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

		// Active Effect management
		html.on('click', '.effect-control', (ev) =>
			onManageActiveEffect(ev, this.item)
		);
	}
}
