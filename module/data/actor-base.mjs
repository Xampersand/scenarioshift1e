import SS1EItemBase from "./item-base.mjs";

class ValueData extends foundry.abstract.DataModel {
	static defineSchema() {
		const requiredInteger = { required: true, nullable: false, integer: true };
		const fields = foundry.data.fields;
		return {
			baseValue: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			multi: new fields.NumberField({ ...requiredInteger, initial: 1 }),
			value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
			label: new fields.StringField({ initial: "Label" })
		};
	}
}

class ResourceData extends ValueData {
	static defineSchema() {
		const schema = super.defineSchema();
		const fields = foundry.data.fields;
		return {
			...schema,
			max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 100 })
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

		// console.log(CONFIG.SS1E);

		// Object.entries(CONFIG.SS1E.resources).forEach((entry) => console.log(`Key ${entry[0]} with value ${entry}`));

		schema.resources = new fields.SchemaField(
			Object.keys(CONFIG.SS1E.resources).reduce((obj, stat) => {
				obj[stat] = new fields.EmbeddedDataField(ResourceData, { initial: { baseValue: 0, bonus: 0, multi: 1, value: 0, max: 0, label: CONFIG.SS1E.resources[stat] } });
				return obj;
			}, {})
		);
		
		// Keep derived and stats using ValueData without max
		schema.derived = new fields.SchemaField(
			Object.keys(CONFIG.SS1E.derived).reduce((obj, stat) => {
				obj[stat] = new fields.EmbeddedDataField(ValueData, { initial: { baseValue: 0, bonus: 0, multi: 1, value: 0, label: CONFIG.SS1E.derived[stat] } });
				return obj;
			}, {})
		);
		
		schema.stats = new fields.SchemaField(
			Object.keys(CONFIG.SS1E.stats).reduce((obj, stat) => {
				obj[stat] = new fields.EmbeddedDataField(ValueData, { initial: { baseValue: 0, bonus: 0, multi: 1, value: 0, label: CONFIG.SS1E.stats[stat] } });
				return obj;
			}, {})
		);

		schema.attributes = new fields.ArrayField(new fields.EmbeddedDataField(SS1EItemBase));
		
		schema.skills = new fields.ArrayField(new fields.EmbeddedDataField(SS1EItemBase));

		schema.items = new fields.ArrayField(new fields.EmbeddedDataField(SS1EItemBase));
		schema.itemSlots = new fields.NumberField({ ...requiredInteger, initial: 5});

		return schema;
	}
}