import SS1EActorBase from './actor-base.mjs';
export default class SS1ECharacter extends SS1EActorBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

		schema.sponsor = new fields.StringField({ initial: 'None' });
		schema.race = new fields.StringField({ initial: CONFIG.SS1E.races.human });

		return schema;
	}

	prepareData() {
		// Prepare data for the actor. Calling the super version of this executes
		// the following, in order: data reset (to clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData().
		super.prepareData();
	}

	prepareDerivedData() {
		// console.log("hi initializing")
		const ARMOR_INCREMENT = 0.5;
		const EVASION_INCREMENT = 0.5;
		const ACCURACY_INCREMENT = 2;
		const MANA_INCREMENT = 5;
		const HEALTH_INCREMENT = 2.5;

		// How much stat do you need to get 1% inc damage
		const STRENGTH_DAMAGE_SCALING = 1;
		const AGILITY_DAMAGE_SCALING = 2;
		const INTELLIGENCE_DAMAGE_SCALING = 1;

		const [derived, stats] = [this.derived, this.stats];
		const resources = this.resources;

		// ARMOR, EVASION, ACCURACY
		derived.armor.value = Math.round(
			(stats.str.value + stats.str.bonus) * ARMOR_INCREMENT
		);
		derived.evasion.value = Math.round(
			(stats.agi.value + stats.agi.bonus) * EVASION_INCREMENT
		);
		derived.accuracy.value = Math.round(
			(stats.agi.value + stats.agi.bonus + stats.int.value + stats.int.bonus) *
				ACCURACY_INCREMENT
		);

		// DAMAGE MULTIPLEIRS BASED ON STATS
		derived.strStatDmgMulti.value =
			stats.str.value / STRENGTH_DAMAGE_SCALING / 100;
		derived.agiStatDmgMulti.value =
			stats.agi.value / AGILITY_DAMAGE_SCALING / 100;
		derived.intStatDmgMulti.value =
			stats.int.value / INTELLIGENCE_DAMAGE_SCALING / 100;

		// HEALTH, MANA
		this.resources.health.max =
			5 + Math.round((stats.con.value + stats.con.bonus) * HEALTH_INCREMENT);

		this.resources.mana.max = Math.round(
			(stats.int.value + stats.int.bonus) * MANA_INCREMENT
		);
	}

	getRollData() {
		const data = {};

		// Check if stats is defined
		if (this.stats) {
			// Copy the ability scores to the top level
			for (let [k, v] of Object.entries(this.stats)) {
				data[k] = foundry.utils.deepClone(v);
			}
		} else {
			console.warn('Stats not defined for this actor:', this);
		}

		return data;
	}
}
