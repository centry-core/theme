from typing import Optional, Dict

from pydantic.v1 import BaseModel


class GAConfiguration(BaseModel):
    id: Optional[str]
    cookie_name: Optional[str] = 'centry_gaid'
    post_url: Optional[str] = 'https://www.google-analytics.com/mp/collect'
    api_secret: Optional[str]
    client_id: Optional[str] = 'centry'

    @property
    def enough_for_backend_events(self):
        return all((self.id, self.post_url, self.api_secret))


class GAEvent(BaseModel):
    name: str
    params: Optional[Dict]
