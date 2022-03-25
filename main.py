import eel
import csv
import numpy as np
import pandas as pd
import MeCab
import itertools
from collections import Counter
import matplotlib.pyplot as plt
import networkx as nx
import japanize_matplotlib
from pathlib import Path
import collections
import seaborn as sns
import re
import collections
import math
import spacy
from  spacy.lang.ja import stop_words
import pke
import ginza
import nltk
import pandas as pd
import pprint
import json
import datetime
from sklearn import preprocessing


# 自作ライブラリ
from assets.python import conversation
from assets.python import make_graph as graph
from assets.python import structure_extract as structure
from assets.python import Vectorizer
from assets.python import Topic

# コメントアウト
graph_data = {}
dt_now = datetime.datetime.now()
dt_now = dt_now.strftime('%Y年%m月%d日 %H:%M:%S')


get_tweet = conversation.Get_Tweets()
make_graph = graph.Make_Graph()
# labor2 = [1490567249652031489, 1489795944220880899, 1490430110155030538, 1488625709803184128]
# corona = [1489773893045092353]
# labor = [1489168999170523141, 1489712123152564224, 1489571330093731845, 1487950503317147651, 1489044878508302336, 1489411887913926658, 1489926517375537152, 1487932837789528064, 1488411632070197250, 1489914877527605262, 1489161118488866819, 1488500053299720197, 1489771455797608449, 1489816049109319681]
# id_list = [1484645089616216064, 1484293644870098946, 1485165876597133314, 1485610712320077826, 1485814778488520705, 1484282090695069696, 1484868413373571077, 1486471968857759746, 1485799080932823043, 1485865903145517058, 1484865511494017024, 1486328195737845765, 1485657103184412676, 1485821109240885248, 1486274715266482176, 1485363765973745664, 1486293297727299585, 1486111532732026881, 1486476435074142208, 1486188899634352129, 1486491625463300096, 1485205689517899776, 1486354787499409408]
# id_list = [1485912956735225864, 1485588005113196547, 1485909471796686848, 1485593729289396226, 1485604349191815172, 1486239986114777090, 1486188899634352129, 1486007896479760392]
# # id_list = [1480641604075819008, 1480513996889661448, 1480496662410047490, 1479434925476843527, 1480710062054449154, 1480538588098228227, 1480758066958462976, 1480492024252219394, 1480715567778897923, 1480483156293984260,1480202064160595969, 1479676044936646658, 1480544960697212932, 1480544155780927490, 1480355892453609474, 1479310452534710272, 1478350234170572800,1478649305066278913, 1480520889859186688]
# id_list = [1498249991424733185]
# zikken_topic1 = [1499024231006629888, 1498994039395282947, 1499033793633550337, 1496500775945601024,1498204737120137218, 1498673060593147911]
# topic1_2 = [1499421338888720387, 1499175495749234689]
# zikkenn_topic2 = [1499347613703090177, 1499359621596971009, 1499583755522035745, 1499557836485193728, 1498965064531202052, 1498689523730944004]
# topic2_2 = [1498665320772509701, 1489795944220880899]
# topic2_3 = [1499527550233882626]
# topic2_4 = [1499637207971549184]
# ### 検索時 ###
# for id in topic2_4:
#     get_tweet.get(id=id, want_reply=True)
#     print("終了")
#
tweet_data = pd.read_csv("assets/data/tweets_data/zikken_topic2.csv", encoding='utf_8_sig')
children_list = pd.read_csv("assets/data/tweets_data/zikken_topic2_child.csv", encoding='utf_8_sig')
tweet_data = pd.merge(tweet_data, children_list)
tweet_data['children'] = tweet_data['Str_children'].str.split(',')
pd.set_option('display.max_rows', None)
tweet_data = tweet_data.drop_duplicates(subset='id')
# tweet_data = tweet_data.dropna(how='any')
tweet_data = tweet_data.fillna("Nane")
tweet_data['pre_favorite'] = preprocessing.minmax_scale(tweet_data['favorite'])
tweet_data['pre_retweet'] = preprocessing.minmax_scale(tweet_data['retweet'])
tweet_split = tweet_data.to_dict(orient='list')
tweet_info = {str(id): {'pre_favorite': pre_favorite, 'pre_retweet': pre_retweet,'favorite': favorite, 'retweet': retweet, 'text': text, 'user': user, 'time': time, 'root': root, 'claster': [], "phrase": []} for id, pre_favorite, pre_retweet, favorite, retweet, text, user, time, root in zip(tweet_data['id'], tweet_data['pre_favorite'], tweet_data['pre_retweet'], tweet_data['favorite'], tweet_data['retweet'], tweet_data['text'], tweet_data['user'], tweet_data['time'], tweet_data['root'])}


# 構造抽出
structure = structure.Structure_Extract(tweet_data)
result = structure.structure_extract()
segment = []



tree_edge = []
for li in result:
    if len(li) == 1:
        continue
    else:
        for i in range(0, len(li)):
            if len(li) == i+1:
                continue
            else:
                tree_edge.append([li[i], li[i+1]])

tree_node = tweet_split['id']
tweet_info = make_graph.tree_plot(tree_edge, tree_node, tweet_info)

# 文章準備
corpus = tweet_split['text']
tweet_id = tweet_split['id']

tweet_id_segment_id = {}
tweet_id_claster_id = {}
for id in tweet_id:
    tweet_id_segment_id[id] = []
    tweet_id_claster_id[id] = []

#　# パラメータ設定
params=0.8
n_keys=7
n_word_lower = 4
edge_threshold=0.02

data_dir_path = Path('data')
image_dir_path = Path('assets/image')
plot_data_dir_path = Path('assets/data/plot_data')
#
# # # # paramはデフォルトが0.5, n_keysはデフォルトが２
embedrank = Vectorizer.EmbedRankpp(params=params, n_keys=n_keys)
s_keyphrase, sentences, candidate_phrases, doc_sep = embedrank.extract_candidate(corpus)

# # 実験時
# collect_data = []
# for i in sentences.keys():
#     Str_candidate = "，".join(candidate_phrases[i])
#     Str_result = "，".join(s_keyphrase[i])
#     a = {"text": sentences[i], "candidate": Str_candidate, "result": Str_result}
#     collect_data.append(a)
# result_data = pd.DataFrame(collect_data)
# result_data.to_csv("assets/data/tweets_data/result_data2.csv", encoding="utf_8_sig", mode="a", index=False, header=False)

s_keyphrase = list(itertools.chain.from_iterable(list(s_keyphrase.values())))
c = collections.Counter(s_keyphrase)

keyphrase_list = [i[0] for i in c.items() if i[1] >= n_word_lower]

noun_sentences = []
for docs, sentence in zip(doc_sep, sentences.values()):
    for doc in docs:
        noun = [k for k in keyphrase_list if k in doc]

        noun_sentences.append(noun)



csv_name = 'word_count_params={0}n_key={1}edge={2}.csv'.format(params, n_keys, edge_threshold)
csv_file_name = plot_data_dir_path.joinpath(csv_name)
image_name = 'word_count_params={0}n_key={1}edge={2}.png'.format(params, n_keys, edge_threshold)
image_file_name = image_dir_path.joinpath(image_name)


# make_graph.word_count(noun_sentences, csv_file_name, image_file_name)
jaccard_coef_data = make_graph.combinations(noun_sentences)
# jaccard_coef_data = pd.read_csv('assets/data/zikkenn_topic2_jaccard_coef_data.csv')


if not image_dir_path.exists():
    image_dir_path.mkdir(parents=True)



plot_data = jaccard_coef_data.query(
    'count1 >= {0} and count2 >= {0}'.format(n_word_lower)
).rename(
    columns={'word1': 'node1', 'word2': 'node2', 'jaccard_coef': 'weight'}
)
links = plot_data.query(
    'node1 != node2 and weight > {0}'.format(edge_threshold)
).rename(
    columns={'node1': 'source', 'node2': 'target', 'weight': 'value'}
)
# name = 'plot_data_params={0}n_key={1}edge={2}time={3}.csv'.format(params, n_keys, edge_threshold,dt_now)
name = "plot_zikkenn_topic2.csv"
file_name = plot_data_dir_path.joinpath(name)
plot_data.to_csv(file_name, encoding="utf_8_sig", index=False)
# plot_data = pd.read_csv("assets/data/plot_data/zikken.csv", encoding="utf_8_sig")


node_list = list(set(plot_data['node1'].tolist() + plot_data['node2'].tolist()))


name = 'params={0}n_key={1}edge={2}0118.png'.format(params, n_keys, edge_threshold)
name = 'zikkenn_topic2.png'
file_name = image_dir_path.joinpath(name)

claster, pos, pagerank = make_graph.plot_network(data=plot_data,edge_threshold=edge_threshold,fig_size=(10, 10),fontsize=9,fontfamily='Hiragino Maru Gothic Pro',coefficient_of_restitution=0.08,image_file_path=file_name)
kekka = []

for a in result:

    b = ""
    for id in a:
        b += tweet_info[str(id)]["text"]
    l = []
    for node, i in zip(claster.keys(), claster.values()):

        count = b.count(node)
        if count == 0:
            continue
        n = 0
        while n < count:
            l.append(str(i))
            n += 1
    c = collections.Counter(l)
    values, counts = zip(*c.most_common())
    most = values[0]
    fa = {"segment": b, "claster": most}
    kekka.append(fa)

    for id in a:
        tweet_info[str(id)]["claster"].append(int(most))

result_data = pd.DataFrame(kekka)
result_data.to_csv("assets/data/tweets_data/segment_zikkenn_topic2.csv", encoding="utf_8_sig", mode="a", index=False, header=False)




# with open('assets/js/graph_json.js', 'w', encoding='utf-8') as f:
#     f.write('graph_data = ' + out_str + '\n')

# # 以下をコメントアウトしてる
all_structure_id, discussion_id, id_discussion, keyword_id, id_keyword, emb_array, keyword_tweet_id, discussion_in_keyword, keyword_structure_id, discussion_structure_keyword = structure.keyword(node_list, claster, tweet_id_segment_id, tweet_id_claster_id, tweet_info)

##################################
###### グラフ用jsonデータの作成 ######
#################################

nodes = [{"id": node, "tweet_id": tweet_id, "structure_id": keyword_structure_id[node], "discussion_info": {}, "group": claster[node], "p_x": pos[node][0]*60000, "p_y": pos[node][1]*4000+100, "r": pagerank[node]*500} for node, tweet_id in zip(list(keyword_tweet_id.keys()), list(keyword_tweet_id.values()))]
links = links[['source', 'target', 'value']]
links = links.to_dict(orient='records')

# 議論セグメントの計算
# nodes = embedrank.discussion_rank(nodes, id_discussion, links, keyword_id, discussion_id)
graph_json = {'nodes': nodes, 'links': links}
out_str = json.dumps(graph_json, ensure_ascii=False, indent=2)

with open('assets/js/zikkenn_topic2_graph.js', 'w', encoding='utf-8') as f:
	f.write('graph_data = ' + out_str + '\n')

# ツイートのデータ
tweet_data_j = [{'id': id, 'user': user, 'reply_id': reply_id, 'text': text, 'root': root, 'children': children, 'favorite': favorite, 'time': time, 'retweet': retweet} for id, user, reply_id, text, root, children, favorite, time, retweet in zip(tweet_split['id'], tweet_split['user'], tweet_split['reply_id'], tweet_split['text'], tweet_split['root'], tweet_split['children'], tweet_split['favorite'], tweet_split['time'], tweet_split['retweet'])]
tweet_data_json = {'data': tweet_data_j}
out_str = json.dumps(tweet_data_json, ensure_ascii=False, indent=2)
id_text = {}
for id, text in zip(tweet_split['id'], tweet_split['text']):
    id_text[id] = text

with open('assets/js/zikkenn_topic2_tweet.js', 'w', encoding='utf-8') as f:
    f.write('tweet_data = ' + out_str + '\n')

# ツリー構造データ
tree_dict = structure.create_tree(all_structure_id, id_text)

out_str = json.dumps(tree_dict, ensure_ascii=False, indent=2)
with open('assets/js/zikkenn_topic2_tree.js', 'w', encoding='utf-8') as f:
    f.write('tree_data = ' + out_str + '\n')


# 議論構造のデータ
structure_data = [all_structure_id]
discussion_data_json = {"structure_data": structure_data}
out_str = json.dumps(discussion_data_json, ensure_ascii=False, indent=2)
with open('assets/js/zikkenn_topic2_discussion.js', 'w', encoding='utf-8') as f:
    f.write('discussion_data = ' + out_str + '\n')

# html/css/jsの入っているディレクトリを指定
eel.init('assets', allowed_extensions=['.js', '.html&css', '.python'])
#
# # JavaScriptから呼べるように関数を登録
# 最初の画面のhtmlファイルを指定
eel.start('html&css/zikkenn_topic2.html', port=9999)
