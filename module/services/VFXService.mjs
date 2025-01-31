const default_attack_animation_paths = {
	'sword': 'jb2a.shortsword.melee.01.white',
	'greatsword': 'jb2a.greatsword.melee.standard.white',
	'quarterstaff': 'jb2a.quarterstaff.melee.01.white',
	'dagger': 'jb2a.dagger.melee.02.white',
	'club': 'jb2a.club.melee.01.white',
	'greatclub': 'jb2a.greatclub.standard.white',
	'bow': 'jb2a.arrow.physical.white.02',
	'bullet': 'jb2a.bullet.01.orange',
	'magic': 'jb2a.magic_missile.blue',
	'unarmed': 'jb2a.unarmed_strike.physical.01.yellow',
	'scythe': 'jb2a.melee_attack.05.scythe'
}

export function playUnarmedAnimation(actor) {
	const macro = game.macros.getName(actor.name + "_Unarmed_VFX");
	if (macro) {
		macro.execute();
	} else {
		for (const token of game.user.targets.values()) {
			new Sequence()
			.effect()
				.atLocation(canvas.tokens.controlled[0])
				.stretchTo(token)
				.file(default_attack_animation_paths.unarmed)
			.play();
		}
	}
}

export function playAttackAnimation(actor, weapon) {
	const macro = game.macros.getName(weapon.name + "_VFX");
	if (macro) {
		macro.execute();
	} else {
		const weaponAnimationType = weapon.system.animationType;
		for (const token of game.user.targets.values()) {
			new Sequence()
			.effect()
				.atLocation(canvas.tokens.controlled[0])
				.stretchTo(token)
				.file(default_attack_animation_paths[weaponAnimationType || 'unarmed'])
			.play();
		}
	}
}

export function playSkillAnimation(actor, skill) {
	const macro = game.macros.getName(skill.name + "_VFX");
	if (macro) {
		macro.execute();
	}
}