"""Director — Request/Response Schemas"""

from pydantic import BaseModel

class DirectorLoginRequest(BaseModel):
    username: str
    password: str
