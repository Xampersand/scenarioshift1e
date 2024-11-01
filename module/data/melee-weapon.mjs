import SS1EWeapon from "./weapon.mjs";

export default class SS1EMeleeWeapon extends SS1EWeapon {

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.damageRoll = new fields.SchemaField({
			diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
			diceSize: new fields.StringField({ initial: "d4" }),
			diceBonus: new fields.StringField({ initial: "+0" })
		})
		schema.damageType = new fields.StringField({ initial: "bludgeoning" });
		schema.damageFormula = new fields.StringField({ required: false, blank: true });

		return schema;
	}

	prepareDerivedData() {
		// Build the formula dynamically using string interpolation
		const roll = this.damageRoll;

		this.damageFormula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
	}

	equip() {
		console.log("equipped");
		console.log(this);
	}
}