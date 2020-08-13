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
            j = list()
            for r in self.redis.smembers('review'):
                j.append(json.loads(r))
            return json.dumps(j)

        @self.app.post('/api/v1/review')
        @self.api(query=[],
                  req_desc='review coll')
        def post_review():
            print([request.query['user'], request.query['collID']])
            self.redis.sadd('review', json.dumps([request.query['user'], request.query['collID']]))

            return ("OK")
