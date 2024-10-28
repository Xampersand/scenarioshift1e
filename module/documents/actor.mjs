/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SS1EActor extends Actor {
	/** @override */
	prepareData() {
		// Prepare data for the actor. Calling the super version of this executes
		// the following, in order: data reset (to clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData().
		super.prepareData();
	}

	/** @override */
	prepareBaseData() {
		// Data modifications in this step occur before processing embedded
		// documents or derived data.
	}

	/**
	 * @override
	 * Augment the actor source data with additional dynamic data. Typically,
	 * you'll want to handle most of your calculated/derived data in this step.
	 * Data calculated in this step should generally not exist in template.json
	 * (such as ability modifiers rather than ability scores) and should be
	 * available both inside and outside of character sheets (such as if an actor
	 * is queried and has a roll executed directly from it).
	 */
	prepareDerivedData() {
		const actorData = this;
		const systemData = actorData.system;
		const flags = actorData.flags.scenarioshift1e || {};

		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.
		this._prepareCharacterData(actorData);
		this._prepareNpcData(actorData);
	}

	/**
	 * Prepare Character type specific data
	 */
	_prepareCharacterData(actorData) {
		if (actorData.type !== 'character') return;

		// Make modifications to data here. For example:
		const systemData = actorData.system;

		const stats = systemData.stats;

		const ARMOR_INCREMENT = 0.5;
		const EVASION_INCREMENT = 0.5;
		const ACCURACY_INCREMENT = 2;
		const MANA_INCREMENT = 5;
		const HEALTH_INCREMENT = 2.5;

		// ARMOR, EVASION, ACCURACY
		systemData.armor.value = Math.round(
			(stats.str.value + stats.str.bonus) * ARMOR_INCREMENT
		);
		systemData.evasion.value = Math.round(
			(stats.agi.value + stats.agi.bonus) * EVASION_INCREMENT
		);
		systemData.accuracy.value = Math.round(
			(stats.agi.value + stats.agi.bonus) * ACCURACY_INCREMENT
		);

		// HEALTH, MANA
		systemData.health.max =
			5 + Math.round((stats.con.value + stats.con.bonus) * HEALTH_INCREMENT);

		systemData.mana.max = Math.round(
			(stats.int.value + stats.int.bonus) * MANA_INCREMENT
		);
	}

	/**
	 * Prepare NPC type specific data.
	 */
	_prepareNpcData(actorData) {
		if (actorData.type !== 'npc') return;

		// Make modifications to data here. For example:
		// const systemData = actorData.system;
		// systemData.xp = systemData.cr * systemData.cr * 100;
	}

	/**
	 * Override getRollData() that's supplied to rolls.
	 */
	getRollData() {
		// Starts off by populating the roll data with `this.system`
		const data = { ...super.getRollData() };

		// Prepare character roll data.
		this._getCharacterRollData(data);
		this._getNpcRollData(data);

		return data;
	}

	/**
	 * Prepare character roll data.
	 */
	_getCharacterRollData(data) {
		if (this.type !== 'character') return;

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		if (data.attributes) {
			for (let [k, v] of Object.entries(data.attributes)) {
				data[k] = foundry.utils.deepClone(v);
			}
		}
	}

	/**
	 * Prepare NPC roll data.
	 */
	_getNpcRollData(data) {
		if (this.type !== 'npc') return;

		// Process additional NPC data here.
	}
}
