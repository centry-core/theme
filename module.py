#!/usr/bin/python3
# coding=utf-8

#   Copyright 2021 getcarrier.io
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

""" Module """
import re
from collections import defaultdict

from flask import redirect, url_for, g
from pylon.core.tools import log, web, module  # pylint: disable=E0611,E0401
from pylon.core.tools.context import Context as Holder  # pylint: disable=E0401

import tools  # pylint: disable=E0401
from tools import auth  # pylint: disable=E0401

from .filters import tag_format, extract_tags, list_pd_to_json


class Module(module.ModuleModel):
    """ Pylon module """

    def __init__(self, context, descriptor):
        self.context = context
        self.descriptor = descriptor

        # Registry
        self.landing = {"kind": "holder"}  # {kind, prefix|route|url}
        self.sections = dict()  # section_key -> {name, kind, location, permissions, icon_class, prefix|route|url}  # pylint: disable=C0301
        self.subsections = dict()  # section_key -> subsection_key -> {name, kind, permissions, icon_class, prefix|route|url}  # pylint: disable=C0301
        self.pages = dict()  # section_key -> subsection_key -> page_key -> {kind, prefix|route|url}  # pylint: disable=C0301

        # Public routes
        self._public = [
            {
                "uri": re.escape("/access_denied"),
            },
            {
                "uri": f'{re.escape("/socket.io/")}.*',
            },
            {
                "uri": f'{re.escape("/css/")}.*',
            },
            {
                "uri": f'{re.escape("/img/")}.*',
            },
            {
                "uri": f'{re.escape("/js/")}.*',
            },
            {
                "uri": f'{re.escape("/vendor/")}.*',
            },
            {
                "uri": re.escape("/robots.txt"),
            },
            {
                "uri": re.escape("/favicon.ico"),
            },
        ]

    def init(self):
        """ Init module """
        log.info('Initializing module')

        # Init Blueprint
        self.descriptor.init_blueprint(
            url_prefix='/',
            static_url_prefix='/',
            # use_template_prefix=False
        )

        # SocketIO events
        self.context.sio.on("connect", handler=self.sio_connect)
        self.context.sio.on("disconnect", handler=self.sio_disconnect)
        # Public routes
        for route in self._public:
            auth.add_public_rule(route)

        # Hooks
        self.context.app.context_processor(lambda: {"tools": tools})
        self.context.app.errorhandler(Exception)(self._error_handler)
        self.context.app.before_request(self._before_request_hook)
        self.context.app.after_request(self._after_request_hook)

        # Init RPCs
        self.descriptor.init_rpcs()

        # Register tool
        self.descriptor.register_tool(self.descriptor.name, self)

        # Register custom Jinja filters
        self.context.app.template_filter()(tag_format)
        self.context.app.template_filter()(extract_tags)
        self.context.app.template_filter()(list_pd_to_json)

    def _error_handler(self, error):
        log.error("Error: %s", error)
        return self.descriptor.render_template("access_denied.html"), 400

    def _before_request_hook(self):  # pylint: disable=R0201
        g.theme = Holder()
        g.theme.active_section = None
        g.theme.active_subsection = None

    def _after_request_hook(self, response):
        additional_headers = self.descriptor.config.get(
            "additional_headers", dict()
        )
        for key, value in additional_headers.items():
            response.headers[key] = value
        return response

    def deinit(self):  # pylint: disable=R0201
        """ De-init module """
        log.info('De-initializing module')

    def get_visible_sections(self) -> list:
        """ Get sections visible for current user """
        result = list()
        #
        current_permissions = auth.resolve_permissions()
        location_result = defaultdict(list)
        #
        for section_key, section_attrs in self.sections.items():
            required_permissions = section_attrs.get("permissions", [])
            #
            if set(required_permissions).issubset(set(current_permissions)):
                #
                item = {
                    "key": section_key,
                    **section_attrs
                }
                #
                location_result[section_attrs["location"]].append(item)
        #
        log.info('location_result items %s', location_result.items())
        for i in location_result.values():
            result.extend(sorted(i, key=lambda x: (-x["weight"], x["name"])))
        #
        return result

    def get_visible_subsections(self, section):
        """ Get subsections visible for current user """
        result = list()
        #
        if section not in self.subsections:
            return result
        #
        current_permissions = auth.resolve_permissions()
        #
        for subsection_key, subsection_attrs in self.subsections[section].items():
            required_permissions = subsection_attrs.get("permissions", [])
            #
            if set(required_permissions).issubset(set(current_permissions)):
                item = {
                    "key": subsection_key,
                    **subsection_attrs
                }
                #
                result.append(item)
        #
        result.sort(key=lambda x: (-x["weight"], x["name"]))
        #
        return result

    @auth.decorators.sio_connect()
    def sio_connect(self, sid, environ):
        """ Connect handler """

    @auth.decorators.sio_disconnect()
    def sio_disconnect(self, sid):
        """ Disconnect handler """

    # Routes
    @web.route("/")
    def index(self):  # pylint: disable=R0201
        """ Index route """
        landing_kind = self.landing.get("kind", "default")
        #
        if landing_kind == "holder":
            sections = self.get_visible_sections()
            if sections:
                return redirect(
                    url_for(
                        "theme.route_section", section=sections[0]["key"]
                    )
                )
        elif landing_kind == "route":
            return redirect(
                url_for(
                    self.landing.get("route", "theme.access_denied")
                )
            )
        elif landing_kind == "redirect":
            return redirect(
                self.landing.get("url", url_for("theme.access_denied"))
            )
        elif landing_kind == "slot":
            return self.descriptor.render_template(
                "index.html",
                logout_url=self.descriptor.config.get("logout_url", "#"),
                prefix=self.landing.get("prefix", "_"),
                title=self.landing.get("title", "Index"),
            )
        #
        return redirect(url_for("theme.access_denied"))

    @web.route("/-/<section>/")
    def route_section(self, section):  # pylint: disable=R0201
        """ Section route """
        g.theme.active_section = section
        #
        if section not in self.sections:
            return redirect(url_for("theme.access_denied"))
        #
        section_attrs = self.sections[section]
        section_kind = section_attrs.get("kind", "default")
        #
        if section_kind == "holder":
            subsections = self.get_visible_subsections(section)
            if subsections:
                return redirect(
                    url_for(
                        "theme.route_section_subsection",
                        section=section, subsection=subsections[0]["key"]
                    )
                )
        elif section_kind == "route":
            return redirect(
                url_for(
                    section_attrs.get("route", "theme.access_denied")
                )
            )
        elif section_kind == "redirect":
            return redirect(
                section_attrs.get("url", url_for("theme.access_denied"))
            )
        elif section_kind == "slot":
            return self.descriptor.render_template(
                "index.html",
                logout_url=self.descriptor.config.get("logout_url", "#"),
                prefix=section_attrs.get("prefix", f"{section}_"),
                title=section_attrs.get("title", section.capitalize()),
            )
        #
        return redirect(url_for("theme.access_denied"))

    @web.route("/-/<section>/<subsection>/")
    def route_section_subsection(self, section, subsection):  # pylint: disable=R0201
        """ Subsection route """
        g.theme.active_section = section
        g.theme.active_subsection = subsection
        #
        if section not in self.subsections:
            return redirect(url_for("theme.access_denied"))
        #
        if subsection not in self.subsections[section]:
            return redirect(url_for("theme.access_denied"))
        #
        subsection_attrs = self.subsections[section][subsection]
        subsection_kind = subsection_attrs.get("kind", "default")
        #
        if subsection_kind == "route":
            return redirect(
                url_for(
                    subsection_attrs.get("route", "theme.access_denied")
                )
            )
        elif subsection_kind == "redirect":
            return redirect(
                subsection_attrs.get("url", url_for("theme.access_denied"))
            )
        elif subsection_kind == "slot":
            return self.descriptor.render_template(
                "index.html",
                logout_url=self.descriptor.config.get("logout_url", "#"),
                prefix=subsection_attrs.get(
                    "prefix", f"{section}_{subsection}_"
                ),
                title=subsection_attrs.get("title", subsection.capitalize()),
            )
        #
        return redirect(url_for("theme.access_denied"))

    @web.route("/-/<section>/<subsection>/<page>")
    def route_section_subsection_page(self, section, subsection, page):  # pylint: disable=R0201
        """ Page route """
        g.theme.active_section = section
        g.theme.active_subsection = subsection
        #
        if section not in self.pages:
            return redirect(url_for("theme.access_denied"))
        #
        if subsection not in self.pages[section]:
            return redirect(url_for("theme.access_denied"))
        #
        if page not in self.pages[section][subsection]:
            return redirect(url_for("theme.access_denied"))
        #
        page_attrs = self.pages[section][subsection][page]
        page_kind = page_attrs.get("kind", "default")
        #
        if page_kind == "route":
            return redirect(
                url_for(
                    page_attrs.get("route", "theme.access_denied")
                )
            )
        elif page_kind == "redirect":
            return redirect(
                page_attrs.get("url", url_for("theme.access_denied"))
            )
        elif page_kind == "slot":
            return self.descriptor.render_template(
                "index.html",
                logout_url=self.descriptor.config.get("logout_url", "#"),
                prefix=page_attrs.get(
                    "prefix", f"{section}_{subsection}_{page}_"
                ),
                title=page_attrs.get("title", page.capitalize()),
            )
        #
        return redirect(url_for("theme.access_denied"))

    @web.route("/access_denied")
    def access_denied(self):  # pylint: disable=R0201
        """ Access denied page """
        return self.descriptor.render_template("access_denied.html")

    @property
    def access_denied_part(self):
        """ Get 'Access denied' template part """
        with self.context.app.app_context():
            return self.descriptor.render_template("part/access_denied.html")

    @web.route("/socket.io/")
    def socketio(self):  # pylint: disable=R0201
        """ SocketIO reference """
        return redirect(url_for("theme.index"))
