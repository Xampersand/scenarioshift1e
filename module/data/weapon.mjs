import SS1EItemBase from "./item-base.mjs";

export default class SS1EWeapon extends SS1EItemBase {

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.range = new fields.NumberField({ ...requiredInteger, initial: 0});
		schema.accuracy = new fields.NumberField({ ...requiredInteger, initial: 0});

		// Break down roll formula into three independent fields
		schema.hitRoll = new fields.SchemaField({
			diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
			diceSize: new fields.StringField({ initial: "d100" }),
			diceBonus: new fields.StringField({ initial: "+@accuracy" })
		})

		schema.hitFormula = new fields.StringField({ required: false, blank: true });

		return schema;
	}

	prepareDerivedData() {
		// Build the formula dynamically using string interpolation
		const roll = this.hitRoll;
	
		this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
	  }
}