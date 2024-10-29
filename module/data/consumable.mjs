import SS1EItemBase from "./item-base.mjs";

export default class SS1EConsumable extends SS1EItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

	schema.effect = new fields.StringField({ initial: "No Effect" });

    return schema;
  }
}