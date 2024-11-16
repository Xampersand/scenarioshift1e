import SS1EEquippableItem from './equippable-item.mjs';

export default class SS1EAmmo extends SS1EEquippableItem {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.damageRoll = new fields.SchemaField({
			diceNum: new fields.NumberField({
				...requiredInteger,
				initial: 1,
				min: 1,
			}),
			diceSize: new fields.StringField({ initial: 'd4' }),
			diceBonus: new fields.NumberField({
				...requiredInteger,
				initial: 0,
				min: 0,
			}),
		});
		schema.damageType = new fields.StringField({ initial: 'bludgeoning' });
		schema.damageFormula = new fields.StringField({ initial: '' });

		return schema;
	}

	prepareDerivedData() {
		super.prepareDerivedData();
		// Ensure the damageRoll property is defined
		const roll = this.system.damageRoll || {
			diceNum: 1,
			diceSize: 'd4',
			diceBonus: 0,
		};

		// Build the formula dynamically using string interpolation
		this.system.damageFormula = `${roll.diceNum}${roll.diceSize}+${roll.diceBonus}`;
	}
}
