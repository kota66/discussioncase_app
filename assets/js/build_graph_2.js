eel.expose(js_function);
function js_function(python_links, python_nodes){
    //nodeのデータを作成
  var nodes = JSON.parse(python_nodes);
  // var range = nodes.length;

  //linkのデータを作成//
  var links = JSON.parse(python_links);
  // console.log(links)

  //メイン！D3.jsのforcesimulation
  //svg領域の大きさを定義する
  var svgheight = 1000,
      svgwidth = 960;

  var datatip = d3.select("#datatip");
  var sidedata = d3.select("#side_data");

  var svg = d3.select("svg");
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(function(d){return 50}))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(svgwidth / 2, svgheight / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

  // var simulation = d3.forceSimulation(nodes)
  //   .velocityDecay(0.3)                                                     //摩擦
  //   .force('charge', d3.forceManyBody())                                      //詳細設定は後で
  //   .force('link', d3.forceLink().id(function(d) { return d.id; }))          //詳細設定は後で
  //   .force('colllision',d3.forceCollide(40))                                 //nodeの衝突半径：Nodeの最大値と同じとする
  //   .force('positioningX',d3.forceX())                                        //詳細設定は後で
  //   .force('positioningY',d3.forceY())                                        //詳細設定は後で
  //   .force('center', d3.forceCenter(width / 2, height / 2));

//"svg"にZoomイベントを設定
  var zoom = d3.zoom()
  .scaleExtent([1/4,4])
  .on('zoom', SVGzoomed);

  svg.call(zoom);

  //"svg"上に"g"をappendしてdragイベントを設定
  var g = svg.append("g")
    .call(d3.drag()
    .on('drag',SVGdragged))

  function SVGzoomed() {
    g.attr("transform", d3.event.transform);
  }

  function SVGdragged(d) {
    d3.select(this).attr('cx', d.x = d3.event.x).attr('cy', d.y = d3.event.y);
      };

  //-------★追加-------
  //linkをsvg領域に描画する

  var link = g.append("g")  //svg⇒gに
              .attr("class", "links")
              .selectAll("line")
              .data(links)
              .enter().append("line")
              .attr("stroke","#999")  //輪郭線の色指定追加
              .attr("stroke-width", function(d) { return d.value })  //valueの値をそのまま使用
              .on('mouseover', function(){d3.select(this).attr('stroke', 'red');}) //カーソルが合ったら赤に
              .on('mouseout', function(){d3.select(this).attr('stroke', "#999");}) //カーソルが外れたら元の色に
              .call(d3.drag()　              //無いとエラーになる。。
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));


  //nodeの色を定義
  // var color = d3.scaleOrdinal(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3","#3366ff","#99ff66"]);
  //nodeをsvg領域に描画する
  var node = g.append("g")
              .attr('class', 'nodes')
              .selectAll('g')
              .data(nodes)
              .enter()
              .append('g')
              .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

  node.append('circle')
              .attr("class", "node")
              .attr("id", function(d){return d.id;})
              .attr("r", function(d){return d.r;})
              .attr("fill", "#66c2a5")
              .on('mouseover', function(d){
                  d3.select(this).attr('fill', 'red');  //カーソルが合ったら赤に
                  datatip
                          .style("visibility", "visible")
                          .style("left", d3.event.pageX + 20 + "px")
                          .style("top", d3.event.pageY + 20 + "px")

                  datatip
                          .select("h2")
                          .text(d.label);

                  datatip
                          .select("p")
                          .text('つながり');
              })
              // .on('mousemove', function(){
              //     datatip.style("left", d3.event.pageX + 20 + "px")
              //             .sytle("top", d3.event.pageY + 20 + "px")
              // })
              .on('mouseout', function(){
                d3.select(this).attr('fill', "#66c2a5");
                datatip.style("visibility", "hidden");
              }) //カーソルが外れたら元の色に
              .on('mousedown', set_sidedata)
              ;

  node.append('text')
              .attr('text-anochor', 'middle')
              .attr('fill', 'black')
              .style('pointer-event', 'none')
              .attr('font-size', function(d) {return '10px'; }  )
              .text(function(d) { return d.text; });



  //nodeをマウスドラッグで動かすための関数
  function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
  }
  function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
  }
  function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(.03);
      d.fx = null;
      d.fy = null;
  }

  //動作開始！
  simulation
      .nodes(nodes)
      .on("tick", ticked);
  simulation.force("link")
      .links(links);

  function ticked() {
      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')'});
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
  }
  function set_sidedata(d){
    sidedata.select("h3")
            .text(d.label)

    sidedata.select("#data_memo")
            .attr("srcdoc", function(){
              if (typeof d.tweets === "undefined"){
                return " <p style='font-size: 11px'></p>"
              }
              else {
                return "<p style='font-size: 11px'>" + d.tweets.replace(/¥n/g,"<br>") + "</p>"
              }
            })
    sidedata.select("#data_relation")
            .attr("srcdoc", function(){
              var r_value = "";
              var r_target = links.filter(function(item,index){if(item.source.id == d.id ) return true});
              console.log(r_target);
              var r_source = links.filter(function(item,index){if(item.target.id == d.id ) return true});
              console.log(r_source);
              for (var key in r_target) {
                r_value = r_value + "to: " + r_target[key].target.id + "<br>"
              }
              for (var key in r_source) {
                r_value = r_value + "from: " + r_source[key].source.id + "<br>"
              }
              return "<p style='font-size: 11px'>" + r_value + "</p>"
            })
  }
}
