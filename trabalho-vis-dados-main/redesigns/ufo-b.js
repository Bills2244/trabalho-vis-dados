import { consulta } from "../db.js";
import { mostrarTooltip, esconderTooltip } from "../tooltip.js";

// redesign B do caso UFO: heatmap de avistamentos por dia da semana e hora do dia
export async function desenharUfoB(conn){

  // monta todas as combinações de dia (0 = domingo) e hora, as vazias ficam com 0
  const dados = await consulta(conn, `
    WITH dias AS (SELECT unnest(range(7)) AS dia),
         horas AS (SELECT unnest(range(24)) AS hora),
         contagem AS (
           SELECT dayofweek(d) AS dia, hour(strptime(time, '%H:%M:%S')) AS hora, count(*) AS total
           FROM ufo
           GROUP BY 1, 2
         )
    SELECT dias.dia::INT AS dia, horas.hora::INT AS hora, coalesce(c.total, 0)::INT AS total
    FROM dias
    CROSS JOIN horas
    LEFT JOIN contagem c ON c.dia = dias.dia AND c.hora = horas.hora
  `);

  const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const largura = 900;
  const altura = 300;
  const margem = { top: 10, right: 20, bottom: 40, left: 50 };

  const svg = d3.select("#chart-ufo-b").append("svg")
    .attr("viewBox", `0 0 ${largura} ${altura}`)
    .attr("width", "100%");

  const x = d3.scaleBand()
    .domain(d3.range(24))
    .range([margem.left, largura - margem.right])
    .padding(0.05);

  const y = d3.scaleBand()
    .domain(d3.range(7))
    .range([margem.top, altura - margem.bottom])
    .padding(0.05);

  // faixas fixas porque a maioria das células tem poucos relatos
  const cores = ["#1e2a38", "#2f4a68", "#4a729c", "#72a3cf", "#9fd8ff"];
  const limites = [2, 5, 10, 20];
  const nomesFaixas = ["0 a 1", "2 a 4", "5 a 9", "10 a 19", "20 ou mais"];
  const cor = d3.scaleThreshold()
    .domain(limites)
    .range(cores);

  svg.selectAll(".celula")
    .data(dados)
    .join("rect")
    .attr("class", "celula")
    .attr("x", d => x(d.hora))
    .attr("y", d => y(d.dia))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => cor(d.total))
    .on("mousemove", (event, d) => {
      mostrarTooltip("<b>" + nomesDias[d.dia] + ", " + d.hora + "h</b><br>" + d.total + " avistamentos", event);
    })
    .on("mouseleave", esconderTooltip);

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${altura - margem.bottom})`)
    .call(d3.axisBottom(x).tickFormat(h => h + "h"));

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margem.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d => nomesDias[d]));

  svg.append("text")
    .attr("class", "chart-label")
    .attr("x", largura / 2)
    .attr("y", altura - 6)
    .attr("text-anchor", "middle")
    .text("Hora do dia");

  // legenda
  const legenda = d3.select("#legend-ufo-b");
  cores.forEach((c, i) => {
    const item = legenda.append("div").attr("class", "legend-item");
    item.append("span").attr("class", "legend-swatch").style("background", c);
    item.append("span").text(nomesFaixas[i]);
  });
  legenda.append("span").text("avistamentos");
}
