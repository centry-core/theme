#!/usr/bin/python3
# coding=utf-8
# pylint: disable=C0411

""" Method """

import flask  # pylint: disable=E0401

# pylint: disable=E0401
from tools import (
    web,
    router,
    # auth,
    this,
)


class Method:  # pylint: disable=E1101,R0903
    """ Method """

    # pylint: disable=W0201,R0912
    @web.method()
    def target_auth_processor(self, target, router_state):
        """ Method """
        _ = target, router_state
        return True

    # pylint: disable=W0201,R0912
    @web.method()
    def access_denied_handler(self):
        """ Method """
        template_kwargs = router.default_template_kwargs.copy()
        return flask.render_template(f"{this.module_name}:blank.html", **template_kwargs)
