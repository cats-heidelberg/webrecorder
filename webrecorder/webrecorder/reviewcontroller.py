from webrecorder.basecontroller import BaseController, wr_api_spec
from bottle import request, response
import json

# ============================================================================
class ReviewController(BaseController):
    def init_routes(self):

        # Review
        wr_api_spec.set_curr_tag('review')

        @self.app.get('/api/v1/review')
        @self.api(resp='reviewcolls')
        def get_review():
            collections = list()
            for r in self.redis.smembers('review'):
                j = json.loads(r)
                collections.append(self.user_manager.all_users.make_user(j[0]).get_collection_by_name(j[1]))
            print(collections)
            return {'collections': [coll.serialize() for coll in collections]}

        @self.app.post('/api/v1/review')
        @self.api(query=[],
                  req_desc='review coll')
        def post_review():
            print([request.query['user'], request.query['collID']])
            self.redis.sadd('review', json.dumps([request.query['user'], request.query['collID']]))

            return ("OK")

        @self.app.delete('/api/v1/review')
        @self.api(query=[],
                  req_desc='review coll')
        def delete_review():
            print("deleting " + str(request.query['collID']))
            self.redis.srem('review', json.dumps([request.query['user'], request.query['collID']]))