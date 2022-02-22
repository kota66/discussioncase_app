// 蓄積処理
function flagClick(e){
  var id = e.id;
  tree_g.selectAll('rect')
      .filter(function(v, i){
          if (v.data.tweet_id == id){
            if (v.data.flag == false){
              tree_g.selectAll('rect').filter(function(w, j){if (w.data.tweet_id == id){return true}}).data()[0].data.flag = true;
            }else{
              tree_g.selectAll('rect').filter(function(w, j){if (w.data.tweet_id == id){return true}}).data()[0].data.flag = false;
            }
            return true
          }
        });

  // クリックしたタブメニューに'is-active'クラスを追加
   if (e.classList.contains('is-active')){
     e.classList.remove('is-active');
   }else{
     e.classList.add('is-active');
   }
};

function accumulTweet(e){
  var id = e.id;

  var url = '../html&css/index2.html'
  var obj_window = open_window(url);


  var tweet_data = tree_g.selectAll('rect')
                        .filter(function(v, i){
                            if (v.data.tweet_id == id){
                              return true
                            }
                          }).data()[0];
  text = tweet_data.data.name;
  time = tweet_data.data.time;
  user = tweet_data.data.user;
  favorite = tweet_data.data.favorite;
  retweet = tweet_data.data.retweet;
  flag = tweet_data.data.flag;
  tweet_id = BigInt(tweet_data.data.tweet_id);
  j = 1

  var tweet_html = tweet_data_insert( time, text, j, user, favorite, retweet, tweet_id, flag ) ;
  obj_window.document.getElementById("fav_wrapper").innerHTML(tweet_html)

};

function open_window (url){
  var obj_window = window.open(url, '', 'width=500, height=500');

  return obj_window
}
