// export function to update actor mana, input is actor and itemID
export function spendManaCost(actor, manaCost) {
	const updateData = {
		[`system.manaCurrent`]: actor.system.manaCurrent - manaCost,
	};
	actor.update(updateData).then(() => actor.sheet.render(true)); // Apply the update and render the item sheet
}
