import SS1EItemBase from './item-base.mjs';

export default class SS1ESkill extends SS1EItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    schema.range = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.accuracy = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
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
    const roll = this.damageRoll;
    this.damageFormula = `${roll.diceNum}${roll.diceSize}+${roll.diceBonus}`;
  }
}
