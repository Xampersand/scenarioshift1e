export async function onDropSkill(event) {
  event.preventDefault();
  event.stopPropagation();

  if (!$(event.target).hasClass('drop-zone')) return;

  const data = JSON.parse(
    event.originalEvent.dataTransfer.getData('text/plain')
  );
  const item = await Item.implementation.fromDropData(data);

  // Only allow items of type 'skill' to be dropped in the skill inventory
  if (item.type !== 'skill') {
    return ui.notifications.error(
      'Only skills can be dropped in the skill inventory.'
    );
  }

  await this.actor.createEmbeddedDocuments('Item', [item.toObject()]);
  this._tabs[0].activate('skills');
}

export function openSkillDialog(event, itemId, actor) {
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

  new Dialog(
    {
      title: '-------------SKILL PANEL-------------',
      buttons: {
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
                title: 'DELETE SKILL',
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
