import { consulta } from "../db.js";
import { mostrarTooltip, esconderTooltip } from "../tooltip.js";

// redesign A do caso animais: todos os animais em barras com escala logarítmica
export async function desenharAnimalsA(conn){

  const dados = await consulta(conn, `
    SELECT animal, mortes, coalesce(minimo, false) AS minimo
    FROM animals
    ORDER BY mortes DESC
  `);

  const largura = 900;
  const alturaLinha = 24;
  const margem = { top: 30, right: 80, bottom: 10, left: 170 };
  const altura = margem.top + dados.length * alturaLinha + margem.bottom;

  const svg = d3.select("#chart-animals-a").append("svg")
    .attr("viewBox", `0 0 ${largura} ${altura}`)
    .attr("width", "100%");

  // escala log começando em 1 para os animais com poucas mortes também aparecerem
  const x = d3.scaleLog()
    .domain([1, 1000000])
    .range([margem.left, largura - margem.right]);

  const y = d3.scaleBand()
    .domain(dados.map(d => d.animal))
    .range([margem.top, altura - margem.bottom])
    .padding(0.2);

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${margem.top})`)
    .call(d3.axisTop(x).ticks(6, "~s").tickSize(-(altura - margem.top - margem.bottom)));

  svg.selectAll(".axis .tick line").attr("class", "gridline");

  svg.selectAll(".barra")
    .data(dados)
    .join("rect")
    .attr("class", "barra")
    .attr("x", x(1))
    .attr("y", d => y(d.animal))
    .attr("width", d => x(d.mortes) - x(1))
    .attr("height", y.bandwidth())
    .attr("fill", d => d.animal === "Humans" ? "#9aa1b1" : "#e57373")
    .attr("opacity", d => d.minimo ? 0.5 : 1)
    .on("mousemove", (event, d) => {
      mostrarTooltip("<b>" + d.animal + "</b><br>" + (d.minimo ? "mais de " : "") + d.mortes.toLocaleString("pt-BR") + " mortes por ano", event);
    })
    .on("mouseleave", esconderTooltip);

  svg.selectAll(".nome")
    .data(dados)
    .join("text")
    .attr("class", "nome")
    .attr("x", margem.left - 8)
    .attr("y", d => y(d.animal) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(d => d.animal);

  svg.selectAll(".valor")
    .data(dados)
    .join("text")
    .attr("class", "valor")
    .attr("x", d => x(d.mortes) + 6)
    .attr("y", d => y(d.animal) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(d => (d.minimo ? ">" : "") + d.mortes.toLocaleString("pt-BR"));
}
