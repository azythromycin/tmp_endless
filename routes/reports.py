"""
Reports: P&L, Balance Sheet, Cash Flow (Step 10).
Uses views: trial_balance_view, account_balances_view; and journal_entries.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict
from database import supabase
from collections import defaultdict
from middleware.auth import get_current_user_company

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/profit-loss")
async def profit_loss(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    auth: Dict[str, str] = Depends(get_current_user_company),
):
    """Profit & Loss: revenue - expenses. Uses accounts by type (revenue, expense)."""
    cid = auth["company_id"]
    r = supabase.table("accounts").select("id, account_code, account_name, account_type, current_balance").eq("company_id", cid).execute()
    accounts = r.data or []
    revenue = sum(a.get("current_balance") or 0 for a in accounts if a.get("account_type") == "revenue")
    expense = sum(a.get("current_balance") or 0 for a in accounts if a.get("account_type") == "expense")
    return {
        "company_id": cid,
        "revenue_total": revenue,
        "expense_total": expense,
        "net_income": revenue - expense,
        "start_date": start_date,
        "end_date": end_date,
    }


@router.get("/balance-sheet")
async def balance_sheet(
    as_of_date: Optional[str] = None,
    auth: Dict[str, str] = Depends(get_current_user_company),
):
    """Balance Sheet: assets = liabilities + equity. Uses account balances by type."""
    cid = auth["company_id"]
    r = supabase.table("accounts").select("id, account_code, account_name, account_type, current_balance").eq("company_id", cid).execute()
    accounts = r.data or []
    by_type = defaultdict(list)
    for a in accounts:
        by_type[a.get("account_type", "other")].append(a)
    assets = sum(a.get("current_balance") or 0 for a in by_type.get("asset", []))
    liabilities = sum(a.get("current_balance") or 0 for a in by_type.get("liability", []))
    equity = sum(a.get("current_balance") or 0 for a in by_type.get("equity", []))
    return {
        "company_id": cid,
        "assets": assets,
        "liabilities": liabilities,
        "equity": equity,
        "as_of_date": as_of_date,
    }


@router.get("/cash-flow")
async def cash_flow(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    auth: Dict[str, str] = Depends(get_current_user_company),
):
    """Cash flow: operating (from P&L), investing, financing. Simplified: cash account changes."""
    cid = auth["company_id"]
    r = supabase.table("accounts").select("id, account_code, account_name, account_subtype, current_balance").eq("company_id", cid).execute()
    accounts = r.data or []
    cash_bank = sum(a.get("current_balance") or 0 for a in accounts if a.get("account_subtype") in ("cash", "bank"))
    return {
        "company_id": cid,
        "cash_and_equivalents": cash_bank,
        "start_date": start_date,
        "end_date": end_date,
    }
