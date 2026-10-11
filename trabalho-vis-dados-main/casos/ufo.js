import { carregarCsv } from "../db.js";

// caso 1: avistamentos de OVNI (NUFORC)
export async function carregarUfo(db, conn){
  await carregarCsv(db, "ufo_dataset.csv");

  // a data vem como mm/dd/aa, linhas com data inválida são removidas
  await conn.query(`
    CREATE TABLE ufo AS
    SELECT * FROM (
      SELECT *, try_strptime(date, '%m/%d/%y')::DATE AS d
      FROM read_csv('ufo_dataset.csv', header = true, all_varchar = true)
    ) WHERE d IS NOT NULL
  `);
}
