import { consulta } from "../db.js";
import { mostrarTooltip, esconderTooltip } from "../tooltip.js";

// redesign A do caso cowbell: gráfico de unidades, cada quadrado é uma música
export async function desenharCowbellA(conn){

  // todas as músicas dos artistas com 4 ou mais, com a posição de cada uma na linha
  const dados = await consulta(conn, `
    SELECT * FROM (
      SELECT artist, title,
             count(*) OVER (PARTITION BY artist)::INT AS total,
             row_number() OVER (PARTITION BY artist ORDER BY title)::INT AS pos
      FROM cowbell
    )
    WHERE total >= 4
    ORDER BY total DESC, artist, pos
  `);

  const artistas = [...new Set(dados.map(d => d.artist))];

  const tamanho = 22;
  const espaco = 4;
  const margem = { top: 10, right: 20, bottom: 10, left: 220 };
  const largura = 900;
  const altura = margem.top + artistas.length * (tamanho + espaco) + margem.bottom;

  const svg = d3.select("#chart-cowbell-a").append("svg")
    .attr("viewBox", `0 0 ${largura} ${altura}`)
    .attr("width", "100%");

  const y = d3.scaleBand()
    .domain(artistas)
    .range([margem.top, altura - margem.bottom])
    .paddingInner(espaco / (tamanho + espaco));

  // nome do artista
  svg.selectAll(".nome")
    .data(artistas)
    .join("text")
    .attr("class", "nome")
    .attr("x", margem.left - 10)
    .attr("y", d => y(d) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(d => d);

  // um quadrado por música
  svg.selectAll(".musica")
    .data(dados)
    .join("rect")
    .attr("class", "musica")
    .attr("x", d => margem.left + (d.pos - 1) * (tamanho + espaco))
    .attr("y", d => y(d.artist))
    .attr("width", tamanho)
    .attr("height", y.bandwidth())
    .attr("rx", 3)
    .on("mousemove", (event, d) => {
      mostrarTooltip("<b>" + d.artist + "</b><br>" + d.title, event);
    })
    .on("mouseleave", esconderTooltip);

  // total no fim da linha
  svg.selectAll(".total")
    .data(artistas)
    .join("text")
    .attr("class", "total")
    .attr("x", d => margem.left + dados.find(m => m.artist === d).total * (tamanho + espaco) + 6)
    .attr("y", d => y(d) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(d => dados.find(m => m.artist === d).total);
}
