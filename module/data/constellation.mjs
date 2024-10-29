import SS1EActorBase from "./actor-base.mjs";

export default class SS1EConstellation extends SS1EActorBase {

	static defineSchema() {
		const schema = super.defineSchema();

		const fields = foundry.data.fields;

		schema.grade = new fields.StringField({ initial: CONFIG.SS1E.grades.historical })
		schema.trueName = new fields.StringField({ initial: "Nameless" })
		schema.incarnation = new fields.StringField({ initial: "None" })

		return schema;
	}
}