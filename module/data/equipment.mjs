import SS1EEquippableItem from "./equippable-item.mjs";
export default class SS1EEquipment extends SS1EEquippableItem {

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.defense = new fields.NumberField({ ...requiredInteger, initial: 0 });
		schema.defenseType = new fields.StringField({ initial: 'armor' })
		schema.effect = new fields.StringField({ required: true, blank: true });

		return schema;
	}

	prepareDerivedData() { }
}