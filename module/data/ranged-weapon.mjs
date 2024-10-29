import SS1EWeapon from "./weapon.mjs";

export default class SS1ERangedWeapon extends SS1EWeapon {

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.damageModifier = new fields.NumberField({ ...requiredInteger, initial: 1 });

		return schema;
	}

	prepareDerivedData() {
		
	}
}