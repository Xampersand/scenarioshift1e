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
    schema.skillType = new fields.StringField({ initial: 'damage' });
    schema.apCost = new fields.NumberField({ ...requiredInteger, initial: 1 });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const roll = this.damageRoll;
    this.damageFormula = `${roll.diceNum}${roll.diceSize}+${roll.diceBonus}`;
  }
}
// to do
//  add action point cost to schema
// setup buttons to use, which consumes action points and sends the description to chat
// setup active effects to apply to actor when skill is used for a duration
// setup accuracy and damage formula to be used in the roll buttons
// evolve the skill based on actor stats ( more dice rolls at say 20 str)
// setup skill damage roll to scale with user stats
