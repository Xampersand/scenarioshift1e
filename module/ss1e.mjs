// Import document classes.
import { SS1EActor } from './documents/actor.mjs';
import { SS1EItem } from './documents/item.mjs';
// Import sheet classes.
import { SS1EActorSheet } from './sheets/actor-sheet.mjs';
import { SS1EItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { SS1E } from './helpers/config.mjs';

import * as models from './data/_module.mjs';

// import CharacterData from './data/character.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
	// Add utility classes to the global game object so that they're more easily
	// accessible in global contexts.
	game.ss1e = {
		SS1EActor,
		SS1EItem,
		rollItemMacro,
	};

	// Add custom constants for configuration.
	CONFIG.SS1E = SS1E;

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
		formula: 'round((1d100 + @initiativeTotal)*@initiativeMulti)',
		decimals: 2,
	};

	console.log('bye template.json, hello data models');

	// Define custom Document classes
	CONFIG.Actor.documentClass = SS1EActor;
	CONFIG.Actor.dataModels = {
		character: models.SS1ECharacter,
		constellation: models.SS1EConstellation,
		npc: models.SS1ENPC,
		gmboard: models.SS1EConstellation,
	};
	CONFIG.Item.documentClass = SS1EItem;
	CONFIG.Item.dataModels = {
		item: models.SS1EItem,
		consumable: models.SS1EConsumable,
		meleeWeapon: models.SS1EMeleeWeapon,
		rangedWeapon: models.SS1ERangedWeapon,
		ammo: models.SS1EAmmo,
		equipment: models.SS1EEquipment,
		skill: models.SS1ESkill,
	};

	// Active Effects are never copied to the Actor,
	// but will still apply to the Actor from within the Item
	// if the transfer property on the Active Effect is true.
	CONFIG.ActiveEffect.legacyTransferral = false;

	// Register sheet application classes
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('ss1e', SS1EActorSheet, {
		makeDefault: true,
		label: 'SS1E.SheetLabels.Actor',
	});
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('ss1e', SS1EItemSheet, {
		makeDefault: true,
		label: 'SS1E.SheetLabels.Item',
	});

	// Preload Handlebars templates.
	return preloadHandlebarsTemplates();
});

Hooks.on('manageCurrency', function () {
	console.log('clicked currency');
});

Hooks.on('renderCompendium', async (compendium) => {
	if (compendium.collection === 'your-compendium-name') {
		let inventory = getYourInventoryItems(); // Retrieve your inventory items
		await syncInventoryImages(inventory);
	}
});
Hooks.on('updateCombat', async (combat, updateData, options, userId) => {
	if (updateData.round && updateData.round !== combat.previous.round) {
		for (const combatant of combat.combatants) {
			const actor = combatant.actor;

			if (!actor || updateData.round === 1) continue;

			// Update Action Points to max
			const maxAP = actor.system.actionPointsMax;
			await actor.update({ 'system.actionPointsCurrent': maxAP });

			// Update Mana
			const manaGainPerTurn =
				Math.round(
					actor.system.manaMaxTotal *
						(actor.system.baseManaRegen +
							actor.system.bonusManaRegen)
				) + actor.system.flatManaRegen;
			if (actor.system.manaCurrent < actor.system.manaMaxTotal) {
				let newMana = actor.system.manaCurrent + manaGainPerTurn;
				if (newMana > actor.system.manaMaxTotal) {
					newMana = actor.system.manaMaxTotal;
				}
				await actor.update({ 'system.manaCurrent': newMana });
			}

			// Update Health
			const healthGainPerTurn =
				Math.round(
					actor.system.healthMaxTotal *
						(actor.system.baseHealthRegen +
							actor.system.bonusHealthRegen)
				) + actor.system.flatHealthRegen;
			if (actor.system.healthCurrent < actor.system.healthMaxTotal) {
				let newHealth = actor.system.healthCurrent + healthGainPerTurn;
				if (newHealth > actor.system.healthMaxTotal) {
					newHealth = actor.system.healthMaxTotal;
				}
				await actor.update({ 'system.healthCurrent': newHealth });
			}
		}
	}
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('diff', (a, b) => a - b);
Handlebars.registerHelper('notEqual', (a, b) => a !== b);
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('repeat', function (times, opts) {
	var out = '';
	var i;
	var data = {};

	if (times) {
		for (i = 0; i < times; i += 1) {
			data.index = i;
			out += opts.fn(this, {
				data: data,
			});
		}
	} else {
		out = opts.inverse(this);
	}

	return out;
});

Handlebars.registerHelper('toLowerCase', function (str) {
	return str.toLowerCase();
});
Handlebars.registerHelper('filterNonSkillItems', function (items, options) {
	const filteredItems = items.filter((item) => item.type !== 'skill');
	return options.fn({ items: filteredItems });
}); //need this for inventory to filter out skills from normal inv

Handlebars.registerHelper("getDamageIncreasePercentage", function (context) {
	const key = this.short + "DamageIncreasePercentage";
	return context[key];
});
Handlebars.registerHelper("getDamageIncreaseBonusPercentage", function (context) {
	const key = this.short + "DamageIncreaseBonusPercentage";
	return context[key];
});
Handlebars.registerHelper("getDamageIncreasePercentageDamageType", function (context) {
	const key = this + "DamageIncreasePercentage";
	return context[key];
});
Handlebars.registerHelper("getDamageIncreaseBonusPercentageDamageType", function (context) {
	const key = this + "DamageIncreaseBonusPercentage";
	return context[key];
});
Handlebars.registerHelper("getDamageResistancePercentageDamageType", function (context) {
	const key = this + "DamageResistancePercentage";
	return context[key];
});
Handlebars.registerHelper("getDamageResistanceBonusPercentageDamageType", function (context) {
	const key = this + "DamageResistanceBonusPercentage";
	return context[key];
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once('socketlib.ready', () => {
	SS1E.socket = socketlib.registerSystem('ss1e');
	SS1E.socket.register('scenarioMessage', showScenarioMessage);
});
Hooks.on('renderChatMessage', (message, html, data) => {
	// Find all links with a data-uuid attribute in the message
	html.find('.content-link[data-uuid]').each(async (index, element) => {
		const uuid = element.getAttribute('data-uuid');

		try {
			const item = await fromUuid(uuid);

			if (!item || item.documentName !== 'Item') return;

			// Get the rarity from the item's system data
			const rating = item.system.rating || 'common'; // Fallback to 'common'

			// Add the data-rarity attribute to the link
			element.setAttribute('data-rating', rating);
		} catch (error) {
			console.error(`Failed to fetch item from UUID ${uuid}:`, error);
		}
	});
});

function showScenarioMessage(message) {
	const dialogOptions = {
		width: 400, // Adjust width as needed
		height: 600, // Adjust height as needed
		top: Math.floor(window.innerHeight / 2 - 300 + Math.random() * 450),
		left: Math.floor(window.innerWidth / 2 - 700 + Math.random() * 1050),
	};

	const dialogContent = `
        <div class="scenario-message">
            ${message.content}
        </div>
    `;

	const dialog = new Dialog(
		{
			title: '', // Optional title
			content: dialogContent,
			buttons: {},
			close: () => console.log('Dialog closed.'),
		},
		dialogOptions
	).render(true);

	// Optional: Automatically close the dialog after x seconds
	setTimeout(() => dialog.close(), 10000);
}
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once('socketlib.ready', () => {
	SS1E.socket = socketlib.registerSystem('ss1e');
	SS1E.socket.register('starstreamMessage', showStarstreamMessage);
});

function showStarstreamMessage(message) {
	const dialogOptions = {
		width: 300,
		height: 150,
		top: Math.floor(window.innerHeight / 2 - 300 + Math.random() * 450),
		left: Math.floor(window.innerWidth / 2 - 700 + Math.random() * 1050),
	};

	const dialogContent = `
        <div class="constellation-message">
            ${message.content}
        </div>
    `;

	const dialog = new Dialog(
		{
			title: '', // Optional title
			content: dialogContent,
			buttons: {},
			close: () => console.log('Dialog closed.'),
		},
		dialogOptions
	).render(true);

	// Optional: Automatically close the dialog after x seconds
	setTimeout(() => dialog.close(), 5000);
}

Hooks.once('socketlib.ready', () => {
	SS1E.socket = socketlib.registerSystem('ss1e');
	SS1E.socket.register('constellationMessage', showConstellationMessage);
});

function showConstellationMessage(message) {
	const dialogOptions = {
		width: 300,
		height: 150,
		top: Math.floor(window.innerHeight / 2 - 300 + Math.random() * 450),
		left: Math.floor(window.innerWidth / 2 - 700 + Math.random() * 1050),
	};

	const dialogContent = `
		<div class="constellation-message">
			THE CONSTELLATION '${message.constellation.toUpperCase()}' ${message.content.toUpperCase()}
		</div>
	`;

	const dialog = new Dialog(
		{
			content: dialogContent,
			buttons: {},
			close: () => console.log('Closed without choosing.'),
		},
		dialogOptions
	).render(true);

	setTimeout(() => dialog.close(), 5000);
}
Hooks.on('diceSoNiceMessageProcessed', async (messageId, interception) => {
	if (!interception.willTrigger3DRoll) return;

	const message = game.messages.get(messageId);
	if (!message) return;

	if (!message.isRoll || !message.rolls?.length) return;

	const sender = game.users.get(message.user.id);
	if (!sender) return;

	if (!game.user.isGM) return;

	const flavorText = message.flavor || '';
	if (!flavorText.toLowerCase().includes('damage')) return;

	const targets = Array.from(sender.targets);
	if (targets.length === 0) return;

	const rollResult = message.rolls[0].total;

	let gmMessage = `${sender.name} rolled an initial damage of: ${rollResult}`;

	let actor;
	if (sender.isGM) {
		const controlledTokens = canvas.tokens.controlled;
		actor = controlledTokens[0].actor;
	} else {
		actor = game.actors.get(sender.character?.id || sender.character);
	}

	const lastAttackRoll = actor.system.lastAttackRoll;
	const wasUnarmedRoll = lastAttackRoll === "Unarmed";

	let damageType = "";

	if (wasUnarmedRoll) {
		damageType = "physical";
	} else {
		const rolledItem = actor.items.get(lastAttackRoll);
		console.log(rolledItem);
		const rolledDamageType = rolledItem.system.damageType.toLowerCase();
		switch(rolledItem.type) {
			case 'meleeWeapon': {
				damageType = rolledDamageType;
				break;
			};
			case 'skill': {
				if (rolledItem.system.isAttackSkill === true) {
					const usedWeapon = actor.items.get(actor.system.attackSkillWeapon);
					const weaponDamageType = usedWeapon.system.damageType.toLowerCase();
					if (weaponDamageType === "physical") {
						damageType = weaponDamageType;
					} else {
						damageType = rolledDamageType;
					}
				} else {
					damageType = rolledDamageType;
				}
				break;
			}
		}
	}

	for (const target of targets) {
		let targetDamageTypeFlatResistance = target.actor.system[damageType + "FlatDmgResistanceTotal"];
		let targetDamageTypeResistance = target.actor.system[damageType + "DmgResistanceTotal"];

		const targetArmor = target.actor.system.armorTotal || 0;
		let finalArmor = Math.max(targetArmor * (1 - actor.system.shredTotal) - actor.system.penetrationTotal, 0);
		let armorReductionFactor = (finalArmor * 100) / (finalArmor + 100) / 100;
		
		let durabilityPercentage = target.actor.system.durability * 100 || 0;
		let durabilityFactor = 1 - target.actor.system.durability || 1;
		
		if (damageType === "true") {
			finalArmor = 0;
			armorReductionFactor = 0;
			targetDamageTypeFlatResistance = 0;
			targetDamageTypeResistance = 0;
			durabilityPercentage = 0;
			durabilityFactor = 0;
		} else if (damageType === "psychic") {
			finalArmor = 0;
			armorReductionFactor = 0;
		}
		
		// Damage Calculation Order: PERCENT RESISTANCE -> FLAT RESISTANCE -> ARMOR -> DURABILITY

		const damageAfterPercentageReduction = Math.max(0, rollResult * (1 - targetDamageTypeResistance));
		const damageAfterFlatReduction = Math.max(0, damageAfterPercentageReduction - targetDamageTypeFlatResistance);

		const finalDamage = Math.round((damageAfterFlatReduction - damageAfterFlatReduction * armorReductionFactor) * durabilityFactor);

		const resistances = {
			'Resistance': [targetDamageTypeResistance * 100, true],
			'Flat Resistance': [targetDamageTypeFlatResistance],
			'Armor': [finalArmor],
			'Durability': [durabilityPercentage, true]
		}

		gmMessage += `<br>Target: ${target.name} | <strong>Final damage: ${finalDamage} ${damageType}</strong> (`
		for (const [name, resistance] of Object.entries(resistances)) {
			if (resistance[0] <= 0) {
				continue;
			}
			gmMessage += `${name} ${resistance[0]}`
			if (resistance[1] === true) {
				gmMessage += `%`;
			}
			gmMessage += ` `;
		}
		gmMessage += `)`
	}

	await ChatMessage.create({
		content: gmMessage,
		whisper: [game.user.id],
	});
});
Hooks.on('diceSoNiceMessageProcessed', async (messageId, interception) => {
	if (!interception.willTrigger3DRoll) return;

	const message = game.messages.get(messageId);
	if (!message) return;

	if (!message.isRoll || !message.rolls?.length) return;

	const sender = game.users.get(message.user.id);
	if (!sender) return;

	if (!game.user.isGM) return;

	const flavorText = message.flavor || '';
	if (!flavorText.toLowerCase().includes('accuracy')) return;

	const targets = Array.from(sender.targets);
	if (targets.length === 0) return;

	const rollResult = message.rolls[0].total;
	const diceTerms = message.rolls[0].dice;

	if (!diceTerms || diceTerms.length === 0) return;

	let gmMessage = `${sender.name} rolled an initial accuracy of: <strong>${rollResult}<strong>`;

	for (const target of targets) {
		const targetActor = target.actor;
		if (!targetActor || !targetActor.system) continue;

		const targetEvasion = targetActor.system.evasionTotal || 0;
		const finalHitDice = rollResult - targetEvasion;
		let megaMiss = false;
		let megaCrit = false;

		let actor;
		if (sender.isGM) {
			const controlledTokens = canvas.tokens.controlled;
			actor = controlledTokens[0].actor;
		} else {
			actor = game.actors.get(sender.character?.id || sender.character);
		}

		const megacritBreakpoint = actor.system.megacritBreakpoint;

		for (const diceTerm of diceTerms) {
			const diceResults = diceTerm.results;
			for (const dieResult of diceResults) {
				if (dieResult.result === 1) megaMiss = true;
				if (dieResult.result >= megacritBreakpoint) megaCrit = true;
			}
		}

		if (megaMiss) {
			gmMessage += `<br>${sender.name}&nbsp;<strong><span style='color:#742100 !important'>&nbsp;MEGA&nbsp;MISSED&nbsp;</span></strong>&nbsp;<strong>${target.name}</strong>&nbsp;|&nbsp;${targetEvasion}&nbsp;evasion`;
		} else if (megaCrit) {
			gmMessage += `<br>${sender.name}&nbsp;<strong><span style='color:green !important'>&nbsp;MEGA&nbsp;CRIT&nbsp;</span></strong>&nbsp;<strong>${target.name}</strong>&nbsp;|&nbsp;${targetEvasion}&nbsp;evasion`;
		} else {
			const hit = finalHitDice >= 20;
			const miss = finalHitDice <= 19;
			const crit = finalHitDice >= 95;
			if (crit) {
				gmMessage += `<br>${sender.name} <strong>crit</strong>&nbsp;${target.name}&nbsp;|&nbsp;${rollResult}&nbsp;Acc&nbsp;-&nbsp;${targetEvasion}&nbsp;ev&nbsp;=&nbsp;${finalHitDice}&nbsp;(crit)`;
			} else if (miss) {
				gmMessage += `<br>${sender.name} <strong>missed</strong>&nbsp;${target.name}&nbsp;|&nbsp;${rollResult}&nbsp;Acc&nbsp;-&nbsp;${targetEvasion}&nbsp;ev&nbsp;=&nbsp;${finalHitDice}&nbsp;(miss)`;
			} else if (hit) {
				gmMessage += `<br>${sender.name} <strong>hit</strong>&nbsp;${target.name}&nbsp;|&nbsp;${rollResult}&nbsp;Acc&nbsp;-&nbsp;${targetEvasion}&nbsp;ev&nbsp;=&nbsp;${finalHitDice}&nbsp;(hit)`;
			}
		}
	}

	// Send the message to the GM
	await ChatMessage.create({
		content: gmMessage,
		whisper: [game.user.id],
	});
});
Hooks.once('ready', function () {
	// Wait to register hotbar drop hook on ready so that modules csould register earlier if they want to
	Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));

	Hooks.on("renderRollTableConfig", (app, html, data) => {
		// Loop through each element with the "details" class
		$(html).find(".details").each((_, element) => {
			const text = $(element).text().split("(")
			if (text.length > 1) { // Make sure the split worked (i.e., there is text after the '(')
				const itemId = text[1].slice(0, -1);  // Remove the closing parenthesis
				const item = game.items.get(itemId);
				if (item) {
					$(element).attr("data-rating", item.system.rating);
					$(element).text(text[0].slice(0, -1));
				}
			}
		});
	});

});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
	// First, determine if this is a valid owned item.
	if (data.type !== 'Item') return;
	if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
		return ui.notifications.warn(
			'You can only create macro buttons for owned Items'
		);
	}
	// If it is, retrieve it based on the uuid.
	const item = await Item.fromDropData(data);

	// Create the macro command using the uuid.
	const command = `game.ss1e.rollItemMacro("${data.uuid}");`;
	let macro = game.macros.find(
		(m) => m.name === item.name && m.command === command
	);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: 'script',
			img: item.img,
			command: command,
			flags: { 'ss1e.itemMacro': true },
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
	// Reconstruct the drop data so that we can load the item.
	const dropData = {
		type: 'Item',
		uuid: itemUuid,
	};
	// Load the item from the uuid.
	Item.fromDropData(dropData).then((item) => {
		// Determine if the item loaded and if it's an owned item.
		if (!item || !item.parent) {
			const itemName = item?.name ?? itemUuid;
			return ui.notifications.warn(
				`Could not find item ${itemName}. You may need to delete and recreate this macro.`
			);
		}

		// Trigger the item roll
		item.roll();
	});
}

async function syncInventoryImages(inventory) {
	for (let item of inventory) {
		let compendium = game.packs.get(item.compendium); // Get the compendium
		let originalItem = await compendium.getDocument(item.id); // Get the original item
		if (originalItem && originalItem.img !== item.img) {
			item.img = originalItem.img; // Update inventory item image
			// Trigger a UI update for the inventory, if necessary
		}
	}
}
