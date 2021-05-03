from webrecorder.basecontroller import BaseController, wr_api_spec
from bottle import request, response
import json

# ============================================================================
class DoiController(BaseController):
    def init_routes(self):

        # Review
        wr_api_spec.set_curr_tag('doimodel')


        @self.app.post('/api/v1/doi')
        @self.api(query=[],
                  req_desc='doi coll')
        def post_doi():
            if self.redis.sismember('doimodel', request.query['DOI']) == 0:
                self.redis.sadd('doimodel', ""+request.query['DOI']+"_1"))
                print("reviewControllerpost"+request.query['DOI']+"_1")
                return {'DOI': ""+request.query['DOI']+"_1"}
            elif self.redis.sismember('doimodel', ""+request.query['DOI']+"_1") == 0:
                self.redis.sadd('doimodel', ""+request.query['DOI']+"_2"))
                print("reviewControllerpost"+request.query['DOI']+"_2")
                return {'DOI': ""+request.query['DOI']+"_2"}

            else:
                return self._raise_error(400, "DOI could not be created")



            return ("OK")
