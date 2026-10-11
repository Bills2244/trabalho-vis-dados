import { consulta } from "../db.js";
import { mostrarTooltip, esconderTooltip } from "../tooltip.js";

// redesign A do caso UFO: barras com os avistamentos de cada mês
export async function desenharUfoA(conn){

  // só jan/2022 a fev/2023 tem dados completos, meses sem relato ficam com 0
  const dados = await consulta(conn, `
    WITH meses AS (
      SELECT unnest(range(DATE '2022-01-01', DATE '2023-03-01', INTERVAL 1 MONTH))::DATE AS mes
    )
    SELECT strftime(m.mes, '%m/%Y') AS mes, count(u.d)::INT AS total
    FROM meses m
    LEFT JOIN ufo u ON date_trunc('month', u.d) = m.mes
    GROUP BY 1 ORDER BY min(m.mes)
  `);

  const fora = await consulta(conn, `
    SELECT count(*)::INT AS total FROM ufo
    WHERE d < DATE '2022-01-01' OR d >= DATE '2023-03-01'
  `);

  const largura = 900;
  const altura = 340;
  const margem = { top: 30, right: 20, bottom: 34, left: 46 };

  const svg = d3.select("#chart-ufo-a").append("svg")
    .attr("viewBox", `0 0 ${largura} ${altura}`)
    .attr("width", "100%");

  const x = d3.scaleBand()
    .domain(dados.map(d => d.mes))
    .range([margem.left, largura - margem.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dados, d => d.total)])
    .nice()
    .range([altura - margem.bottom, margem.top]);

  // linhas de grade
  svg.selectAll(".gridline")
    .data(y.ticks(5))
    .join("line")
    .attr("class", "gridline")
    .attr("x1", margem.left)
    .attr("x2", largura - margem.right)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d));

  svg.selectAll(".barra")
    .data(dados)
    .join("rect")
    .attr("class", "barra")
    .attr("x", d => x(d.mes))
    .attr("y", d => y(d.total))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.total))
    .attr("fill", "#5fb3e8")
    .on("mousemove", (event, d) => {
      mostrarTooltip("<b>" + d.mes + "</b><br>" + d.total + " avistamentos", event);
    })
    .on("mouseleave", esconderTooltip);

  svg.selectAll(".valor")
    .data(dados)
    .join("text")
    .attr("class", "valor")
    .attr("x", d => x(d.mes) + x.bandwidth() / 2)
    .attr("y", d => y(d.total) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.total);

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${altura - margem.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margem.left},0)`)
    .call(d3.axisLeft(y).ticks(5));

  svg.append("text")
    .attr("class", "chart-label")
    .attr("x", margem.left)
    .attr("y", 14)
    .text("Avistamentos por mês (" + fora[0].total + " relatos fora do período foram excluídos)");
}
