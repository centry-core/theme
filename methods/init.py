#!/usr/bin/python3
# coding=utf-8
# pylint: disable=C0411

""" Method """

# pylint: disable=E0401
from tools import (
    web,
    router,
    # context,
    this,
    # log,
    # auth,
)


class Method:  # pylint: disable=E1101,R0902,R0903
    """ Method """

    # pylint: disable=W0201,R0912
    @web.init()
    def init(self):
        """ Init """
        #
        # Core
        #
        # auth.add_public_rule({"uri": f"{context.url_prefix}/"})
        #
        self.descriptor.register_tool("theme", self)
        #
        router.default_template = f"{this.module_name}:index.html"
        #
        if "app_title" in self.descriptor.config:
            router.default_template_kwargs = {
                "app_title": self.descriptor.config.get("app_title"),
            }
        #
        # router.target_auth_processor = self.target_auth_processor
        # router.access_denied_handler = self.access_denied_handler
        #
        router.register_mode()

    # pylint: disable=W0201,R0912
    @web.deinit()
    def deinit(self):
        """ De-init """
