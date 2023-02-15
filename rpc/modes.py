from pylon.core.tools import web, log
from tools import rpc_tools


class RPC:
    rpc = lambda name: web.rpc(f"theme_{name}", name)

    @rpc("register_mode")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_mode(  # pylint: disable=R0913
            self, key, name,
            permissions=None,
            weight=1,
            **kvargs,
    ):
        permissions = permissions or []
        if key in self.modes:
            raise ValueError(f"Mode is already present: {key}")
        #
        self.modes[key] = {
            "name": name,
            "permissions": permissions,
            "weight": weight,
        }
        #
        self.modes[key].update(kvargs)

    @rpc("unregister_mode")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_mode(self, key):
        if key not in self.modes:
            raise ValueError(f"Mode is not present: {key}")
        #
        self.modes.pop(key)

    @rpc("register_mode_landing")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_mode_landing(  # pylint: disable=R0913
            self, mode,
            kind="holder",
            **kvargs,
    ):
        self.mode_landing[mode] = {
            "kind": kind,
        }
        #
        self.mode_landing[mode].update(kvargs)

    @rpc("unregister_mode_landing")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_mode_landing(self, mode):
        self.mode_landing[mode] = {"kind": "holder"}

    @rpc("register_mode_section")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_mode_section(  # pylint: disable=R0913
            self, mode, key, name,
            kind="holder", location="dropdown",
            permissions=None, icon_class=None,
            weight=1,
            **kvargs,
    ):
        if mode not in self.modes:
            raise ValueError(f"Mode is not present: {mode}")
        if mode not in self.mode_sections:
            self.mode_sections[mode] = dict()
        #
        permissions = permissions or []
        if key in self.mode_sections[mode]:
            raise ValueError(f"Section is already present: {key}")
        #
        self.mode_sections[mode][key] = {
            "name": name,
            "kind": kind,
            "location": location,
            "permissions": permissions,
            "icon_class": icon_class,
            "weight": weight,
        }
        #
        self.mode_sections[mode][key].update(kvargs)

    @rpc("unregister_mode_section")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_mode_section(self, mode, key):
        if mode not in self.modes:
            raise ValueError(f"Mode is not present: {mode}")
        if mode not in self.mode_sections:
            raise ValueError(f"Section is not present: {key}")
        if key not in self.mode_sections[mode]:
            raise ValueError(f"Section is not present: {key}")
        #
        self.mode_sections[mode].pop(key)

    @rpc("register_mode_subsection")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_mode_subsection(  # pylint: disable=R0913
            self, mode, section, key, name,
            kind="slot",
            permissions=None, icon_class=None,
            weight=1,
            **kvargs,
    ):
        if mode not in self.modes:
            raise ValueError(f"Mode is not present: {mode}")
        if mode not in self.mode_subsections:
            self.mode_subsections[mode] = dict()
        #
        permissions = permissions or []
        if section not in self.mode_subsections[mode]:
            self.mode_subsections[mode][section] = dict()
        #
        if key in self.mode_subsections[mode][section]:
            raise ValueError(f"Subsection is already present: {section}:{key}")
        #
        self.mode_subsections[mode][section][key] = {
            "name": name,
            "kind": kind,
            "permissions": permissions,
            "icon_class": icon_class,
            "weight": weight,
        }
        #
        self.mode_subsections[mode][section][key].update(kvargs)

    @rpc("unregister_mode_subsection")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_mode_subsection(self, mode, section, key):
        if mode not in self.modes:
            raise ValueError(f"Mode is not present: {mode}")
        if mode not in self.mode_subsections:
            raise ValueError(f"Subsection is not present: {key}")
        if section not in self.mode_subsections[mode]:
            raise ValueError(f"Section is not present: {section}")
        #
        if key not in self.mode_subsections[mode][section]:
            raise ValueError(f"Subsection is not present: {section}:{key}")
        #
        self.mode_subsections[mode][section].pop(key)

    @rpc("register_mode_page")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_mode_page(  # pylint: disable=R0913
            self, mode, section, subsection, key,
            kind="slot",
            **kvargs,
    ):
        if mode not in self.modes:
            raise ValueError(f"Mode is not present: {mode}")
        if mode not in self.mode_pages:
            self.mode_pages[mode] = dict()
        #
        if section not in self.mode_pages[mode]:
            self.mode_pages[mode][section] = dict()
        #
        if subsection not in self.mode_pages[mode][section]:
            self.mode_pages[mode][section][subsection] = dict()
        #
        if key in self.mode_pages[mode][section][subsection]:
            raise ValueError(
                f"Page is already present: {section}:{subsection}:{key}"
            )
        #
        self.mode_pages[mode][section][subsection][key] = {
            "kind": kind,
        }
        #
        self.mode_pages[mode][section][subsection][key].update(kvargs)

    @rpc("unregister_mode_page")
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_mode_page(self, mode, section, subsection, key):
        if mode not in self.modes:
            raise ValueError(f"Mode is not present: {mode}")
        if mode not in self.mode_pages:
            raise ValueError(f"Page is not present: {key}")
        #
        if section not in self.mode_pages[mode]:
            raise ValueError(f"Section is not present: {section}")
        #
        if subsection not in self.mode_pages[mode][section]:
            raise ValueError(
                f"Subsection is not present: {section}:{subsection}"
            )
        #
        if key not in self.mode_pages[mode][section][subsection]:
            raise ValueError(
                f"Page is not present: {section}:{subsection}:{key}"
            )
        #
        self.mode_pages[mode][section][subsection].pop(key)
