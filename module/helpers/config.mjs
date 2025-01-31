export const SS1E = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */

SS1E.races = {
  human: 'Human',
  demihuman: 'Demihuman',
};

SS1E.grades = {
  historical: 'Historical',
  fabled: 'Fabled',
  mythical: 'mythical',
};

SS1E.ratings = {
  common: 'Common',
  rare: 'Rare',
  heroic: 'Heroic',
  legendary: 'Legendary',
  mythical: 'Mythical',
};

SS1E.derived = {
  evasion: {name: "Evasion", short: "evasion"},
  accuracy: {name: "Accuracy", short: "accuracy"},
  armor: {name: "Armor", short: "armor"},
  shred: {name: "Shred", short: "shred"},
  penetration: {name: "Penetration", short: "penetration"},
  health: {name: "Health", short: "health"},
  mana: {name: "Mana", short: "mana"},
}

SS1E.stats = {
  str: {name: "Strength", short: "str"},
  agi: {name: "Agility", short: "agi"},
  con: {name: "Constitution", short: "con"},
  int: {name: "Intelligence", short: "int"},
}

SS1E.damageTypes = {
  physical: 'physical',
  magical: 'magical',
	true: 'true',
	healing: 'healing',
}

SS1E.animationTypes = [
  'sword', 
  'greatsword', 
  'quarterstaff', 
  'shortsword', 
  'dagger', 
  'club',
  'greatclub',
  'bow',
  'bullet',
  'magic',
  'scythe'
]