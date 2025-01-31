import SS1EActorBase from './actor-base.mjs';

function camelCase(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

const suffixes = ["Base", "Bonus", "TempBonus", "Total"];
const fieldTypes = [
	"DmgIncrease",
	"FlatDmgIncrease",
	"DmgResistance",
	"FlatDmgResistance"
];

export default class SS1ECharacter extends SS1EActorBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

		schema.sponsor = new fields.StringField({ initial: 'None' });
		schema.race = new fields.StringField({
			initial: CONFIG.SS1E.races.human,
		});
		schema.attributes = new fields.StringField({ initial: 'None' });
		schema.stigmas = new fields.StringField({ initial: 'None' });
		schema.stories = new fields.StringField({ initial: 'None' });

		schema.actionPointsMax = new fields.NumberField({ initial: 4 });
		schema.actionPointsCurrent = new fields.NumberField({ initial: 0 });

		schema.attackSkillWeapon = new fields.StringField({ initial: '' });
		schema.lastAttackRoll = new fields.StringField({ initial: '' });
		
		// Derived Stats Schema

		for (const [_, stat] of Object.entries(CONFIG.SS1E.derived)) {
			let key = stat.short;
			if (stat.short === "health" || stat.short === "mana") key = stat.short + "Max";
			for (const suffix of suffixes) {
				schema[key + suffix] = new fields.NumberField({ initial: 0 });
			}
			schema[key + "Multi"] = new fields.NumberField({ initial: 1 });
		}

		// Resource Specific Schema

		schema.healthMaxBase = new fields.NumberField({ initial: 5 });
		schema.healthCurrent = new fields.NumberField({ initial: 5 });
		schema.baseHealthRegen = new fields.NumberField({ initial: 0 });
		schema.bonusHealthRegen = new fields.NumberField({ initial: 0 });

		schema.manaCurrent = new fields.NumberField({ initial: 0 });
		schema.baseManaRegen = new fields.NumberField({ initial: 0.02 });
		schema.bonusManaRegen = new fields.NumberField({ initial: 0 });


		// Initiative Schema

		schema.initiativeBase = new fields.NumberField({ initial: 0 });
		schema.initiativeBonus = new fields.NumberField({ initial: 0 });
		schema.initiativeTempBonus = new fields.NumberField({ initial: 0 });
		schema.initiativeTotal = new fields.NumberField({ initial: 0 });
		schema.initiativeMulti = new fields.NumberField({ initial: 1 });

		// Rolls Schema

		for (const [_, stat] of Object.entries(CONFIG.SS1E.stats)) {
			schema[stat.short + "RollBaseBonus"] = new fields.NumberField({ initial: 0 });
			schema[stat.short + "RollBonus"] = new fields.NumberField({ initial: 0 });
		}

		// Stat Damage Increases Schema

		for (const [_, stat] of Object.entries(CONFIG.SS1E.stats)) {
			for (const suffix of suffixes) {
				const fieldName = `damageIncrease${camelCase(stat.short)}${suffix}`;
				schema[fieldName] = new fields.NumberField({ initial: 0 });
			}
		}

		// Regen Schema
		schema.flatManaRegen = new fields.NumberField({ initial: 0 });
		schema.flatHealthRegen = new fields.NumberField({ initial: 0 });
		
		// Crit Schema
		schema.critMultiBase = new fields.NumberField({ initial: 2 });
		schema.critMultiBonus = new fields.NumberField({ initial: 0 });
		schema.critMultiTotal = new fields.NumberField({ initial: 0 });
		schema.megacritBreakpoint = new fields.NumberField({ initial: 100 });
		
		// Multiplier Schema
		schema.amplification = new fields.NumberField({ initial: 0 });
		schema.durability = new fields.NumberField({ initial: 0 });
		schema.resonance = new fields.NumberField({ initial: 0 });


		// Derived Increases Schema

		for (const damageType of Object.values(CONFIG.SS1E.damageTypes)) {
			for (const fieldType of fieldTypes) {
				for (const suffix of suffixes) {
					const fieldName = `${damageType}${fieldType}${suffix}`;
					schema[fieldName] = new fields.NumberField({ initial: 0 });
				}
			}
		}
		return schema;
	}

	prepareData() {
		super.prepareData();
	}

	prepareBaseData() {
		
	}


	getItemsWithEffects(items) {
		return items.filter((item) => {
			return item.collections.effects.size > 0;
		})
	}
	prepareEmbeddedDocuments() {}

	prepareDerivedData() {
		// Making multipliers into percentages
		for (const stat of Object.values(CONFIG.SS1E.stats)) {
			this[stat.short + "Multi"] = 1 + this[stat.short + "Multi"] / 100;
			this[stat.short + "Total"] = Math.round(this[stat.short + "Base"] + this[stat.short + "Bonus"] + this[stat.short + "TempBonus"]) * this[stat.short + "Multi"];
		}

		for (const stat of Object.values(CONFIG.SS1E.derived)) {
			this[stat.short + "Multi"] = 1 + this[stat.short + "Multi"] / 100;
			this[stat.short + "Total"] = Math.round(this[stat.short + "Base"] + this[stat.short + "Bonus"] + this[stat.short + "TempBonus"]) * this[stat.short + "Multi"];
		}

		//stat scalings
		const INCREMENTS = {
			'armor': 1,
			'evasion': 0.7,
			'accuracy': {
				'str': 0.2,
				'agi': 0.7,
				'int': 0.6
			},
			'mana': 5,
			'health': 5,
			'initiative': 0.5
		}

		const SCALINGS = {
			'str': 1,
			'agi': 1,
			'con': 1,
			'int': 1
		}

		//base combat stats
		this.evasionBase = this.agiTotal * INCREMENTS.evasion;
		this.accuracyBase =
			this.agiTotal * INCREMENTS.accuracy.agi +
			this.intTotal * INCREMENTS.accuracy.int +
			this.strTotal * INCREMENTS.accuracy.str;
		this.armorBase = this.strTotal * INCREMENTS.armor;
		this.healthMaxBase = this.conTotal * INCREMENTS.health;
		this.manaMaxBase = this.intTotal * INCREMENTS.mana;
		this.initiativeBase = this.agiTotal * INCREMENTS.initiative;

		//base damage increases
		this.damageIncreaseAgiBase = this.agiTotal * SCALINGS.agi / 100;
		this.damageIncreaseIntBase = this.intTotal * SCALINGS.int / 100;
		this.damageIncreaseStrBase = this.strTotal * SCALINGS.str / 100;
		this.damageIncreaseConBase = this.conTotal * SCALINGS.con / 100;

		// making bonus increases a percentage & total damage increases

		for (const stat of Object.values(CONFIG.SS1E.stats)) {
			const key = "damageIncrease" + camelCase(stat.short);
			this[key + "Bonus"] = this[key + "Bonus"] / 100;
			this[key + "TempBonus"] = this[key + "TempBonus"] / 100;
			this[key + "Total"] = this[key + "Base"] + this[key + "Bonus"] + this[key + "TempBonus"];
		}

		for (const damageType of Object.values(CONFIG.SS1E.damageTypes)) {
			for (const fieldType of fieldTypes) {
				const key = damageType + fieldType;
				if (fieldType.includes("Flat")) {
					this[key + "Total"] = this[key + "Base"] + this[key + "Bonus"] + this[key + "TempBonus"];
				} else {
					this[key + "Base"] = this[key + "Base"] / 100;
					this[key + "Bonus"] = this[key + "Bonus"] / 100;
					this[key + "TempBonus"] = this[key + "TempBonus"] / 100;
					this[key + "Total"] = this[key + "Base"] + this[key + "Bonus"] + this[key + "TempBonus"];
				}
			}
		}

		//total combat stats
		this.evasionTotal = Math.round(
			(this.evasionBase + this.evasionBonus + this.evasionTempBonus) *
				this.evasionMulti
		);
		this.accuracyTotal = Math.round(
			(this.accuracyBase + this.accuracyBonus + this.accuracyTempBonus) *
				this.accuracyMulti
		);
		this.armorTotal = Math.round(
			(this.armorBase + this.armorBonus + this.armorTempBonus) *
				this.armorMulti
		);
		this.healthMaxTotal = Math.round(
			5 + (this.healthMaxBase + this.healthMaxBonus) * this.healthMaxMulti
		);
		this.manaMaxTotal = Math.round(
			(this.manaMaxBase + this.manaMaxBonus) * this.manaMaxMulti
		);
		this.initiativeTotal = Math.round(
			this.initiativeBase +
				this.initiativeBonus +
				this.initiativeTempBonus
		);
		this.strRollBaseBonus = Math.round(this.strTotal / 3);
		this.agiRollBaseBonus = Math.round(this.agiTotal / 3);
		this.conRollBaseBonus = Math.round(this.conTotal / 3);
		this.intRollBaseBonus = Math.round(this.intTotal / 3);
		// rounding resource values
		this.healthCurrent = Math.round(this.healthCurrent);
		this.manaCurrent = Math.round(this.manaCurrent);
		this.critMultiTotal = this.critMultiBase + this.critMultiBonus;

		this.prepareEmbeddedDocuments();
	}

	
	calculateTotals() {}
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
