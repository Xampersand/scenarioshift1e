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

    const hpValue = context.system.resources.health.value;
    const hpMax = context.system.resources.health.max;
    const hpBarWidth = (hpValue / hpMax) * 100;

    const manaValue = context.system.resources.mana.value;
    const manaMax = context.system.resources.mana.max;
    const manaBarWidth = (manaValue / manaMax) * 100;

    // Assign this width to the template data
    context.hpBarWidth = hpBarWidth;
    context.manaBarWidth = manaBarWidth;

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
    // Toggle edit mode when the button is clicked
    html.find('.edit-mode-toggle').click((ev) => {
      this.isEditing = !this.isEditing;
      this.render(); // Re-render the sheet with updated edit mode
    });

    html.find('.drop-zone').on('drop', Inventory.onDropItem.bind(this));
    // Handle skill drop
    html
      .find('.skill-container.drop-zone')
      .on('drop', SkillInventory.onDropSkill.bind(this));
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

    //gmboard messaging, checkboxing and stuff,
    html.on('click', 'button[data-action="sendPresetGmboard"]', async (ev) => {
      const message = ev.currentTarget.dataset.message;
      const cost = Number(ev.currentTarget.dataset.cost);
      const selectedCheckboxes = html.find('.message-speaker-checkbox:checked');
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
          await new Promise((resolve) => setTimeout(resolve, delayTime)); // Wait for x seconds between messages
        }
      }
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
    // Add event listener for stat labels
    html.on('click', 'label[data-action="rollStat"]', (ev) => {
      const key = ev.currentTarget.dataset.key;
      RpRollService.onRollRP(ev, this.actor, key);
    });

    html
      .find('button[data-action="attributeLevelUp"]')
      .click(Stat.onStatLevelUp.bind(this));
    html
      .find('button[data-action="openCurrencyPanel"]')
      .click(Coin.openCurrencyPanel.bind(this));
    html
      .find('button[data-action="purchase-slots"]')
      .click(Inventory.openPurchaseSlots.bind(this));

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
    html
      .find('#roll-accuracy')
      .click((event) => WeaponRoll.onRollAccuracy(event, this.actor));
    // Roll weapon accuracy button
    // Event listener for rolling weapon accuracy
    html
      .find('button[data-action="rollWeaponAccuracy"]')
      .click((event) => WeaponRoll.onRollWeaponAccuracy(event, this.actor));
    // Roll Melee weapon damage button
    html.find('#roll-melee-weapon').click((event) => {
      WeaponRoll.onRollMeleeWeapon(event, this.actor);
    });
    // Roll Ranged weapon damage button
    html.find('#roll-ranged-weapon').click((event) => {
      WeaponRoll.onRollRangedWeapon(event, this.actor);
    });
    // Roll Unmarmed damage button
    html.find('#roll-unarmed-damage').click((event) => {
      WeaponRoll.onRollUnarmedDamage(event, this.actor);
    });
    // Roll skill accuracy button
    html.find('button[data-action="roll-skill-accuracy"]').click((event) => {
      SkillRoll.onRollSkillAccuracy(event, this.actor);
    });

    // Roll skill damage button
    html.find('button[data-action="roll-skill-damage"]').click((event) => {
      SkillRoll.onRollSkillDamage(event, this.actor);
    });
    // Send Skill to chat
    html.find('button[data-action="send-skill-to-chat"]').click((event) => {
      SkillRoll.onSendSkillToChat(event, this.actor);
    });
    // Send Preset Message
    html
      .find('button[data-action="sendPreset"]')
      .click(Constellation.onSendPresetMessage.bind(this));
    // Send Custom Message
    html
      .find('button[data-action="sendCustom"]')
      .click(Constellation.onSendCustomMessage.bind(this));

    // Handle sending coins to another character
    html
      .find('button[data-action="sendCoins"]')
      .click(Coin.onSendCoins.bind(this));
    // Event listener for HP bar click
    html.find('#hp-bar').click(() => this._openHealthDialog());
    // Event listener for MAana bar click
    html.find('#mana-bar').click(() => this._openManaDialog());

    html.find('#scenario-submit').on('click', (event) => {
      Scenario.onScenarioSubmit(event); // Call your submission handler
    });

    html.find('button[data-action="item-view"]').click((event) => {
      const itemId = $(event.currentTarget).data('item-id');
      Inventory.openItemDialog(event, itemId, this.actor);
    });
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
    const currentHealth = this.actor.system.resources.health.value;
    const maxHealth = this.actor.system.resources.health.max;

    // Create dialog
    new Dialog({
      title: 'Edit Health',
      content: `
				<form>
					<div class="form-group">
						<label>Current Health</label>
						<input type="number" name="health" value="${currentHealth}" min="0" max="${maxHealth}">
					</div>
				</form>
			`,
      buttons: {
        save: {
          label: 'Save',
          callback: (html) => {
            const newHealth = parseInt(html.find('input[name="health"]').val());

            // Ensure health is within the valid range
            if (!isNaN(newHealth) && newHealth >= 0 && newHealth <= maxHealth) {
              this.actor.update({ 'system.resources.health.value': newHealth });
            } else {
              ui.notifications.warn('Please enter a valid health value.');
            }
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
    const currentMana = this.actor.system.resources.mana.value;
    const maxMana = this.actor.system.resources.mana.max;

    // Create dialog
    new Dialog({
      title: 'Edit Mana',
      content: `
				<form>
					<div class="form-group">
						<label>Current Mana</label>
						<input type="number" name="mana" value="${currentMana}" min="0" max="${maxMana}">
					</div>
				</form>
			`,
      buttons: {
        save: {
          label: 'Save',
          callback: (html) => {
            const newMana = parseInt(html.find('input[name="mana"]').val());

            // Ensure health is within the valid range
            if (!isNaN(newMana) && newMana >= 0 && newMana <= maxMana) {
              this.actor.update({ 'system.resources.mana.value': newMana });
            } else {
              ui.notifications.warn('Please enter a valid mana value.');
            }
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
