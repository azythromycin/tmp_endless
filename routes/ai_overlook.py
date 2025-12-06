from fastapi import APIRouter, HTTPException
import os
from datetime import datetime
from database import table
import re

router = APIRouter(prefix="/ai", tags=["AI Overlook"])

def build_peer_context(revenue: float, expense: float) -> str:
    revenue = revenue or 0
    expense = expense or 0
    peer_expense_ratio = 0.62  # simple SaaS benchmark
    peer_margin = 0.18

    if revenue <= 0:
        return "Comparable SaaS companies typically spend ~62% of revenue on operating costs and run ~18% net margins."

    company_exp_ratio = expense / revenue
    company_margin = (revenue - expense) / revenue

    return (
        f"SaaS peers spend ~{peer_expense_ratio * 100:.0f}% of revenue and run ~{peer_margin * 100:.0f}% margins; "
        f"you're tracking at {company_exp_ratio * 100:.0f}% spend and {company_margin * 100:.0f}% margins."
    )

def clean_ai_response(answer: str, peer_context: str) -> str:
    if not answer:
        return answer

    cleaned = re.sub(r"\*\*(.*?)\*\*", r"\1", answer)
    cleaned = cleaned.replace("•", "-").replace("*", "")
    cleaned = " ".join(cleaned.split())

    if peer_context.lower() not in cleaned.lower():
        cleaned = f"{cleaned} Peer snapshot: {peer_context}"

    return cleaned.strip()


def get_ai_suggestions(company_id: str, vendor_name: str, amount: float, date: str, category: str = None, memo: str = None):
    """
    Use OpenAI to suggest category, memo, and normalized vendor name.
    Falls back to basic rules if OPENAI_API_KEY is not set.
    """
    openai_key = os.getenv("OPENAI_API_KEY", "")

    # If OpenAI key is available, use it
    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)

            prompt = f"""Analyze this expense and provide suggestions:
- Vendor: {vendor_name}
- Amount: ${amount}
- Date: {date}
- Category: {category or 'Not provided'}
- Memo: {memo or 'Not provided'}

Provide:
1. A normalized vendor name (clean, standardized)
2. An appropriate expense category (e.g., Office Supplies, Travel, Meals & Entertainment, Software & Services, etc.)
3. A concise memo describing the expense

Respond in JSON format:
{{
  "normalized_vendor": "standardized name",
  "category": "category name",
  "memo": "brief description"
}}"""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a financial assistant helping categorize business expenses. Respond only with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            import json
            suggestions = json.loads(response.choices[0].message.content)

            return {
                "normalized_vendor": suggestions.get("normalized_vendor", vendor_name),
                "category": suggestions.get("category", category or "Uncategorized"),
                "memo": suggestions.get("memo", memo or f"{vendor_name} expense")
            }

        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fall through to basic suggestions

    # Fallback: Basic rule-based suggestions
    normalized_vendor = vendor_name.strip().title()
    suggested_category = category or "Uncategorized"
    suggested_memo = memo or f"{normalized_vendor} expense"

    # Simple category guessing based on vendor name
    vendor_lower = vendor_name.lower()
    if any(word in vendor_lower for word in ["office", "staples", "depot"]):
        suggested_category = "Office Supplies"
    elif any(word in vendor_lower for word in ["amazon", "aws", "google", "microsoft", "software"]):
        suggested_category = "Software & Services"
    elif any(word in vendor_lower for word in ["restaurant", "cafe", "coffee", "lunch", "dinner"]):
        suggested_category = "Meals & Entertainment"
    elif any(word in vendor_lower for word in ["uber", "lyft", "airline", "hotel"]):
        suggested_category = "Travel"

    return {
        "normalized_vendor": normalized_vendor,
        "category": suggested_category,
        "memo": suggested_memo
    }


@router.post("/overlook_expense")
def overlook_expense(expense_data: dict):
    """
    AI-powered expense validation and suggestion.
    Returns issues, suggestions, and a JSON patch for the expense.
    """
    try:
        company_id = expense_data.get("company_id")
        vendor_name = expense_data.get("vendor_name")
        amount = expense_data.get("amount")
        date = expense_data.get("date")
        category = expense_data.get("category")
        memo = expense_data.get("memo")

        # Validation
        issues = []
        if not vendor_name:
            issues.append("Vendor name is required")
        if not amount or amount <= 0:
            issues.append("Amount must be greater than 0")
        if not date:
            issues.append("Date is required")
        else:
            # Validate date format
            try:
                datetime.strptime(date, "%Y-%m-%d")
            except ValueError:
                issues.append("Date must be in YYYY-MM-DD format")

        valid = len(issues) == 0

        # Get AI suggestions
        suggestions = {}
        if valid:
            suggestions = get_ai_suggestions(
                company_id=company_id,
                vendor_name=vendor_name,
                amount=amount,
                date=date,
                category=category,
                memo=memo
            )

        return {
            "valid": valid,
            "issues": issues,
            "suggestions": suggestions,
            "json_patch": suggestions  # Same as suggestions for now
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing expense: {str(e)}")


@router.post("/query")
def ai_query(query_data: dict):
    """
    AI-powered financial assistant that answers questions about your financial data.
    Analyzes journal entries, chart of accounts, and account balances.
    Acts as a helpful, friendly accountant companion.
    """
    try:
        company_id = query_data.get("company_id")
        question = query_data.get("question", "").strip()

        if not company_id:
            raise HTTPException(status_code=400, detail="company_id is required")

        if not question:
            raise HTTPException(status_code=400, detail="question is required")

        # Check for OpenAI key
        openai_key = os.getenv("OPENAI_API_KEY", "")
        if not openai_key:
            raise HTTPException(
                status_code=503,
                detail="AI assistant requires OPENAI_API_KEY to be configured. Please add it to your .env file."
            )

        # Fetch all financial data for the company
        try:
            # Get chart of accounts with balances
            accounts_resp = table("accounts").select("*").eq("company_id", company_id).execute()
            accounts = accounts_resp.data or []

            # Get journal entries with lines
            journals_resp = table("journal_entries").select("*, journal_lines(*)").eq("company_id", company_id).execute()
            journals = journals_resp.data or []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching financial data: {str(e)}")

        # Check if we have any financial data
        if not accounts and not journals:
            return {
                "answer": "I don't see any financial data recorded yet for your company. Once you set up your chart of accounts and start recording journal entries, I'll be able to help you analyze your financial position, identify trends, and answer questions about your accounts!",
                "account_count": 0,
                "journal_count": 0
            }

        # Build comprehensive financial summary for AI

        # 1. Account Summary by Type
        account_types = {}
        for acc in accounts:
            acc_type = acc.get("account_type", "Unknown")
            balance = acc.get("current_balance", 0)
            if acc_type not in account_types:
                account_types[acc_type] = {"count": 0, "total_balance": 0, "accounts": []}
            account_types[acc_type]["count"] += 1
            account_types[acc_type]["total_balance"] += balance
            account_types[acc_type]["accounts"].append({
                "code": acc.get("account_code", ""),
                "name": acc.get("account_name", ""),
                "balance": balance
            })

        totals_by_type = {
            acc_type: data["total_balance"]
            for acc_type, data in account_types.items()
        }
        peer_context = build_peer_context(
            totals_by_type.get("revenue", 0),
            totals_by_type.get("expense", 0)
        )

        # 2. Journal Entry Summary
        total_journal_entries = len(journals)
        total_debits = 0
        total_credits = 0

        for journal in journals:
            journal_lines = journal.get("journal_lines", [])
            for line in journal_lines:
                total_debits += line.get("debit", 0)
                total_credits += line.get("credit", 0)

        # Recent journals (last 10)
        recent_journals = journals[-10:] if len(journals) > 10 else journals

        # Build context for AI
        context = f"""Company Financial Data Summary:

CHART OF ACCOUNTS:
- Total Accounts: {len(accounts)}
"""

        # Add accounts by type
        for acc_type, data in account_types.items():
            context += f"\n{acc_type.upper()} Accounts ({data['count']}):\n"
            context += f"  Total Balance: ${data['total_balance']:.2f}\n"
            # Show top 5 accounts by balance for this type
            sorted_accounts = sorted(data['accounts'], key=lambda x: abs(x['balance']), reverse=True)[:5]
            for acc in sorted_accounts:
                context += f"  - {acc['code']}: {acc['name']} = ${acc['balance']:.2f}\n"

        context += f"""
JOURNAL ENTRIES:
- Total Journal Entries: {total_journal_entries}
- Total Debits: ${total_debits:.2f}
- Total Credits: ${total_credits:.2f}
- Balance Check: {'✓ Balanced' if abs(total_debits - total_credits) < 0.01 else '✗ IMBALANCED'}

Recent Journal Entries:
"""
        for journal in recent_journals:
            entry_date = journal.get("entry_date", "N/A")
            memo = journal.get("memo", "No memo")
            status = journal.get("status", "unknown")
            context += f"- {entry_date}: {memo} (Status: {status})\n"

            # Show journal lines
            journal_lines = journal.get("journal_lines", [])
            for line in journal_lines:
                # Get account name
                account_id = line.get("account_id")
                account_name = "Unknown Account"
                for acc in accounts:
                    if acc.get("id") == account_id:
                        account_name = f"{acc.get('account_code')} - {acc.get('account_name')}"
                        break

                debit = line.get("debit", 0)
                credit = line.get("credit", 0)
                line_desc = line.get("description", "")

                if debit > 0:
                    context += f"    DR {account_name}: ${debit:.2f}"
                else:
                    context += f"    CR {account_name}: ${credit:.2f}"
                if line_desc:
                    context += f" ({line_desc})"
                context += "\n"

        context += f"\nPeer Benchmark: {peer_context}\n"

        # Call OpenAI
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)

            system_prompt = """You are a helpful, friendly AI accountant companion for a small business.
Your role is to help the user understand their financial data, identify trends, and make informed decisions.

Be conversational, warm, and encouraging. Use clear language without too much jargon or markdown formatting.
When discussing numbers, be specific and helpful. Offer insights and suggestions when appropriate.

Think of yourself as a knowledgeable friend who happens to be great with numbers and finances."""

            user_prompt = f"""Based on the following financial data, please answer the user's question:

{context}

User's Question: {question}

Provide a crisp, two-paragraph response with short sentences. Avoid markdown styling, keep the tone confident, and explicitly reference the peer benchmark in your final sentence so the reader understands how they compare to similar companies."""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )

            raw_answer = response.choices[0].message.content
            answer = clean_ai_response(raw_answer, peer_context)

            return {
                "answer": answer,
                "account_count": len(accounts),
                "journal_count": total_journal_entries,
                "total_debits": total_debits,
                "total_credits": total_credits
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing AI query: {str(e)}")
