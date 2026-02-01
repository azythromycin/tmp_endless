"""
Authentication middleware for JWT validation and company scoping.
"""

from fastapi import HTTPException, Header, Depends
from typing import Optional, Dict
import os
from jose import jwt, JWTError
from database import supabase

# Supabase JWT secret (from your Supabase project settings > API > JWT Secret)
# This is different from the service_role key
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

async def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Validate JWT token from Authorization header.
    Returns user_id if valid.

    Raises:
        HTTPException: If token is missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token. Please login."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use 'Bearer <token>'"
        )

    token = authorization.replace("Bearer ", "")

    try:
        # For now, we'll use Supabase's built-in user verification
        # This is more reliable than manual JWT decoding
        response = supabase.auth.get_user(token)

        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        return response.user.id

    except Exception as e:
        # If JWT secret is configured, try manual validation as fallback
        if SUPABASE_JWT_SECRET:
            try:
                payload = jwt.decode(
                    token,
                    SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    audience="authenticated"
                )
                return payload.get("sub")  # user_id
            except JWTError:
                pass

        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user_company(user_id: str = Depends(verify_token)) -> Dict[str, str]:
    """
    Get the authenticated user's company_id.

    Args:
        user_id: The authenticated user's ID from verify_token

    Returns:
        Dict with user_id and company_id

    Raises:
        HTTPException: If user not found or not assigned to a company
    """
    try:
        # Fetch user's company_id from database
        response = supabase.table("users")\
            .select("id, company_id, email, role")\
            .eq("id", user_id)\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="User not found in database"
            )

        user_data = response.data

        if not user_data.get("company_id"):
            raise HTTPException(
                status_code=403,
                detail="User not assigned to a company. Please complete onboarding."
            )

        return {
            "user_id": user_data["id"],
            "company_id": user_data["company_id"],
            "email": user_data.get("email"),
            "role": user_data.get("role", "user")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch user company: {str(e)}"
        )


async def require_role(required_role: str, auth: Dict[str, str] = Depends(get_current_user_company)):
    """
    Verify user has the required role.

    Args:
        required_role: One of 'admin', 'accountant', 'user', 'viewer'
        auth: Authentication context from get_current_user_company

    Raises:
        HTTPException: If user doesn't have required role
    """
    role_hierarchy = {
        "admin": 4,
        "accountant": 3,
        "user": 2,
        "viewer": 1
    }

    user_role = auth.get("role", "user")
    user_level = role_hierarchy.get(user_role, 0)
    required_level = role_hierarchy.get(required_role, 999)

    if user_level < required_level:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. Required role: {required_role}, your role: {user_role}"
        )

    return auth


# Optional: For routes that work with or without authentication
async def get_optional_user_company(
    authorization: Optional[str] = Header(None)
) -> Optional[Dict[str, str]]:
    """
    Get user company if authenticated, otherwise return None.
    Useful for public/demo routes.
    """
    if not authorization:
        return None

    try:
        user_id = await verify_token(authorization)
        return await get_current_user_company(user_id)
    except:
        return None
