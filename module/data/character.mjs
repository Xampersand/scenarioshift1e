import { NumberField, SchemaField, StringField, BooleanField } from "foundry.data.fields";
import { HealthData, ValueData } from "./abstract.mjs";

export default class CharacterData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			health: new SchemaField(HealthData),
			mana: new SchemaField(ValueData),
			stats: new SchemaField({
				str: new SchemaField(ValueData, { initial: { label: "Strength" } }),
				agi: new SchemaField(ValueData, { initial: { label: "Agility" } }),
				con: new SchemaField(ValueData, { initial: { label: "Constitution" } }),
				int: new SchemaField(ValueData, { initial: { label: "Intelligence" } })
			}),
			armor: new SchemaField(ValueData),
			evasion: new SchemaField(ValueData),
			accuracy: new SchemaField(ValueData),

			items: new ArrayField({initial: []}),
			itemSlots: new NumberField({initial: 5}),

			skills: new ArrayField({initial: []}),

			age: new NumberField({ initial: 18 }),
			race: new StringField({ initial: "Human" }),
			sponsor: new StringField({ initial: "None" }),
			coins: new NumberField({ initial: 0 })
		};
	}
}