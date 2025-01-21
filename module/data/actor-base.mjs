import SS1EItemBase from './item-base.mjs';

class ValueData extends foundry.abstract.DataModel {
  static defineSchema() {
    const requiredInteger = { required: true, nullable: false, integer: true };
    const fields = foundry.data.fields;
    return {
      baseValue: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      multi: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      label: new fields.StringField({ initial: 'Label' }),
    };
  }
}

class ResourceData extends ValueData {
  static defineSchema() {
    const schema = super.defineSchema();
    const fields = foundry.data.fields;
    return {
      ...schema,
      max: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 100,
      }),
    };
  }
}

export default class SS1EActorBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };

    const schema = {};

    schema.coins = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.age = new fields.NumberField({ ...requiredInteger, initial: 1 });
    schema.strBase = new fields.NumberField({ initial: 0 });
    schema.strBonus = new fields.NumberField({ initial: 0 });
    schema.strTempBonus = new fields.NumberField({ initial: 0 });
    schema.strMulti = new fields.NumberField({ initial: 0 });
    schema.strTotal = new fields.NumberField({ initial: 0 });
    schema.agiBase = new fields.NumberField({ initial: 0 });
    schema.agiBonus = new fields.NumberField({ initial: 0 });
    schema.agiTempBonus = new fields.NumberField({ initial: 0 });
    schema.agiMulti = new fields.NumberField({ initial: 0 });
    schema.agiTotal = new fields.NumberField({ initial: 0 });
    schema.conBase = new fields.NumberField({ initial: 0 });
    schema.conBonus = new fields.NumberField({ initial: 0 });
    schema.conTempBonus = new fields.NumberField({ initial: 0 });
    schema.conMulti = new fields.NumberField({ initial: 0 });
    schema.conTotal = new fields.NumberField({ initial: 0 });
    schema.intBase = new fields.NumberField({ initial: 0 });
    schema.intBonus = new fields.NumberField({ initial: 0 });
    schema.intTempBonus = new fields.NumberField({ initial: 0 });
    schema.intMulti = new fields.NumberField({ initial: 0 });
    schema.intTotal = new fields.NumberField({ initial: 0 });

    schema.attributes = new fields.ArrayField(
      new fields.EmbeddedDataField(SS1EItemBase)
    );

    schema.skills = new fields.ArrayField(
      new fields.EmbeddedDataField(SS1EItemBase)
    );
    schema.itemSlots = new fields.NumberField({
      ...requiredInteger,
      initial: 50,
    });

    return schema;
  }
}
