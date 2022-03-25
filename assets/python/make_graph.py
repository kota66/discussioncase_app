from pathlib import Path
import re
import collections
import pandas as pd
import MeCab
import mojimoji
import neologdn
import unicodedata
import itertools
import networkx as nx
import matplotlib.pyplot as plt
import urllib.request, urllib.error
from pylab import rcParams
import community
from googletrans import Translator
import pydot
from networkx.drawing.nx_agraph import graphviz_layout
from sklearn import preprocessing

class Make_Graph():

    def __init__(self):

        result = []

    def combinations(self, noun_sentences):
        combination_sentences = [list(itertools.combinations(words, 2)) for words in noun_sentences]
        combination_sentences = [[tuple(sorted(combi)) for combi in combinations] for combinations in combination_sentences]
        tmp = []
        for combinations in combination_sentences:
            tmp.extend(combinations)
        combination_sentences = tmp

        return self.make_jaccard_coef_data(combination_sentences)

    def make_jaccard_coef_data(self, combination_sentences):

        combi_count = collections.Counter(combination_sentences)

        word_associates = []
        for key, value in combi_count.items():
            word_associates.append([key[0], key[1], value])

        word_associates = pd.DataFrame(word_associates, columns=['word1', 'word2', 'intersection_count'])

        words = []
        for combi in combination_sentences:
            words.extend(combi)

        word_count = collections.Counter(words)
        word_count = [[key, value] for key, value in word_count.items()]
        word_count = pd.DataFrame(word_count, columns=['word', 'count'])

        word_associates = pd.merge(
            word_associates,
            word_count.rename(columns={'word': 'word1'}),
            on='word1', how='left'
        ).rename(columns={'count': 'count1'}).merge(
            word_count.rename(columns={'word': 'word2'}),
            on='word2', how='left'
        ).rename(columns={'count': 'count2'}).assign(
            union_count=lambda x: x.count1 + x.count2 - x.intersection_count
        ).assign(jaccard_coef=lambda x: x.intersection_count / x.union_count).sort_values(
            ['jaccard_coef', 'intersection_count'], ascending=[False, False]
        )

        word_associates.to_csv("assets/data/zikkenn_topic1_jaccard_coef_data.csv", encoding="utf_8_sig", index=False)

        return word_associates

    def plot_network(
        self, data, edge_threshold=0., fig_size=(15, 15),
        fontfamily='Hiragino Maru Gothic Pro', fontsize=14,
        coefficient_of_restitution=0.15,
        image_file_path=None
    ):

        nodes = list(set(data['node1'].tolist() + data['node2'].tolist()))

        plt.figure(figsize=fig_size)

        G = nx.Graph()
        # 頂点の追加
        G.add_nodes_from(nodes)

        # 辺の追加
        # edge_thresholdで枝の重みの下限を定めている
        for i in range(len(data)):
            row_data = data.iloc[i]
            if row_data['weight'] >= edge_threshold:
                G.add_edge(row_data['node1'], row_data['node2'], weight=row_data['weight'])

        # 孤立したnodeを削除
        isolated = [n for n in G.nodes if len([i for i in nx.all_neighbors(G, n)]) == 0]
        for n in isolated:
            G.remove_node(n)

        # k = node間反発係数
        pos = nx.spring_layout(G, k=coefficient_of_restitution)

        pr = nx.pagerank(G)


        partition = community.best_partition(G)

        # 実験時に使うやつ（クラスタリングなし）
        nx.draw_networkx(
        G, pos, node_color=list(pr.values()),cmap=plt.cm.Reds,
        font_size=fontsize, font_family=fontfamily, font_weight="bold",
        alpha=0.7,
        node_size=[50000*v for v in pr.values()])
        nx.draw_networkx_edges(G, pos, alpha=0.4, edge_color="darkgrey")

        # # 実験時に使うやつ（クラスタリングあり）
        # nx.draw_networkx(
        # G, pos, node_color=list(partition.values()),
        # font_size=fontsize, font_family=fontfamily, font_weight="bold",
        # alpha=0.7,
        # node_size=[50000*v for v in pr.values()])
        # nx.draw_networkx_edges(G, pos, alpha=0.4, edge_color="darkgrey")

        # plt.show()

        # nodeの大きさ
        # nx.draw_networkx_nodes(
        #     G, pos, node_color=list(partition.values()),
        #     alpha=0.9,
        #     node_size=[80000*v for v in pr.values()]
        # )





        # 日本語ラベル
        nx.draw_networkx_labels(G, pos, font_size=fontsize, font_family=fontfamily, font_weight="bold")

        # エッジの太さ調節
        edge_width = [d["weight"] * 200 for (u, v, d) in G.edges(data=True)]
        nx.draw_networkx_edges(G, pos, alpha=0.8, edge_color="black", width=2.0)

        plt.axis('off')
        plt.tight_layout()
        # plt.show()

        if image_file_path:
            plt.savefig(image_file_path, dpi=300)

        return partition, pos, pr

    def word_count(self, noun_sentences, csv_file_name, image_file_name):

        words = list(itertools.chain.from_iterable(noun_sentences))
        c = collections.Counter(words)
        print(c.most_common())

        word_count = pd.DataFrame(list(c.values()), index=list(c.keys()), columns=['count'])

        word_count.to_csv(csv_file_name, encoding='utf_8_sig')
        # plt.xticks([5, 10, 15, 20, 25, 30, 50])
        # plt.yticks([0,10,20,30,40,80,100, 1000])
        # plt.tight_layout()
        # plt.hist(word_count, color='blue', range=(0, 80), bins=100, alpha=0.5, label='n_key=5')
        # plt.savefig(image_file_name, dpi=300)

    # ノードがidエッジが返信関係
    def tree_plot(self, edge, nodes, tweet_info):

        G = nx.Graph()
        # 頂点の追加
        G.add_nodes_from(nodes)

        for e in edge:
            G.add_edge(e[0], e[1])

        pr = nx.pagerank(G)
        # 正規化
        pr_pre = list(pr.values())
        pr_pre = preprocessing.minmax_scale(pr_pre)

        pr = {str(id): p for id, p in zip(pr.keys(), pr_pre)}

        for node in nodes:
            if tweet_info[str(node)]['root'] == False:
                tweet_info[str(node)]["pr"] = pr[str(node)]
                tweet_info[str(node)]["score"] = pr[str(node)] + tweet_info[str(node)]["pre_favorite"] + tweet_info[str(node)]["pre_retweet"]
            else:
                tweet_info[str(node)]["pr"] = -1
                tweet_info[str(node)]["score"] = -1

        return tweet_info
