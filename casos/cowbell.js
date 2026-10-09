import { carregarCsv } from "../db.js";

// caso 2: músicas com cowbell
export async function carregarCowbell(db, conn){
  await carregarCsv(db, "cowbell.csv");

  // junta nomes escritos de jeitos diferentes (ex: B-52s e B’52s) e tira músicas repetidas
  await conn.query(`
    CREATE TABLE cowbell AS
    SELECT DISTINCT min(Artist) OVER (PARTITION BY chave) AS artist, Title AS title
    FROM (
      SELECT *, regexp_replace(regexp_replace(lower(Artist), '^the ', ''), '[^a-z0-9]', '', 'g') AS chave
      FROM read_csv('cowbell.csv', header = true, all_varchar = true)
    )
  `);
}
