import { carregarCsv } from "../db.js";

// caso 3: animais que mais matam humanos por ano
export async function carregarAnimals(db, conn){
  await carregarCsv(db, "animals.csv");

  // traduz o tipo do animal e marca as estimativas que são valor mínimo (">")
  await conn.query(`
    CREATE TABLE animals AS
    SELECT Animal AS animal,
           CASE Animal_Type
             WHEN 'Insect' THEN 'Inseto'
             WHEN 'Mammal' THEN 'Mamífero'
             WHEN 'Reptile' THEN 'Réptil'
             WHEN 'Mollusc' THEN 'Molusco'
             WHEN 'Nematode' THEN 'Nematódeo'
             WHEN 'Arachnid' THEN 'Aracnídeo'
             WHEN 'Flatworm' THEN 'Platelminto'
             WHEN 'Cnidarian' THEN 'Cnidário'
             WHEN 'Fish' THEN 'Peixe'
           END AS tipo,
           "Number of humans killed per year"::INT AS mortes,
           Estimate_Qualifier = '>' AS minimo
    FROM read_csv('animals.csv', header = true, all_varchar = true)
  `);
}
