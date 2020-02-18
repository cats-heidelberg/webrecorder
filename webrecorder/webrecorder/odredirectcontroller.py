from webrecorder.basecontroller import BaseController, wr_api_spec
from bottle import request, response


# ============================================================================
class OdRedirectController(BaseController):
    def init_routes(self):
        # ODREDIRECT
        wr_api_spec.set_curr_tag('OdRedirect')

        @self.app.route('/api/v1/od')
        def test():
            return ("test")
