

////////////////////////
////  共起情報管理  ////
////////////////////////
//// コンストラクタ
var	Collocations = function(){
	// オブジェクトが作られるごとに、状態番号を0～で割り振る
	if ( Collocations.prototype.state_count == void 0 )	// == undefined
	{
		Collocations.prototype.state_count = 0 ;
	}
	this.state_no = Collocations.prototype.state_count ;
	Collocations.prototype.state_count ++ ;
};

//// 共通単語情報
Collocations.prototype.no2word = new Array() ;	// 単語番号から単語表記の検索用Array
Collocations.prototype.word2no = {} ;			// 単語表記から単語番号の検索用Hash
Collocations.prototype.word_count = 0

//// 単語一覧への登録
Collocations.prototype.addWord = function( word ){
  // javascriptの場合条件式の前に演算子がくるこの場合notnot（!）は条件式の結果を逆にします。条件式がtrueの場合falseを、falseの場合trueを返します。
// 例えば、条件式を「if(!(num <= 80))」とするとnumが81以上の場合にtrueとなります。
	if ( ! ( word in Collocations.prototype.word2no ) )
	{
		var	word_id = Collocations.prototype.no2word.length ;
		Collocations.prototype.no2word.push( word ) ;
		Collocations.prototype.word2no[word] = word_id ;
		Collocations.prototype.word_count = Collocations.prototype.no2word.length ;
	}
};

//// 単語一覧から単語番号の取り出し：表記→番号, error-->null
Collocations.prototype.getWordID = function( word ){
	return ( word in Collocations.prototype.word2no )?Collocations.prototype.word2no[word]:null ;
};

//// 単語一覧から単語表記の取り出し：番号→表記, error-->null
Collocations.prototype.getWord = function( word_id ){
	return ( word_id < Collocations.prototype.no2word.length )?Collocations.prototype.no2word[word_id]:null ;
};

//// 単語数を取得
Collocations.prototype.getCount = function(){
	return Collocations.prototype.word_count ;
};


Collocations.prototype.init = function ( graph_json, tweet_json, discussion_json ){
	// 単語を登録
	for ( var i = 0 ; i < graph_json["nodes"].length; i++){
		var id = graph_json["nodes"][i]["id"]
		Collocations.prototype.addWord( id ) ;
	}

	// 共起情報を登録
	this.static_coll_data = new Array() ;
	for ( var i = 0; i < Collocations.prototype.getCount() ; i ++) {
		var data = []
		this.static_coll_data.push(data)
	}
	for ( var i = 0; i < graph_json["links"].length; i ++) {
		var c = graph_json["links"][i]
		var src_no = Collocations.prototype.getWordID( c["source"] ) ;
		var tgt_no = Collocations.prototype.getWordID( c["target"] ) ;
		var val = c["value"]
		this.static_coll_data[src_no].push([tgt_no, val])
		this.static_coll_data[tgt_no].push([src_no, val])
	}

  //　単語が持つtweet_idを登録
  this.tweet_id = new Array() ;
  for (var i = 0; i < Collocations.prototype.getCount() ; i ++) {
    var data = []
    this.tweet_id.push(data)
  }
  for ( var i = 0; i < graph_json["nodes"].length; i ++) {
    var c = graph_json["nodes"][i]
		// tweet_idはjson処理の文字数を超えているからbigintをする必要性がある
    var tweet_id = c["tweet_id"]
    var no = Collocations.prototype.getWordID( c["id"] );
    this.tweet_id[no].push(tweet_id)
  }

  // tweet情報を登録
  this.tweet_text_id = new Object() ;
  for ( var i = 0 ; i < tweet_json["data"].length ; i ++ ){
    var data = tweet_json["data"][i]
    var id = BigInt(data["id"]);
    var text = data["text"]
		this.tweet_text_id[id] = text
  }

// ノードが持つstructure_id情報を登録
	this.node_structure_id = new Array() ;
	for (var i = 0; i < Collocations.prototype.getCount() ; i ++) {
    var data = []
    this.node_structure_id.push(data)
  }
	for ( var i = 0 ; i < graph_json["nodes"].length ; i ++) {
		id = graph_json["nodes"][i]["id"]
		no = Collocations.prototype.getWordID( id ) ;
		structure_id = graph_json["nodes"][no]["structure_id"]
		this.node_structure_id[no].push(structure_id)
	}


	// クラスタリング結果を登録
	this.node_group_id = new Array() ;
	this.node_xy = new Array();
	this.node_r = new Array()
	for (var i = 0; i < Collocations.prototype.getCount() ; i ++) {
    var data = [] ;
    this.node_group_id.push(data);
		this.node_xy.push(data);
		this.node_r.push(data)
  }
	for ( var i = 0 ; i < graph_json["nodes"].length ; i ++) {
		id = graph_json["nodes"][i]["id"]
		no = Collocations.prototype.getWordID( id ) ;
		group_id = graph_json["nodes"][no]["group"]
		x = graph_json["nodes"][no]["px"]
		y = graph_json["nodes"][no]["py"]
		r = graph_json["nodes"][no]["r"]
		this.node_group_id[no].push(group_id)
		this.node_xy[no].push(x)
		this.node_xy[no].push(y)
		this.node_r[no].push(r)
	}



	// 議論idを登録
	this.discussion_id = new Array() ;
	discussion_data = discussion_json['structure_data'][0]
	var lengthOfObject = Object.keys(discussion_data).length ;
	for ( var i = 0 ; i < lengthOfObject ; i ++) {
		var data = []
		this.discussion_id.push(data)
	}
	for ( var i = 0 ; i < lengthOfObject ; i ++) {
		this.discussion_id[i].push(discussion_data[i])
	}

	// 表示する単語一覧の初期化
	this.display_words = this.initWords() ;

	// 最初の選択単語番号
	this.comp_word_id = 0 ;
};

//// 共起度を取得
Collocations.prototype.getCollValue = function( id1, id2 ){
	if ( this.static_coll_data[id1] != void 0 )
	{
		var	coll = this.static_coll_data[id1] ;
		for ( var i = 0 ; i < coll.length ; i ++ )
		{
			if ( coll[i][0] == id2 )
			{
				return coll[i][1] ;
			}
		}
	}

	return 0.0 ;
};

//// 単語一覧を初期化
//
// @param	Collocations.prototype.getWord(id)	単語一覧
// @return	this.display_words	並べ替えられた単語一覧
Collocations.prototype.initWords = function(){
	var	words = [] ;
	for ( var i = 0 ; i < Collocations.prototype.getCount() ; i ++ )
	{
		words.push( { "id":i, "name":Collocations.prototype.getWord(i) } ) ;
	}
	return words ;
};



function	exec(){
	////////////////////////
	////  グラフ管理    ////
	////////////////////////

	//// Node情報の作成
	function	graph_make_node( collocation )	{
		var	nodes = [] ;
		for( var i = 0; i < collocation.getCount(); i++)
		{
			var name = collocation.getWord(i) ;
			var id = collocation.getWordID(name) ;
			var group = collocation.node_group_id[id][0]
			var x = collocation.node_xy[id][0]
			var y = collocation.node_xy[id][1]
			var r = collocation.node_r[id][3]
			nodes.push( { name : name, no : i, group: group, x: x, y: y, no : i, is_node : 0, is_link : 0 , r: r} ) ;
		}
		return nodes ;
	}


	//// Link情報の作成（閾値によって構造は変わる）
	function	graph_make_link( collocation )	{
		var	colls = collocation.static_coll_data ;
		var	links = [] ;

		for( var i = 0; i < colls.length; i++)
		{
			var	targets_value = colls[i] ;
			for ( var j = 0 ; j < targets_value.length ; j ++ )
			{
				var	target_value = targets_value[j] ;
				var	target = target_value[0] ;
				var	value  = target_value[1] ;
				if ( target > i)
				{
					links.push( { source : i, target : target, value : value } ) ;
				}
			}
		}
		return links ;
	}

	function node_color(group_id) {
		var colors = ['#4682b4', '#008000', '#ffff00', '#e66767', '#cc661d', '#9370db', '#a0522d'] ;
		return colors[group_id] ;
	}



//////// -------- メイン処理 -------- ////////
	// 共起情報の初期化
	var	coll = new Collocations() ;
	coll.init( graph_data, tweet_data, discussion_data ) ;
	//// d3.jsの形式にデータを変換
	var	nodes = graph_make_node( coll ) ;
	var	links = graph_make_link( coll ) ;


	//// ToolTips
	var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden")
		.style("border", "1px solid black")
		.style("background-color", "white")
		.style("padding", "5px 5px 5px 5px")
		.style("border-radius", "4px")
		.style("-moz-border-radius", "4px")
		.style("-webkit-border-radius", "4px");


	// グラフ情報の初期化
	var	graph_width  = 500 ;
	var	graph_height = 400 ;

	// 描画領域
	//// SVG領域の定義
	var	vbox_x = 0 ;
	var	vbox_y = 0 ;
	var vbox_default_width  = vbox_width  = graph_width ;
	var vbox_default_height = vbox_height = graph_height ;

	var	n_svg = d3.select("div#right-top-container").append("svg")
			.attr("width", graph_width)
			.attr("height", graph_height)
			.attr("viewBox", "" + vbox_x + " " + vbox_y + " " + vbox_width + " " + vbox_height) ;	// viewBox属性を付加


		var net_zoom = d3.zoom()
		  .scaleExtent([1/4,4])
		  .on('zoom', SVGzoomed);

		n_svg.call(net_zoom);

		//"svg"上に"g"をappendしてdragイベントを設定
		var g0 = n_svg.append("g")
		  .call(d3.drag()
		  .on('drag',SVGdragged))

		function SVGzoomed() {
		  g0.attr("transform", d3.event.transform);
		}

		function SVGdragged(d) {
		  d3.select(this).attr('cx', d.x = d3.event.x).attr('cy', d.y = d3.event.y);
		    };

	var d3_drag = d3.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended);

	var link = g0.selectAll(".link")
		.data(links)
		.enter()
		.append("line")
		.attr("stroke-width", 2)
		.attr("stroke", "#808080")
		.call(d3_drag);

		var n_node = g0.append('g')
	     .attr('class', 'nodes')
	     .selectAll('g')
	     .data(nodes)
	     .enter()
	     .append('g')
	     .call(d3_drag)
			 .on("click", g_clicked);

	 // node circleの定義
	   n_node.append('circle')
	     .attr('r', function(d) {return d.r})
	     .attr('stroke', '#ccc')
	     .attr('fill', function(d) { return node_color(d.group); })
	     .style('stroke-width', '2');   //線の太さを2に設定

	 //node textの定義
	   n_node.append('text')
		 	.attr('id', 'g_text')
	    .attr('text-anchor', 'middle')
	    .attr('fill', 'black')
	    .style('pointer-events', 'none')
	    .attr('font-size', function(d) {return '15px'; }  )
			.attr('font-weight', 'bold')
	    .text(function(d) { return d.name; });

	// 力学モデル
	var simulation = d3.forceSimulation()
	.force("link",
		d3.forceLink()
		.distance(200)
		.iterations(2))
		.force("collide",
		d3.forceCollide()
		.radius(10)
		.strength(0.7)
		.iterations(2))
		.force("charge", d3.forceManyBody().strength(-100))
		.force("x", d3.forceX().strength(0.01).x(graph_width / 2))
		.force("y", d3.forceY().strength(0.01).y(graph_height / 2))
		.force("center", d3.forceCenter(graph_width / 2, graph_height / 2));

		simulation
	    .nodes(nodes)
	    .on("tick", ticked);

		simulation.force("link")
			.links(links)
			.id(function(d) { return d.index; }); ;

		function ticked() {
		 link
			 .attr("x1", function(d) { return d.source.x; })
			 .attr("y1", function(d) { return d.source.y; })
			 .attr("x2", function(d) { return d.target.x; })
			 .attr("y2", function(d) { return d.target.y; });
		 n_node
			 .attr("cx", function(d) { return d.x; })
			 .attr("cy", function(d) { return d.y; })
			 .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')'});
		}

		// ドラッグ時のイベント関数
		function dragstarted(d) {
		 if(!d3.event.active) simulation.alphaTarget(0.3).restart();
		 d3.event.subject.fx = d3.event.subject.x;
		 d3.event.subject.fy = d3.event.subject.y;
		}

		function dragged(d) {
		 d3.event.subject.fx = d3.event.x;
		 d3.event.subject.fy = d3.event.y;
		}

		function dragended(d) {
		 if(!d3.event.active) simulation.alphaTarget(0);
		 d3.event.subject.fx = null;
		 d3.event.subject.fy = null;
		}


	////////////////////////////
	////  左右プレーン管理    ////
	////////////////////////////


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
	      var tweet_html = '<div class="twitter__block" id="twitter_block"　style="background-color: #FFFFFF;">'
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
	      var tweet_html = '<div class="twitter__block" id="twitter_block"　style="background-color: #FFFFFF;">'
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
	    return tweet_html
	};

	// ノードがクリックされた時の動作
		function g_clicked(d){

			var this_name = d3.select(this).data()[0].name
			var tree_d = d3.selectAll("rect").data();
			d3.selectAll(".selected").classed("selected", false);
			d3.selectAll(".conected").classed("conected", false);
			d3.selectAll("line").classed("linkSelected", false);
			d3.selectAll("rect").classed("t_selected", false);
			d3.selectAll("path").style("stroke", "black").style("stroke-opacity", 1)

			d3.selectAll("circle").classed("this_node", false);
	 		// d3.selectAll("line").classed("n_selected", true);
			d3.selectAll("rect").classed("n_selected", true);



			d3.select(this).select("circle").classed("this_node", true);


			var tweet_html = ""
			for (var i = 0 ; i < tree_d.length ; i ++){
				if (tree_d[i].data.name.indexOf(this_name) != -1){
							text = tree_d[i].data.name;
				      time = tree_d[i].data.time;
				      user = tree_d[i].data.user;
				      favorite = tree_d[i].data.favorite;
				      retweet = tree_d[i].data.retweet;
							flag = tree_d[i].data.flag;
							console.log(flag)
				      tweet_id = BigInt(tree_d[i].data.tweet_id);
							j = 1

				      tweet_html += tweet_data_insert( time, text, j, user, favorite, retweet, tweet_id, flag )

				}
			}
			document.getElementById('view_tweet').innerHTML = tweet_html ;



			d3.selectAll("rect")
				.filter(function(v, i){
					if(v.data.claster.includes(d.group)){
						return true;
					}
				}).classed("t_selected", true);

			d3.selectAll("rect")
				.filter(function(v, i){
					if(v.data.claster.includes(d.group)){
						return true;
					}
				})
				.classed("n_selected", false)
				.style("stroke", node_color(d.group));

			d3.selectAll("path")
				.filter(function(v, i){
					if(v.data.claster.includes(d.group)){
						return true;
					}
				}).style("stroke", "red")
	      	.style("stroke-opacity", 1);

	};


};
