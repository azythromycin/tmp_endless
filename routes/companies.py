from fastapi import APIRouter, HTTPException, Depends
from database import table, supabase
from typing import Dict, Optional
from middleware.auth import get_current_user_company, require_role, verify_token

router = APIRouter(prefix="/companies", tags=["Companies"])


# Get all companies (with users included)
@router.get("/with-users")
def get_companies_with_users():
    """Fetch all companies along with their associated users."""
    try:
        response = table("companies").select("*, users(full_name, email, role, user_type)").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching companies: {e}")


# Get authenticated user's company (works for users with or without companies)
@router.get("/")
async def get_all_companies(user_id: str = Depends(verify_token)):
    try:
        # Get user's company_id
        user_response = supabase.table("users").select("company_id").eq("id", user_id).single().execute()

        if not user_response.data or not user_response.data.get("company_id"):
            # User has no company yet (onboarding not complete)
            return {"status": "success", "data": []}

        company_id = user_response.data["company_id"]
        response = table("companies").select("*").eq("id", company_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get a single company by ID (with users)
@router.get("/{company_id}")
def get_company(company_id: str, auth: Dict[str, str] = Depends(get_current_user_company)):
    try:
        # Verify user owns this company
        if auth["company_id"] != company_id:
            raise HTTPException(status_code=403, detail="Cannot access another company")

        response = (
            table("companies")
            .select("*, users(full_name, email, role, user_type)")
            .eq("id", company_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Company not found.")
        return {"status": "success", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Create a new company
@router.post("/")
def create_company(company: dict):
    try:
        response = table("companies").insert(company).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update a company
@router.patch("/{company_id}")
def update_company(company_id: str, update_data: dict, auth: Dict[str, str] = Depends(get_current_user_company)):
    try:
        # Verify user owns this company
        if auth["company_id"] != company_id:
            raise HTTPException(status_code=403, detail="Cannot update another company")

        response = table("companies").update(update_data).eq("id", company_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Company not found.")
        return {"status": "success", "data": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete a company (admin only)
@router.delete("/{company_id}")
def delete_company(company_id: str, auth: Dict[str, str] = Depends(lambda a=Depends(get_current_user_company): require_role("admin", a))):
    try:
        # Additional check: can only delete own company even as admin
        if auth["company_id"] != company_id:
            raise HTTPException(status_code=403, detail="Cannot delete another company")

        response = table("companies").delete().eq("id", company_id).execute()
        return {"status": "success", "message": f"Company {company_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get all users belonging to a specific company
@router.get("/{company_id}/users")
def get_company_users(company_id: str):
    """Fetch all users that belong to a given company."""
    try:
        response = table("users").select("*, companies(name, industry)").eq("company_id", company_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {e}")

