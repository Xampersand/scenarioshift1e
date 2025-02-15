import SS1EItemBase from './item-base.mjs';

export default class SS1ESkill extends SS1EItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = {
			required: true,
			nullable: false,
			integer: true,
		};
		const schema = super.defineSchema();
		schema.range = new fields.NumberField({
			...requiredInteger,
			initial: 0,
		});
		schema.accuracy = new fields.NumberField({
			...requiredInteger,
			initial: 0,
		});
		schema.diceNum = new fields.NumberField({
			...requiredInteger,
			initial: 1,
			min: 0,
		});
		schema.diceSize = new fields.StringField({ initial: 'd4' });
		schema.diceBonus = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});
		schema.secondDiceNum = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});
		schema.secondDiceSize = new fields.StringField({ initial: 'd6' });
		schema.secondDiceBonus = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});
		schema.thirdDiceNum = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});
		schema.thirdDiceSize = new fields.StringField({ initial: 'd8' });
		schema.thirdDiceBonus = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});
		schema.fourthDiceNum = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});
		schema.fourthDiceSize = new fields.StringField({ initial: 'd10' });
		schema.fourthDiceBonus = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});
		schema.damageType = new fields.StringField({ initial: 'bludgeoning' });
		// schema.damageFormula = new fields.StringField({ initial: '' });
		schema.skillType = new fields.StringField({ initial: 'offensive' });
		schema.apCost = new fields.NumberField({
			...requiredInteger,
			initial: 1,
		});
		schema.upgradeThreshold = new fields.NumberField({
			...requiredInteger,
			initial: 10,
		});
		schema.manaType = new fields.StringField({ initial: 'Transmutation' });
		schema.manaCost = new fields.NumberField({ initial: 0 });
		schema.macroEffect = new fields.StringField({ initial: 'none' });
		schema.skillCooldown = new fields.NumberField({ initial: 0 });
		schema.usesCustomMacro = new fields.BooleanField({ initial: false });
		schema.customMacro = new fields.StringField({ initial: '' });
		schema.isAttackSkill = new fields.BooleanField({ initial: false });
		schema.isActive = new fields.BooleanField({ initial: false });
		return schema;
	}

	prepareDerivedData() {
		super.prepareDerivedData();
	}
}
