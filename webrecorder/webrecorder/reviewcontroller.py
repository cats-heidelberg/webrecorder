from webrecorder.basecontroller import BaseController, wr_api_spec
from bottle import request, response


# ============================================================================
class ReviewController(BaseController):
    def init_routes(self):
        # Review
        wr_api_spec.set_curr_tag('review')

        @self.app.get('/api/v1/review')
        @self.api(resp='reviewcolls')
        def get_review():
            return ("test")

        @self.app.post('/api/v1/review')
        @self.api(query=[],
                  req_desc='review coll')
        def post_review(req):
            print(request.json)
            return ("OK")
