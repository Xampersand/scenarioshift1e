/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  await loadTemplates([
    // Actor partials.
	'systems/ss1e/templates/actor/parts/inventory.hbs',
    // Item partials
    'systems/ss1e/templates/item/parts/item-effects.hbs',
  ]);
  const templatePath = await getTemplate('systems/ss1e/templates/actor/parts/inventory.hbs');
  Handlebars.registerPartial('inventory', templatePath);
};
