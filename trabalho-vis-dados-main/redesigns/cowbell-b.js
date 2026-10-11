import { consulta } from "../db.js";
import { mostrarTooltip, esconderTooltip } from "../tooltip.js";

// redesign B do caso cowbell: histograma de quantas músicas cada artista tem
export async function desenharCowbellB(conn){

  const dados = await consulta(conn, `
    SELECT musicas::INT AS musicas, count(*)::INT AS artistas
    FROM (SELECT artist, count(*) AS musicas FROM cowbell GROUP BY artist)
    GROUP BY musicas
    ORDER BY musicas
  `);

  const totalArtistas = d3.sum(dados, d => d.artistas);
  const comUma = dados[0].artistas;
  const porcentagem = Math.round(comUma / totalArtistas * 100);

  const largura = 900;
  const altura = 360;
  const margem = { top: 40, right: 30, bottom: 44, left: 50 };

  const svg = d3.select("#chart-cowbell-b").append("svg")
    .attr("viewBox", `0 0 ${largura} ${altura}`)
    .attr("width", "100%");

  const x = d3.scaleBand()
    .domain(dados.map(d => d.musicas))
    .range([margem.left, largura - margem.right])
    .padding(0.15);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dados, d => d.artistas)])
    .nice()
    .range([altura - margem.bottom, margem.top]);

  svg.selectAll(".gridline")
    .data(y.ticks(5))
    .join("line")
    .attr("class", "gridline")
    .attr("x1", margem.left)
    .attr("x2", largura - margem.right)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d));

  // barras com 4 ou mais músicas ficam em laranja (parte que o original mostra)
  svg.selectAll(".barra")
    .data(dados)
    .join("rect")
    .attr("class", "barra")
    .attr("x", d => x(d.musicas))
    .attr("y", d => y(d.artistas))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.artistas))
    .attr("fill", d => d.musicas >= 4 ? "#f2a14e" : "#5fb3e8")
    .on("mousemove", (event, d) => {
      mostrarTooltip(d.artistas + " artistas com " + d.musicas + " música(s)", event);
    })
    .on("mouseleave", esconderTooltip);

  svg.selectAll(".valor")
    .data(dados)
    .join("text")
    .attr("class", "valor")
    .attr("x", d => x(d.musicas) + x.bandwidth() / 2)
    .attr("y", d => y(d.artistas) - 6)
    .attr("text-anchor", "middle")
    .text(d => d.artistas);

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
    .attr("x", largura / 2)
    .attr("y", altura - 8)
    .attr("text-anchor", "middle")
    .text("Número de músicas com cowbell");

  svg.append("text")
    .attr("class", "chart-label")
    .attr("x", margem.left)
    .attr("y", 16)
    .text(comUma + " de " + totalArtistas + " artistas (" + porcentagem + "%) têm só uma música com cowbell");
}
