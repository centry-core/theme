from abc import ABC, abstractmethod
from pydantic import BaseModel, validator, AnyUrl, parse_obj_as, root_validator, constr
from typing import Optional, Union


class SourceABC(ABC, BaseModel):
    @property
    @abstractmethod
    def execution_json(self) -> dict:
        ...

    @validator('*', pre=True, allow_reuse=True)
    def empty_str_to_none(cls, value, field):
        if value == '':
            return field.default
        return value


class SourceGitSSH(SourceABC):
    repo: str
    private_key: str
    branch: Optional[str] = 'main'
    password: Optional[str]

    @property
    def execution_json(self):
        return {
            'git': {
                'repo': self.repo,
                'repo_branch': self.branch,
                'repo_key': self.private_key,
                'password': self.password
            }
        }


class SourceGitHTTPS(SourceABC):
    repo: str
    branch: Optional[str] = 'main'
    username: Optional[str]
    password: Optional[str]

    @property
    def execution_json(self):
        return {
            'git': {
                'repo': self.repo,
                'repo_branch': self.branch
            }
        }


class SourceArtifact(SourceABC):
    file_meta: Optional[dict]
    file: Union[str, dict]

    @property
    def execution_json(self):
        return {
            'artifact': {'file': self.file, 'file_meta': self.file_meta}
        }


class SourceLocal(SourceABC):
    path: str

    @property
    def execution_json(self):
        return {
            'local_path': self.path
        }


class SourceContainer(SourceABC):
    image_name: str

    @property
    def execution_json(self):
        return {
            'image_name': self.image_name
        }

