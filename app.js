import { iniciarDuckDB } from "./db.js";
import { carregarUfo } from "./casos/ufo.js";
import { carregarCowbell } from "./casos/cowbell.js";
import { carregarAnimals } from "./casos/animals.js";
import { desenharUfoA } from "./redesigns/ufo-a.js";
import { desenharUfoB } from "./redesigns/ufo-b.js";
import { desenharCowbellA } from "./redesigns/cowbell-a.js";
import { desenharCowbellB } from "./redesigns/cowbell-b.js";
import { desenharAnimalsA } from "./redesigns/animals-a.js";
import { desenharAnimalsB } from "./redesigns/animals-b.js";

async function main(){
  const db = await iniciarDuckDB();
  const conn = await db.connect();

  await carregarUfo(db, conn);
  await carregarCowbell(db, conn);
  await carregarAnimals(db, conn);

  await desenharUfoA(conn);
  await desenharUfoB(conn);
  await desenharCowbellA(conn);
  await desenharCowbellB(conn);
  await desenharAnimalsA(conn);
  await desenharAnimalsB(conn);
}

main().catch(erro => {
  console.error(erro);
  d3.select("main").insert("p", ":first-child")
    .style("color", "#f2a14e")
    .text("Erro ao carregar os dados. Abra a página por um servidor local (veja o README).");
});
