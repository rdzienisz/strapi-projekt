'use strict';

/**
 * data importer router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::data-importer.data-importer');
