from webrecorder.basecontroller import BaseController, wr_api_spec
from bottle import request, response
import json

# ============================================================================
class ReviewController(BaseController):
    REVIEW_KEY = 'review'
    def init_routes(self):
        # Review
        wr_api_spec.set_curr_tag('review')

        @self.app.get('/api/v1/review')
        @self.api(resp='reviewcolls')
        def get_review():
            return json.dumps(redis.smembers(REVIEW_KEY))

        @self.app.post('/api/v1/review')
        @self.api(query=[],
                  req_desc='review coll')
        def post_review():
            print(request.json)

            return ("OK")
