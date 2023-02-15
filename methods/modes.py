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

""" Method """

from collections import defaultdict

from flask import g

from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import web  # pylint: disable=E0611,E0401

from tools import auth  # pylint: disable=E0401


class Method:  # pylint: disable=E1101,R0903
    """
        Method Resource

        self is pointing to current Module instance

        web.method decorator takes zero or one argument: method name
        Note: web.method decorator must be the last decorator (at top)

    """

    @web.init()
    def _init(self):
        # Mode registry
        self.modes = dict()  # mode_key -> {name, permissions, href?}  # pylint: disable=C0301
        self.mode_landing = dict()  # mode_key -> {kind, prefix|route|url}
        self.mode_sections = dict()  # mode_key -> section_key -> {name, kind, location, permissions, icon_class, prefix|route|url}  # pylint: disable=C0301
        self.mode_subsections = dict()  # mode_key -> section_key -> subsection_key -> {name, kind, permissions, icon_class, prefix|route|url}  # pylint: disable=C0301
        self.mode_pages = dict()  # mode_key -> section_key -> subsection_key -> page_key -> {kind, prefix|route|url}  # pylint: disable=C0301
        #
        self.register_mode(key="default", name="Project", href="/", weight=100)

    @web.method("get_modes")
    def _get_modes(  # pylint: disable=R0913
            self,
    ):
        current_permissions = auth.resolve_permissions()
        #
        modes = list()
        for mode_key, mode_attrs in self.modes.items():
            if mode_attrs.get("hidden", False):
                continue
            #
            required_permissions = mode_attrs.get("permissions", [])
            #
            if set(required_permissions).issubset(set(current_permissions)):
                mode = {
                    "key": mode_key,
                    **mode_attrs
                }
                #
                if "href" not in mode:
                    mode["href"] = f'/~/{mode["key"]}/~/'
                #
                modes.append(mode)
            #
        #
        result = list()
        result.extend(sorted(modes, key=lambda x: (-x["weight"], x["name"])))
        return result

    @web.method("get_sections")
    def _get_sections(  # pylint: disable=R0913
            self,
    ):
        if g.theme.active_mode == "default":
            return self.get_visible_plugins()
        #
        result = list()
        #
        mode = g.theme.active_mode
        if mode not in self.modes or mode not in self.mode_sections:
            return result
        #
        current_permissions = auth.resolve_permissions()
        location_result = defaultdict(list)
        #
        for section_key, section_attrs in self.mode_sections[mode].items():
            if section_attrs.get("hidden", False):
                continue
            #
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
        for i in location_result.values():
            result.extend(sorted(i, key=lambda x: (-x["weight"], x["name"])))
        #
        return result

    @web.method("get_subsections")
    def _get_subsections(  # pylint: disable=R0913
            self,
    ):
        if g.theme.active_mode == "default":
            return self.get_visible_subsections(g.theme.active_section)
        #
        result = list()
        #
        mode = g.theme.active_mode
        if mode not in self.modes or mode not in self.mode_subsections:
            return result
        #
        section = g.theme.active_section
        if section not in self.mode_subsections[mode]:
            return result
        #
        current_permissions = auth.resolve_permissions()
        #
        for subsection_key, subsection_attrs in self.mode_subsections[mode][section].items():
            if subsection_attrs.get("hidden", False):
                continue
            #
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
