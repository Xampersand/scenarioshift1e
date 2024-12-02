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
    schema.diceNum = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
    });
    schema.diceSize = new fields.StringField({ initial: 'd4' });
    schema.diceBonus = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.damageType = new fields.StringField({ initial: 'bludgeoning' });
    // schema.damageFormula = new fields.StringField({ initial: '' });
    schema.skillType = new fields.StringField({ initial: 'offensive' });
    schema.apCost = new fields.NumberField({ ...requiredInteger, initial: 1 });
    schema.upgradeThreshold = new fields.NumberField({
      ...requiredInteger,
      initial: 10,
    });
    schema.manaType = new fields.StringField({ initial: 'Transmutation' });
    schema.manaCost = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}
// to do
// add action point cost to schema
// setup buttons to use, which consumes action points and sends the description to chat
// setup active effects to apply to actor when skill is used for a duration - cannot do untill automation is setup for combat
// DONE setup accuracy and damage formula to be used in the roll buttons
// DONE evolve the skill based on actor stats ( more dice rolls at say 20 str)
// DONE setup skill damage roll to scale with user stats
