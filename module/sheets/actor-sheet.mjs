import {
	onManageActiveEffect,
	prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

import * as Constellation from '../services/ConstellationService.mjs';
import * as Inventory from '../services/InventoryService.mjs';
import * as Coin from '../services/CoinService.mjs';
import * as Stat from '../services/StatService.mjs';
import * as Scenario from '../services/ScenarioService.mjs';
import * as Gmboard from '../services/GmboardService.mjs';
import * as WeaponRoll from '../services/WeaponRollService.mjs';
import * as RpRollService from '../services/RpRollService.mjs';
import * as ActionPoints from '../services/ActionPointService.mjs';
import * as SkillInventory from '../services/SkillInventoryService.mjs';
import * as SkillRoll from '../services/SkillService.mjs';
import * as TempBonus from '../services/TempStatService.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SS1EActorSheet extends ActorSheet {
	constructor(...args) {
		super(...args);
		this.isEditing = false; // Initialize edit mode state
	}
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['ss1e', 'sheet', 'actor'],
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
		return `systems/ss1e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
	}
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

		//define editable context
		context.isEditing = this.isEditing;

		// Get all player characters
		context.players = game.actors
			.filter((actor) => actor.hasPlayerOwner)
			.map((actor) => ({
				id: actor.id,
				name: actor.name,
			}));
		// get all items of player with type meleeWeapon, map their name and id
		context.weapons = this.actor.items
			.filter((item) => item.type === 'meleeWeapon')
			.map((item) => ({
				id: item.id,
				name: item.name,
			}));
		context.accessories = this.actor.items
			.filter((item) => item.type === 'accessory')
			.filter((item) => item.system.equipped === true)
			.map((item) => ({
				id: item.id,
				name: item.name,
				img: item.img,
			}));

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = actorData.system;
		context.flags = actorData.flags;

		// // Prepare character data and items.
		if (actorData.type == 'character') {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		// Prepare NPC data and items.
		if (actorData.type == 'npc') {
			this._prepareItems(context);
		}

		const hpValue = context.system.healthCurrent;
		const hpMax = context.system.healthMaxTotal;
		const hpBarWidth = (hpValue / hpMax) * 100;

		const manaValue = context.system.manaCurrent;
		const manaMax = context.system.manaMaxTotal;
		const manaBarWidth = (manaValue / manaMax) * 100;

		// Assign this width to the template data
		context.hpBarWidth = hpBarWidth;
		context.manaBarWidth = manaBarWidth;

		context.CONFIG = {
			SS1E: CONFIG.SS1E,
			INCREASES: {},
		}
		
		function camelCase(word) {
			return word.charAt(0).toUpperCase() + word.slice(1);
		}

		for (const [key, stat] of Object.entries(CONFIG.SS1E.stats)) {
			context[stat.short + "DamageIncreasePercentage"] = Math.round(
				context.system["damageIncrease" + camelCase(stat.short) + "Total"] * 100
			);

			context[stat.short + "DamageIncreaseBonusPercentage"] = Math.round(
				context.system["damageIncrease" + camelCase(stat.short) + "TempBonus"] * 100
			);

			context.CONFIG.INCREASES[stat.short + "DamageIncreasePercentage"] = context[stat.short + "DamageIncreasePercentage"];
			context.CONFIG.INCREASES[stat.short + "DamageIncreaseBonusPercentage"] = context[stat.short + "DamageIncreaseBonusPercentage"];
		}
		
		for (const [_, damageType] of Object.entries(CONFIG.SS1E.damageTypes)) {
			context[damageType + "DamageIncreasePercentage"] = Math.round(
				context.system[damageType + "DmgIncreaseTotal"] * 100
			);
			
			context[damageType + "DamageIncreaseBonusPercentage"] = Math.round(
				context.system[damageType + "DmgIncreaseTempBonus"] * 100
			);
			
			context.CONFIG.INCREASES[damageType + "DamageIncreasePercentage"] = context[damageType + "DamageIncreasePercentage"];
			context.CONFIG.INCREASES[damageType + "DamageIncreaseBonusPercentage"] = context[damageType + "DamageIncreaseBonusPercentage"];
		}

		for (const [_, damageType] of Object.entries(CONFIG.SS1E.damageTypes)) {
			context[damageType + "DamageResistancePercentage"] = Math.round(
				context.system[damageType + "DmgResistanceTotal"] * 100
			);
			
			context[damageType + "DamageResistanceBonusPercentage"] = Math.round(
				context.system[damageType + "DmgResistanceTempBonus"] * 100
			);
			
			context.CONFIG.INCREASES[damageType + "DamageResistancePercentage"] = context[damageType + "DamageResistancePercentage"];
			context.CONFIG.INCREASES[damageType + "DamageResistanceBonusPercentage"] = context[damageType + "DamageResistanceBonusPercentage"];
		}
		
		context.constellations = game.actors.filter(
			(actor) => actor.type === 'constellation'
		);
		return context;
	}
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
		html.find('.edit-mode-toggle').click((ev) => {
			this.isEditing = !this.isEditing;
			this.render(); // Re-render the sheet with updated edit mode
		});

		html.find('.drop-zone').on('drop', Inventory.onDropItem.bind(this));
		// Handle skill drop
		html.find('.skill-container.drop-zone').on(
			'drop',
			SkillInventory.onDropSkill.bind(this)
		);
		//handle skill dialog
		html.find('button[data-action="skill-view"]').click((event) => {
			const itemId = $(event.currentTarget).data('item-id');
			SkillInventory.openSkillDialog(event, itemId, this.actor);
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
		//gmboard system messaging
		html.on(
			'click',
			'button[data-action="sendStarstreamGmboard"]',
			async (ev) => {
				const message = html.find('#starstreamMessage').val();
				const recipientId = html
					.find('#starstreamMessageRecipient')
					.val();
				await Gmboard.onSendCustomStarstreamMessage(
					ev,
					recipientId,
					message
				);
				const delayTime = Math.random() * 400; // Random delay time to prevent spamming
				await new Promise((resolve) => setTimeout(resolve, delayTime)); // Wait for x seconds between messages
			}
		);
		//gmboard messaging, checkboxing and stuff,
		html.on(
			'click',
			'button[data-action="sendPresetGmboard"]',
			async (ev) => {
				const message = ev.currentTarget.dataset.message;
				const cost = Number(ev.currentTarget.dataset.cost);
				const selectedCheckboxes = html.find(
					'.message-speaker-checkbox:checked'
				);
				const selectedConstellations = selectedCheckboxes
					.map((i, checkbox) => checkbox.value)
					.get();
				const recipientId = html.find('#gmboardMessageRecipient').val();

				for (const constellationId of selectedConstellations) {
					const constellation = game.actors.get(constellationId);
					if (constellation) {
						await Gmboard.onSendPresetGmboardMessage.call(
							{ actor: constellation },
							ev,
							message,
							cost,
							recipientId
						);
						const delayTime = Math.random() * 400; // Random delay time to prevent spamming
						await new Promise((resolve) =>
							setTimeout(resolve, delayTime)
						); // Wait for x seconds between messages
					}
				}
			}
		);

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
		// Add event listener for stat labels
		html.on('click', 'label[data-action="rollStat"]', (ev) => {
			const key = ev.currentTarget.dataset.key;
			RpRollService.onRollRP(ev, this.actor, key);
		});

		// Add event listener to spans with data-action="edit-temp-stat"
		html.on('click', '[data-action="edit-temp-stat"]', (event) => {
			const statId = event.currentTarget.id;
			const currentValue = parseInt(
				event.currentTarget.textContent.match(/\d+/)[0]
			);
			TempBonus.openEditTempStatDialog(
				this.actor.id,
				statId,
				currentValue
			);
		});

		html.find('button[data-action="attributeLevelUp"]').click(
			Stat.onStatLevelUp.bind(this)
		);
		html.find('button[data-action="openCurrencyPanel"]').click(
			Coin.openCurrencyPanel.bind(this)
		);
		html.find('button[data-action="purchase-slots"]').click(
			Inventory.openPurchaseSlots.bind(this)
		);

		html.find('button[data-action="plus-ap"]').click(() =>
			ActionPoints.addActionPoints(this.actor)
		);
		html.find('button[data-action="minus-ap"]').click(() =>
			ActionPoints.minusActionPoints(this.actor)
		);
		html.find('button[data-action="reset-ap"]').click(() =>
			ActionPoints.resetActionPoints(this.actor)
		);

		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find('li.item').each((i, li) => {
				if (li.classList.contains('inventory-header')) return;
				li.setAttribute('draggable', true);
				li.addEventListener('dragstart', handler, false);
			});
		}
		//Roll acc button
		html.find('#roll-accuracy').click((event) => {
			const mode = 'normal';
			WeaponRoll.onRollAccuracy(this.actor, mode);
		});
		// Roll weapon accuracy button
		// Event listener for rolling weapon accuracy
		html.find('button[data-action="rollWeaponAccuracy"]').click((event) => {
			const itemId = $(event.currentTarget).data('item-id');
			const mode = 'normal';
			WeaponRoll.onRollWeaponAccuracy(this.actor, itemId, mode);
		});
		// Roll Melee weapon damage button
		html.find('button[data-action="rollWeaponDamage"]').click((event) => {
			const itemId = $(event.currentTarget).data('item-id');
			const mode = 'normal';
			WeaponRoll.onRollMeleeWeapon(this.actor, itemId, mode);
		});
		// Roll Ranged weapon damage button
		html.find('#roll-ranged-weapon').click((event) => {
			const weaponId = $(event.currentTarget).data('weapon-id');
			const ammoId = $(event.currentTarget).data('ammo-id');
			const mode = 'normal';
			WeaponRoll.onRollRangedWeapon(this.actor, weaponId, ammoId, mode);
		});
		// Roll Unmarmed damage button
		html.find('#roll-unarmed-damage').click((event) => {
			const mode = 'normal';
			WeaponRoll.onRollUnarmedDamage(this.actor, mode);
		});
		// Roll skill accuracy button
		html.find('button[data-action="roll-skill-accuracy"]').click(
			(event) => {
				const mode = 'normal';
				const itemId = $(event.currentTarget).data('item-id');
				SkillRoll.onRollSkillAccuracy(this.actor, itemId, mode);
			}
		);

		// Roll skill damage button
		html.find('button[data-action="roll-skill-damage"]').click((event) => {
			const itemId = $(event.currentTarget).data('item-id');
			SkillRoll.onRollSkillDamage(this.actor, itemId, 'normal');
		});
		html.find('button[data-action="use-skill"]').click((event) => {
			SkillRoll.onSkillUse(event, this.actor);
		});
		// Send Skill to chat
		html.find('button[data-action="send-skill-to-chat"]').click((event) => {
			SkillRoll.onSendSkillToChat(event, this.actor);
		});
		// Send Preset Message
		html.find('button[data-action="sendPreset"]').click(
			Constellation.onSendPresetMessage.bind(this)
		);
		// Send Custom Message
		html.find('button[data-action="sendCustom"]').click(
			Constellation.onSendCustomMessage.bind(this)
		);

		// Handle sending coins to another character
		html.find('button[data-action="sendCoins"]').click(
			Coin.onSendCoins.bind(this)
		);
		// Event listener for HP bar click
		html.find('[data-action="hp-bar"]').click(() =>
			this._openHealthDialog()
		);
		// Event listener for MAana bar click
		html.find('[data-action="mana-bar"]').click(() =>
			this._openManaDialog()
		);

		// Event listener for the scenario button
		html.find('#scenario-submit').on('click', (event) => {
			const recipientId = html.find('#gmboardScenarioRecipient').val();
			Scenario.onScenarioSubmit(event, recipientId);
		});

		html.find('[data-action="item-view"]').click((event) => {
			const itemId = $(event.currentTarget).data('item-id');
			Inventory.openItemDialog(event, itemId, this.actor);
		});

		document
			.querySelectorAll('#roll-skill-accuracy')
			.forEach((skillBox) => {
				new ContextMenu(
					skillBox,
					'#roll-skill-accuracy',
					[
						{
							name: 'Roll Accuracy with Advantage',
							icon: '<i class="fas fa-dice-d20"></i>',
							callback: (arg0) => {
								const skillId = arg0.data('item-id');
								const actor = this.actor;
								const mode = 'advantage';
								SkillRoll.onRollSkillAccuracy(
									actor,
									skillId,
									mode
								);
							},
						},
						{
							name: 'Roll Accuracy with Disadvantage',
							icon: '<i class="fas fa-dice-d20"></i>',
							callback: (arg0) => {
								const skillId = arg0.data('item-id');
								const actor = this.actor;
								const mode = 'disadvantage';
								SkillRoll.onRollSkillAccuracy(
									actor,
									skillId,
									mode
								);
							},
						},
					],
					{
						fixed: true,
					}
				);
			});
		document.querySelectorAll('#roll-skill-damage').forEach((skillBox) => {
			new ContextMenu(
				skillBox,
				'#roll-skill-damage',
				[
					{
						name: 'Roll Critical Damage',
						icon: '<i class="fas fa-dice-d20"></i>',
						callback: (arg0) => {
							const skillId = arg0.data('item-id');
							const actor = this.actor;
							const mode = 'crit';
							SkillRoll.onRollSkillDamage(actor, skillId, mode);
						},
					},
					{
						name: 'Roll Mega Crit',
						icon: '<i class="fas fa-dice-d20"></i>',
						callback: (arg0) => {
							const skillId = arg0.data('item-id');
							const actor = this.actor;
							const mode = 'megaCrit';
							SkillRoll.onRollSkillDamage(actor, skillId, mode);
						},
					},
				],
				{
					fixed: true,
				}
			);
		});
		document
			.querySelectorAll('#roll-weapon-accuracy')
			.forEach((skillBox) => {
				new ContextMenu(
					skillBox,
					'#roll-weapon-accuracy',
					[
						{
							name: 'Roll Accuracy with Advantage',
							icon: '<i class="fas fa-dice-d20"></i>',
							callback: (arg0) => {
								const skillId = arg0.data('item-id');
								const actor = this.actor;
								const mode = 'advantage';
								WeaponRoll.onRollWeaponAccuracy(
									actor,
									skillId,
									mode
								);
							},
						},
						{
							name: 'Roll Accuracy with Disadvantage',
							icon: '<i class="fas fa-dice-d20"></i>',
							callback: (arg0) => {
								const skillId = arg0.data('item-id');
								const actor = this.actor;
								const mode = 'disadvantage';
								WeaponRoll.onRollWeaponAccuracy(
									actor,
									skillId,
									mode
								);
							},
						},
					],
					{
						fixed: true,
					}
				);
			});
		document.querySelectorAll('#roll-melee-weapon').forEach((skillBox) => {
			new ContextMenu(
				skillBox,
				'#roll-melee-weapon',
				[
					{
						name: 'Roll Critical Damage',
						icon: '<i class="fas fa-dice-d20"></i>',
						callback: (arg0) => {
							const itemId = arg0.data('item-id');
							const actor = this.actor;
							const mode = 'crit';
							WeaponRoll.onRollMeleeWeapon(actor, itemId, mode);
						},
					},
					{
						name: 'Roll Mega Crit',
						icon: '<i class="fas fa-dice-d20"></i>',
						callback: (arg0) => {
							const itemId = arg0.data('item-id');
							const actor = this.actor;
							const mode = 'megaCrit';
							WeaponRoll.onRollMeleeWeapon(actor, itemId, mode);
						},
					},
				],
				{
					fixed: true,
				}
			);
		});
		document.querySelectorAll('#roll-ranged-weapon').forEach((skillBox) => {
			new ContextMenu(
				skillBox,
				'#roll-ranged-weapon',
				[
					{
						name: 'Roll Critical Damage',
						icon: '<i class="fas fa-dice-d20"></i>',
						callback: (arg0) => {
							const weaponId = arg0.data('weapon-id');
							const ammoId = arg0.data('ammo-id');
							const actor = this.actor;
							const mode = 'crit';
							WeaponRoll.onRollRangedWeapon(
								actor,
								weaponId,
								ammoId,
								mode
							); // Pass both IDs to the function
						},
					},
					{
						name: 'Roll Mega Crit',
						icon: '<i class="fas fa-dice-d20"></i>',
						callback: (arg0) => {
							const weaponId = arg0.data('weapon-id');
							const ammoId = arg0.data('ammo-id');
							const actor = this.actor;
							const mode = 'megaCrit';
							WeaponRoll.onRollRangedWeapon(
								actor,
								weaponId,
								ammoId,
								mode
							);
						},
					},
				],
				{
					fixed: true,
				}
			);
		});
		new ContextMenu(
			document.querySelector('#roll-unarmed-damage'),
			'#roll-unarmed-damage',
			[
				{
					name: 'Roll Critical Damage',
					icon: '<i class="fas fa-dice-d20"></i>',
					callback: (arg0) => {
						const actor = this.actor;
						const mode = 'crit';
						WeaponRoll.onRollUnarmedDamage(actor, mode);
					},
				},
				{
					name: 'Roll Mega Crit',
					icon: '<i class="fas fa-dice-d20"></i>',
					callback: (arg0) => {
						const actor = this.actor;
						const mode = 'megaCrit';
						WeaponRoll.onRollUnarmedDamage(actor, mode);
					},
				},
			],
			{
				fixed: true,
			}
		);
		new ContextMenu(
			document.querySelector('#roll-accuracy'),
			'#roll-accuracy',
			[
				{
					name: 'Roll Accuracy with Advantage',
					icon: '<i class="fas fa-dice-d20"></i>',
					callback: (arg0) => {
						const actor = this.actor;
						const mode = 'advantage';
						WeaponRoll.onRollAccuracy(actor, mode);
					},
				},
				{
					name: 'Roll Accuracy with Disadvantage',
					icon: '<i class="fas fa-dice-d20"></i>',
					callback: (arg0) => {
						const actor = this.actor;
						const mode = 'disadvantage';
						WeaponRoll.onRollAccuracy(actor, mode);
					},
				},
			],
			{
				fixed: true,
			}
		);
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

	_openHealthDialog() {
		// Retrieve current health values
		const currentHealth = this.actor.system.healthCurrent;
		const maxHealth = this.actor.system.healthMaxTotal;
		const healthMaxTempBonus = this.actor.system.healthMaxTempBonus;

		// Create dialog
		new Dialog({
			title: 'Edit Health',
			content: `
				<form>
					<div class= "form-group-column" style="display: flex; flex-direction: column;">
						<div class= "form-group-row" style="display: flex; flex-direction: row; justify-content: space-between;">
							<div class= "form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;margin-bottom:4px;">
								<label>Current&nbsp;Health</label>
								<input type="number" name="health" value="${currentHealth}" min="0" max="${maxHealth}" style="width:60px;">
							</div>
							<div class= "form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;">
								<label>Bonus&nbsp;Health</label>
								<input type="number" name="healthBonus" value="${healthMaxTempBonus}" min="0" style="width:60px;">
							</div>
						</div>
						<div class= "form-group-row" style="display: flex; flex-direction: row; justify-content: space-between;margin-top:4px;">
							<div class= "form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;">
								<label style="color:#df5555 !important;">Damage&nbsp;Taken</label>
								<input type="number" name="damage" value="0" min="0" max="${maxHealth}" style="width:60px;">
							</div>
							<div class= "form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;">
								<label style="color:#70f9ba !important">Healing&nbsp;Received</label>
								<input type="number" name="healing" value="0" min="0" max="${maxHealth}" style="width:60px;">
							</div>
						</div>			
					</div>
				</form>
			`,
			buttons: {
				save: {
					label: 'Apply',
					callback: (html) => {
						let newHealth =
							parseInt(html.find('input[name="health"]').val()) ||
							0;
						let newHealthBonus =
							parseInt(
								html.find('input[name="healthBonus"]').val()
							) || 0;
						let damageTaken =
							parseInt(html.find('input[name="damage"]').val()) ||
							0;
						let healingReceived =
							parseInt(
								html.find('input[name="healing"]').val()
							) || 0;

						if (damageTaken > 0) {
							if (newHealthBonus > damageTaken) {
								newHealthBonus -= damageTaken;
								damageTaken = 0;
							} else {
								damageTaken -= newHealthBonus;
								newHealthBonus = 0;
							}

							newHealth = Math.max(newHealth - damageTaken, 0);
						}

						if (healingReceived > 0) {
							newHealth = Math.min(
								newHealth + healingReceived,
								maxHealth
							);
						}

						this.actor.update({
							'system.healthCurrent': newHealth,
							'system.healthMaxTempBonus': newHealthBonus,
						});
					},
				},
				cancel: {
					label: 'Cancel',
				},
			},
			default: 'save',
		}).render(true, { width: 400, height: 200 });
	}
	_openManaDialog() {
		// Retrieve current health values
		const currentMana = this.actor.system.manaCurrent;
		const maxMana = this.actor.system.manaMaxTotal;
		const manaMaxTempBonus = this.actor.system.manaMaxTempBonus;

		// Create dialog
		new Dialog({
			title: 'Edit Mana',
			content: `
        <form>
            <div class="form-group-column" style="display: flex; flex-direction: column;">
                <div class="form-group-row" style="display: flex; flex-direction: row; justify-content: space-between;">
                    <div class="form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;margin-bottom:4px;">
                        <label>Current&nbsp;Mana</label>
                        <input type="number" name="mana" value="${currentMana}" min="0" max="${maxMana}" style="width:60px;">
                    </div>
                    <div class="form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;">
                        <label>Bonus&nbsp;Mana</label>
                        <input type="number" name="manaBonus" value="${manaMaxTempBonus}" min="0" style="width:60px;">
                    </div>
                </div>
                <div class="form-group-row" style="display: flex; flex-direction: row; justify-content: space-between;margin-top:4px;">
                    <div class="form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;">
                        <label>Mana&nbsp;Used</label>
                        <input type="number" name="manaCost" value="0" min="0" max="${maxMana}" style="width:60px;">
                    </div>
                    <div class="form-group-row" style="display: flex; flex-direction: row; justify-content: space-evenly; flex:1;">
                        <label>Mana&nbsp;Gained</label>
                        <input type="number" name="manaRegen" value="0" min="0" max="${maxMana}" style="width:60px;">
                    </div>
                </div>
            </div>
        </form>
    `,
			buttons: {
				save: {
					label: 'Apply',
					callback: (html) => {
						let newMana =
							parseInt(html.find('input[name="mana"]').val()) ||
							0;
						let newManaBonus =
							parseInt(
								html.find('input[name="manaBonus"]').val()
							) || 0;
						let manaCost =
							parseInt(
								html.find('input[name="manaCost"]').val()
							) || 0;
						let manaRegen =
							parseInt(
								html.find('input[name="manaRegen"]').val()
							) || 0;

						if (manaCost > 0) {
							if (manaCost <= newManaBonus) {
								newManaBonus -= manaCost;
							} else {
								manaCost -= newManaBonus;
								newManaBonus = 0;
								newMana = Math.max(newMana - manaCost, 0);
							}
						}
						newMana = Math.min(newMana + manaRegen, maxMana);
						this.actor.update({
							'system.manaCurrent': newMana,
							'system.manaMaxTempBonus': newManaBonus,
						});
					},
				},
				cancel: {
					label: 'Cancel',
				},
			},
			default: 'save',
		}).render(true, { width: 400, height: 200 });
	}
}
