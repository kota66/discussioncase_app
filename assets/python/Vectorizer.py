import tensorflow_hub as hub
import numpy as np
import tensorflow_text
import spacy
import ginza
from spacy.lang.ja import stop_words
import nltk
import itertools
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import collections
import urllib
import neologdn
import re
import datetime, time, sys
import emoji


# for avoiding error
import ssl

class EmbedRankpp():

    def __init__(self, params=0.5, n_keys=2):

        self.n_keys = n_keys
        self.param = params
        self.keyphrase = {}
        self.candidate_phrases = {}
        self.sentences = {}
        self.unselected_sentences = []
        self.candidate_embedding = []
        self.discussion_rank_dict = {}
        self.doc_sep = []

    def stopwords(self, sentences):

        slothlib_path = 'http://svn.sourceforge.jp/svnroot/slothlib/CSharp/Version1/SlothLib/NLP/Filter/StopWord/word/Japanese.txt'
        slothlib_file = urllib.request.urlopen(url=slothlib_path)
        slothlib_stopwords = [line.decode("utf-8").strip() for line in slothlib_file]
        slothlib_stopwords = [ss for ss in slothlib_stopwords if not ss==u'']
        stopwords = list(slothlib_stopwords)
        stopwords.extend(['ただ', 'こんな', 'そんな', 'あんな', 'せい', '何', 'なに', 'これ', 'それ', 'こと', '事', '方', 'なん', 'ため', 'ら', '0%', '0割'])

        result = {}
        for n, sentence in sentences.items():
            result[n] = [i for i in sentence if i not in stopwords]

        return result

    def screening(self, text) :
        s = text
        #@screen_nameを外す
        while s.find("@") != -1 :
            index_at = s.find("@")
            if s.find(" ") != -1  :
                index_sp = s.find(" ",index_at)
                if index_sp != -1 :
                    s = s.replace(s[index_at:index_sp+1],"")
                else :
                    s = s.replace(s[index_at:],"")
            else :
                s = s.replace(s[index_at:],"")
        # 正規化
        s = neologdn.normalize(s)
        #RTを外す
        if s[0:3] == "RT " :
            s = s.replace(s[0:3],"")

        #改行を外す
        while s.find("\n") != -1 :
            index_ret = s.find("\n")
            s = s.replace(s[index_ret],"。")

        #URLを外す
        s = re.sub(r'https?://[\w/:%#\$&\?\(\)~\.=\+\-…]+', "", s)
        #絵文字を「。」に置き換え その１
        non_bmp_map = dict.fromkeys(range(0x10000, sys.maxunicode + 1), '。')
        s = s.translate(non_bmp_map)
        #絵文字を「。」に置き換え　その２
        s=''.join(c if c not in emoji.UNICODE_EMOJI else '。' for c in s  )
        #置き換えた「。」が連続していたら１つにまとめる
        while s.find('。。') != -1 :
            index_period = s.find('。。')
            s = s.replace(s[index_period:index_period+2],'。')

        #ハッシュタグを外す
        while s.find('#') != -1 :
            index_hash = s.find('#')
            s = s[0:index_hash]

        tmp = re.sub(r'[!-/:-@[-`{-~]', r'', s)

        s = re.sub(u'[■-♯]', ' ', tmp)
        s = re.sub('ω|´|・|꒪|ꇴ|「|」||↓|❁|①|③|④|②|…|❓|❗️ |ʖ|Д|ﾟ|ˋ|ヮ|≧|≦|＼|o|༎|ຶ|Ψ|∀|｀|¬|✧|╹|✅','',s)

        tmp = re.sub(r'(\d)([,.])(\d+)', r'\1\3', s)
        s = re.sub(r'\d+', '0', tmp)

        # 空白を削除
        while s.find("\u3000") != -1 :
            index_ret = s.find("\u3000")
            s = s.replace(s[index_ret],"")
        while s.find(" ") != -1 :
            index_ret = s.find("　")
            s = s.replace(s[index_ret],"")
        while s.find("\u200d") != -1 :
            index_ret = s.find("\u200d")
            s = s.replace(s[index_ret],"")
        if s == '':
            s = "None"

        # s = re.sub("\u", '', s)

        return s

    def extract_candidate(self, texts):

        # モデルのロード
        nlp = spacy.load('ja_ginza')
        stopwords = list(stop_words.STOP_WORDS)
        nltk.corpus.stopwords.words_org = nltk.corpus.stopwords.words
        nltk.corpus.stopwords.words = lambda lang : stopwords if lang == 'japanese' else nltk.corpus.stopwords.words_org(lang)
        # 文単位に分割
        a = []
        docs = nlp.pipe(texts, disable=['ner'])
        for doc in docs:
            for s in doc.sents:
                a.append(str(s))
            self.doc_sep.append(a)
            a = []
        docs = texts


        idx = 0
        for doc in texts:
            self.sentences[idx] = self.screening(doc)
            idx = idx + 1

        # 名詞句抽出
        docs = nlp.pipe(list(self.sentences.values()), disable=['ner'])
        keyphrase_candidates = []
        noun = []
        date = []
        pos = 'a'
        for i, doc in enumerate(docs):
            index = -2
            del_word = []
            num = 'a'
            for tok in doc:
                # 代名詞削除
                if tok.pos_ == 'PRON':
                    if str(tok.text) not in del_word:
                        del_word.append(str(tok.text))
                if tok.pos_ == 'PUNCT':
                    if str(tok.text) not in del_word:
                        del_word.append(str(tok.text))

                # 時間割合等削除
                if tok.pos_ == 'NUM':
                    if index != -2:
                        if num not in del_word and num != 'a':
                            del_word.append(num)
                    num = str(tok.text)
                    index = int(tok.i)

                elif tok.i == index+1 and tok.pos_ == "NOUN":
                    num = num + str(tok.text)
                    index = int(tok.i)

                else:
                    if num != 'a' and num not in del_word:
                        del_word.append(num)
                    index = -3
                    pos = 'else'

            for n in doc.noun_chunks:
                n = str(n)
                for word in del_word:
                    while n.find(word) != -1 :
                        n = n.replace(word,"")
                if n != '':
                    noun.append(n)


            self.candidate_phrases[i] = noun
            noun = []

        candidate_phrases = self.candidate_phrases
        candidate_phrases = self.stopwords(candidate_phrases)

        return self.keyphrase_embedrank(self.sentences, candidate_phrases)

    def discussion_rank(self, nodes, id_discussion, links, keyword_id, discussion_id):

        ssl._create_default_https_context = ssl._create_unverified_context
        model_url = "assets/python/universal-sentence-encoder-multilingual-large_3"
        embed = hub.load(model_url)
        embed_array = np.zeros((len(keyword_id.keys()), len(id_discussion.keys())))
        for node in nodes:
            node_vector = embed(node['id'])
            ids = node['structure_id']
            discussion = [id_discussion[i] for i in ids]
            discussion_vector = embed(discussion)
            print('vector終わり')
            N = len(discussion)
            id = keyword_id[node['id']]
            embed_array = self.cos_sim(node_vector, discussion_vector, N, rule="discusion", ids=ids, array=embed_array, id=id)

        embed_array = pd.DataFrame(embed_array, index=list(keyword_id.keys()), columns=list(id_discussion.values()))
        embed_array.to_csv("assets/data/tweets_data/zikkenn_topic2.csv", encoding="utf_8_sig")
        # embed_array = pd.read_csv('assets/data/tweets_data/embed_array.csv', encoding='utf_8_sig', index_col=0)
        discussion_params = 0.5
        for node in nodes:
            id = node['id']

            for link in links:
                target = link['target']
                source = link['source']
                if id == target or id == source:
                    if id == target:
                        link_id = source
                    else:
                        link_id = target
                    v = link['value']

                    array = embed_array.loc[[id, link_id]]
                    array = array.T
                    split = array.to_dict(orient='split')
                    index = split['index']
                    columns = split['columns']
                    values = []
                    discussion_values = {}
                    for i, data in enumerate(split['data']):
                        if data[0] > 0 and data[1] > 0:
                            discussion_value = discussion_params * data[0] + (1 - discussion_params) * (data[1] + v)
                            discussion = index[i]
                            no = discussion_id[discussion]
                            discussion_values[no] = discussion_value

                    discussion_sort = sorted(discussion_values.items(), key=lambda x:x[1], reverse=True)

                    node['discussion_info'][link_id] = list(discussion_sort)

        return nodes

    def keyphrase_embedrank(self, sentences, keyphrase_candidates):

        ssl._create_default_https_context = ssl._create_unverified_context
        model_url = "assets/python/universal-sentence-encoder-multilingual-large_3"
        embed = hub.load(model_url)

        for  key, sent, idx in zip(list(keyphrase_candidates.values()), list(sentences.values()), list(sentences.keys())):
            N = len(key)
            if N < self.n_keys:
                self.keyphrase[idx] = key
                continue

            # print("sent: ", sent, "key: ", key)
            # keyphraseのベクトル生成
            cand_vectors = embed(key)
            # sentenceのベクトル生成
            sent_vector = embed(sent)
            # mmr計算
            mmr_sort = self.mmr(sent_vector, cand_vectors, N)

            self.keyphrase[idx] = [key[i] for i in mmr_sort[:self.n_keys]]

        return self.keyphrase, self.sentences, self.candidate_phrases, self.doc_sep

    def mmr(self, sent_vector, cand_vectors, N):

        sentence_similarity = self.cos_sim(sent_vector, cand_vectors, N)
        # print("sentence_similarity", sentence_similarity)
        max_idx = np.argmax(sentence_similarity)
        mmr = np.zeros(N)
        mmr[max_idx] = sentence_similarity[max_idx]
        unselect_idx = list(range(len(sentence_similarity)))
        selected_idx = [max_idx]
        unselect_idx.remove(max_idx)


        for idx in unselect_idx:
            sim1 = sentence_similarity[idx]

            select_vector = cand_vectors[idx]
            selected_vectors = [cand_vectors[i] for i in selected_idx]
            sim2 = np.max(self.cos_sim(select_vector, selected_vectors, len(selected_idx)))
            scores = self.param * sim1 - (1-self.param) * sim2
            # print("idx: ", idx, "scores: ", scores)
            mmr[idx] = scores

            selected_idx.append(idx)
        # print("mmr: ", mmr)
        mmr_sort = np.argsort(-mmr)
        # print("mmr_sort: ", mmr_sort)

        return mmr_sort

    def cos_sim(self, select_vector, selected_vectors, N, rule="keyword", ids=[], array=[], id=1):

        if rule == "keyword":
            cosine_similarity = []
            for idx in range(N):
                v1 = select_vector
                v2 = selected_vectors[idx]
                cos_sim = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                cosine_similarity.append(cos_sim)
            sim = np.array(cosine_similarity)
        else:
            cosine_similarity = array
            for idx, discussion_id in zip(range(N), ids):
                v1 = select_vector
                v2 = selected_vectors[idx]
                cos_sim = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                cosine_similarity[id][discussion_id] = cos_sim
            sim = cosine_similarity

        return sim
