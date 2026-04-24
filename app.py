from flask import Flask, request, jsonify
import requests
import json
import base64
from datetime import datetime, timedelta
import pytz

app = Flask(__name__)

# Joy/Privateaser refresh token (expires 2026-05-23)
JOY_REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3Njk1Mjg3NCwianRpIjoiYzg4NDE5MjUtNzQ3ZS00ZTczLWE0NTgtYjk2MDQ4ZGIzOWQ3IiwidHlwZSI6InJlZnJlc2giLCJpZGVudGl0eSI6MTU3MDIsIm5iZiI6MTc3Njk1Mjg3NCwiZXhwIjoxNzc5NTQ0ODc0LCJjb3VudHJ5IjoiRlIiLCJyb2xlIjoiQURNSU4ifQ.gMwmt_yPCIUZOW6zf15HpJtmnSxIBaAS9CbJf-7gGT4"
JOY_API_BASE = "https://manager-api.privateaser.com"

# Token cache
_token_cache = {"token": None, "expires_at": None}


def get_joy_access_token():
    """Get a valid Joy access token using the refresh token."""
    now = datetime.now()
    if _token_cache["token"] and _token_cache["expires_at"]:
        if now < _token_cache["expires_at"] - timedelta(seconds=60):
            return _token_cache["token"]

    try:
        resp = requests.post(
            f"{JOY_API_BASE}/api/refresh",
            headers={
                "Authorization": f"Bearer {JOY_REFRESH_TOKEN}",
                "Origin": "https://app.joy.io"
            },
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
    except Exception as e:
        pass

    return None


def get_joy_bookings(date_str):
    """Fetch confirmed bookings from Joy for a given date."""
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
            headers={
                "Authorization": token,
                "Origin": "https://app.joy.io"
            },
            timeout=10
        )
        if resp.status_code == 200:
            return resp.json().get("results", []), None
        else:
            return [], f"API error {resp.status_code}"
    except Exception as e:
        return [], str(e)


def format_bookings_html(bookings):
    """Format bookings list as HTML table."""
    if not bookings:
        return "<p><em>Aucune réservation confirmée.</em></p>"

    rows = []
    for b in bookings:
        booker = b.get('booker_information') or {}
        room = b.get('room') or {}
        brief = b.get('brief') or {}
        notes = b.get('notes') or {}

        name = booker.get('full_name', '?')
        pax = b.get('pax', '?')
        room_name = room.get('name', '')

        event_dt = brief.get('event_date_time', '')
        time_str = event_dt[11:16] if len(event_dt) >= 16 else '?'

        note_content = ''
        if isinstance(notes, dict):
            note_content = (notes.get('content') or '')[:60]
        elif isinstance(notes, str):
            note_content = notes[:60]

        rows.append(
            f"<tr><td><strong>{time_str}</strong></td>"
            f"<td>{name}</td>"
            f"<td>{pax} pers.</td>"
            f"<td>{room_name}</td>"
            f"<td><em>{note_content}</em></td></tr>"
        )

    return (
        '<table border="1" cellpadding="6" cellspacing="0" '
        'style="border-collapse:collapse;font-family:Arial;font-size:13px;width:100%">\n'
        '<tr style="background:#f0f0f0;">'
        '<th>Heure</th><th>Client</th><th>Pers.</th><th>Espace</th><th>Notes</th></tr>\n'
        + "\n".join(rows)
        + "\n</table>"
    )


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "prost-formatter"})


@app.route('/reservations', methods=['GET'])
def get_reservations():
    """Return today's Joy reservations as HTML for Make."""
    try:
        paris_tz = pytz.timezone('Europe/Paris')
        now_paris = datetime.now(paris_tz)
        date_str = request.args.get('date', now_paris.strftime('%Y-%m-%d'))

        bookings, error = get_joy_bookings(date_str)
        html = format_bookings_html(bookings)

        return jsonify({
            "html": html,
            "count": len(bookings),
            "date": date_str,
            "error": error
        })
    except Exception as e:
        return jsonify({
            "html": f"<p>Erreur: {str(e)}</p>",
            "count": 0,
            "error": str(e)
        })


@app.route('/format-plats', methods=['POST'])
def format_plats():
    raw = request.get_data(as_text=True)
    with open('/tmp/make_request_body.txt', 'w') as f:
        f.write(raw)

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

    html = (
        '<table border="1" cellpadding="6" cellspacing="0" '
        'style="border-collapse:collapse;font-family:Arial;font-size:13px;width:100%">\n'
        '<tr style="background:#f0f0f0;"><th>Plat</th><th>Catégorie</th><th>Qté</th><th>CA €</th></tr>\n'
        + rows + '</table>'
    )

    return jsonify({
        "html": html,
        "count": count,
        "debug_items_received": len(items),
        "debug_raw_length": len(raw)
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
