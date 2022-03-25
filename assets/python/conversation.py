from requests_oauthlib import OAuth1Session
import urllib
import requests
from requests_oauthlib import OAuth1Session, OAuth1
import json
import datetime, time, sys
import re
import datetime
import sys
import emoji
import csv
import itertools
import pandas as pd
import neologdn
# import MySQLdb

from socket import error as SocketError
import errno

# APIの秘密鍵
CK = ''
CKS = ''
AT = ''
ATS = ''

class Get_Tweets:

    def __init__(self):

        self.id = []
        self.searched_id = []
        self.children = []
        self.original_tweets = []
        self.reply_tweets = []
        self.reply_searches = []
        self.url = 'https://api.twitter.com/1.1/search/tweets.json?tweet_mode=extended'
        self.url2 = 'https://api.twitter.com/1.1/statuses/lookup.json?tweet_mode=extended'
        self.url_limit = "https://api.twitter.com/1.1/application/rate_limit_status.json"
        self.session = OAuth1Session(CK, CKS, AT, ATS)
        self.save_count = 0

    def get(self, id=None, keyword=None, want_reply=False):

        while True:
            reset = self.checkLimit()
            get_time = time.mktime(datetime.datetime.now().timetuple())

            # キーワード検索の場合
            if keyword != None:
                params = {'q': keyword, 'count': 100, 'lang': 'ja', 'result_type': 'mixed'}

            if id != None:
                params  = {'id' : id}

            try:
                if keyword != None:
                    res = self.session.get(self.url, params = params)
                if id != None:
                    res = self.session.get(self.url2, params = params)

            # エラー処理
            except SocketError as e:
                print('ソケットエラー errno=',e.errno)
                if unavailableCnt > 10:
                    raise

            if res.status_code == 503:
                # 503 : Service Unavailable
                if unavailableCnt > 10:
                    raise Exception('Twitter API error %d' % res.status_code)

                unavailableCnt += 1
                print ('Service Unavailable 503')
                self.waitUntilReset(time.mktime(datetime.datetime.now().timetuple()) + 30)
                continue

            unavailableCnt = 0

            if res.status_code != 200:
                raise Exception('Twitter API error %d' % res.status_code)

            res_text = json.loads(res.text)

            if len(res_text) == 0:
                break
            # キーワードで検索した時のオリジナルの保存と返信検索作業
            if keyword != None:
                for tweet in res_text["statuses"]:
                    if tweet['full_text'][0:3] != "RT ":
                        print("original_tweet", tweet['full_text'])
                        text = self.screening(tweet['full_text'])

                        if tweet['in_reply_to_status_id'] == None:
                            self.original_tweets.append({'id': str(tweet['id']), 'user': tweet['user']['screen_name'], 'reply_id': str(tweet['in_reply_to_status_id']), 'text': text, 'root': True, 'favorite': tweet["favorite_count"], "retweet": tweet['retweet_count'], "time": '{0:%Y-%m-%d %H:%M:%S}'.format(datetime.datetime.strptime(tweet['created_at'], "%a %b %d %H:%M:%S %z %Y") + datetime.timedelta(hours=9))})
                            self.id.append(tweet["id"])
                        else:
                            original_tweets, reply_tweets, children = self.get(id=tweet['in_reply_to_status_id'], want_reply=True)
                if want_reply == False:
                    tweet_data, children_list = self.save_data(self.original_tweets, self.reply_tweets, self.children)
                    return
                else:
                    # オリジナルツイートの返信検索
                    for original_tweet in self.original_tweets:
                        self.get_reply(original_tweet)
                        # リプライの返信検索
                        result = []
                        for reply_search in self.reply_searches:
                            self.get_reply(reply_search)

                        self.reply_searches = []

                original_tweets = self.original_tweets
                reply_tweets = self.reply_tweets
                children = self.children
                self.save_data(original_tweets, reply_tweets, children)
                return

            if id != None:
                for tweet in res_text:
                    if tweet['full_text'][0:3] != "RT ":
                        text = self.screening(tweet['full_text'])
                        if tweet['in_reply_to_status_id'] == None:
                            self.original_tweets.append({'id': str(tweet['id']), 'user': tweet['user']['screen_name'], 'reply_id': str(tweet['in_reply_to_status_id']), 'text': text, 'root': True, 'favorite': tweet['favorite_count'], 'retweet': tweet['retweet_count'], "time": '{0:%Y-%m-%d %H:%M:%S}'.format(datetime.datetime.strptime(tweet['created_at'], "%a %b %d %H:%M:%S %z %Y") + datetime.timedelta(hours=9))})
                            self.id.append(tweet["id"])
                        else:
                            original_tweets, reply_tweets, children = self.get(id=tweet['in_reply_to_status_id'], want_reply=True)
                    if want_reply == False:
                        tweet_data, children_list = self.save_data(self.original_tweets, self.reply_tweets, self.children)
                        return
                    else:
                        # オリジナルツイートの返信検索
                        for original_tweet in self.original_tweets:
                            self.get_reply(original_tweet)
                            # リプライの返信検索
                            result = []
                            for reply_search in self.reply_searches:
                                self.get_reply(reply_search)

                            self.reply_searches = []

                    original_tweets = self.original_tweets
                    reply_tweets = self.reply_tweets
                    children = self.children
                    self.save_data(original_tweets, reply_tweets, children)
                    return



    def get_reply(self, original_tweet):

        if original_tweet['id'] in self.searched_id:
            return
        print("reply_search: ",original_tweet["text"])
        children = []
        count = 0
        id = []
        original_id = int(original_tweet['id'])
        self.searched_id.append(original_id)
        user_id = original_tweet['user']
        user_id = urllib.parse.quote_plus(user_id)
        max_id = {'max_id': original_id + 40000000000000}
        params = {'q': user_id, 'lang': 'ja', 'count': 100, 'result_type': "mixed"}
        while True:

            reset = self.checkLimit()
            get_time = time.mktime(datetime.datetime.now().timetuple())

            try:
                res = self.session.get(self.url, params = params)
                count = count + 1
            # エラー処理
            except SocketError as e:
                print('ソケットエラー errno=',e.errno)
                if unavailableCnt > 10:
                    raise

            if res.status_code == 503:
                # 503 : Service Unavailable
                if unavailableCnt > 10:
                    raise Exception('Twitter API error %d' % res.status_code)

                unavailableCnt += 1
                print ('Service Unavailable 503')
                self.waitUntilReset(time.mktime(datetime.datetime.now().timetuple()) + 30)
                continue

            unavailableCnt = 0

            if res.status_code != 200:
                raise Exception('Twitter API error %d' % res.status_code)

            res_text = json.loads(res.text)

            if len(res_text["statuses"]) == 0:
                break

            for tweet in res_text['statuses']:
                if tweet['in_reply_to_status_id'] == original_id:
                    if tweet['id'] not in self.id:
                        self.id.append(tweet['id'])
                        self.reply_searches.append({'id': tweet['id'], 'user': tweet['user']['screen_name'], 'reply_id': tweet['in_reply_to_status_id'], 'text': self.screening(tweet['full_text']), 'root': False, 'favorite': tweet['favorite_count'], "time": '{0:%Y-%m-%d %H:%M:%S}'.format(datetime.datetime.strptime(tweet['created_at'], "%a %b %d %H:%M:%S %z %Y") + datetime.timedelta(hours=9))})
                        self.reply_tweets.append({'id': str(tweet['id']), 'user': tweet['user']['screen_name'], 'reply_id': str(tweet['in_reply_to_status_id']), 'text': self.screening(tweet['full_text']), 'root': False, 'favorite': tweet['favorite_count'], 'retweet': tweet['retweet_count'], "time": '{0:%Y-%m-%d %H:%M:%S}'.format(datetime.datetime.strptime(tweet['created_at'], "%a %b %d %H:%M:%S %z %Y") + datetime.timedelta(hours=9))})
                        children.append(tweet['id'])
                params['max_id'] = tweet['id'] -1
            if params['max_id'] <= original_id:
                if len(children) > 0:
                    Str_children = ",".join(map(str, children))
                else:
                    Str_children = "-1"
                self.children.append({'id': str(original_id), 'Str_children': Str_children})
                break
            elif count > 35:
                if len(children) > 0:
                    Str_children = ",".join(map(str, children))
                else:
                    Str_children = "-1"
                self.children.append({'id': str(original_id), 'Str_children': Str_children})
                break

    def checkLimit(self):
        unavailableCnt = 0
        while True:
            try:
                res = self.session.get(self.url_limit)
            except SocketError as e:
                print('erron=',e.errno)
                print('ソケットエラー')
                if unavailableCnt > 10:
                    raise

                self.waitUntilReset(time.mktime(datetime.datetime.now().timetuple()) + 30)
                unavailableCnt += 1
                continue

            if res.status_code == 503:
                # 503 : Service Unavailable
                if unavailableCnt > 10:
                    raise Exception('Twitter API error %d' % res.status_code)

                unavailableCnt += 1
                print ('Service Unavailable 503')
                self.waitUntilReset(time.mktime(datetime.datetime.now().timetuple()) + 30)
                continue

            unavailableCnt = 0

            if res.status_code != 200:
                raise Exception('Twitter API error %d' % res.status_code)

            remaining_search,remaining_user, remaining_limit ,reset = self.getLimitContext(json.loads(res.text))
            if remaining_search <= 10 or remaining_user <=10 or remaining_limit <= 10:
                self.waitUntilReset(reset+30)
            else :
                break

        sec = reset - time.mktime(datetime.datetime.now().timetuple())
        print(remaining_search,remaining_user, remaining_limit ,sec)
        return reset

    def waitUntilReset(self, reset):
        seconds = reset - time.mktime(datetime.datetime.now().timetuple())
        seconds = max(seconds, 0)
        print ('\n     =====================')
        print ('     ==  %d 秒　待ち ==' % seconds)
        print ('     =====================')
        sys.stdout.flush()
        time.sleep(seconds + 10)  # 念のため + 10 秒

    def getLimitContext(self, res_text):
        # searchの制限情報
        remaining_search = res_text['resources']['search']['/search/tweets']['remaining']
        reset1     = res_text['resources']['search']['/search/tweets']['reset']
        # lookupの制限情報
        remaining_user = res_text['resources']['statuses']['/statuses/lookup']['remaining']
        reset2     = res_text['resources']['statuses']['/statuses/lookup']['reset']
        # 制限情報取得の制限情報
        remaining_limit = res_text['resources']['application']['/application/rate_limit_status']['remaining']
        reset3 = res_text['resources']['application']['/application/rate_limit_status']['reset']

        return int(remaining_search),int(remaining_user),int(remaining_limit) ,max(int(reset1),int(reset2),int(reset3))

    def save_data(self, original_tweets, reply_tweets, children):

        tweet_data = []
        tweet_data.append(original_tweets)
        tweet_data.append(reply_tweets)
        tweet_data = list(itertools.chain.from_iterable(tweet_data))
        tweet_data = pd.DataFrame(tweet_data)
        children_list = pd.DataFrame(children)
        if self.save_count == 0:
            tweet_data.to_csv("assets/data/tweets_data/topic2_4.csv", encoding="utf_8_sig", index=False)
            children_list.to_csv("assets/data/tweets_data/topic2_4_child.csv", index=False)
            self.save_count = 1
        else:
            tweet_data.to_csv("assets/data/tweets_data/topic2_4.csv", encoding="utf_8_sig", mode="a", index=False, header=False)
            children_list.to_csv("assets/data/tweets_data/topic2_4_child.csv", mode="a", index=False, header=False)

        self.id = []
        self.searched_id = []
        self.children = []
        self.original_tweets = []
        self.reply_tweets = []
        self.reply_searches = []
        return

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

        while s.find("\n") != -1 :
            index_ret = s.find("\n")
            s = s.replace(s[index_ret],"。")

        s = re.sub(r'https?://[\w/:%#\$&\?\(\)~\.=\+\-…]+', "", s)

        return s
