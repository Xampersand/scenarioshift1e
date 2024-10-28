import { NumberField, SchemaField, StringField, BooleanField } from "foundry.data.fields";

// Base template for health
export class HealthData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			baseValue: new NumberField({ initial: 0 }),
			bonus: new NumberField({ initial: 0 }),
			multi: new NumberField({ initial: 1 }),
			value: new NumberField({ initial: 1 }),
			max: new NumberField({ initial: 1 })
		};
	}
}

// Value template
export class ValueData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			baseValue: new NumberField({ initial: 0 }),
			bonus: new NumberField({ initial: 0 }),
			multi: new NumberField({ initial: 1 }),
			value: new NumberField({ initial: 0 }),
			label: new StringField({ initial: "" })
		};
	}
}