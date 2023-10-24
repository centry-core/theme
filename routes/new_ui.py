from pathlib import Path

from pylon.core.tools import web, log

from werkzeug.exceptions import NotFound


class Route:
    @web.route('/alita_ui/', defaults={'sub_path': ''}, endpoint='route_alita_ui')
    @web.route('/alita_ui/<path:sub_path>', endpoint='route_alita_ui_sub_path')
    def alita_ui_react(self, sub_path: str):
        base_path = Path('ui', 'dist')
        try:
            return self.bp.send_static_file(base_path.joinpath(sub_path))
        except NotFound:
            log.info("Route route_alita_ui_sub_path: %s; serving: %s", sub_path, base_path.joinpath('index.html'))
            return self.bp.send_static_file(base_path.joinpath('index.html'))
