from flask import Flask, jsonify, request
import requests, json, re, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.tiktok.com/',
}

def cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/tiktok/search')
def search():
    q = request.args.get('q', '').strip().lstrip('@')
    if not q:
        return cors(jsonify({'users': []}))

    users = []

    try:
        r = requests.get(f'https://www.tiktok.com/@{q}', headers=HEADERS, timeout=8)
        match = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', r.text, re.DOTALL)
        if match:
            data = json.loads(match.group(1))
            ui = data.get('__DEFAULT_SCOPE__', {}).get('webapp.user-detail', {}).get('userInfo', {})
            u = ui.get('user', {})
            s = ui.get('stats', {})
            if u.get('uniqueId'):
                users.append({
                    'uniqueId':  u.get('uniqueId', q),
                    'nickname':  u.get('nickname', q),
                    'avatarUrl': u.get('avatarThumb') or u.get('avatarMedium') or '',
                    'verified':  bool(u.get('verified') or u.get('customVerify')),
                    'followers': s.get('followerCount', 0),
                    'likes':     s.get('heartCount', 0),
                    'videos':    s.get('videoCount', 0),
                    'bio':       u.get('signature', ''),
                })
    except Exception as e:
        print('profile scrape error:', e)

    if not users:
        try:
            url = f'https://www.tiktok.com/api/search/user/full/?keyword={requests.utils.quote(q)}&count=8&cursor=0'
            r = requests.get(url, headers=HEADERS, timeout=8)
            data = r.json()
            for item in (data.get('user_list') or []):
                u = item.get('user_info') or item
                users.append({
                    'uniqueId':  u.get('unique_id') or u.get('uniqueId', ''),
                    'nickname':  u.get('nickname', ''),
                    'avatarUrl': ((u.get('avatar_thumb') or {}).get('url_list') or [''])[0],
                    'verified':  bool(u.get('custom_verify') or u.get('verified')),
                    'followers': u.get('follower_count') or u.get('followerCount', 0),
                    'likes':     u.get('total_favorited', 0),
                    'videos':    u.get('aweme_count', 0),
                    'bio':       u.get('signature', ''),
                })
        except Exception as e:
            print('search api error:', e)

    return cors(jsonify({'users': users}))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'\n✅  Server running on port {port}\n')
    app.run(host='0.0.0.0', port=port, debug=False)
