#!/usr/bin/python3
# coding=utf-8

#   Copyright 2023 getcarrier.io
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

""" Route """

import flask
from flask import redirect, url_for, g, request, Response

from pylon.core.tools import log  # pylint: disable=E0611,E0401,W0611
from pylon.core.tools import web  # pylint: disable=E0611,E0401

from tools import auth  # pylint: disable=E0401


class Route:  # pylint: disable=E1101,R0903
    """
        Route Resource

        self is pointing to current Module instance

        By default routes are prefixed with module name
        Example:
        - pylon is at "https://example.com/"
        - module name is "demo"
        - route is "/"
        Route URL: https://example.com/demo/

        web.route decorator takes the same arguments as Flask route
        Note: web.route decorator must be the last decorator (at top)

        Route resources use check auth decorator
        auth.decorators.check takes the following arguments:
        - permissions
        - scope_id=1
    """

    @web.route("/~/<mode>/~/", defaults={"parameter": None}, endpoint="route_mode_index")
    @web.route("/~/<mode>/~/<parameter>/~/", endpoint="route_mode_index_with_parameter")
    def _route_mode_index(self, mode, parameter):  # pylint: disable=R0201
        """ Index route """
        if mode not in self.modes:
            return redirect(url_for("theme.access_denied"))
        if mode not in self.mode_landing:
            self.mode_landing[mode] = {"kind": "holder"}
        #
        g.theme.active_mode = mode
        g.theme.active_parameter = parameter
        #
        landing_kind = self.mode_landing[mode].get("kind", "default")
        #
        if landing_kind == "holder":
            sections = self.get_sections()
            if sections:
                if parameter is None:
                    return redirect(
                        url_for(
                            "theme.route_mode_section",
                            mode=mode, section=sections[0]["key"]
                        )
                    )
                else:
                    return redirect(
                        url_for(
                            "theme.route_mode_section_with_parameter",
                            mode=mode, parameter=parameter, section=sections[0]["key"]
                        )
                    )
        elif landing_kind == "route":
            return redirect(
                url_for(
                    self.mode_landing[mode].get("route", "theme.access_denied")
                )
            )
        elif landing_kind == "redirect":
            return redirect(
                self.mode_landing[mode].get("url", url_for("theme.access_denied"))
            )
        elif landing_kind == "slot":
            return self.descriptor.render_template(
                "index.html",
                logout_url=self.descriptor.config.get("logout_url", "#"),
                prefix=self.mode_landing[mode].get("prefix", f"{mode}_"),
                title=self.mode_landing[mode].get("title", "Index"),
            )
        #
        return redirect(url_for("theme.access_denied"))

    @web.route("/~/<mode>/~/<section>/", defaults={"parameter": None}, endpoint="route_mode_section")
    @web.route("/~/<mode>/~/<parameter>/~/<section>/", endpoint="route_mode_section_with_parameter")
    def _route_mode_section(self, mode, parameter, section):  # pylint: disable=R0201
        """ Section route """
        if mode not in self.modes:
            return redirect(url_for("theme.access_denied"))
        if mode not in self.mode_sections:
            return redirect(url_for("theme.access_denied"))
        #
        g.theme.active_mode = mode
        g.theme.active_parameter = parameter
        g.theme.active_section = section
        #
        if section not in self.mode_sections[mode]:
            return redirect(url_for("theme.access_denied"))
        #
        section_attrs = self.mode_sections[mode][section]
        section_kind = section_attrs.get("kind", "default")
        #
        if section_kind == "holder":
            subsections = self.get_subsections()
            if subsections:
                if parameter is None:
                    return redirect(
                        url_for(
                            "theme.route_mode_section_subsection",
                            mode=mode,
                            section=section, subsection=subsections[0]["key"]
                        )
                    )
                else:
                    return redirect(
                        url_for(
                            "theme.route_mode_section_subsection_with_parameter",
                            mode=mode, parameter=parameter,
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

    @web.route("/~/<mode>/~/<section>/<subsection>/", defaults={"parameter": None}, endpoint="route_mode_section_subsection")
    @web.route("/~/<mode>/~/<parameter>/~/<section>/<subsection>/", endpoint="route_mode_section_subsection_with_parameter")
    def _route_mode_section_subsection(self, mode, parameter, section, subsection):  # pylint: disable=R0201
        """ Subsection route """
        if mode not in self.modes:
            return redirect(url_for("theme.access_denied"))
        if mode not in self.mode_subsections:
            return redirect(url_for("theme.access_denied"))
        #
        g.theme.active_mode = mode
        g.theme.active_parameter = parameter
        g.theme.active_section = section
        g.theme.active_subsection = subsection
        #
        if section not in self.mode_subsections[mode]:
            return redirect(url_for("theme.access_denied"))
        #
        if subsection not in self.mode_subsections[mode][section]:
            return redirect(url_for("theme.access_denied"))
        #
        subsection_attrs = self.mode_subsections[mode][section][subsection]
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

    @web.route("/~/<mode>/~/<section>/<subsection>/<page>", defaults={"parameter": None}, endpoint="route_mode_section_subsection_page")
    @web.route("/~/<mode>/~/<parameter>/~/<section>/<subsection>/<page>", endpoint="route_mode_section_subsection_page_with_parameter")
    def _route_mode_section_subsection_page(self, mode, parameter, section, subsection, page):  # pylint: disable=R0201
        """ Page route """
        if mode not in self.modes:
            return redirect(url_for("theme.access_denied"))
        if mode not in self.mode_pages:
            return redirect(url_for("theme.access_denied"))
        #
        g.theme.active_mode = mode
        g.theme.active_parameter = parameter
        g.theme.active_section = section
        g.theme.active_subsection = subsection
        #
        if section not in self.mode_pages[mode]:
            return redirect(url_for("theme.access_denied"))
        #
        if subsection not in self.mode_pages[mode][section]:
            return redirect(url_for("theme.access_denied"))
        #
        if page not in self.mode_pages[mode][section][subsection]:
            return redirect(url_for("theme.access_denied"))
        #
        page_attrs = self.mode_pages[mode][section][subsection][page]
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
