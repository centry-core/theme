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
import logging
from queue import Empty

import flask  # pylint: disable=E0401
import jinja2  # pylint: disable=E0401
from flask import request, render_template, redirect, url_for
from pylon.core.tools import log, web  # pylint: disable=E0611,E0401
from pylon.core.tools import module  # pylint: disable=E0611,E0401


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
from .filters import tag_format, extract_tags

from ..shared.connectors.auth import SessionProject
from ..shared.utils.render import render_template_base


class Module(module.ModuleModel):
    """ Pylon module """

    def __init__(self, context, descriptor):
        self.context = context
        self.descriptor = descriptor

    def init(self):
        """ Init module """
        log.info("Initializing module Theme")

        log.info(
            self.descriptor.init_blueprint(
                url_prefix='/',
                static_url_prefix="/",
                # use_template_prefix=False
            ).__dict__
        )

        # self.configuration_init()

        self.init_slots()

        # Register event listener
        # self.context.event_manager.register_listener("base.index", self.base_event)


        # Register custom Jinja filters
        self.context.app.template_filter()(tag_format)
        self.context.app.template_filter()(extract_tags)

        # self.context.app.errorhandler(404)(self.page_404)

    def init_slots(self):
        # Register template slot callback
        self.context.slot_manager.register_callback("navbar", render_navbar)
        self.context.slot_manager.register_callback("page_content", render_page)
        self.context.slot_manager.register_callback("create_test", render_test)
        self.context.slot_manager.register_callback("edit_test", render_test)
        self.context.slot_manager.register_callback("run_test", render_run_test)
        self.context.slot_manager.register_callback("create_threshold", thresholds)
        self.context.slot_manager.register_callback("reporting_config", reporting_config)
        self.context.slot_manager.register_callback("params_table", params_table)
        self.context.slot_manager.register_callback("locations", locations)
        self.context.slot_manager.register_callback("source_card", source_card)
        self.context.slot_manager.register_callback("alert_bar", render_alert_bar)

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
        log.info("De-initializing module Theme")

    @web.route('/')
    def index(self):
        log.info('ACCESSED INDEX')
        project_id = SessionProject.get()
        if not project_id:
            return redirect(url_for('theme.new'))
        try:
            return self.context.rpc_manager.timeout(2).homepage(project_id=project_id)  # define homepage
        except Empty:
            # return redirect(url_for('theme.page_404'))
            return self.page_404()

    @web.route('/404')
    def page_404(self, e=None):
        return render_template_base('theme:common/empty.html')

    @web.route('/old')
    def index_old(self):
        chapter = request.args.get('chapter', '')
        session_project = SessionProject.get()
        # logging.info(session_project)
        if not session_project:
            # return redirect(url_for('theme.create_project'))
            return redirect(url_for('theme.new'))
        project_config = self.context.rpc_manager.call.project_get_or_404(project_id=session_project).to_json()
        return self.descriptor.render_template("base_old.html", active_chapter=chapter, config=project_config)

    @web.route('/new')
    def new(self):
        try:
            groups = self.context.rpc_manager.timeout(5).project_keycloak_group_list()
        except Empty:
            groups = []
        return self.descriptor.render_template(
            "wizard/project_wizard.html",
            group_options=groups,
        )

    @web.route('/configuration/<string:section>')
    def configuration(self, section=None):
        log.info(f'configuration section is  {section}')
        if not section:
            log.warning('No section provided')
            return self.page_404()

        try:
            return render_template(
                'theme:base.html',
                page_content=self.context.rpc_manager.call_function_with_timeout(
                    func=f'configuration_{section}',
                    timeout=2,
                )
            )
        except Empty:
            return self.page_404()
