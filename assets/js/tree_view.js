


var colors = ['#4682b4', '#008000', '#ffff00', '#e66767', '#cc661d', '#9370db', '#a0522d']
var	all_root = "" ;
for ( var i = 0 ; i < tree_data.length ; i ++ )
{
  all_root += '<div class="twitter__block" id="twitter_block" style="background-color: #ffffff;">'
              + '<figure>'
              + '<img src="image/user_icon.png" />'
              + '</figure>'
              + '<div class="twitter__block-text">'
              + '<div class="name">'
              + tree_data[i].user
              + '<span class="name_reply"></span></div>'
              + '<div class="date">'
              + tree_data[i].time
              + '</div>'
              + '<div class="text">'
              + tree_data[i].name
              + '<br>'
              + '</div>'
              + '<div class="twitter__icon">'
              + '<span class="twitter-bubble"></span>'
              + '<span class="twitter-loop">'
              + tree_data[i].retweet
              + '</span>'
              + '<span class="twitter-heart">'
              + tree_data[i].favorite
              + '</span>'
              + '<span>'
              + '<button class="forcus-button" type="button" onclick="root_click('
              + String(i)
              + ', tree_g)">select</button>'
              + '</span>'
              + '</div>'
              + '</div>'
              + '</div>' ;
}


roots_html = new Array();
data = ""
for ( var i = 0 ; i < 10 ; i ++){
  roots_html.push(data)
}
for ( var i = 0 ; i < tree_data.length ; i ++){
  for (var j = 0 ; j < tree_data[i].claster.length ; j ++){
    var a = '<div class="twitter__block" id="twitter_block" style="background-color: #ffffff;">'
                + '<figure>'
                + '<img src="image/user_icon.png" />'
                + '</figure>'
                + '<div class="twitter__block-text">'
                + '<div class="name">'
                + tree_data[i].user
                + '<span class="name_reply"></span></div>'
                + '<div class="date">'
                + tree_data[i].time
                + '</div>'
                + '<div class="text">'
                + tree_data[i].name
                + '<br>'
                + '</div>'
                + '<div class="twitter__icon">'
                + '<span class="twitter-bubble"></span>'
                + '<span class="twitter-loop">'
                + tree_data[i].retweet
                + '</span>'
                + '<span class="twitter-heart">'
                + tree_data[i].favorite
                + '</span>'
                + '<span>'
                + '<button class="forcus-button" type="button" onclick="root_click('
                + String(i)
                + ', tree_g)">select</button>'
                + '</span>'
                + '</div>'
                + '</div>'
                + '</div>' ;

    var index = tree_data[i].claster[j];
    roots_html[index] += a;
    a = ""
  }
}

roots_html = roots_html.filter(item => item != '');

var tab = '<li class="tab-menu__item"><span class="tab-trigger js-tab-trigger tab0 is-active" data-id="tab00">all</span></li>';

var twitter_wrapper = '<div class="twitter__container">'
                + '<div class="twitter__title">'
                + '<span class="twitter-logo"></span>'
                + '</div>'
                + '<div class="twitter__contents scroll">'
                + '<div class="root_wrapper" id="root0">'
                + '<div class="twitter__block" id="twitter_block">'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>';

var tab_content = '<div class="tab-content__item js-tab-target is-active" id="tab00">'
                + twitter_wrapper
                + '</div>'

for (var i = 0 ; i < roots_html.length ; i ++){
    var j = i+1
    tab += '<li class="tab-menu__item"><span class="tab-trigger js-tab-trigger tab'
          + String(j)
          + '" data-id="tab0'
          + String(j)
          + '">'
          + String(j)
          + '</span></li>'

    twitter_wrapper = '<div class="twitter__container">'
                    + '<div class="twitter__title">'
                    + '<span class="twitter-logo"></span>'
                    + '</div>'
                    + '<div class="twitter__contents scroll">'
                    + '<div class="root_wrapper" id="root'
                    + String(j)
                    + '">'
                    + '<div class="twitter__block" id="twitter_block">'
                    + '</div>'
                    + '</div>'
                    + '</div>'
                    + '</div>';

      tab_content += '<div class="tab-content__item js-tab-target" id="tab0'
          + String(j)
          + '">'
          + twitter_wrapper
          + '</div>'
}

tab += '<li class="tab-menu__item"><span class="tab-trigger js-tab-trigger n-view" data-id="n-view">tweet_view</span></li>'
twitter_wrapper = '<div class="twitter__container">'
                + '<div class="twitter__title">'
                + '<span class="twitter-logo"></span>'
                + '</div>'
                + '<div class="twitter__contents scroll">'
                + '<div class="root_wrapper" id="view_tweet">'
                + '</div>'
                + '</div>'
                + '</div>';

tab_content += '<div class="tab-content__item js-tab-target" id="n-view">'
    + twitter_wrapper
    + '</div>';

function tweet_data_insert( time, text, no, user, favorite, retweet, tweet_id, flag ){

  if (flag == true){
    if ( no == 0 ){
      var tweet_html = '<div class="twitter__block" id="twitter_block" style="background-color: #f4ffff;">'
                  + '<figure>'
                  + '<img src="image/user_icon.png" />'
                  + '</figure>'
                  + '<div class="twitter__block-text">'
                  + '<div class="name">'
                  + user
                  + '<span class="name_reply"></span></div>'
                  + '<div class="date">'
                  + time
                  + '</div>'
                  + '<div class="text">'
                  + text
                  + '<br>'
                  + '</div>'
                  + '<div class="twitter__icon">'
                  + '<span class="twitter-bubble"></span>'
                  + '<span class="twitter-loop">'
                  + retweet
                  + '</span>'
                  + '<span class="twitter-heart">'
                  + favorite
                  + '</span>'
                  + '<span>'
                  + '<button class="forcus-button" type="button" onclick="discussionPoint('
                  + String(tweet_id)
                  + ')">focus</button>'
                  + '</span>'
                  + '<span class="flag-item"><div class="flag is-active" id='
                  + String(tweet_id)
                  + ' onclick="flagClick(this);accumulTweet(this)"><i class="fas fa-flag"></i></div></span>'
                  + '</div>'
                  + '</div>'
                  + '</div>' ;
    }
    else {
      var tweet_html = '<div class="twitter__block" id="twitter_block"???style="background-color: #FFFFFF;">'
                  + '<div class="twitter__block-text">'
                  + '<div class="name">'
                  + user
                  + '<span class="name_reply"></span></div>'
                  + '<div class="date">'
                  + time
                  + '</div>'
                  + '<div class="text">'
                  + text
                  + '<br>'
                  + '</div>'
                  + '<div class="twitter__icon">'
                  + '<span class="twitter-bubble"></span>'
                  + '<span class="twitter-loop">'
                  + retweet
                  + '</span>'
                  + '<span class="twitter-heart">'
                  + favorite
                  + '</span>'
                  + '<span>'
                  + '<button class="forcus-button" type="button" onclick="discussionPoint('
                  + String(tweet_id)
                  + ')">focus</button>'
                  + '</span>'
                  + '<span class="flag-item"><div class="flag is-active" id='
                  + String(tweet_id)
                  + ' onclick="flagClick(this);accumulTweet(this)"><i class="fas fa-flag"></i></div></span>'
                  + '</div>'
                  + '</div>'
                  + '</div>' ;
    } ;
  }else{
    if ( no == 0 ){
      var tweet_html = '<div class="twitter__block" id="twitter_block" style="background-color: #f4ffff;">'
                  + '<figure>'
                  + '<img src="image/user_icon.png" />'
                  + '</figure>'
                  + '<div class="twitter__block-text">'
                  + '<div class="name">'
                  + user
                  + '<span class="name_reply"></span></div>'
                  + '<div class="date">'
                  + time
                  + '</div>'
                  + '<div class="text">'
                  + text
                  + '<br>'
                  + '</div>'
                  + '<div class="twitter__icon">'
                  + '<span class="twitter-bubble"></span>'
                  + '<span class="twitter-loop">'
                  + retweet
                  + '</span>'
                  + '<span class="twitter-heart">'
                  + favorite
                  + '</span>'
                  + '<span>'
                  + '<button class="forcus-button" type="button" onclick="discussionPoint('
                  + String(tweet_id)
                  + ')">focus</button>'
                  + '</span>'
                  + '<span class="flag-item"><div class="flag" id='
                  + String(tweet_id)
                  + ' onclick="flagClick(this);accumulTweet(this)"><i class="fas fa-flag"></i></div></span>'
                  + '</div>'
                  + '</div>'
                  + '</div>' ;
    }
    else {
      var tweet_html = '<div class="twitter__block" id="twitter_block"???style="background-color: #FFFFFF;">'
                  + '<div class="twitter__block-text">'
                  + '<div class="name">'
                  + user
                  + '<span class="name_reply"></span></div>'
                  + '<div class="date">'
                  + time
                  + '</div>'
                  + '<div class="text">'
                  + text
                  + '<br>'
                  + '</div>'
                  + '<div class="twitter__icon">'
                  + '<span class="twitter-bubble"></span>'
                  + '<span class="twitter-loop">'
                  + retweet
                  + '</span>'
                  + '<span class="twitter-heart">'
                  + favorite
                  + '</span>'
                  + '<span>'
                  + '<button class="forcus-button" type="button" onclick="discussionPoint('
                  + String(tweet_id)
                  + ')">focus</button>'
                  + '</span>'
                  + '<span class="flag-item"><div class="flag" id='
                  + String(tweet_id)
                  + ' onclick="flagClick(this);accumulTweet(this)"><i class="fas fa-flag"></i></div></span>'
                  + '</div>'
                  + '</div>'
                  + '</div>' ;
    } ;
  }
  // tweet????????????


    return tweet_html
};

function make_g(){
  d3.select("div#center-container").select("svg").remove();
  var tree_zoom=d3.zoom()
    .scaleExtent([0, 3])
    .on("zoom", tree_zoomed);

  const height = 800;
  const width = 1000;
  var	vbox_x = 0 ;
  var	vbox_y = 0 ;
  var vbox_width  = width ;
  var vbox_height = height ;
  var	tree_svg = d3.select("div#center-container").append("svg")
      .attr("width", width)
      .attr("height", height)
    .attr("viewBox", "" + vbox_x + " " + vbox_y + " " + vbox_width + " " + vbox_height) ;	// viewBox???????????????


  // ????????????????????????
  var tree_g = tree_svg.append("g");

  tree_g.call(tree_zoom);

  return tree_g;
};

function root_click(i){
  d3.selectAll("circle").classed("n_selected", true)
  d3.selectAll("#g_text").classed("n_selected", true)
  d3.selectAll("line").classed("n_selected", true);

  tree_g = make_g()
  make_tree(i, tree_data, tree_g);

  var tree_d = d3.selectAll("rect").data();
  var node_array = new Array();
  d3.selectAll("circle")
          .filter(function(v,i){
            for (var i = 0 ; i < tree_d.length ; i ++){
               if (tree_d[i].data.name.indexOf(v.name) != -1){
                 node_array.push(v.name);
                 return true
               }
            }
          }).classed("n_selected", false)

  d3.selectAll('#g_text')
			.filter(function(v, i){
        for (var i = 0 ; i < tree_d.length ; i ++){
           if (tree_d[i].data.name.indexOf(v.name) == -1){
             return true
           }
        }
			}).classed("n_selected", true);

  d3.selectAll("#g_text")
          .filter(function(v, i){
            for (var i = 0 ; i < tree_d.length ; i ++){
               if (tree_d[i].data.name.indexOf(v.name) != -1){
                 return true
               }
            }
          }).classed("n_selected", false)
  d3.selectAll("line")
  		.filter(function(v, i){
        for (var i = 0 ; i < node_array.length ; i ++){
          for (var j = 0 ; j < node_array.length ; j ++){
            if(node_array[i] == v.source.name && node_array[j] == v.target.name){
      				return true;
      				}
            if(node_array[j] == v.source.name && node_array[i] == v.target.name){
      				return true;
      				}
          }
        }
  		}).classed("n_selected", false);

}

// ??????????????????
function make_tree(i, tree_data, tree_g){

  // ?????????????????????????????????????????????
  const rectSize = {
    height: 20,
    width: 80,
  };

  // ?????????????????????????????????
  const basicSpace = {
    padding: 30,
    height: 50,
    width: 240,
  };

  const sampleData = tree_data[i];
  // ???????????????????????????
  const root = d3.hierarchy(sampleData);
  const tree = d3.tree();
  // tree???????????????????????????x, y??????????????????????????????????????????
  tree(root);
  // ????????????????????????????????????????????????????????????????????????"value"???????????????????????????????????????????????????
  root.count();

  leaves = root.leaves();


  // ????????????name???????????????????????????????????????parent??????
  const seekParent = (currentData, name) => {
    // ?????????????????????????????????????????????????????????????????????????????????????????????????????????
    const crntHrcy = currentData.parent.children;
    // ??????????????????????????????????????????name??????????????????????????????????????????????????????
    const target = crntHrcy.find((contents) => contents.data.name == name);
    // ??????????????????????????????name?????????????????????
    // ?????????????????????????????????????????????????????????????????????????????????????????????????????????
    return target ? { name: name, hierarchy: crntHrcy } : seekParent(currentData.parent, name);
  };

  // ???????????????????????????????????????????????????????????????????????????
  const calcLeaves = (names, currentData) => {
    // ??????????????????????????????????????????????????????name????????????JSON??????
    const eachHierarchies = names.map((name) => seekParent(currentData, name));
    // ??????????????????????????????????????????name??????????????????????????????????????????
    const eachIdxes = eachHierarchies.map((item) =>
      item.hierarchy.findIndex((contents) => contents.data.name == item.name)
    );
    // ????????????????????????????????????????????????????????????????????????????????????????????????
    const filteredHierarchies = eachHierarchies.map((item, idx) =>
      item.hierarchy.slice(0, eachIdxes[idx])
    );
    // ????????????????????????????????????value?????????
    const values = filteredHierarchies.map((hierarchy) => hierarchy.map((item) => item.value));
    // ?????????????????????
    return values.flat();
  };

  // y???????????????
  const defineY = (data, spaceInfo) => {
    // ??????????????????????????????????????????????????????????????????
    const ancestorValues = data.ancestors().map((item) => item.data.name);
    // ???????????????????????????????????????????????????????????????????????????
    const leaves = calcLeaves(ancestorValues.slice(0, ancestorValues.length - 1), data);
    // ????????????????????????
    const sumLeaves = leaves.reduce((previous, current) => previous + current, 0);
    // y??????????????? ????????????????????? * ???????????????????????????????????? + ????????????
    return sumLeaves * spaceInfo.height + spaceInfo.padding;
  };

  // ????????????
  const definePos = (treeData, spaceInfo) => {
    treeData.each((d) => {
      // x????????? ?????? * ?????????????????? + ???????????????
      d.x = d.depth * spaceInfo.width + spaceInfo.padding;
      d.y = defineY(d, spaceInfo);
    });
  };
  definePos(root, basicSpace);

  // text?????????????????????
  const splitByLength = (treeData, length) => {
      treeData.each((d) => {
        var resultArr = [];
        var str = d.data.name;
        if (!str || !length || length < 1) {
          resultArr[0] = str
          d.data.name_array = resultArr;
        }else{
          var index = 0;
          var start = index;
          var end = start + length;
          while (start < str.length) {
            resultArr[index] = str.substring(start, end);
            index++;
            start = end;
            end = start + length;
            d.data.name_array = resultArr;
        }
      }})
  };

  splitByLength(root, 22);

  // ???????????????
  function leftLinebreak(d){
    let string = "";
    array = d.data.name_array;
    if (array.length > 1) {
      array.forEach((t, i) =>{
        string += `<tspan y="${i}em" x="0em">${t}</tspan>`;
      })

    }
    else{
      n = d.data.name_array;
      string = `<tspan y="0em" x="0em">${n}</tspan>`;
    }
    return string;
  };

  // path???????????????
  tree_g.selectAll(".link")
    .data(root.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("d", (d) =>
      `M${d.x},${d.y}
      L${d.parent.x + rectSize.width + (basicSpace.width - rectSize.width) / 2},${d.y}
      ${d.parent.x + rectSize.width + (basicSpace.width - rectSize.width) / 2},${d.parent.y}
      ${d.parent.x + rectSize.width},${d.parent.y}`
        .replace(/\r?\n/g, "")
        .replace(/\s+/g, " ")
    )
    .attr("transform", (d) => `translate(0, ${rectSize.height / 2})`);

  // ????????????????????????????????????
  const t_node = tree_g
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "t_node")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .on("click", function(d){tree_clicked(d);});

  // ??????
  t_node
    .append("rect")
    .attr("width", rectSize.width * 1.5)
    .attr("height", rectSize.height * 2.2)
    .attr("fill", "#fff")
    .style("stroke", (d) => node_color(d));

  // ????????????
  t_node
    .append("text")
    .html((d) => leftLinebreak(d))
    .attr("id", 't_text')
    .attr("transform", `translate(5, 10)`)
    .style("font-size", 5)

};

function tree_clicked(d){

  var parent = document.getElementById('twitter_wrapper');
  while(parent.firstChild){
    parent.removeChild(parent.firstChild)
  }

  leaves = d.leaves()

  var claster_l = new Array();

  for ( var i = 0 ; i < leaves.length ; i ++) {
    claster_l.push(leaves[i].ancestors().reverse());
  };

  for ( var i = 0 ; i < claster_l.length ; i ++) {
    for ( var j = 0 ; j < claster_l[i].length ; j ++) {
      var text = claster_l[i][j].data.name;
      var time = claster_l[i][j].data.time;
      var user = claster_l[i][j].data.user;
      var favorite = claster_l[i][j].data.favorite;
      var retweet = claster_l[i][j].data.retweet;
      var tweet_id = BigInt(claster_l[i][j].data.tweet_id);
      var flag = claster_l[i][j].data.flag;
      console.log(flag);
      var tweet_html = tweet_data_insert( time, text, j, user, favorite, retweet, tweet_id, flag )
      document.getElementById('twitter_wrapper').insertAdjacentHTML('beforeend',tweet_html);
    }
  }

};


count = 0;
function click_hint(){

  var tree_zoom=d3.zoom()
  	  .scaleExtent([1, 3])
  	  .on("zoom", tree_zoomed);

  var a = -1;
  var data = d3.selectAll("rect")
  .filter(function(v, i){
      if (v.data.score > a){
        a = v.data.score;
      }
  });
  var focus = d3.selectAll("rect")
  .filter(function(d, i){
      if (d.data.score == a){
        return true
      }
  });
  var focus_data = focus.data();
  var i = focus_data.length - 1;

  count ++;

  if (count % 2 != 0){

    focus.style("stroke", '#dc143c');
    tree_g.transition()
      .duration(550)
      .call(tree_zoom.transform, transform(focus_data[i].x, focus_data[i].y))
    }else{
      focus.style("stroke", node_color(focus_data[i]));
      tree_g.transition()
        .duration(550)
        .call(tree_zoom.transform, d3.zoomIdentity);
    }
};


focus_count = 0;
// ????????????????????????????????????????????????
function discussionPoint(id) {

  var tree_zoom=d3.zoom()
  	  .scaleExtent([1, 3])
  	  .on("zoom", tree_zoomed);

  var d_data = d3.selectAll("rect")
  .filter(function(v, i){
      if (v.data.tweet_id == id){
        return true;
      }
    });
  focus_count += 1;
  var data = d_data.data();

  if (focus_count % 2 != 0){
    // d_data.style("stroke", '#dc143c');
    tree_g.transition()
      .duration(550)
      .call(tree_zoom.transform, transform(data[0].x, data[0].y))
  }else{
    d_data.style("stroke", node_color(data[0]));
    tree_g.transition()
      .duration(550)
      .call(tree_zoom.transform, d3.zoomIdentity);
  }

};


function transform(x, y) {
  return d3.zoomIdentity
    .translate(400, 400)
    .scale(2)
    .translate(-x, -y);
}

function node_color(d) {
  claster = d.data.claster[0] ;
  var colors = ['#4682b4', '#008000', '#ffff00', '#e66767', '#cc661d', '#9370db', '#a0522d'] ;
  if (claster == -1){
    color = "#808080";
  }else{
    color = colors[claster];
  }
  return color ;
}

function tree_zoomed(cords) {
    tree_g.attr("transform", d3.event.transform);
}

function	lplane_roots(roots_html, all_root, tab, tab_content){
  document.getElementById('tab-content').innerHTML = tab_content ;
  document.getElementById('tab-menu').innerHTML = tab ;
  for (i = 0 ; i < roots_html.length + 1 ; i ++){
    if (i == 0){
      var tab_name = 'root' + String(i)
      document.getElementById(tab_name).innerHTML = all_root ;
    }else{
      var tab_name = 'root' + String(i)
      document.getElementById(tab_name).innerHTML = roots_html[i-1] ;
    }
  }

}

document.addEventListener('DOMContentLoaded', () => {
    // ???????????????????????????'.js-tab-trigger'????????????????????????
    const tabTriggers = document.querySelectorAll('.js-tab-trigger');
    // ??????????????????????????????'.js-tab-target'????????????????????????
    const tabTargets = document.querySelectorAll('.js-tab-target');

    // ??????????????????????????????????????????????????????????????????
    for (let i = 0; i < tabTriggers.length; i++) {
        // ?????????????????????????????????
        tabTriggers[i].addEventListener('click', (e) => {
            // ????????????????????????????????????????????????[??????????????????]????????????
            let currentMenu = e.currentTarget;
            // ???????????????????????????????????????????????????data?????????????????????id?????????????????????????????????[?????????????????????]????????????
            let currentContent = document.getElementById(currentMenu.dataset.id);

            // ?????????????????????????????????'is-active'??????????????????
            for (let i = 0; i < tabTriggers.length; i++) {
                tabTriggers[i].classList.remove('is-active');
            }
            // ???????????????????????????????????????'is-active'??????????????????
            currentMenu.classList.add('is-active');

            // ???????????????????????????????????????????????????
            for (let i = 0; i < tabTargets.length; i++) {
                tabTargets[i].classList.remove('is-active');
            }
            // ?????????????????????(????????????ID????????????????????????)??????????????????
            if(currentContent !== null) {
                currentContent.classList.add('is-active');
            }
        });
    }
});



// ????????????????????????
var tree_g = make_g();

lplane_roots(roots_html, all_root, tab, tab_content);
