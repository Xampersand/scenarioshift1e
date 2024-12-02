export async function onDropItem(event) {
  event.preventDefault();
  event.stopPropagation();

  if (!$(event.target).hasClass('drop-zone')) return;

  const data = JSON.parse(
    event.originalEvent.dataTransfer.getData('text/plain')
  );
  const item = await Item.implementation.fromDropData(data);
  // Prevent items of type 'skill' from being dropped in the inventory
  if (item.type === 'skill') {
    return ui.notifications.error('Skills cannot be dropped in the inventory.');
  }

  const itemSlots = this.actor.system.itemSlots;
  const items = this.actor.items.filter((i) => i.type !== 'skill'); //exclude skills

  if (items.size >= itemSlots) {
    return ui.notifications.error('Not enough item slots!');
  }

  await this.actor.createEmbeddedDocuments('Item', [item.toObject()]);
  this._tabs[0].activate('inventory');
}

export function openItemDialog(event, itemId, actor) {
  event.preventDefault();

  const dialogOptions = {
    width: 300,
    height: 150,
  };

  const item = actor.items.get(itemId);
  if (!item) {
    console.error('Item not found with specified ID.');
    return;
  }

  const equippables = [
    'meleeWeapon',
    'rangedWeapon',
    'equipment',
    'ammo',
    'accessory',
  ];
  const consumables = ['item', 'consumable'];

  // onEquip and onUnequip need to be defined here, or else they wont work as async functions(dont ask me why)
  if (equippables.includes(item.type)) {
    item.onEquip = async function () {
      console.log('You have equipped this item!');
      // Toggle on active effects
      for (let effect of this.effects) {
        await effect.update({ disabled: false });
      }
    };

    item.onUnequip = async function () {
      console.log('You have unequipped this item!');
      // Toggle off active effects
      for (let effect of this.effects) {
        await effect.update({ disabled: true });
      }
    };
  }

  new Dialog(
    {
      title: '-------------ITEM PANEL-------------',
      buttons: {
        equip: {
          label: equippables.includes(item.type)
            ? item.system.equipped
              ? 'UNEQUIP'
              : 'EQUIP'
            : 'USE',
          callback: async () => {
            const requirement = item.system.requirement;
            const statTotal = actor.system[`${requirement.type}Total`];
            if (statTotal >= requirement.value) {
              if (equippables.includes(item.type)) {
                if (item.system.equipped) {
                  await item.onUnequip();
                } else {
                  await item.onEquip();
                }
                item.system.equipped = !item.system.equipped;
                await item.update({ 'system.equipped': item.system.equipped });
              } else if (item.system.consumableType === 'health') {
                actor.system.healthCurrent += item.system.consumableValue;
                await actor.sheet.render(true);
              } else if (item.system.consumableType === 'mana') {
                actor.system.manaCurrent += item.system.consumableValue;
                await actor.sheet.render(true);
              } else {
                console.log('Item used!');
              }
            } else {
              ui.notifications.error(
                'You do not meet the requirements to equip this item!'
              );
            }
          },
        },
        inspect: {
          label: 'INSPECT',
          callback: () => {
            item.sheet.render(true);
          },
        },
        delete: {
          label: 'DELETE',
          callback: () => {
            new Dialog(
              {
                title: 'DELETE ITEM',
                content: `<p>Are you sure you want to delete '${item.name}'?</p>`,
                buttons: {
                  yes: {
                    label: 'YES',
                    callback: async () => {
                      await item.delete();
                      ui.notifications.info(`${item.name} has been deleted.`);
                    },
                  },
                  no: {
                    label: 'NO',
                  },
                },
                default: 'no',
              },
              dialogOptions
            ).render(true);
          },
        },
        cancel: {
          label: 'CANCEL',
          callback: () => {},
        },
      },
      default: 'cancel',
    },
    dialogOptions
  ).render(true);
}

export function openPurchaseSlots(event) {
  event.preventDefault();

  const dialogOptions = {
    width: 300,
    height: 150,
  };

  const data = this.actor.system;
  const cost = 100 * Math.pow(3, data.itemSlots / 5);

  new Dialog(
    {
      title: 'Expand Inventory!',
      content: `
			  <p>${data.itemSlots} slots → ${data.itemSlots + 5} slots</p>
			  <p>Cost: ${cost} Coins</p>
			`,
      buttons: {
        yes: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Yes',
          callback: () => {
            if (data.coins >= cost) {
              const updatedCoins = data.coins - cost;
              const newSlots = data.itemSlots + 5;

              // Prepare the data object for updating
              let updateData = {
                [`system.coins`]: updatedCoins,
                [`system.itemSlots`]: newSlots,
              };

              // Apply updates to actor
              this.actor.update(updateData).then(() => this.render()); // Re-render the sheet
            } else {
              ui.notifications.error('Not enough coins to expand inventory!');
            }
          },
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: 'No',
          callback: () => console.log('Expand inventory canceled'),
        },
      },
      default: 'no',
      close: () => console.log('Expand inventory closed without choosing.'),
    },
    dialogOptions
  ).render(true);
}
