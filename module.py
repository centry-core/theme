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
from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import module  # pylint: disable=E0611,E0401

from .components.commons.navbar import render_navbar
from .components.commons.page import (
    render_page,
    render_test,
    reporting_config,
    render_run_test,
    test_result_page,
    params_table,
    locations,
    source_card, render_alert_bar
)
from .components.security.common import create_test_processing
from .components.security.result import result_findings, result_artifacts, tests_logs
from .filters import tag_format

from ..shared.connectors.auth import SessionProject


class Module(module.ModuleModel):
    """ Galloper module """

    def __init__(self, settings, root_path, context):
        self.settings = settings
        self.root_path = root_path
        self.context = context

    def init(self):
        """ Init module """
        log.info("Initializing module Theme")
        bp = flask.Blueprint(  # pylint: disable=C0103
            "theme", "plugins.theme.plugin",
            root_path=self.root_path,
            url_prefix=f"{self.context.url_prefix}/"
        )
        bp.jinja_loader = jinja2.ChoiceLoader([
            jinja2.loaders.PackageLoader("plugins.theme", "templates"),
        ])
        bp.add_url_rule("/", "index", self.index)
        bp.add_url_rule("/new", "create_project", self.project_wizard)
        # Register in app
        self.context.app.register_blueprint(bp)
        # Register template slot callback
        self.context.slot_manager.register_callback("navbar", render_navbar)
        self.context.slot_manager.register_callback("page_content", render_page)
        self.context.slot_manager.register_callback("create_test", render_test)
        self.context.slot_manager.register_callback("edit_test", render_test)
        self.context.slot_manager.register_callback("run_test", render_run_test)
        self.context.slot_manager.register_callback("reporting_config", reporting_config)
        self.context.slot_manager.register_callback("params_table", params_table)
        self.context.slot_manager.register_callback("locations", locations)
        self.context.slot_manager.register_callback("source_card", source_card)
        self.context.slot_manager.register_callback("create_test_processing", create_test_processing)
        self.context.slot_manager.register_callback("test_result_page", test_result_page)
        self.context.slot_manager.register_callback("security_findings_table", result_findings)
        self.context.slot_manager.register_callback("security_artifacts_table", result_artifacts)
        self.context.slot_manager.register_callback("security_logs_list", tests_logs)
        self.context.slot_manager.register_callback("alert_bar", render_alert_bar)

        # Register event listener
        # self.context.event_manager.register_listener("base.index", self.base_event)

        # Register custom Jinja filters
        self.context.app.template_filter()(tag_format)


    def deinit(self):  # pylint: disable=R0201
        """ De-init module """
        log.info("De-initializing module Theme")

    def index(self):
        chapter = request.args.get('chapter', '')
        session_project = SessionProject.get()
        logging.info(session_project)
        if not session_project:
            return redirect(url_for('theme.create_project'))
        project_config = self.context.rpc_manager.call.project_get_or_404(project_id=session_project).to_json()
        return render_template("base.html", active_chapter=chapter, config=project_config)

    def project_wizard(self):
        import random
        try:
            groups = self.context.rpc_manager.timeout(5).project_keycloak_group_list()
        except Empty:
            groups = []
        return render_template(
            "wizard/project_wizard.html",
            group_options=groups,
            cache_prevent=random.random()
        )
