import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_NINJA_KEY = os.getenv("API_NINJA_KEY")


# -------------------------------
# 🌐 HS Code Lookup (WCO or Similar)
# -------------------------------
def get_hs_code(product_name):
    """
    Fetch HS code for a given product using a trade API or open dataset.
    Example: product_name="leather shoes"
    """
    try:
        url = f"https://api.api-ninjas.com/v1/hslookup?query={product_name}"
        headers = {"X-Api-Key": "API_NINJA_KEY"}  # Replace with your key
        response = requests.get(url, headers=headers)
        data = response.json()
        if data:
            return f"HS Code for {product_name}: {data[0]['hs_code']} - {data[0]['description']}"
        return "No HS code found for that product."
    except Exception as e:
        return f"Error fetching HS code: {str(e)}"


# -------------------------------
# 💰 Tariff / Duty Calculation
# -------------------------------
def get_tariff_info(country_from, country_to, hs_code):
    """
    Example API for duty rates (replace with Trade Tariff / USITC API endpoints).
    """
    try:
        url = f"https://api.trade-tariff.service.gov.uk/commodities/{hs_code}.json"
        response = requests.get(url)
        data = response.json()
        if 'data' in data:
            desc = data['data']['attributes']['description']
            return f"Duty Info for HS {hs_code} ({desc}): Check tariff details in {country_to} customs portal."
        return "No tariff information available."
    except Exception as e:
        return f"Error fetching tariff info: {str(e)}"


# -------------------------------
# 📊 Global Trade Data (UN Comtrade)
# -------------------------------
def get_trade_statistics(country, commodity):
    """
    Returns basic trade statistics for a product and country.
    """
    try:
        url = (
            "https://comtradeapi.un.org/public/v1/preview"
            f"?reporter={country}&cmdCode={commodity}&type=C&freq=A&px=HS"
        )
        response = requests.get(url)
        data = response.json()
        return data if data else "No trade data found."
    except Exception as e:
        return f"Error fetching trade statistics: {str(e)}"


# -------------------------------
# 📄 EU Documentation (TARIC API)
# -------------------------------
def get_eu_doc_requirements(hs_code):
    """
    Fetch documentation/licensing requirements for goods entering the EU.
    """
    try:
        url = f"https://api.taric.es/api/commodities/{hs_code}"
        response = requests.get(url)
        data = response.json()
        if 'measures' in data:
            return f"Documentation required for HS {hs_code}: {', '.join([m['measure_type'] for m in data['measures']])}"
        return "No documentation found."
    except Exception as e:
        return f"Error fetching documentation: {str(e)}"




# app.py


# @app.route("/get", methods=["GET", "POST"])
# def chat():
#     msg = request.form["msg"].lower()
#     session_id = "default_user"

#     # 🔍 Smart routing based on user query
#     if "hs code" in msg:
#         product = msg.replace("hs code for", "").strip()
#         response_text = get_hs_code(product)

    # elif "duty" in msg or "tariff" in msg:
    #     # Example: "duty for hs 6403 from china to india"
    #     words = msg.split()
    #     hs_code = next((w for w in words if w.isdigit()), None)
    #     response_text = get_tariff_info("china", "india", hs_code)

    # elif "trade data" in msg or "export" in msg:
    #     response_text = get_trade_statistics("India", "TOTAL")

    # elif "documentation" in msg or "eu" in msg:
    #     hs_code = next((w for w in msg.split() if w.isdigit()), None)
    #     response_text = get_eu_doc_requirements(hs_code)

    # else:
    #     # Fall back to LLM RAG response
    #     response = rag_chain_with_memory.invoke(
    #         {"input": msg},
    #         config={"configurable": {"session_id": session_id}}
    #     )
    #     response_text = response["answer"]

    # print("Response:", response_text)
    # return str(response_text)