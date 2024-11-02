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
		super.prepareData();
	}

	prepareBaseData() {
		this.addItemModifiers();
		this.calculateStats(this.stats);
	}

	prepareEmbeddedDocuments() { }

	prepareDerivedData() {
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
		derived.armor.baseValue = Math.round(stats.str.value * ARMOR_INCREMENT);
		derived.evasion.baseValue = Math.round(stats.agi.value * EVASION_INCREMENT);
		derived.accuracy.baseValue = Math.round((stats.agi.value + stats.int.value) * ACCURACY_INCREMENT);

		// DAMAGE MULTIPLIERS BASED ON STATS
		derived.strStatDmgMulti.baseValue = stats.str.value / STRENGTH_DAMAGE_SCALING / 100;
		derived.agiStatDmgMulti.baseValue = stats.agi.value / AGILITY_DAMAGE_SCALING / 100;
		derived.intStatDmgMulti.baseValue = stats.int.value / INTELLIGENCE_DAMAGE_SCALING / 100;

		this.calculateStats(derived);

		// HEALTH, MANA
		resources.health.max =
			5 + Math.round((stats.con.value) * HEALTH_INCREMENT);

		resources.mana.max = Math.round((stats.int.value) * MANA_INCREMENT);
	}

	calculateStats(path) {
		for (const key of Object.keys(path)) {
			path[key].value = (path[key].baseValue + path[key].bonus) * path[key].multi;
		}
	}

	addItemModifiers() {
		const items = this.parent.items;
		for (const item of items) {
			// console.log(item);
		}
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
