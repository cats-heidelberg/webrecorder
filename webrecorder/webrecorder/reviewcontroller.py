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
#            if not self.access.is_superuser():
#                return ('Access Denied')
            collections = list()
            for r in self.redis.smembers('review'):
                j = json.loads(r)
                if self.user_manager.all_users.make_user(j[0]).get_collection_by_name(j[1]):
                    collections.append(self.user_manager.all_users.make_user(j[0]).get_collection_by_name(j[1]))

            return {'collections': [coll.serialize() for coll in collections]}

        @self.app.post('/api/v1/review')
        def post_review():
#            if not self.access.is_superuser():
#                return ('Access Denied')

            data = request.json or {}
            print("reviewControllerpostusername"+request.query['user'])
            print("reviewControllerpostcolltitle"+data.get('coll_nameID'))
            self.redis.sadd('review', json.dumps([request.query['user'], data.get('coll_nameID')]))

            return ("OK")

        @self.app.delete('/api/v1/review')
        @self.api(query=[],
                  req_desc='review coll delete')
        def delete_review():
            if not self.access.is_superuser():
                return ('Access Denied')
            print("reviewControllerdelete"+request.query.get('coll_nameID'))
            self.redis.srem('review', json.dumps([request.query['user'], request.query.get('coll_nameID')]))
