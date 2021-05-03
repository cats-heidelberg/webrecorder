import logging
import os
import traceback

from webrecorder.models.base import RedisUniqueComponent, RedisOrderedList

logger = logging.getLogger('wr.io')



class DoiModel(RedisUniqueComponent):
    """Collection Redis building block.

    :cvar str COLL_ID
    :ivar RedisOrderedList
    :ivar RedisNamedMap list_names: n.s.
    """
    MY_TYPE = 'doimodel'

    def __init__(self, **kwargs):
        """Initialize collection Redis building block."""
        super(Review, self).__init__(**kwargs)
        self.colls = RedisOrderedList(self.LISTS_KEY, self)

    @classmethod
    def init_props(cls, config):
        """Initialize class variables.

        :param dict config: Webrecorder configuration
        """

        cls.COMMIT_WAIT_SECS = int(config['commit_wait_secs'])
