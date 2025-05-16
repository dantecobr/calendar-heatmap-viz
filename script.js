// Importa dados do Looker Studio via dscc
dscc.subscribeToData(function (dataResponse) {
  const rows = dataResponse.tables.DEFAULT;
  if (!rows || rows.length === 0) return;

  const dateDimensionId = Object.keys(rows[0]).find(key => rows[0][key].hasOwnProperty("formatted"));
  const metricId = Object.keys(rows[0]).find(key => rows[0][key].hasOwnProperty("value"));

  const rawData = rows.map(row => [
    row[dateDimensionId].formatted,
    row[metricId].value
  ]);

  drawCalendar(rawData);
}, { transform: dscc.tableTransform });

function drawCalendar(data) {
  const container = document.getElementById("calendar");
  container.innerHTML = "";

  const width = 1000;
  const height = 150;
  const cellSize = 17;

  const parseDate = d3.timeParse("%Y-%m-%d");
  const formatDate = d3.timeFormat("%Y-%m-%d");

  const parsedData = {};
  data.forEach(row => {
    const date = parseDate(row[0]);
    const value = +row[1];
    if (date) parsedData[formatDate(date)] = value;
  });

  const dates = Object.keys(parsedData).map(d => new Date(d));
  const startDate = d3.min(dates);
  const endDate = d3.max(dates);
  const years = d3.timeYear.range(d3.timeYear.floor(startDate), d3.timeYear.offset(endDate, 1));

  const colorScale = d3.scaleThreshold()
    .domain([1, 10, 25, 50, 100])
    .range(["#161917", "#70160e", "#9e0004", "#b9030f", "#e1e3db"]);

  years.forEach(year => {
    const svg = d3.select("#calendar")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(40,20)");

    const days = d3.timeDays(new Date(year, 0, 1), new Date(year + 1, 0, 1));

    svg.append("text")
      .attr("x", 0)
      .attr("y", -5)
      .text(year.getFullYear())
      .style("fill", "#e1e3db")
      .style("font-weight", "bold");

    svg.selectAll(".day")
      .data(days)
      .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
      .attr("y", d => d.getDay() * cellSize)
      .datum(d => formatDate(d))
      .style("fill", d => parsedData[d] ? colorScale(parsedData[d]) : "#161917")
      .append("title")
      .text(d => `${d}: ${parsedData[d] || 0}`);
  });
}
