from pylon.core.tools import web  # pylint: disable=E0611,E0401
from tools import auth  # pylint: disable=E0401


class Slot:  # pylint: disable=E1101,R0903
    @web.slot('params_table_content')
    def params_table_content(self, context, slot, payload):
        """
        params_table with payload config:
        caption::
        description::
        modal_id::
        default_params::
        disabled_names::
        hidden_columns::
        """
        from pylon.core.tools import log
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/params_table/content.html',
                **payload
            )

    @web.slot('params_table_scripts')
    def params_table_scripts(self, context, slot, payload):
        from pylon.core.tools import log
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/params_table/scripts.html',
            )

    @web.slot('params_table_styles')
    def params_table_styles(self, context, slot, payload):
        from pylon.core.tools import log
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/params_table/styles.html',
            )
