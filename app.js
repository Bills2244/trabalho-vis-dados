/* =========================================================
   Trabalho de Visualização de Dados — Redesign UFO Sightings
   Espera um CSV em data/ufo_dataset.csv com as colunas:
   posted, date, time, city, state, shape, duration, summary,
   images, img_link, lat, lng, population
   ========================================================= */

const tooltip = d3.select("#tooltip");

function showTooltip(html, event){
  tooltip
    .style("opacity", 1)
    .html(html)
    .style("left", (event.clientX + 14) + "px")
    .style("top", (event.clientY + 10) + "px");
}
function hideTooltip(){ tooltip.style("opacity", 0); }

d3.csv("data/ufo_dataset.csv", d3.autoType).then(raw => {

  // O campo "date" vem como MM/DD/AA (ex.: 03/05/23)
  const parseDate = d3.timeParse("%m/%d/%y");

  const data = raw.map(d => ({
    ...d,
    dateParsed: parseDate(d.date)
  })).filter(d => d.dateParsed);

  renderRedesignA(data);
  renderRedesignB(data);

}).catch(err => {
  console.error("Não foi possível carregar data/ufo_dataset.csv", err);
  d3.select("main").insert("p", ":first-child")
    .style("color", "#f2a14e")
    .style("padding", "0 24px")
    .text("Coloque o ficheiro ufo_dataset.csv dentro da pasta data/ para gerar os gráficos.");
});


/* =========================================================
   REDESIGN A — Série temporal real (d3.scaleTime)
   Corrige o eixo X distorcido do original: aqui a distância
   visual entre dois pontos é proporcional ao tempo real entre
   eles, e só desenhamos a linha onde há dados contínuos
   (2020 em diante), evitando a falsa tendência 1975–2010.
   ========================================================= */
function renderRedesignA(data){

  const cutoff = new Date(2020, 0, 1);
  const filtered = data.filter(d => d.dateParsed >= cutoff);

  // Agregação mensal — meses sem registo entram como 0,
  // garantindo que a escala de tempo não "esconda" lacunas.
  const monthStart = d3.timeMonth.floor(d3.min(filtered, d => d.dateParsed));
  const monthEnd = d3.timeMonth.floor(d3.max(filtered, d => d.dateParsed));
  const allMonths = d3.timeMonths(monthStart, d3.timeMonth.offset(monthEnd, 1));

  const counts = d3.rollup(filtered, v => v.length, d => +d3.timeMonth.floor(d.dateParsed));
  const series = allMonths.map(m => ({
    date: m,
    count: counts.get(+m) || 0
  }));

  const container = d3.select("#chart-a");
  container.select("svg").remove();

  const width = 900, height = 340;
  const margin = { top: 20, right: 30, bottom: 34, left: 46 };

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", height);

  const defs = svg.append("defs");
  const grad = defs.append("linearGradient")
    .attr("id", "areaGradientA")
    .attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1");
  grad.append("stop").attr("offset", "0%").attr("stop-color", "#5fb3e8").attr("stop-opacity", 0.5);
  grad.append("stop").attr("offset", "100%").attr("stop-color", "#5fb3e8").attr("stop-opacity", 0.02);

  const x = d3.scaleTime()
    .domain(d3.extent(series, d => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(series, d => d.count)]).nice()
    .range([height - margin.bottom, margin.top]);

  // gridlines horizontais
  svg.append("g")
    .selectAll("line")
    .data(y.ticks(5))
    .join("line")
    .attr("class", "gridline")
    .attr("x1", margin.left).attr("x2", width - margin.right)
    .attr("y1", d => y(d)).attr("y2", d => y(d));

  const area = d3.area()
    .x(d => x(d.date))
    .y0(y(0))
    .y1(d => y(d.count))
    .curve(d3.curveMonotoneX);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append("path").datum(series).attr("class", "area-path").attr("d", area);
  svg.append("path").datum(series).attr("class", "line-path").attr("d", line);

  // eixos — escala de tempo real, ticks anuais/mensais automáticos
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%b %y")));

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));

  svg.append("text")
    .attr("class", "axis")
    .attr("x", margin.left)
    .attr("y", 14)
    .style("fill", "#9aa1b1")
    .style("font-size", "12px")
    .text("Avistamentos reportados por mês");

  // pontos + tooltip
  svg.selectAll("circle.point-a")
    .data(series)
    .join("circle")
    .attr("class", "point-a")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.count))
    .attr("r", 3)
    .attr("fill", "#5fb3e8")
    .on("mousemove", (event, d) => showTooltip(
      `<b>${d3.timeFormat("%B %Y")(d.date)}</b><br>${d.count} avistamentos`, event))
    .on("mouseleave", hideTooltip);
}


/* =========================================================
   REDESIGN B — Mapa de pontos (d3.geoAlbersUsa)
   Usa lat/lng reais do dataset, algo completamente ignorado
   no gráfico original apesar de estar disponível no ficheiro.
   ========================================================= */
function renderRedesignB(data){

  const container = d3.select("#chart-b");
  container.select("svg").remove();

  const width = 900, height = 500;
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", height);

  const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1050);
  const path = d3.geoPath(projection);

  // Top 6 formatos ganham cor própria; o resto agrupa em "Outro"
  const topShapes = Array.from(
    d3.rollup(data, v => v.length, d => d.shape || "Desconhecido"),
    ([shape, count]) => ({ shape, count })
  ).sort((a, b) => d3.descending(a.count, b.count)).slice(0, 6).map(d => d.shape);

  const color = d3.scaleOrdinal()
    .domain([...topShapes, "Outro"])
    .range(["#5fb3e8", "#f2a14e", "#8dd6a7", "#e57373", "#b39ddb", "#f6c453", "#6b7182"]);

  function shapeGroup(s){ return topShapes.includes(s) ? s : "Outro"; }

  const geoDataUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

  d3.json(geoDataUrl).then(us => {
    const states = topojson.feature(us, us.objects.states).features;

    svg.append("g")
      .selectAll("path")
      .data(states)
      .join("path")
      .attr("class", "us-state")
      .attr("d", path);

    const points = data
      .filter(d => d.lat != null && d.lng != null)
      .map(d => ({ ...d, coords: projection([d.lng, d.lat]) }))
      .filter(d => d.coords);

    svg.append("g")
      .selectAll("circle")
      .data(points)
      .join("circle")
      .attr("class", "point")
      .attr("cx", d => d.coords[0])
      .attr("cy", d => d.coords[1])
      .attr("r", 2.2)
      .attr("fill", d => color(shapeGroup(d.shape)))
      .on("mousemove", (event, d) => showTooltip(
        `<b>${d.city || "?"}, ${d.state || "?"}</b><br>Formato: ${d.shape || "desconhecido"}<br>${d.date}`, event))
      .on("mouseleave", hideTooltip);

    // legenda
    const legend = d3.select("#legend-b").html("");
    [...topShapes, "Outro"].forEach(s => {
      const item = legend.append("div").attr("class", "legend-item");
      item.append("span").attr("class", "legend-swatch").style("background", color(s));
      item.append("span").text(s);
    });

  }).catch(err => {
    console.error("Não foi possível carregar a malha geográfica dos EUA.", err);
    container.append("p")
      .style("color", "#f2a14e")
      .style("font-size", "13px")
      .text("Falha ao carregar o contorno dos EUA (verifique a ligação à internet).");
  });
}