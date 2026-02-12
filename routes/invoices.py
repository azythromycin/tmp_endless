"""
Invoices (AR): create customer, create invoice, send, record payment (Step 7).
Schema: invoices, invoice_lines, payments, payment_applications.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List
from database import supabase
from middleware.auth import get_current_user_company

router = APIRouter(prefix="/invoices", tags=["Invoices"])


class InvoiceLineCreate(BaseModel):
    line_number: int
    description: Optional[str] = None
    quantity: float = 1
    unit_price: float = 0
    amount: Optional[float] = None
    revenue_account_id: Optional[str] = None


class InvoiceCreate(BaseModel):
    customer_id: str
    invoice_date: str
    due_date: Optional[str] = None
    memo: Optional[str] = None
    lines: List[InvoiceLineCreate]


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None  # draft|sent|posted|paid|void
    memo: Optional[str] = None


@router.get("/")
async def list_invoices(
    status: Optional[str] = None,
    auth: Dict[str, str] = Depends(get_current_user_company),
):
    """List invoices for the company."""
    cid = auth["company_id"]
    q = supabase.table("invoices").select("*, contacts(display_name, email)").eq("company_id", cid)
    if status:
        q = q.eq("status", status)
    r = q.order("invoice_date", desc=True).execute()
    return r.data or []


@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    auth: Dict[str, str] = Depends(get_current_user_company),
):
    """Get one invoice with lines."""
    cid = auth["company_id"]
    r = supabase.table("invoices")\
        .select("*, invoice_lines(*), contacts(display_name, email)")\
        .eq("id", invoice_id)\
        .eq("company_id", cid)\
        .single()\
        .execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return r.data


@router.post("/")
async def create_invoice(
    body: InvoiceCreate,
    auth: Dict[str, str] = Depends(get_current_user_company),
):
    """Create draft invoice with lines."""
    cid = auth["company_id"]
    # Next invoice number
    num_r = supabase.table("invoices").select("invoice_number").eq("company_id", cid).order("created_at", desc=True).limit(1).execute()
    next_num = "INV-001"
    if num_r.data and num_r.data[0].get("invoice_number"):
        try:
            prefix = "INV-"
            last = num_r.data[0]["invoice_number"]
            if last.startswith(prefix):
                n = int(last.replace(prefix, "")) + 1
                next_num = f"{prefix}{n:03d}"
        except Exception:
            pass
    subtotal = 0
    for line in body.lines:
        amt = line.amount if line.amount is not None else (line.quantity * line.unit_price)
        subtotal += amt
    inv_data = {
        "company_id": cid,
        "customer_id": body.customer_id,
        "invoice_number": next_num,
        "invoice_date": body.invoice_date,
        "due_date": body.due_date or body.invoice_date,
        "memo": body.memo,
        "subtotal": subtotal,
        "tax_total": 0,
        "total": subtotal,
        "amount_paid": 0,
        "balance_due": subtotal,
        "status": "draft",
    }
    inv_r = supabase.table("invoices").insert(inv_data).execute()
    if not inv_r.data:
        raise HTTPException(status_code=400, detail="Failed to create invoice")
    inv = inv_r.data[0]
    for line in body.lines:
        amt = line.amount if line.amount is not None else (line.quantity * line.unit_price)
        supabase.table("invoice_lines").insert({
            "invoice_id": inv["id"],
            "line_number": line.line_number,
            "description": line.description,
            "quantity": line.quantity,
            "unit_price": line.unit_price,
            "amount": amt,
            "revenue_account_id": line.revenue_account_id,
        }).execute()
    r = supabase.table("invoices").select("*, invoice_lines(*), contacts(display_name, email)").eq("id", inv["id"]).eq("company_id", cid).single().execute()
    return r.data or inv


@router.patch("/{invoice_id}")
async def update_invoice(
    invoice_id: str,
    body: InvoiceUpdate,
    auth: Dict[str, str] = Depends(get_current_user_company),
):
    """Update invoice (e.g. status to sent/posted)."""
    cid = auth["company_id"]
    data = body.dict(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    r = supabase.table("invoices").update(data).eq("id", invoice_id).eq("company_id", cid).execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return r.data[0]
