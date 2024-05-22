const assert = require(`assert`);
const PasswordHelper = require(`../helpers/passwordHelper`);

const SENHA = `Erick@123`;
const HASH = `$2b$10$uNKsDCxPQmcut.RuePrOh.GOVCPaW/wmjH4zV0cOjjM97W38d4UgW`;

describe(`UserHelper test suite`, async function () {
  it(`deve gerar um hash a partir de uma senha`, async () => {
    const result = await PasswordHelper.hashPassword(SENHA);
    assert.ok(result.length > 10);
  })
  it(`deve comparar uma senha e seu hash`, async () => {
    const result = await PasswordHelper.comparePassword(SENHA, HASH);
    assert.ok(result);
  })
})
