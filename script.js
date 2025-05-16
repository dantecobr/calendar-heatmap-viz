function drawCalendar(data) {
  const container = document.getElementById("calendar");
  container.innerHTML = ""; // Clear previous draw

  const width = 1000;
  const height = 150;
  const cellSize = 17;

  const parseDate = d3.timeParse("%Y-%m-%d");

  // Transformar dados
  const parsedData = {};
  data.forEach(row => {
    const date = parseDate(row[0]);
    const value = +row[1];
    parsedData[date] = value;
  });

  const year = d3.timeYear(d3.min(Object.keys(parsedData).map(d => new Date(d))));

  const svg = d3.select("#calendar")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(40,20)");

  const color = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, d3.max(Object.values(parsedData))]);

  const days = d3.timeDays(d3.timeMonth.floor(year), d3.timeMonth.offset(year, 1));

  svg.selectAll(".day")
    .data(days)
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", d => d3.timeWeek.count(d3.timeMonth(d), d) * cellSize)
    .attr("y", d => d.getDay() * cellSize)
    .datum(d => d)
    .style("fill", d => parsedData[d] ? color(parsedData[d]) : "#eee")
    .append("title")
    .text(d => `${d.toISOString().split("T")[0]}: ${parsedData[d] || 0}`);
}

function drawViz(data, config) {
  const headers = data.fields.map(f => f.name);
  const rows = data.tables.DEFAULT.map(row => row.map(cell => cell.v));
  drawCalendar(rows);
}

// Looker Studio integration
google.visualization.data = {
  onDataChanged: function(dataResponse) {
    drawViz(dataResponse, {});
  }
};
