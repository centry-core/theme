from pylon.core.tools import web, log
from pydantic import parse_obj_as

from ..models.pd.sources import (
    SourceGitHTTPS, 
    SourceGitSSH, 
    SourceArtifact, 
    SourceLocal,
    SourceContainer,
)

from tools import rpc_tools


class RPC:
    @web.rpc('parse_source', 'parse_source')
    @rpc_tools.wrap_exceptions(ValueError)
    def parse_source(self, value: dict):
        _validation_map = {
            'git_ssh': SourceGitSSH,
            'git_https': SourceGitHTTPS,
            'artifact': SourceArtifact,
            'local': SourceLocal,
            'container': SourceContainer,
        }
        try:
            model = _validation_map[value['name']]
        except KeyError:
            raise ValueError(f'Unsupported source: {value.get("name")}')
        return parse_obj_as(model, value)
