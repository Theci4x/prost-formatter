from flask import Flask, request, jsonify, render_template_string
import requests
import json
import base64
from datetime import datetime, timedelta
import pytz

app = Flask(__name__)

# Joy/Privateaser refresh token (expires 2026-05-23)
JOY_REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3Njk1Mjg3NCwianRpIjoiYzg4NDE5MjUtNzQ3ZS00ZTczLWE0NTgtYjk2MDQ4ZGIzOWQ3IiwidHlwZSI6InJlZnJlc2giLCJpZGVudGl0eSI6MTU3MDIsIm5iZiI6MTc3Njk1Mjg3NCwiZXhwIjoxNzc5NTQ0ODc0LCJjb3VudHJ5IjoiRlIiLCJyb2xlIjoiQURNSU4ifQ.gMwmt_yPCIUZOW6zf15HpJtmnSxIBaAS9CbJf-7gGT4"
JOY_API_BASE = "https://manager-api.privateaser.com"
FIDYO_BOUT_ID = "4484bbb0-244d-49cb-8a06-b2aa6321f3b5"
FIDYO_API_BASE = "https://api.fidyo.fr"
# Static JWT token valid until 2026-05-24 (update when expired)
FIDYO_STATIC_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZmR5dXNlciIsImlkIjoiZDJkYzM1YzUtYWU1Ni00NDhlLTg2YWEtN2NiYzI0NjQ3NzdjIiwiZXhwIjoxNzc5NjI3MTc3LCJ0eXBlIjoiZmR5dXNlciIsInNlc3Npb25faWQiOiJlMGI0ZjViMS00NTMyLTRlNjMtODBkNi1mYmJiOWY0M2VmYjUifQ.AnXuP_QOvMd9aQHmxfXbe4hgnbajap5UWjPMjCw_aYk"

# Token cache
_token_cache = {"token": None, "expires_at": None}
_fidyo_token_cache = {"token": None, "expires_at": None}


def get_joy_access_token():
    now = datetime.now()
    if _token_cache["token"] and _token_cache["expires_at"]:
        if now < _token_cache["expires_at"] - timedelta(seconds=60):
            return _token_cache["token"]
    try:
        resp = requests.post(
            f"{JOY_API_BASE}/api/refresh",
            headers={"Authorization": f"Bearer {JOY_REFRESH_TOKEN}", "Origin": "https://app.joy.io"},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            if token:
                payload = token.split('.')[1]
                payload += '=' * (4 - len(payload) % 4)
                payload_data = json.loads(base64.b64decode(payload))
                exp = payload_data.get('exp', 0)
                _token_cache["token"] = f"Bearer {token}"
                _token_cache["expires_at"] = datetime.fromtimestamp(exp)
                return _token_cache["token"]
    except:
        pass
    return None


def get_joy_bookings(date_str):
    token = get_joy_access_token()
    if not token:
        return [], "Token refresh failed"
    try:
        resp = requests.get(
            f"{JOY_API_BASE}/api/bookings",
            params={
                "booking_statuses": ["confirmed", "pre-confirmed"],
                "event_date_from": date_str,
                "event_date_to": date_str,
                "per_page": 50,
                "order_by": "event_date_time",
                "order_dir": "asc"
            },
            headers={"Authorization": token, "Origin": "https://app.joy.io"},
            timeout=10
        )
        if resp.status_code == 200:
            return resp.json().get("results", []), None
        return [], f"API error {resp.status_code}"
    except Exception as e:
        return [], str(e)


def get_fidyo_token():
    """Return the static Fidyo JWT token (valid until 2026-05-24)."""
    return FIDYO_STATIC_TOKEN


def get_fidyo_sales(date_str):
    token = get_fidyo_token()
    if not token:
        return None, None, "Token failed"
    try:
        resp = requests.post(
            f"{FIDYO_API_BASE}/rpc/app_order_sale_stat",
            json={"bout_id": FIDYO_BOUT_ID, "date_from": date_str, "date_to": date_str},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/vnd.pgrst.object+json",
                "Prefer": "params=single-object",
                "Content-Profile": "api_v2"
            },
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            result = data.get("result", [{}])
            if result:
                r = result[0]
                return r.get("total_sale", 0), r.get("order_count", r.get("total_count", 0)), None
    except Exception as e:
        return None, None, str(e)
    return None, None, "No data"


def get_fidyo_menu(date_str):
    token = get_fidyo_token()
    if not token:
        return [], "Token failed"
    try:
        resp = requests.post(
            f"{FIDYO_API_BASE}/rpc/app_menu_sale_stat",
            json={"bout_id": FIDYO_BOUT_ID, "date_from": date_str, "date_to": date_str},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/vnd.pgrst.object+json",
                "Prefer": "params=single-object",
                "Content-Profile": "api_v2"
            },
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("result", []), None
    except Exception as e:
        return [], str(e)
    return [], "No data"


def get_meteo():
    try:
        resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": 48.8534, "longitude": 2.3692,
                "daily": "temperature_2m_min,temperature_2m_max,precipitation_sum",
                "timezone": "Europe/Paris", "forecast_days": 2
            },
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json().get("daily", {})
            return {
                "tmin": data.get("temperature_2m_min", [None, None])[1],
                "tmax": data.get("temperature_2m_max", [None, None])[1],
                "pluie": data.get("precipitation_sum", [None, None])[1]
            }
    except:
        pass
    return {"tmin": "?", "tmax": "?", "pluie": "?"}


def get_events_bastille():
    try:
        paris_tz = pytz.timezone('Europe/Paris')
        today = datetime.now(paris_tz).strftime('%Y-%m-%d')
        resp = requests.get(
            "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records",
            params={
                "where": f'date_start>="{today}" AND (address_zipcode="75011" OR address_zipcode="75012" OR address_zipcode="75004")',
                "limit": 5,
                "lang": "fr",
                "select": "title,date_start,address_name,lead_text"
            },
            timeout=10
        )
        if resp.status_code == 200:
            return resp.json().get("results", [])
    except:
        pass
    return []


DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🍺 Le Prost & Speakeasy 404 — Dashboard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f0f; color: #e0e0e0; min-height: 100vh; }
  
  header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 24px 32px;
    border-bottom: 2px solid #e8b84b;
    display: flex; align-items: center; justify-content: space-between;
  }
  header h1 { font-size: 1.8rem; color: #e8b84b; letter-spacing: 1px; }
  header .date-badge {
    background: rgba(232,184,75,0.15); border: 1px solid #e8b84b;
    padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; color: #e8b84b;
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 20px;
    padding: 28px 32px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .card {
    background: #1a1a2e;
    border-radius: 12px;
    border: 1px solid #2a2a4a;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,184,75,0.1); }
  
  .card-header {
    padding: 14px 20px;
    background: rgba(232,184,75,0.08);
    border-bottom: 1px solid #2a2a4a;
    display: flex; align-items: center; gap: 10px;
  }
  .card-header .icon { font-size: 1.4rem; }
  .card-header h2 { font-size: 1rem; font-weight: 600; color: #e8b84b; text-transform: uppercase; letter-spacing: 1px; }
  
  .card-body { padding: 20px; }
  
  /* Météo */
  .meteo-row { display: flex; gap: 20px; align-items: center; }
  .meteo-temp { font-size: 2.5rem; font-weight: 700; color: #e8b84b; }
  .meteo-details { font-size: 0.9rem; color: #aaa; line-height: 1.8; }
  
  /* Stats */
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .stat-box { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 16px; text-align: center; }
  .stat-value { font-size: 2rem; font-weight: 700; color: #e8b84b; }
  .stat-label { font-size: 0.75rem; color: #888; text-transform: uppercase; margin-top: 4px; }
  
  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { background: rgba(232,184,75,0.12); color: #e8b84b; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
  td { padding: 8px 10px; border-bottom: 1px solid #2a2a4a; color: #ccc; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.03); }
  
  /* Events */
  .event-item { padding: 10px 0; border-bottom: 1px solid #2a2a4a; }
  .event-item:last-child { border-bottom: none; }
  .event-title { font-weight: 600; color: #e0e0e0; margin-bottom: 3px; }
  .event-location { font-size: 0.8rem; color: #888; }
  
  /* Sport */
  .sport-text { font-size: 1rem; line-height: 1.6; color: #ccc; }
  .sport-text strong { color: #e8b84b; }
  
  /* Badge */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
  .badge-green { background: rgba(72,199,116,0.2); color: #48c774; }
  .badge-orange { background: rgba(255,165,0,0.2); color: #ffa500; }
  
  /* Loading */
  .loading { color: #555; font-style: italic; padding: 20px 0; text-align: center; }
  
  /* Refresh */
  .refresh-bar {
    text-align: center; padding: 12px;
    background: rgba(232,184,75,0.05);
    border-top: 1px solid #2a2a4a;
    font-size: 0.8rem; color: #555;
  }
  .refresh-bar a { color: #e8b84b; text-decoration: none; }
  .refresh-bar a:hover { text-decoration: underline; }
  
  /* Wide card */
  .card-wide { grid-column: 1 / -1; }
  
  @media (max-width: 768px) {
    header { flex-direction: column; gap: 10px; text-align: center; }
    .grid { padding: 16px; gap: 14px; }
    .card-wide { grid-column: 1; }
  }
</style>
</head>
<body>

<header>
  <h1>🍺 Le Prost & Speakeasy 404</h1>
  <div class="date-badge">{{ date_fr }}</div>
</header>

<div class="grid">

  <!-- Météo -->
  <div class="card">
    <div class="card-header"><span class="icon">🌡️</span><h2>Météo Bastille</h2></div>
    <div class="card-body">
      <div class="meteo-row">
        <div class="meteo-temp">{{ meteo.tmin }}° → {{ meteo.tmax }}°C</div>
      </div>
      <div class="meteo-details" style="margin-top:12px">
        🌧️ Pluie prévue : <strong>{{ meteo.pluie }} mm</strong>
      </div>
    </div>
  </div>

  <!-- Sport -->
  <div class="card">
    <div class="card-header"><span class="icon">⚽</span><h2>Sport du jour</h2></div>
    <div class="card-body">
      <div class="sport-text">
        {% if sport %}
          <strong>{{ sport.name }}</strong><br>
          <span style="color:#888;font-size:0.85rem">{{ sport.detail }}</span>
        {% else %}
          <span style="color:#555">Aucun match PSG / Équipe de France aujourd'hui.</span>
        {% endif %}
      </div>
    </div>
  </div>

  <!-- Ventes hier -->
  <div class="card">
    <div class="card-header"><span class="icon">📊</span><h2>Ventes — {{ date_hier }}</h2></div>
    <div class="card-body">
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">{{ ca }} €</div>
          <div class="stat-label">Chiffre d'affaires</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ commandes }}</div>
          <div class="stat-label">Commandes</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Réservations aujourd'hui -->
  <div class="card">
    <div class="card-header"><span class="icon">📅</span><h2>Réservations aujourd'hui</h2></div>
    <div class="card-body">
      {% if bookings %}
        <table>
          <tr><th>Heure</th><th>Client</th><th>Pers.</th><th>Espace</th></tr>
          {% for b in bookings %}
          <tr>
            <td><strong>{{ b.time }}</strong></td>
            <td>{{ b.name }}</td>
            <td><span class="badge badge-green">{{ b.pax }}</span></td>
            <td style="font-size:0.8rem;color:#888">{{ b.room }}</td>
          </tr>
          {% endfor %}
        </table>
      {% else %}
        <p class="loading">Aucune réservation confirmée aujourd'hui.</p>
      {% endif %}
    </div>
  </div>

  <!-- Top 10 plats -->
  <div class="card card-wide">
    <div class="card-header"><span class="icon">🍽️</span><h2>Top plats vendus — {{ date_hier }}</h2></div>
    <div class="card-body">
      {% if menu %}
        <table>
          <tr><th>#</th><th>Plat</th><th>Catégorie</th><th>Qté</th><th>CA €</th></tr>
          {% for i, item in menu %}
          <tr>
            <td style="color:#555;font-size:0.8rem">{{ i }}</td>
            <td><strong>{{ item.menu_name }}</strong></td>
            <td style="color:#888;font-size:0.8rem">{{ item.catalog }}</td>
            <td><span class="badge badge-orange">{{ item.total_count }}</span></td>
            <td style="color:#e8b84b">{{ item.total_sale }} €</td>
          </tr>
          {% endfor %}
        </table>
      {% else %}
        <p class="loading">Aucune donnée de vente disponible.</p>
      {% endif %}
    </div>
  </div>

  <!-- Événements Bastille -->
  <div class="card card-wide">
    <div class="card-header"><span class="icon">🎭</span><h2>Événements Bastille (11e / 12e)</h2></div>
    <div class="card-body">
      {% if events %}
        {% for ev in events %}
        <div class="event-item">
          <div class="event-title">{{ ev.title }}</div>
          <div class="event-location">📍 {{ ev.address_name or '' }}</div>
        </div>
        {% endfor %}
      {% else %}
        <p class="loading">Aucun événement trouvé aujourd'hui.</p>
      {% endif %}
    </div>
  </div>

</div>

<div class="refresh-bar">
  Données chargées à {{ now_time }} — <a href="/">↻ Actualiser</a>
</div>

</body>
</html>
"""


@app.route('/', methods=['GET'])
def dashboard():
    paris_tz = pytz.timezone('Europe/Paris')
    now_paris = datetime.now(paris_tz)
    today_str = now_paris.strftime('%Y-%m-%d')
    hier_str = (now_paris - timedelta(days=1)).strftime('%Y-%m-%d')

    JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    date_fr = f"{JOURS[now_paris.weekday()]} {now_paris.day} {MOIS[now_paris.month-1]} {now_paris.year}"
    date_hier = (now_paris - timedelta(days=1)).strftime('%d/%m/%Y')

    # Météo
    meteo = get_meteo()

    # Sport (ESPN)
    sport = None
    try:
        resp = requests.get(
            "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard",
            timeout=8
        )
        if resp.status_code == 200:
            events = resp.json().get('events', [])
            if events:
                ev = events[0]
                sport = {
                    "name": ev.get('name', ''),
                    "detail": ev.get('status', {}).get('type', {}).get('detail', '')
                }
    except:
        pass

    # Ventes Fidyo
    ca, commandes, _ = get_fidyo_sales(hier_str)
    ca = ca if ca is not None else "—"
    commandes = commandes if commandes is not None else "—"

    # Menu Fidyo
    menu_raw, _ = get_fidyo_menu(hier_str)
    menu = list(enumerate(menu_raw[:10], 1))

    # Réservations Joy
    bookings_raw, _ = get_joy_bookings(today_str)
    bookings = []
    for b in bookings_raw:
        booker = b.get('booker_information') or {}
        room = b.get('room') or {}
        brief = b.get('brief') or {}
        event_dt = brief.get('event_date_time', '')
        time_str = event_dt[11:16] if len(event_dt) >= 16 else '?'
        bookings.append({
            "time": time_str,
            "name": booker.get('full_name', '?'),
            "pax": b.get('pax', '?'),
            "room": room.get('name', '')
        })

    # Événements Bastille
    events = get_events_bastille()

    return render_template_string(
        DASHBOARD_HTML,
        date_fr=date_fr,
        date_hier=date_hier,
        meteo=meteo,
        sport=sport,
        ca=ca,
        commandes=commandes,
        menu=menu,
        bookings=bookings,
        events=events,
        now_time=now_paris.strftime('%H:%M')
    )


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "prost-formatter"})


@app.route('/reservations', methods=['GET'])
def get_reservations():
    try:
        paris_tz = pytz.timezone('Europe/Paris')
        now_paris = datetime.now(paris_tz)
        date_str = request.args.get('date', now_paris.strftime('%Y-%m-%d'))
        bookings, error = get_joy_bookings(date_str)
        rows = ""
        for b in bookings:
            booker = b.get('booker_information') or {}
            room = b.get('room') or {}
            brief = b.get('brief') or {}
            event_dt = brief.get('event_date_time', '')
            time_str = event_dt[11:16] if len(event_dt) >= 16 else '?'
            rows += (f"<tr><td><strong>{time_str}</strong></td>"
                     f"<td>{booker.get('full_name','?')}</td>"
                     f"<td>{b.get('pax','?')} pers.</td>"
                     f"<td>{room.get('name','')}</td></tr>")
        html = ('<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial;font-size:13px;width:100%">'
                '<tr style="background:#f0f0f0;"><th>Heure</th><th>Client</th><th>Pers.</th><th>Espace</th></tr>'
                + rows + '</table>') if bookings else "<p><em>Aucune réservation confirmée.</em></p>"
        return jsonify({"html": html, "count": len(bookings), "date": date_str, "error": error})
    except Exception as e:
        return jsonify({"html": f"<p>Erreur: {str(e)}</p>", "count": 0, "error": str(e)})


@app.route('/format-plats', methods=['POST'])
def format_plats():
    raw = request.get_data(as_text=True)
    try:
        data = json.loads(raw) if raw else {}
    except:
        data = {}
    items = data.get('items', [])
    if isinstance(items, dict):
        items = list(items.values())
    elif not isinstance(items, list):
        items = []
    rows = ""
    count = 0
    for item in items:
        if not isinstance(item, dict):
            continue
        name = item.get('menu_name', '')
        total_count = item.get('total_count', 0)
        total_sale = item.get('total_sale', 0)
        catalog = item.get('catalog', '')
        try:
            qty = int(float(str(total_count)))
        except:
            qty = 0
        if qty >= 2:
            rows += f"<tr><td>{name}</td><td>{catalog}</td><td>{qty}</td><td>{total_sale} €</td></tr>\n"
            count += 1
    html = ('<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial;font-size:13px;width:100%">'
            '<tr style="background:#f0f0f0;"><th>Plat</th><th>Catégorie</th><th>Qté</th><th>CA €</th></tr>'
            + rows + '</table>')
    return jsonify({"html": html, "count": count})


@app.route('/api/fidyo', methods=['GET'])
def api_fidyo():
    """Endpoint unique pour toutes les données Fidyo (ventes + top plats).
    Remplace les appels directs Fidyo dans Make.com pour éviter les timeouts.
    Paramètre optionnel: ?date=YYYY-MM-DD (défaut: hier)
    """
    try:
        paris_tz = pytz.timezone('Europe/Paris')
        now_paris = datetime.now(paris_tz)
        yesterday = (now_paris - timedelta(days=1)).strftime('%Y-%m-%d')
        date_str = request.args.get('date', yesterday)

        # Ventes
        ca, commandes, err_sales = get_fidyo_sales(date_str)
        # Top plats
        menu, err_menu = get_fidyo_menu(date_str)

        # Formater top plats en texte WhatsApp
        top_plats_text = ""
        top_plats_html = ""
        rows = ""
        if menu:
            sorted_menu = sorted(menu, key=lambda x: float(x.get('total_count', 0) or 0), reverse=True)
            top10 = [m for m in sorted_menu if float(m.get('total_count', 0) or 0) >= 1][:10]
            for i, item in enumerate(top10, 1):
                name = item.get('menu_name', '?')
                qty = int(float(item.get('total_count', 0) or 0))
                sale = item.get('total_sale', 0)
                cat = item.get('catalog', '')
                top_plats_text += f"{i}. {name} x{qty} — {sale}€\n"
                rows += f"<tr><td>{i}</td><td><strong>{name}</strong></td><td>{cat}</td><td>{qty}</td><td>{sale} €</td></tr>"
            top_plats_html = ('<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial;font-size:13px;width:100%">'
                '<tr style="background:#f0f0f0;"><th>#</th><th>Plat</th><th>Catégorie</th><th>Qté</th><th>CA €</th></tr>'
                + rows + '</table>')

        return jsonify({
            "date": date_str,
            "ca": ca or 0,
            "commandes": commandes or 0,
            "top_plats_text": top_plats_text.strip(),
            "top_plats_html": top_plats_html,
            "error_sales": err_sales,
            "error_menu": err_menu
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/whatsapp-message', methods=['GET'])
def api_whatsapp_message():
    """Retourne le message complet formaté pour WhatsApp (texte brut).
    Paramètre optionnel: ?date=YYYY-MM-DD (défaut: aujourd'hui pour réservations, hier pour ventes)
    """
    try:
        paris_tz = pytz.timezone('Europe/Paris')
        now_paris = datetime.now(paris_tz)
        today = now_paris.strftime('%Y-%m-%d')
        yesterday = (now_paris - timedelta(days=1)).strftime('%Y-%m-%d')
        date_label = now_paris.strftime('%d/%m/%Y')

        # Météo
        meteo = get_meteo()
        tmin = meteo.get('tmin', '?')
        tmax = meteo.get('tmax', '?')
        pluie = meteo.get('pluie', 0)

        # Ventes J-1
        ca, commandes, _ = get_fidyo_sales(yesterday)
        yesterday_label = (now_paris - timedelta(days=1)).strftime('%d/%m/%Y')

        # Top plats J-1
        menu, _ = get_fidyo_menu(yesterday)
        top_plats_lines = ""
        if menu:
            sorted_menu = sorted(menu, key=lambda x: float(x.get('total_count', 0) or 0), reverse=True)
            top5 = [m for m in sorted_menu if float(m.get('total_count', 0) or 0) >= 1][:5]
            for i, item in enumerate(top5, 1):
                name = item.get('menu_name', '?')
                qty = int(float(item.get('total_count', 0) or 0))
                sale = item.get('total_sale', 0)
                top_plats_lines += f"  {i}. {name} x{qty} ({sale}€)\n"

        # Réservations aujourd'hui
        bookings, _ = get_joy_bookings(today)
        resa_lines = ""
        for b in bookings:
            booker = b.get('booker_information') or {}
            brief = b.get('brief') or {}
            event_dt = brief.get('event_date_time', '')
            time_str = event_dt[11:16] if len(event_dt) >= 16 else '?'
            pax = b.get('pax', '?')
            name = booker.get('full_name', '?')
            resa_lines += f"  • {time_str} — {name} ({pax} pers.)\n"

        # Construire le message
        pluie_str = f"{pluie} mm" if pluie and float(pluie) > 0 else "Pas de pluie"
        msg = f"""🍺 *Rapport Prost — {date_label}*

🌡️ *Météo Bastille*
{tmin}° → {tmax}°C | {pluie_str}

📊 *Ventes J-1 ({yesterday_label})*
CA : {ca or '—'} € | Commandes : {commandes or '—'}

🍽️ *Top 5 plats J-1*
{top_plats_lines.rstrip() if top_plats_lines else '  Pas de données'}

📅 *Réservations ce soir*
{resa_lines.rstrip() if resa_lines else '  Aucune réservation'}

🔗 Dashboard : https://prost-formatter.onrender.com"""

        return jsonify({"message": msg, "date": date_label})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/send-whatsapp', methods=['GET', 'POST'])
def api_send_whatsapp():
    """Génère le message complet et l'envoie directement dans le groupe WhatsApp Prost News.
    Appeler cet endpoint depuis Make.com suffit — pas besoin de module Green API séparé.
    """
    GREEN_API_URL = "https://7107.api.greenapi.com"
    GREEN_ID = "7107599166"
    GREEN_TOKEN = "6741ac4b9a644be3983c4e69ec08b4f153cdade48db04b22ad"
    GROUP_ID = "120363192837135531@g.us"

    try:
        paris_tz = pytz.timezone('Europe/Paris')
        now_paris = datetime.now(paris_tz)
        today = now_paris.strftime('%Y-%m-%d')
        yesterday = (now_paris - timedelta(days=1)).strftime('%Y-%m-%d')
        date_label = now_paris.strftime('%d/%m/%Y')
        yesterday_label = (now_paris - timedelta(days=1)).strftime('%d/%m/%Y')

        # Météo
        meteo = get_meteo()
        tmin = meteo.get('tmin', '?')
        tmax = meteo.get('tmax', '?')
        pluie = meteo.get('pluie', 0)
        pluie_str = f"{pluie} mm" if pluie and float(str(pluie).replace('?','0') or 0) > 0 else "Pas de pluie"

        # Ventes J-1
        ca, commandes, _ = get_fidyo_sales(yesterday)

        # Top plats J-1
        menu, _ = get_fidyo_menu(yesterday)
        top_plats_lines = ""
        if menu:
            sorted_menu = sorted(menu, key=lambda x: float(x.get('total_count', 0) or 0), reverse=True)
            top5 = [m for m in sorted_menu if float(m.get('total_count', 0) or 0) >= 1][:5]
            for i, item in enumerate(top5, 1):
                name = item.get('menu_name', '?')
                qty = int(float(item.get('total_count', 0) or 0))
                sale = item.get('total_sale', 0)
                top_plats_lines += f"  {i}. {name} x{qty} ({sale}\u20ac)\n"

        # Réservations aujourd'hui
        bookings, _ = get_joy_bookings(today)
        resa_lines = ""
        for b in bookings:
            booker = b.get('booker_information') or {}
            brief_data = b.get('brief') or {}
            event_dt = brief_data.get('event_date_time', '')
            time_str = event_dt[11:16] if len(event_dt) >= 16 else '?'
            pax = b.get('pax', '?')
            bname = booker.get('full_name', '?')
            resa_lines += f"  \u2022 {time_str} \u2014 {bname} ({pax} pers.)\n"

        msg = (
            f"\U0001f37a *Rapport Prost \u2014 {date_label}*\n\n"
            f"\U0001f321\ufe0f *M\u00e9t\u00e9o Bastille*\n"
            f"{tmin}\u00b0 \u2192 {tmax}\u00b0C | {pluie_str}\n\n"
            f"\U0001f4ca *Ventes J-1 ({yesterday_label})*\n"
            f"CA : {ca or '\u2014'} \u20ac | Commandes : {commandes or '\u2014'}\n\n"
            f"\U0001f37d\ufe0f *Top 5 plats J-1*\n"
            f"{top_plats_lines.rstrip() if top_plats_lines else '  Pas de donn\u00e9es'}\n\n"
            f"\U0001f4c5 *R\u00e9servations ce soir*\n"
            f"{resa_lines.rstrip() if resa_lines else '  Aucune r\u00e9servation'}\n\n"
            f"\U0001f517 Dashboard : https://prost-formatter.onrender.com"
        )

        # Envoyer dans le groupe
        send_url = f"{GREEN_API_URL}/waInstance{GREEN_ID}/sendMessage/{GREEN_TOKEN}"
        resp = requests.post(send_url, json={"chatId": GROUP_ID, "message": msg}, timeout=15)

        if resp.status_code == 200:
            return jsonify({"status": "sent", "idMessage": resp.json().get("idMessage")})
        else:
            return jsonify({"status": "error", "code": resp.status_code, "detail": resp.text}), 500

    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
