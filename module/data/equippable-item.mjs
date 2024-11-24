import SS1EItemBase from './item-base.mjs';

export default class SS1EEquippableItem extends SS1EItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.equipped = new fields.BooleanField({ required: true });

    return schema;
  }

  prepareDerivedData() {}

  // onEquipChange() {
  //   console.log('You have either equipped or unequipped this item!');
  // }

  // async onEquip() {
  //   console.log('You have equipped this item!');
  //   // Toggle on active effects
  //   for (let effect of this.effects) {
  //     await effect.update({ disabled: false });
  //   }
  // }

  // async onUnequip() {
  //   console.log('You have unequipped this item!');
  //   // Toggle off active effects
  //   for (let effect of this.effects) {
  //     await effect.update({ disabled: true });
  //   }
  // }
}
