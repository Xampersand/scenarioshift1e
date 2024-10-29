export default class SS1EItemBase extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
	const requiredInteger = { required: true, nullable: false, integer: true };

	schema.requirement = new fields.SchemaField({
		type: new fields.StringField({ initial: 'int' }),
		value: new fields.NumberField({...requiredInteger, initial: 0})
	});
    schema.description = new fields.StringField({ required: true, blank: true });
	schema.rating = new fields.StringField({ initial: CONFIG.SS1E.ratings.common });

    return schema;
  }
}