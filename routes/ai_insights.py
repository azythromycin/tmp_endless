from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from database import supabase

router = APIRouter()

class AIInsightCreate(BaseModel):
    company_id: str
    insight_type: str  # prediction, anomaly, recommendation, summary
    severity: Optional[str] = "info"  # info, warning, critical
    title: Optional[str] = None
    description: Optional[str] = None
    data: Optional[Dict] = None
    actionable: Optional[bool] = False

@router.get("/company/{company_id}")
def get_company_insights(company_id: str, limit: int = 50):
    """Get AI insights for a specific company"""
    response = supabase.table("ai_insights")\
        .select("*")\
        .eq("company_id", company_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()

    return response.data or []

@router.get("/{insight_id}")
def get_insight(insight_id: str):
    """Get a specific AI insight"""
    response = supabase.table("ai_insights")\
        .select("*")\
        .eq("id", insight_id)\
        .single()\
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Insight not found")

    return response.data

@router.post("/")
def create_insight(insight: AIInsightCreate):
    """Create a new AI insight"""
    insight_data = {
        "company_id": insight.company_id,
        "insight_type": insight.insight_type,
        "severity": insight.severity,
        "title": insight.title,
        "description": insight.description,
        "data": insight.data,
        "actionable": insight.actionable
    }

    response = supabase.table("ai_insights").insert(insight_data).execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create insight")

    return response.data[0]

@router.delete("/{insight_id}")
def delete_insight(insight_id: str):
    """Delete an AI insight"""
    supabase.table("ai_insights")\
        .delete()\
        .eq("id", insight_id)\
        .execute()

    return {"message": "Insight deleted successfully"}
