import SS1EEquippableItem from './equippable-item.mjs';
export default class SS1EAccessory extends SS1EEquippableItem {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    return schema;
  }

  prepareDerivedData() {}
}
