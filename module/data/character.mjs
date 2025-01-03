import SS1EActorBase from './actor-base.mjs';

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
		schema.evasionBase = new fields.NumberField({ initial: 0 });
		schema.evasionBonus = new fields.NumberField({ initial: 0 });
		schema.evasionTempBonus = new fields.NumberField({ initial: 0 });
		schema.evasionMulti = new fields.NumberField({ initial: 1 });
		schema.evasionTotal = new fields.NumberField({ initial: 0 });
		schema.accuracyBase = new fields.NumberField({ initial: 0 });
		schema.accuracyBonus = new fields.NumberField({ initial: 0 });
		schema.accuracyTempBonus = new fields.NumberField({ initial: 0 });
		schema.accuracyMulti = new fields.NumberField({ initial: 1 });
		schema.accuracyTotal = new fields.NumberField({ initial: 0 });
		schema.armorBase = new fields.NumberField({ initial: 0 });
		schema.armorBonus = new fields.NumberField({ initial: 0 });
		schema.armorTempBonus = new fields.NumberField({ initial: 0 });
		schema.armorMulti = new fields.NumberField({ initial: 1 });
		schema.armorTotal = new fields.NumberField({ initial: 0 });
		schema.healthMaxBase = new fields.NumberField({ initial: 5 });
		schema.healthMaxBonus = new fields.NumberField({ initial: 0 });
		schema.healthMaxTempBonus = new fields.NumberField({ initial: 0 });
		schema.healthMaxMulti = new fields.NumberField({ initial: 1 });
		schema.healthMaxTotal = new fields.NumberField({ initial: 0 });
		schema.healthCurrent = new fields.NumberField({ initial: 5 });
		schema.manaMaxBase = new fields.NumberField({ initial: 0 });
		schema.manaMaxBonus = new fields.NumberField({ initial: 0 });
		schema.manaMaxTempBonus = new fields.NumberField({ initial: 0 });
		schema.manaMaxMulti = new fields.NumberField({ initial: 1 });
		schema.manaMaxTotal = new fields.NumberField({ initial: 0 });
		schema.manaCurrent = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseStrBase = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseAgiBase = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseIntBase = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseConBase = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseStrBonus = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseAgiBonus = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseIntBonus = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseConBonus = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseStrTempBonus = new fields.NumberField({
			initial: 0,
		});
		schema.damageIncreaseAgiTempBonus = new fields.NumberField({
			initial: 0,
		});
		schema.damageIncreaseIntTempBonus = new fields.NumberField({
			initial: 0,
		});
		schema.damageIncreaseConTempBonus = new fields.NumberField({
			initial: 0,
		});
		schema.damageIncreaseStrTotal = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseAgiTotal = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseIntTotal = new fields.NumberField({ initial: 0 });
		schema.damageIncreaseConTotal = new fields.NumberField({ initial: 0 });
		schema.actionPointsMax = new fields.NumberField({ initial: 4 });
		schema.actionPointsCurrent = new fields.NumberField({ initial: 0 });

		return schema;
	}

	prepareData() {
		super.prepareData();
	}

	prepareBaseData() {
		this.addItemModifiers();
	}

	prepareEmbeddedDocuments() {}

	prepareDerivedData() {
		// Making multipliers into percentages
		this.strMulti = 1 + this.strMulti / 100;
		this.agiMulti = 1 + this.agiMulti / 100;
		this.conMulti = 1 + this.conMulti / 100;
		this.intMulti = 1 + this.intMulti / 100;

		// Total stats
		this.strTotal = Math.round(
			(this.strBase + this.strBonus + this.strTempBonus) * this.strMulti
		);
		this.agiTotal = Math.round(
			(this.agiBase + this.agiBonus + this.agiTempBonus) * this.agiMulti
		);
		this.conTotal = Math.round(
			(this.conBase + this.conBonus + this.conTempBonus) * this.conMulti
		);
		this.intTotal = Math.round(
			(this.intBase + this.intBonus + this.intTempBonus) * this.intMulti
		);

		//stat scalings
		const ARMOR_INCREMENT = 0.8;
		const EVASION_INCREMENT = 0.7;
		const STR_ACCURACY_INCREMENT = 0.5;
		const AGI_ACCURACY_INCREMENT = 0.75;
		const INT_ACCURACY_INCREMENT = 1;
		const INT_MANA_INCREMENT = 5;
		const CON_MANA_INCREMENT = 1;
		const HEALTH_INCREMENT = 3;

		// damage scaling, x point of stat = 1% increase in damage
		// this is generic, for specific scaling, change in roll formulas
		const AGILITY_DAMAGE_SCALING = 2;
		const INTELLIGENCE_DAMAGE_SCALING = 1;
		const STRENGTH_DAMAGE_SCALING = 1;
		const CONSTITUTION_DAMAGE_SCALING = 1;

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

		//base damage increases
		this.damageIncreaseAgiBase =
			this.agiTotal / AGILITY_DAMAGE_SCALING / 100;
		this.damageIncreaseIntBase =
			this.intTotal / INTELLIGENCE_DAMAGE_SCALING / 100;
		this.damageIncreaseStrBase =
			this.strTotal / STRENGTH_DAMAGE_SCALING / 100;
		this.damageIncreaseConBase =
			this.conTotal / CONSTITUTION_DAMAGE_SCALING / 100;

		// making bonus increases a percentage
		this.damageIncreaseStrBonus = this.damageIncreaseStrBonus / 100;
		this.damageIncreaseAgiBonus = this.damageIncreaseAgiBonus / 100;
		this.damageIncreaseIntBonus = this.damageIncreaseIntBonus / 100;
		this.damageIncreaseConBonus = this.damageIncreaseConBonus / 100;
		this.damageIncreaseStrTempBonus = this.damageIncreaseStrTempBonus / 100;
		this.damageIncreaseAgiTempBonus = this.damageIncreaseAgiTempBonus / 100;
		this.damageIncreaseIntTempBonus = this.damageIncreaseIntTempBonus / 100;
		this.damageIncreaseConTempBonus = this.damageIncreaseConTempBonus / 100;

		// total damage increases
		this.damageIncreaseStrTotal =
			this.damageIncreaseStrBase +
			this.damageIncreaseStrBonus +
			this.damageIncreaseStrTempBonus;
		this.damageIncreaseAgiTotal =
			this.damageIncreaseAgiBase +
			this.damageIncreaseAgiBonus +
			this.damageIncreaseAgiTempBonus;
		this.damageIncreaseIntTotal =
			this.damageIncreaseIntBase +
			this.damageIncreaseIntBonus +
			this.damageIncreaseIntTempBonus;
		this.damageIncreaseConTotal =
			this.damageIncreaseConBase +
			this.damageIncreaseConBonus +
			this.damageIncreaseConTempBonus;

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

		// rounding resource values
		this.healthCurrent = Math.round(this.healthCurrent);
		this.manaCurrent = Math.round(this.manaCurrent);
	}

	addItemModifiers() {
		const items = this.parent.items;
		for (const item of items) {
		}
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
