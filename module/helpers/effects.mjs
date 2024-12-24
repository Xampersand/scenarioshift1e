/**
 * Manage Active Effect instances through an Actor or Item Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export function onManageActiveEffect(event, owner) {
	event.preventDefault();
	const a = event.currentTarget;
	const li = a.closest('li');
	const effect = li ? owner.effects.get(li.dataset.effectId) : null;

	switch (a.dataset.action) {
		case 'create':
			// Handle creating a new effect
			owner.createEmbeddedDocuments('ActiveEffect', [
				{
					name: 'New Effect',
					label: 'New Effect',
					icon: 'icons/svg/aura.svg',
					origin: owner.uuid,
					disabled: false,
					duration: { rounds: 1 },
					changes: [],
				},
			]);
			break;
		case 'edit':
			if (effect) effect.sheet.render(true);
			break;
		case 'delete':
			if (effect) effect.delete();
			break;
		case 'toggle':
			if (effect) effect.update({ disabled: !effect.disabled });
			break;
	}
}

/**
 * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
 * @param {ActiveEffect[]} effects    A collection or generator of Active Effect documents to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {
	// Define effect header categories
	const categories = {
		temporary: {
			type: 'temporary',
			label: game.i18n.localize('SS1E.Effect.Temporary'),
			effects: [],
		},
		passive: {
			type: 'passive',
			label: game.i18n.localize('SS1E.Effect.Passive'),
			effects: [],
		},
		inactive: {
			type: 'inactive',
			label: game.i18n.localize('SS1E.Effect.Inactive'),
			effects: [],
		},
	};

	// Iterate over effects, classifying them into categories
	for (let effect of effects) {
		if (effect.disabled) {
			categories.inactive.effects.push(effect);
		} else if (effect.isTemporary) {
			categories.temporary.effects.push(effect);
		} else {
			categories.passive.effects.push(effect);
		}
	}

	console.log('Prepared effect categories:', categories);
	return categories;
}
