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
		schema.baseManaRegen = new fields.NumberField({ initial: 0.05 });
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

		//stat scalings
		const ARMOR_INCREMENT = 1;
		const EVASION_INCREMENT = 0.75;
		const STR_ACCURACY_INCREMENT = 0.25;
		const AGI_ACCURACY_INCREMENT = 0.75;
		const INT_ACCURACY_INCREMENT = 0.8;
		const INT_MANA_INCREMENT = 5;
		const CON_MANA_INCREMENT = 1;
		const HEALTH_INCREMENT = 3;
		const INITIATIVE_INCREMENT = 0.5;

		// damage scaling, x point of stat = 1% increase in damage
		// this is generic, for specific scaling, change in roll formulas
		const AGILITY_DAMAGE_SCALING = 1;
		const INTELLIGENCE_DAMAGE_SCALING = 1.2;
		const STRENGTH_DAMAGE_SCALING = 0.9;
		const CONSTITUTION_DAMAGE_SCALING = 0.9;

		//base combat stats
		this.evasionBase = this.agiTotal * EVASION_INCREMENT;
		this.accuracyBase =
			this.agiTotal * AGI_ACCURACY_INCREMENT +
			this.intTotal * INT_ACCURACY_INCREMENT +
			this.strTotal * STR_ACCURACY_INCREMENT;
		this.armorBase = this.strTotal * ARMOR_INCREMENT;
		this.healthMaxBase = this.conTotal * HEALTH_INCREMENT;
		this.manaMaxBase =
			this.conTotal * CON_MANA_INCREMENT +
			this.intTotal * INT_MANA_INCREMENT;
		this.initiativeBase = this.agiTotal * INITIATIVE_INCREMENT;

		//base damage increases
		this.damageIncreaseAgiBase =
			this.agiTotal * AGILITY_DAMAGE_SCALING / 100;
		this.damageIncreaseIntBase =
			this.intTotal * INTELLIGENCE_DAMAGE_SCALING / 100;
		this.damageIncreaseStrBase =
			this.strTotal * STRENGTH_DAMAGE_SCALING / 100;
		this.damageIncreaseConBase =
			this.conTotal * CONSTITUTION_DAMAGE_SCALING / 100;

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
