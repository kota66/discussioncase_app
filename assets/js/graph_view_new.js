// 1. 描画用のデータ準備
var	width  = 450 ;
var	height = 300 ;
var graph_json = graph_data;
var	vbox_x = 0 ;
var	vbox_y = 0 ;
var vbox_default_width  = vbox_width  = width ;
var vbox_default_height = vbox_height = height ;

var	svg = d3.select("div#right-top-container").append("svg")
    .attr("width", width)
    .attr("height", height)
	.attr("viewBox", "" + vbox_x + " " + vbox_y + " " + vbox_width + " " + vbox_height) ;	// viewBox属性を付加var nodeNumber = 30;

var force_g = svg.append("g")

var linksData = graph_json['links'];
var nodesData = graph_json['nodes'];
console.log(linksData);

// 2. svg要素を配置
var link = force_g.selectAll(".link")
  .data(linksData)
  .enter()
  .append("line")
	.attr("class", "link")
  .attr("stroke-width", 1)
  .attr("stroke", "black");

var node = force_g.selectAll(".node")
  .data(nodesData)
  .enter().append("g")
  .attr("class", "node")

node.append("circle")
	.attr("r", 5)
	.style("fill", "#99CCFF")
	.style("stroke", "#FFF")
	.style("stroke-width", 3)
	.attr("fill-opacity", "#99CCFF")

node.append("text")
	.text(function(d) { return d.id })
	.style("fill", "blue" )
	.style("font-family", "Arial")
	.style("font-size", 12 )
	.style("font-weight", "normal" )
	.attr("fill-opacity", 0.8)
	.attr("text-anchor", "middle") ;


// 3. forceSimulation設定
var simulation = d3.forceSimulation()
  .force("link",
    d3.forceLink()
    .distance(100)
    .strength(0.03)
    .iterations(16))
  .force("collide",
    d3.forceCollide()
    .radius(10)
    .strength(0.7)
    .iterations(16))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("x", d3.forceX().strength(0.02).x(width / 2))
  .force("y", d3.forceY().strength(0.02).y(height / 2));

simulation
  .nodes(nodesData)
  .on("tick", ticked);

simulation.force("link")
  .links(linksData)
  // .id(function(d) { return d.i; });


// 4. forceSimulation 描画更新用関数
function ticked() {
  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
  node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}

// 5. ドラッグ時のイベント関数
function dragstarted(d) {
  if(!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if(!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
