from pylon.core.tools import web, log
from tools import rpc_tools, auth


class RPC:
    rpc = lambda name: web.rpc(f'theme_{name}', name)

    @rpc('register_landing')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_landing(  # pylint: disable=R0913
            self,
            kind="holder",
            **kvargs,
    ):
        self.landing = {
            "kind": kind,
        }
        #
        self.landing.update(kvargs)

    @rpc('unregister_landing')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_landing(self):
        self.landing = {"kind": "holder"}

    @rpc('register_section')
    # @web.rpc('theme_register_section', 'register_section', )
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_section(  # pylint: disable=R0913
            self, key, name,
            kind="holder", location="dropdown",
            permissions=None, icon_class=None,
            weight=1,
            **kvargs,
    ):
        permissions = permissions or []
        auth.update_local_permissions(permissions)
        if key in self.sections:
            raise ValueError(f"Section is already present: {key}")
        #
        self.sections[key] = {
            "name": name,
            "kind": kind,
            "location": location,
            "permissions": permissions,
            "icon_class": icon_class,
            "weight": weight,
        }
        #
        self.sections[key].update(kvargs)

    @rpc('unregister_section')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_section(self, key):
        if key not in self.sections:
            raise ValueError(f"Section is not present: {key}")
        #
        self.sections.pop(key)

    @rpc('register_subsection')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_subsection(  # pylint: disable=R0913
            self, section, key, name,
            kind="slot",
            permissions=None, icon_class=None,
            weight=1,
            **kvargs,
    ):
        permissions = permissions or []
        auth.update_local_permissions(permissions)
        if section not in self.subsections:
            self.subsections[section] = dict()
        #
        if key in self.subsections[section]:
            raise ValueError(f"Subsection is already present: {section}:{key}")
        #
        self.subsections[section][key] = {
            "name": name,
            "kind": kind,
            "permissions": permissions,
            "icon_class": icon_class,
            "weight": weight,
        }
        #
        self.subsections[section][key].update(kvargs)

    @rpc('unregister_subsection')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_subsection(self, section, key):
        if section not in self.subsections:
            raise ValueError(f"Section is not present: {section}")
        #
        if key not in self.subsections[section]:
            raise ValueError(f"Subsection is not present: {section}:{key}")
        #
        self.subsections[section].pop(key)

    @rpc('register_page')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _register_page(  # pylint: disable=R0913
            self, section, subsection, key,
            kind="slot",
            **kvargs,
    ):
        permissions = kvargs.get("permissions", [])
        auth.update_local_permissions(permissions)
        if section not in self.pages:
            self.pages[section] = dict()
        #
        if subsection not in self.pages[section]:
            self.pages[section][subsection] = dict()
        #
        if key in self.pages[section][subsection]:
            raise ValueError(
                f"Page is already present: {section}:{subsection}:{key}"
            )
        #
        self.pages[section][subsection][key] = {
            "kind": kind,
        }
        #
        self.pages[section][subsection][key].update(kvargs)

    @rpc('unregister_page')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _unregister_page(self, section, subsection, key):
        if section not in self.pages:
            raise ValueError(f"Section is not present: {section}")
        #
        if subsection not in self.pages[section]:
            raise ValueError(
                f"Subsection is not present: {section}:{subsection}"
            )
        #
        if key not in self.pages[section][subsection]:
            raise ValueError(
                f"Page is not present: {section}:{subsection}:{key}"
            )
        #
        self.pages[section][subsection].pop(key)
