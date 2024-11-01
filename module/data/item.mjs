import SS1EItemBase from "./item-base.mjs";

export default class SS1EItem extends SS1EItemBase {

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });

		return schema;
	}

	prepareDerivedData() {

	}
}