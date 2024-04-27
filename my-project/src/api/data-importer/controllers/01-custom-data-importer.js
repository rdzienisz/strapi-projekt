const fs = require('fs');
const csv = require('fast-csv');
const { parseISO } = require('date-fns');
const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  async importData(ctx) {
    try {
      const fileContent = ctx.request.body;
  
      const matches = [];
      await new Promise((resolve, reject) => {
        csv.parseString(fileContent, {
          headers: true,
          trim: true,
        })
        .on('data', (data) => {
          matches.push(data);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
      });
  
      // Check if the team already exists in the database
      const teams = new Set([...matches.map(match => match.home_team), ...matches.map(match => match.away_team)]);
      const teamPromises = Array.from(teams).map(async teamName => {
        const teamExists = await strapi.db.query('api::team.team').findOne({ where: {name: teamName }});
        if (!teamExists) {
          await strapi.service('api::team.team').create({
            data: {
              publishedAt: new Date(),
              name: teamName
            }
          });
        }
      });
      await Promise.all(teamPromises);
  
      const matchService = strapi.service('api::match.match');
      const matchPromises = matches.map(async match => {
        // Check if the match already exists in the database
        const existingMatch = await strapi.db.query('api::match.match').findOne({
          where: {
            home_team: (await strapi.db.query('api::team.team').findOne({ where: {name: match.home_team}, select: 'id' })).id,
            away_team: (await strapi.db.query('api::team.team').findOne({ where: {name: match.away_team}, select: 'id' })).id,
            result: match.result
          }
        });
        console.log(match)
        console.log(existingMatch)
  
        if (!existingMatch) {
          // If the match does not exist, create it
          await matchService.create({
            data: {
              publishedAt: new Date(),
              home_team: (await strapi.db.query('api::team.team').findOne({ where: {name: match.home_team}, select: 'id' })).id,
              away_team: (await strapi.db.query('api::team.team').findOne({ where: {name: match.away_team}, select: 'id' })).id,
              date: parseISO(match.date),
              result: match.result
            }
          });
        }
      });
      await Promise.all(matchPromises);
  
      // Send response after all operations are completed
      ctx.send({ message: 'Dane meczów zostały pomyślnie dodane.' });
    } catch (error) {
      console.error('Błąd podczas importowania danych meczów:', error);
      ctx.throw(500, 'Wystąpił błąd podczas importowania danych meczów.');
    }
  }
}
