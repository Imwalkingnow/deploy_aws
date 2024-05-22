const Hapi = require(`@hapi/hapi`);
const Context = require(`./db/strategies/base/contextStrategy`);
const MongoDB = require(`./db/strategies/mongodb/mongodb`);
const HeroiSchema = require(`./db/strategies/mongodb/schemas/heroisSchema`);


async function main() {
  const app = new Hapi.server({
    port: 5000,
    host: `localhost`
  });

  const connection = await MongoDB.connect();
  const context = new Context(new MongoDB(connection, HeroiSchema));
  await context.isConnected();
  app.route([
    {
      path: `/herois`,
      method: `GET`,
      handler: async (request, head) => {
        return await context.read();
      }
    }
  ])

  await app.start(); 
  console.log('Server running on %s', app.info.uri);


}

main();
