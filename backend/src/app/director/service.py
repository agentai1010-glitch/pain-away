"""Director — Business Logic"""

import jwt
import datetime
from fastapi import HTTPException, status
from app.director.schemas import DirectorLoginRequest
from app.reception.schemas import TokenResponse
from app.shared.constants import IST

SECRET_KEY = "SUPER_SECRET_RECEPTION_KEY" # Using same key for simplicity
ALGORITHM = "HS256"

class DirectorService:

    @staticmethod
    def authenticate(request: DirectorLoginRequest) -> TokenResponse:
        # Hardcoded for director credentials
        if request.username == "director" and request.password == "director123":
            payload = {
                "sub": request.username,
                "role": "director",
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
            return TokenResponse(access_token=token, token_type="bearer")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
