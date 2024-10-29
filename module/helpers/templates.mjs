/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	Handlebars.registerHelper("repeat", function (times, opts) {
		var out = "";
		var i;
		var data = {};

		if (times) {
			for (i = 0; i < times; i += 1) {
				data.index = i;
				out += opts.fn(this, {
					data: data
				});
			}
		} else {

			out = opts.inverse(this);
		}

		return out;
	});

	await loadTemplates([
		// Actor partials.
		'systems/ss1e/templates/actor/parts/inventory.hbs',
		// Item partials
		'systems/ss1e/templates/item/parts/item-effects.hbs',
	]);
	const templatePath = await getTemplate('systems/ss1e/templates/actor/parts/inventory.hbs');
	Handlebars.registerPartial('inventory', templatePath);

	/*
  * Repeat given markup with given times
  * provides @index for the repeated iteraction
  */
};
