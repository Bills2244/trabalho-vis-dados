import { consulta } from "../db.js";
import { mostrarTooltip, esconderTooltip } from "../tooltip.js";

// redesign B do caso animais: waffle com 100 quadrados, cada um é 1% das mortes
export async function desenharAnimalsB(conn){

  // humanos separados dos mamíferos e os grupos muito pequenos juntos em "Outros"
  const dados = await consulta(conn, `
    WITH grupos AS (
      SELECT CASE
               WHEN animal = 'Humans' THEN 'Humanos'
               WHEN tipo IN ('Inseto', 'Réptil', 'Mamífero', 'Molusco') THEN tipo
               ELSE 'Outros'
             END AS grupo,
             tipo, mortes
      FROM animals
    )
    SELECT grupo, sum(mortes)::INT AS total, string_agg(DISTINCT tipo, ', ') AS tipos,
           sum(mortes) * 100.0 / (SELECT sum(mortes) FROM animals) AS porcentagem
    FROM grupos
    GROUP BY grupo
    ORDER BY total DESC
  `);

  // arredonda as porcentagens para somarem exatamente 100 quadrados
  dados.forEach(d => d.quadrados = Math.floor(d.porcentagem));
  let faltam = 100 - d3.sum(dados, d => d.quadrados);
  const porResto = [...dados].sort((a, b) => (b.porcentagem % 1) - (a.porcentagem % 1));
  for (let i = 0; i < faltam; i++) porResto[i].quadrados++;

  const cores = {
    "Inseto": "#e57373",
    "Humanos": "#9aa1b1",
    "Réptil": "#f2a14e",
    "Mamífero": "#5fb3e8",
    "Molusco": "#8dd6a7",
    "Outros": "#b39ddb"
  };

  // lista com um item por quadrado, na ordem dos grupos
  const quadrados = [];
  dados.forEach(d => {
    for (let i = 0; i < d.quadrados; i++) quadrados.push(d);
  });

  const tamanho = 30;
  const espaco = 4;
  const largura = 900;
  const altura = 10 * (tamanho + espaco);

  const svg = d3.select("#chart-animals-b").append("svg")
    .attr("viewBox", `0 0 ${largura} ${altura}`)
    .attr("width", "100%");

  // preenche a grade por colunas, da esquerda para a direita
  svg.selectAll(".quadrado")
    .data(quadrados)
    .join("rect")
    .attr("class", "quadrado")
    .attr("x", (d, i) => Math.floor(i / 10) * (tamanho + espaco))
    .attr("y", (d, i) => (i % 10) * (tamanho + espaco))
    .attr("width", tamanho)
    .attr("height", tamanho)
    .attr("rx", 4)
    .attr("fill", d => cores[d.grupo])
    .on("mousemove", (event, d) => {
      let texto = "<b>" + d.grupo + "</b><br>" + d.total.toLocaleString("pt-BR") + " mortes por ano";
      if (d.grupo === "Outros") texto += "<br>" + d.tipos;
      mostrarTooltip(texto, event);
    })
    .on("mouseleave", esconderTooltip);

  // legenda ao lado da grade
  const xLegenda = 10 * (tamanho + espaco) + 40;

  const legenda = svg.selectAll(".item-legenda")
    .data(dados)
    .join("g")
    .attr("class", "item-legenda")
    .attr("transform", (d, i) => `translate(${xLegenda},${20 + i * 52})`);

  legenda.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", 3)
    .attr("fill", d => cores[d.grupo]);

  legenda.append("text")
    .attr("class", "legenda-nome")
    .attr("x", 30)
    .attr("y", 14)
    .text(d => d.grupo + " " + d.porcentagem.toFixed(1).replace(".", ",") + "%");

  legenda.append("text")
    .attr("class", "legenda-valor")
    .attr("x", 30)
    .attr("y", 34)
    .text(d => d.total.toLocaleString("pt-BR") + " mortes por ano");
}
