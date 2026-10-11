const tooltip = d3.select("#tooltip");

export function mostrarTooltip(html, event){
  tooltip.style("opacity", 1)
    .html(html)
    .style("left", (event.clientX + 14) + "px")
    .style("top", (event.clientY + 10) + "px");
}

export function esconderTooltip(){
  tooltip.style("opacity", 0);
}
