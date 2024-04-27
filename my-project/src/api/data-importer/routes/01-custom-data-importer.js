'use strict';

/**
 * data-importer router
 */

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/data-importers/import',
            handler: '01-custom-data-importer.importData'
        }
    ]
}
