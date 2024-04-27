'use strict';

/**
 * data-importer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::data-importer.data-importer');
