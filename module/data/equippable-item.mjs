import SS1EItemBase from './item-base.mjs';
export default class SS1EEquippableItem extends SS1EItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.equipped = new fields.BooleanField({ required: true });
		// importing item effects from foundry breaks all the css (dont ask me why), so we're going to define it here
		schema.activeEffects = new fields.ArrayField(
			new fields.SchemaField({
				_id: new fields.StringField(),
				label: new fields.StringField(),
				icon: new fields.FilePathField({
					categories: ['IMAGE', 'VIDEO', 'AUDIO', 'MEDIA'],
				}),
				changes: new fields.ArrayField(
					new fields.SchemaField({
						key: new fields.StringField(),
						value: new fields.StringField(),
						mode: new fields.NumberField(),
						priority: new fields.NumberField(),
					})
				),
				disabled: new fields.BooleanField(),
				duration: new fields.SchemaField({
					startTime: new fields.NumberField(),
					seconds: new fields.NumberField(),
					combat: new fields.StringField(),
					rounds: new fields.NumberField(),
					turns: new fields.NumberField(),
					startRound: new fields.NumberField(),
					startTurn: new fields.NumberField(),
				}),
				description: new fields.HTMLField(),
				origin: new fields.StringField(),
				tint: new fields.ColorField(),
				transfer: new fields.BooleanField(),
				statuses: new fields.SetField(new fields.StringField()),
				flags: new fields.ObjectField(),
			})
		);

		return schema;
	}

	prepareDerivedData() {}

	onEquipChange() {
		console.log('You have either equipped or unequipped this item!');
	}

	onEquip() {
		console.log('You have equipped this item!');
	}

	onUnequip() {
		console.log('You have unequipped this item!');
	}
}
