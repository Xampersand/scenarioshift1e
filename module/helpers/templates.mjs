/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/scenarioshift1e/templates/actor/parts/actor-features.hbs',
    'systems/scenarioshift1e/templates/actor/parts/actor-items.hbs',
    'systems/scenarioshift1e/templates/actor/parts/actor-spells.hbs',
    'systems/scenarioshift1e/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/scenarioshift1e/templates/item/parts/item-effects.hbs',
  ]);
};
