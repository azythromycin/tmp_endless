"""
COA Templates for COA-first onboarding (Step 2: pick business type, get pre-made buckets).
Schema: coa_templates, coa_template_accounts.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict
from database import supabase
from middleware.auth import verify_token

router = APIRouter(prefix="/coa-templates", tags=["COA Templates"])


@router.get("/")
async def list_templates(_: str = Depends(verify_token)):
    """List available Chart of Accounts templates (SaaS, Services, Retail, etc.)."""
    try:
        r = supabase.table("coa_templates").select("*").order("name").execute()
        return r.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{template_id}/accounts")
async def get_template_accounts(
    template_id: str,
    _: str = Depends(verify_token),
):
    """Get accounts for a COA template (to copy into company COA during onboarding)."""
    try:
        r = supabase.table("coa_template_accounts")\
            .select("*")\
            .eq("coa_template_id", template_id)\
            .order("account_code")\
            .execute()
        return r.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
