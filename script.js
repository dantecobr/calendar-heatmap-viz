dscc.subscribeToData(function (dataResponse) {
  const rows = dataResponse.tables.DEFAULT;
  if (!rows || rows.length === 0) return;

  const dateKey = Object.keys(rows[0]).find(k => rows[0][k].formatted);
  const metricKey = Object.keys(rows[0]).find(k => rows[0][k].value !== undefined);

  const data = rows.map(row => [
    row[dateKey].formatted,
    row[metricKey].value
  ]);

  drawCalendar(data);
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
  data.forEach(([dateStr, value]) => {
    const date = parseDate(dateStr);
    if (date) parsedData[formatDate(date)] = +value;
  });

  const dates = Object.keys(parsedData).map(d => new Date(d));
  const start = d3.min(dates);
  const end = d3.max(dates);
  const years = d3.timeYear.range(d3.timeYear.floor(start), d3.timeYear.offset(end, 1));

  const color = d3.scaleThreshold()
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
      .attr("x", d => d3.timeWeek.count(d3.timeYear(d
