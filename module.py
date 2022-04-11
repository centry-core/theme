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
from collections import defaultdict
from queue import Empty

from flask import request, render_template, redirect, url_for
from pylon.core.tools import log, web, module  # pylint: disable=E0611,E0401
from pylon.core.tools.context import Context as Holder  # pylint: disable=E0401

import tools  # pylint: disable=E0401
# from tools import auth  # pylint: disable=E0401

from .components.commons.navbar import render_navbar
from .components.commons.page import (
    render_page,
    render_test,
    reporting_config,
    render_run_test,
    thresholds,
    test_result_page,
    params_table,
    locations,
    source_card, render_alert_bar,
    # security_results_show_config
)
# from .components.security.common import create_test_processing
# from .components.security.overview import render_overview
# from .components.security.result import result_findings, result_artifacts, tests_logs
from .filters import tag_format, extract_tags, list_pd_to_json

from ..shared.connectors.auth import SessionProject
from ..shared.utils.render import render_template_base


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
        # for rpc_func, rpc_name, proxy_name in self._rpcs:
        #     self.context.rpc_manager.register_function(rpc_func, rpc_name)
        #     #
        #     if hasattr(self, proxy_name):
        #         raise RuntimeError(f"Name '{proxy_name}' is already set")
        #     #
        #     setattr(
        #         self, proxy_name,
        #         getattr(self.context.rpc_manager.call, rpc_name)
        #     )

        # Register tool
        self.descriptor.register_tool(self.descriptor.name, self)


        # self.configuration_init()

        # self.init_slots()

        # Register event listener
        # self.context.event_manager.register_listener("base.index", self.base_event)


        # Register custom Jinja filters
        self.context.app.template_filter()(tag_format)
        self.context.app.template_filter()(extract_tags)
        self.context.app.template_filter()(list_pd_to_json)

        # self.context.app.errorhandler(404)(self.page_404)

    # def init_slots(self):
    #     # Register template slot callback
    #     self.context.slot_manager.register_callback("navbar", render_navbar)
    #     self.context.slot_manager.register_callback("page_content", render_page)
    #     self.context.slot_manager.register_callback("create_test", render_test)
    #     self.context.slot_manager.register_callback("edit_test", render_test)
    #     self.context.slot_manager.register_callback("run_test", render_run_test)
    #     self.context.slot_manager.register_callback("create_threshold", thresholds)
    #     self.context.slot_manager.register_callback("reporting_config", reporting_config)
    #     self.context.slot_manager.register_callback("params_table", params_table)
    #     self.context.slot_manager.register_callback("locations", locations)
    #     self.context.slot_manager.register_callback("source_card", source_card)
    #     self.context.slot_manager.register_callback("alert_bar", render_alert_bar)

    # def configuration_init(self):
    #     bp = self.descriptor.make_blueprint(
    #         url_prefix='/configuration',
    #         static_url_prefix='/configuration',
    #     )
    #     bp.name = 'configuration'
    #     bp.add_url_rule('/', 'index', self.configuration_index)
    #     # bp.add_url_rule('/new', 'create_project', self.project_wizard)
    #     # Register in app
    #     self.context.app.register_blueprint(bp)



    def deinit(self):  # pylint: disable=R0201
        """ De-init module """
        log.info('De-initializing module')

        #
        # Tools
        #

    def get_visible_sections(self):
        """ Get sections visible for current user """
        result = list()
        #
        # current_permissions = auth.resolve_permissions()
        current_permissions = []
        location_result = defaultdict(list)
        #
        for section_key, section_attrs in self.sections.items():
            required_permissions = section_attrs.get("permissions", [])
            #
            if set(required_permissions).issubset(set(current_permissions)):
                #
                item = {
                    "key": section_key,
                }
                item.update(section_attrs)
                #
                location_result[section_attrs["location"]].append(item)
        #
        for i in location_result.items():
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
        # current_permissions = auth.resolve_permissions()
        current_permissions = []
        #
        for subsection_key, subsection_attrs in self.subsections[section].items():
            required_permissions = subsection_attrs.get("permissions", [])
            #
            if set(required_permissions).issubset(set(current_permissions)):
                item = {
                    "key": subsection_key,
                }
                item.update(subsection_attrs)
                #
                result.append(item)
        #
        result.sort(
            key=lambda x: (-x["weight"], x["name"])
        )
        #
        return result

    @auth.decorators.sio_connect()
    def sio_connect(self, sid, environ):
        """ Connect handler """

    @auth.decorators.sio_disconnect()
    def sio_disconnect(self, sid):
        """ Disconnect handler """

    # @web.route('/')
    # def index(self):
    #     log.info('ACCESSED INDEX')
    #     project_id = SessionProject.get()
    #     if not project_id:
    #         return redirect(url_for('theme.new'))
    #     try:
    #         return self.context.rpc_manager.timeout(2).homepage(project_id=project_id)  # define homepage
    #     except Empty:
    #         # return redirect(url_for('theme.page_404'))
    #         return self.page_404()
    #
    # @web.route('/404')
    # def page_404(self, e=None):
    #     return render_template_base('theme:common/empty.html')
    #
    # @web.route('/old')
    # def index_old(self):
    #     chapter = request.args.get('chapter', '')
    #     session_project = SessionProject.get()
    #     # logging.info(session_project)
    #     if not session_project:
    #         # return redirect(url_for('theme.create_project'))
    #         return redirect(url_for('theme.new'))
    #     project_config = self.context.rpc_manager.call.project_get_or_404(project_id=session_project).to_json()
    #     return self.descriptor.render_template("base_old.html", active_chapter=chapter, config=project_config)

    # @web.route('/new')
    # def new(self):
    #     try:
    #         groups = self.context.rpc_manager.timeout(5).project_keycloak_group_list()
    #     except Empty:
    #         groups = []
    #     return self.descriptor.render_template(
    #         "wizard/project_wizard.html",
    #         group_options=groups,
    #     )

    # @web.route('/configuration/<string:section>')
    # def configuration(self, section=None):
    #     log.info(f'configuration section is  {section}')
    #     if not section:
    #         log.warning('No section provided')
    #         return self.page_404()
    #
    #     try:
    #         return render_template(
    #             'theme:base.html',
    #             page_content=self.context.rpc_manager.call_function_with_timeout(
    #                 func=f'configuration_{section}',
    #                 timeout=2,
    #             )
    #         )
    #     except Empty:
    #         return self.page_404()

