import SS1EActorBase from "./actor-base.mjs";

export default class SS1ENPC extends SS1EActorBase {

	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

		schema.race = new fields.StringField({ initial: CONFIG.SS1E.races.human });

		return schema;
	}
}