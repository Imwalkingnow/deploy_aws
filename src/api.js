// npm i hapi
// npm i vision inert hapi-swagger
// npm i hapi-auth-jwt2

const { config } = require(`dotenv`);
const { join } = require(`path`);
const { ok } = require(`assert`);

const env = process.env.NODE_ENV || `dev`;
console.log(`env`, env);
ok(env === `prod` || env === `dev`, `a env é invalida, ou dev ou prod`);

const configPath = join(__dirname, `../`, `./config`, `.env.${env}`);
console.log(`configPath`, configPath);
config({
  path: configPath
});

console.log(`MONGO`, process.env.MONGODB_URL);

const Hapi = require(`@hapi/hapi`);
const Context = require(`./db/strategies/base/contextStrategy`);
const MongoDB = require(`./db/strategies/mongodb/mongodb`);
const HeroiSchema = require(`./db/strategies/mongodb/schemas/heroisSchema`);
const HeroRoute = require(`./routes/heroRoutes`);
const AuthRoute = require(`./routes/authRoutes`);
const Postgres = require(`./db/strategies/postgres/postgres`);
const UsuarioSchema = require(`./db/strategies/postgres/schemas/usuarioSchema`);
const Joi = require(`joi`);
const HapiSwagger = require(`hapi-swagger`);
const Vision = require(`@hapi/vision`);
const Inert = require(`@hapi/inert`);
const HapiJwt = require(`hapi-auth-jwt2`);
const JWT_SECRET = process.env.JWT_KEY;

function mapRoutes(instance, methods) {
  // o methods vai pegar a lista de nome dos metodos da classe (no caso HeroRoute)
  // ----------> [`list`, `create`, `update`]
  // aqui seria a instancia da class (HeroRoute) e podemos chamar os metodos pela lista
  // ----------> new HeroRoute()[`list`]()
  // que seria a mesma coisa de fazer isso
  // ----------> new HeroRoute().list()

  return methods.map(method => instance[method]());

  // new HeroRoute().list();
  // ah é o heroRoute? é, qual o metodo? é o list, entao vou executar ele ().
  // a ideia ai é que independente da instancia que vc passar, da rota se for de heroi, de alunos...
  // independente dos metodos, se tem um listar com nome diferente ou coisa do tipo, vc consegue
  // pegar todos os metodos dinamicamente, fazer esse contexto rodar em diferentes rotas/bancos/contextos.

}

async function main() {

  const app = new Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST
  });

  try {
    const connection = await MongoDB.connect();
    const context = new Context(new MongoDB(connection, HeroiSchema));
    await context.isConnected();

    const connectionPostgres = await Postgres.connect();
    const usuarioSchema = await Postgres.defineModel(connectionPostgres, UsuarioSchema);
    const contextPostgres = new Context(new Postgres(connectionPostgres, usuarioSchema));

    await app.validator(Joi);

    const swaggerOptions = {
      info: {
        title: `API Herois - #CursoNodeBR`,
        version: `v1.0`,
      }
    };

    await app.register([
      HapiJwt,
      Vision,
      Inert,
      {
        plugin: HapiSwagger,
        options: swaggerOptions
      }
    ]);
    await app.auth.strategy(`jwt`, `jwt`, {
      key: JWT_SECRET,
      // options: {
      //  expiresIn: 20
      // },
      validate: async (dado, request) => {
        const [result] = await contextPostgres.read({
          username: dado.username.toLowerCase()
        })
        if(!result) {
          return {
            isValid: false
          }
        }
        // verifica no banco se usuario continua ativo
        // verifica no banco se o usuario continua pagando
        return {
          isValid: true // caso nao valido - false
        }
      }
    });

    await app.auth.default(`jwt`);

    app.route([
      ...mapRoutes(new HeroRoute(context), HeroRoute.methods()),
      ...mapRoutes(new AuthRoute(JWT_SECRET, contextPostgres), AuthRoute.methods())
    ]);

    await app.start();
    console.log('Server running on %s', app.info.uri);

  } catch (error) {
    console.error('Failed to start server:', error);
  }

  return app;

}


module.exports = main();
