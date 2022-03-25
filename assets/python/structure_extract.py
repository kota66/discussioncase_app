import pandas as pd
import numpy as np
import itertools
import collections
import pickle


class Structure_Extract():

    def __init__(self, tweet_data):

        self.all_structure_id = {}
        self.discussion_id = {}
        self.id_discussion = {}
        self.tweets_data = tweet_data
        self.relationship = []
        self.id_text = []
        self.segment_claster = []
        self.tweet_id_segment_id = []
        self.tweet_id_claster_id = []
        self.tweet_info = []

    def clastering(self, structure_id_claster):

        segment_claster = {}

        for structure_id, node_claster in zip(structure_id_claster.keys(), structure_id_claster.values()):
            if len(node_claster) == 0:
                segment_result = -1
                segment_claster[structure_id] = segment_result
            else:
                count = collections.Counter(node_claster)
                sort = count.most_common()
                d = list(sort[0])
                segment_result = d[0]
                segment_claster[structure_id] = segment_result

        return segment_claster

    def structure_extract(self):
        tweets_data = self.tweets_data.to_dict(orient="records")
        print("データ数：", len(tweets_data))

        for tweet_data in tweets_data:
            structure = [0, tweet_data['id'], 0]

            if tweet_data['root'] == False:
                reply_id = tweet_data['reply_id']
                n = self.tweets_data[self.tweets_data['id'] == int(reply_id)]
                n = n.to_dict(orient='records')
                if len(n) == 0:
                    continue
                get = n[0]
                structure[0] = get['id']

            else:
                structure[0] = -1

            for child_id in tweet_data['children']:
                if child_id == '-1':
                    result = [structure[0], structure[1], -1]
                    self.relationship.append(result)
                else:
                    n = self.tweets_data[self.tweets_data['id'] == int(child_id)]
                    n = n.to_dict(orient='records')
                    if len(n) == 0:
                        continue
                    get = n[0]
                    structure[2] = get['id']
                    result = [structure[0], structure[1], structure[2]]
                    self.relationship.append(result)

        self.relationship = list(map(list, set(map(tuple, self.relationship))))

        self.relationship = pd.DataFrame(self.relationship, columns=list(range(3)))

        leaf_data = self.search_leaf()
        result = []
        for leaf in leaf_data:
            structure = [leaf[1]]
            data = leaf
            while True:
                if len(data) == 0:
                    break
                elif data[0] != -1:
                    forward = self.relationship[self.relationship[1] == data[0]]
                    data = forward[forward[2] == data[1]]
                    data = data.to_dict(orient='split')
                    data = data['data']
                    if len(data) == 0:
                        continue
                    data = data[0]
                    structure.insert(0, data[1])

                else:
                    result.append(structure)
                    break

        i = 0
        for structure in result:
            self.all_structure_id[i] = structure
            data = self.tweets_data[self.tweets_data['id'].isin(structure)]
            data = data.to_dict(orient='list')
            discussion = "".join(list(data['text']))
            self.id_discussion[i] = discussion
            self.discussion_id[discussion] = i
            i = i + 1

        f = open("assets/data/tweets_data/all_structure.txt", 'wb')
        pickle.dump(result, f)

        return result

    def keyword(self, keywords, claster, tweet_id_segment_id, tweet_id_claster_id, tweet_info):

        discussion_in_keyword = {}
        keyword_tweet_id = {}
        keyword_structure_id = {}
        discussion_structure_keyword = {}
        sturucture_id_keyword = {}
        structure_id_claster = {}
        self.tweet_info = tweet_info

        for id in self.all_structure_id.keys():
            structure_id_claster[id] = []

        a = []
        count = 0
        for keyword in keywords:
            keyword_tweets = self.tweets_data[self.tweets_data['text'].str.contains(keyword)]
            keyword_dict = keyword_tweets.to_dict(orient='list')
            ids = keyword_dict['id']

            keyword_tweet_id[keyword] = ids

            result = self.id_search_discussion(ids)

            # keywordとdiscussionのtextのdict
            discussion_in_keyword[keyword] = [self.id_discussion[id] for id in result]
            # keywordと議論構造のdict
            discussion_structure_keyword[keyword] = [self.all_structure_id[id] for id in result]

            # keywordとsturcuture_idのdict
            keyword_structure_id[keyword] = result

            for discussion_id in result:
                structure_id_claster[discussion_id].append(claster[keyword])

        segment_claster = self.clastering(structure_id_claster)
        self.segment_claster = segment_claster

        keyword_id = {}
        id_keyword = {}

        for i, keyword in enumerate(keywords):
            keyword_id[keyword] = i
            id_keyword[i] = keyword

        for segment_id, structure_list in zip(self.all_structure_id.keys(), self.all_structure_id.values()):
            for tweet_id in structure_list:
                tweet_id_segment_id[tweet_id].append(segment_id)
                if segment_claster[segment_id] not in tweet_id_claster_id[tweet_id]:
                    tweet_id_claster_id[tweet_id].append(segment_claster[segment_id])

        self.tweet_id_segment_id = tweet_id_segment_id
        self.tweet_id_claster_id = tweet_id_claster_id


        emb_array = np.zeros((len(keywords), len(list(self.all_structure_id.values()))))

        return self.all_structure_id, self.discussion_id, self.id_discussion, keyword_id, id_keyword, emb_array, keyword_tweet_id, discussion_in_keyword, keyword_structure_id, discussion_structure_keyword


    def search_leaf(self):

        data = self.relationship[self.relationship[2] == -1]
        leaf_data = data.to_dict(orient='split')
        leaf_data = leaf_data['data']

        return leaf_data

    def id_search_discussion(self, keyword_ids):

        result = []
        for id in keyword_ids:
            for structure_id, structure in zip(list(self.all_structure_id.keys()), list(self.all_structure_id.values())):
                if id in structure:
                    result.append(structure_id)


        return result

    def create_tree(self, all_structure_id, id_text):

        self.id_text = id_text

        result = []
        for structure_id in all_structure_id.values():
            structure = [id for id in structure_id]
            result.append(structure)

        return self.make_tree_dict(result)

    def make_tree_dict(self, inputs):
        tree_dict = {}
        for ainput in inputs:
            ainput.append('-1')
            pre_dict = tree_dict
            for j, key in enumerate(ainput):
                if j == len(ainput)-2:
                    pre_dict[key] = ainput[-1]
                    break
                elif key not in pre_dict:
                    pre_dict[key] = {}
                else:
                    pass
                pre_dict = pre_dict[key]
        tree_dict = self.allkeys(tree_dict)
        # tree_dict = {"data"+str(i): dict for i, dict in enumerate(tree_dict)}

        return tree_dict

    def allkeys(self, a):
        t = []
        keys = a.keys()
        values = a.values()

        for k, v in zip(keys, values):
            name = self.id_text[k]
            info = self.tweet_info[str(k)]
            if isinstance(v, dict):
                t.append({"tweet_id": k, "user": info['user'], "time": info['time'], "name": name, "claster": info['claster'], "favorite": str(info['favorite']), "retweet": str(info['retweet']), 'score': info['score'], "flag": False, "children": self.allkeys(v)})
            else:
                t.append({"tweet_id": k, "user": info['user'], "time": info['time'], "name": name, "claster": info['claster'], "favorite": str(info['favorite']), "retweet": str(info['retweet']), 'score': info['score'], "flag": False})


        return t
