from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase

router = APIRouter()

class AccountCreate(BaseModel):
    company_id: str
    account_code: str
    account_name: str
    type: str  # asset, liability, equity, revenue, expense
    subtype: Optional[str] = None
    parent_account_id: Optional[str] = None
    balance: Optional[float] = 0.0

class AccountUpdate(BaseModel):
    account_code: Optional[str] = None
    account_name: Optional[str] = None
    type: Optional[str] = None
    subtype: Optional[str] = None
    parent_account_id: Optional[str] = None
    balance: Optional[float] = None

@router.get("/")
def get_all_accounts():
    """Get all accounts"""
    response = supabase.table("accounts").select("*").execute()
    return response.data

@router.get("/company/{company_id}")
def get_company_accounts(company_id: str):
    """Get all accounts for a specific company"""
    response = supabase.table("accounts")\
        .select("*")\
        .eq("company_id", company_id)\
        .order("account_code")\
        .execute()
    return response.data

@router.get("/{account_id}")
def get_account(account_id: str):
    """Get a specific account"""
    response = supabase.table("accounts")\
        .select("*")\
        .eq("id", account_id)\
        .single()\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Account not found")

    return response.data

@router.post("/")
def create_account(account: dict):
    """Create a new account"""
    try:
        # Log what we received for debugging
        print(f"Received account data: {account}")
        print(f"company_id value: {account.get('company_id')}")

        company_id = account.get("company_id")
        if not company_id:
            raise HTTPException(status_code=400, detail="company_id is required")

        account_data = {
            "company_id": company_id,
            "account_code": account.get("account_code"),
            "account_name": account.get("account_name"),
            "account_type": account.get("type"),  # Map 'type' to 'account_type'
            "account_subtype": account.get("subtype"),  # Map 'subtype' to 'account_subtype'
            "parent_account_id": account.get("parent_account_id"),
        }

        print(f"Attempting to insert: {account_data}")

        response = supabase.table("accounts").insert(account_data).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create account")

        return response.data[0]
    except Exception as e:
        print(f"Error creating account: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{account_id}")
def update_account(account_id: str, account: AccountUpdate):
    """Update an existing account"""
    # Only include fields that are provided
    update_data = {k: v for k, v in account.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.table("accounts")\
        .update(update_data)\
        .eq("id", account_id)\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Account not found")

    return response.data[0]

@router.delete("/{account_id}")
def delete_account(account_id: str):
    """Delete an account"""
    # Check if account has any transactions
    journal_lines = supabase.table("journal_lines")\
        .select("id")\
        .eq("account_id", account_id)\
        .limit(1)\
        .execute()

    if journal_lines.data:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete account with existing transactions"
        )

    response = supabase.table("accounts")\
        .delete()\
        .eq("id", account_id)\
        .execute()

    return {"message": "Account deleted successfully"}
