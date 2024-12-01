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
    formula: '1d100 + @agiTotal / 2',
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

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('diff', (a, b) => a - b);
Handlebars.registerHelper('notEqual', (a, b) => a !== b);
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

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once('socketlib.ready', () => {
  SS1E.socket = socketlib.registerSystem('ss1e');
  SS1E.socket.register('scenarioMessage', showScenarioMessage);
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
  setTimeout(() => dialog.close(), 500);
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

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules csould register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
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
