let width = 1000, height = 400;

let svg = d3.select("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 " + width + " " + height)

sgmap = "https://chi-loong.github.io/CSC3007/assignments/sgmap.json"
pop2021 = "https://chi-loong.github.io/CSC3007/assignments/population2021.csv"
Promise.all([d3.json(sgmap), d3.csv(pop2021)]).then(data => {

    // Merge json
    res = data[0].features.map(x => Object.assign(x, data[1].find(y => y.Subzone.toUpperCase() == x.properties.Name.toUpperCase())));

    // Cleaning undefined
    res.forEach(e => { if (!('Population' in e)) e['Population'] = '-' });

    // Colors
    var domain = [0, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

    var colorScale = d3.scaleThreshold()
        .domain(domain)
        .range(d3.schemeBuPu[9]);

    // Map and projection
    var projection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([[20, 20], [width, height]], data[0]);

    let geopath = d3.geoPath().projection(projection);

    // SVG map
    svg.append("g")
        .attr("id", "districts")
        .attr("class", "countries")
        .selectAll("path")
        .data(res)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", d => {
            return colorScale(d.Population);
        })
        .on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .text(`Subdistrict: ${d.properties.Name}\nPopulation: ${d.Population}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .style("visibility", "visible");;
            d3.select(event.currentTarget)
                .classed("country selected", true);
        })
        .on("mouseout", (event, d) => {
            d3.select(".tooltip")
                .text("")
                .style("visibility", "hidden");;
            d3.select(event.currentTarget)
                .classed("country selected", false);
        });;

    // Legend
    let legend_height = 35;
    var legend = d3.select("#box").append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 " + width + " " + legend_height)
        .append("g")
        .attr("id", "legend");

    var legenditem = legend.selectAll(".legenditem")
        .data(d3.range(domain.length))
        .enter()
        .append("g")
        .attr("class", "legenditem")
        .attr("transform", function (d, i) { return "translate(" + i * 40 + ",0)"; });

    legenditem.append("rect")
        .attr("x", width - 350)
        .attr("y", legend_height - 10)
        .attr("width", 40)
        .attr("height", 8)
        .style("fill", function (d, i) { return colorScale(domain[i]); });

    legenditem.append("text")
        .attr("x", width - 350)
        .attr("y", legend_height - 15)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-family", "Helvetica, sans-serif")
        .text(function (d, i) { return domain[i]; });

    var zoom = d3.zoom()
        .scaleExtent([1, 5])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', handleZoom);
    d3.select('svg')
        .call(zoom);

    function handleZoom(e) {
        d3.select('svg g')
            .attr('transform', e.transform);
    }
});
