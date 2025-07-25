from pylon.core.tools import web  # pylint: disable=E0611,E0401
from tools import auth  # pylint: disable=E0401


class Slot:  # pylint: disable=E1101,R0903
    @web.slot('sources_content')
    def params_table_content(self, context, slot, payload):
        """
        sources with payload config:

        """
        from pylon.core.tools import log
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/sources/content.html',
                **payload
            )

    @web.slot('sources_scripts')
    def params_table_scripts(self, context, slot, payload):
        from pylon.core.tools import log
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/sources/scripts.html',
            )

    @web.slot('sources_styles')
    def params_table_styles(self, context, slot, payload):
        from pylon.core.tools import log
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/sources/styles.html',
            )
