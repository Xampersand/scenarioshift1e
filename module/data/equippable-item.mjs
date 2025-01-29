import SS1EItemBase from './item-base.mjs';

export default class SS1EEquippableItem extends SS1EItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = {
			required: true,
			nullable: false,
			integer: true,
		};
		const schema = super.defineSchema();

		schema.dualRequirement = new fields.SchemaField({
			type: new fields.StringField({ initial: 'agi' }),
			value: new fields.NumberField({...requiredInteger, initial: 0})
		});

		schema.equipped = new fields.BooleanField({ required: true });
		schema.slotOccupied = new fields.StringField({ initial: '' });

		return schema;
	}

	prepareDerivedData() {}
}
