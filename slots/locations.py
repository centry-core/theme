from pylon.core.tools import web  # pylint: disable=E0611,E0401
from tools import auth  # pylint: disable=E0401


class Slot:  # pylint: disable=E1101,R0903
    @web.slot('locations_content')
    def content(self, context, slot, payload):
        """
        locations with payload config:

        """
        from pylon.core.tools import log
        log.info('slot: [%s], payload: %s', slot, payload)
        project_id = context.rpc_manager.call.project_get_id()
        regions = context.rpc_manager.call.get_rabbit_queues("carrier")
        regions.extend(context.rpc_manager.call.get_rabbit_queues(f"project_{project_id}_vhost"))
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/location/content.html', regions=regions,
                **payload
            )

    @web.slot('locations_scripts')
    def scripts(self, context, slot, payload):
        from pylon.core.tools import log
        log.info('slot: [%s], payload: %s', slot, payload)
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/location/scripts.html',
            )

    @web.slot('locations_styles')
    def styles(self, context, slot, payload):
        from pylon.core.tools import log
        log.info('slot: [%s], payload: %s', slot, payload)
        with context.app.app_context():
            return self.descriptor.render_template(
                'part/location/styles.html',
            )
