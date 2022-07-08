from typing import List

import requests
from pylon.core.tools import web, log
from tools import rpc_tools
from pydantic import parse_obj_as, ValidationError

from ..models.pd.google_analytics import GAEvent


class RPC:
    @web.rpc('google_analytics_post', 'google_analytics_post')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def google_analytics_post(self, ga_id: str, events: list, **kwargs) -> int:
        if self.google_analytics_config.enough_for_backend_events:
            headers = {
                'Content-Type': 'application/json'
            }
            params = {
                'api_secret': self.google_analytics_config.api_secret,
                'measurement_id': self.google_analytics_config.id
            }
            try:
                formatted_events = parse_obj_as(List[GAEvent], events)
            except ValidationError as e:
                log.error('Wrong GA event format: %s', e.errors())
                return 500
            body = {
                'client_id': self.google_analytics_config.client_id,
                'user_id': ga_id,
                'events': [i.dict(exclude_unset=True) for i in formatted_events]
            }
            # log.info('GA PUSH BODY %s', body)
            try:
                resp = requests.post(
                    self.google_analytics_config.post_url,
                    params=params, headers=headers, json=body,
                    timeout=5
                )
            except Exception as e:
                log.warning('Unable to POST to google analytics %s', e)
                return 500
            if not resp.ok:
                log.warning('Google analytics request unsuccessful %s', resp.status_code)
            # log.info('GA PUSH RESP CODE %s', resp.status_code)
            return resp.status_code
        else:
            log.warning('Not enough configs for POST')
