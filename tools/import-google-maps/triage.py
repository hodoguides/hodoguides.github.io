"""Triage a Google Takeout 'Saved' list (CSV) for HodoGuides: decode approximate
coordinates from the place URL, drop places outside the country and
non-visit places, guess a category and the nearest city."""
import csv, json, math, re, sys, unicodedata
import s2sphere

src, out_json = sys.argv[1], sys.argv[2]
# Optional per-country config: {"bbox": [lat0, lat1, lng0, lng1], "exclude": [[lat0, lat1, lng0, lng1], ...],
#   "cities": {name: [lat, lng]}, "overrides": "file.json", "fix": {name: [lat, lng]}}
CONFIG = json.load(open(sys.argv[3], encoding="utf-8")) if len(sys.argv) > 3 else {}
BBOX = tuple(CONFIG.get("bbox", (24.0, 46.0, 122.5, 146.5)))  # default: Japan
EXCLUDE = CONFIG.get("exclude", [])
FIX = CONFIG.get("fix", {})

CITIES = {
 "Tokyo":(35.68,139.76),"Yokohama":(35.44,139.64),"Kamakura":(35.32,139.55),"Hakone":(35.23,139.11),"Nikko":(36.75,139.6),
 "Kawaguchiko":(35.50,138.76),"Kyoto":(35.01,135.77),"Osaka":(34.69,135.50),"Nara":(34.68,135.83),"Kobe":(34.69,135.19),
 "Himeji":(34.83,134.69),"Hiroshima":(34.39,132.46),"Miyajima":(34.30,132.32),"Okayama":(34.66,133.92),"Naoshima":(34.46,133.99),
 "Nagoya":(35.18,136.91),"Takayama":(36.14,137.25),"Shirakawa-go":(36.26,136.91),"Kanazawa":(36.56,136.66),"Matsumoto":(36.24,137.97),
 "Sapporo":(43.06,141.35),"Otaru":(43.19,141.0),"Hakodate":(41.77,140.73),"Asahikawa":(43.77,142.37),"Furano":(43.34,142.38),
 "Biei":(43.59,142.47),"Niseko":(42.86,140.69),"Toyako":(42.56,140.82),"Noboribetsu":(42.46,141.17),"Aomori":(40.82,140.74),
 "Hirosaki":(40.6,140.46),"Sendai":(38.27,140.87),"Fukuoka":(33.59,130.4),"Nagasaki":(32.75,129.88),"Kagoshima":(31.6,130.56),
 "Beppu":(33.28,131.49),"Kumamoto":(32.8,130.71),"Naha":(26.21,127.68),"Okinawa (nord)":(26.69,127.88),"Ishigaki":(24.34,124.16),
 "Yonaguni":(24.47,122.99),"Miyako":(24.8,125.28),"Koyasan":(34.21,135.59),"Ine":(35.67,135.29),"Amanohashidate":(35.57,135.19),
 "Shizuoka":(34.98,138.38),"Nagano":(36.65,138.18),"Ise":(34.49,136.71),"Wakayama":(34.23,135.17),"Kinosaki":(35.62,134.81),
 "Matsuyama":(33.84,132.77),"Takamatsu":(34.34,134.05),"Tottori":(35.5,134.24),"Izumo":(35.37,132.75),"Kushiro":(42.98,144.38),
 "Abashiri":(44.02,144.27),"Towada":(40.47,141.0),"Morioka":(39.7,141.15),"Akita":(39.72,140.1),"Yamagata":(38.24,140.36),
}

def _cities_from_config():
    global CITIES
    if "cities" in CONFIG: CITIES = {k: tuple(v) for k, v in CONFIG["cities"].items()}

def norm(s):
    s = unicodedata.normalize("NFKC", s).lower()
    return "".join(ch for ch in unicodedata.normalize("NFKD", s) if not unicodedata.combining(ch) or ord(ch) > 0x3000)

# Manual decisions for names the keyword rules cannot settle.
# "drop" = not a place to recommend, "area" = a whole town/region, else a category.
OVERRIDES = json.load(open(__file__.replace("triage.py", CONFIG.get("overrides", "overrides-jp.json")), encoding="utf-8"))
KEEP_ANYWAY = r"ghibli|donguri|chiikawa|neko machi|cat station|view ?point|倒影|mikasa|tomonoura|former .*station|佳長"

DROP = [  # not places to recommend
 r"\bhotel\b", r"hostel", r"\binn\b", r"guest ?house", r"airbnb", r"apartment", r"condo", r"ホテル", r"旅館?$", r"マンション",
 r"station", r"駅", r"airport", r"空港", r"terminal", r"bus stop", r"バス停", r"\bport\b", r"ferry",
 r"laundr", r"ランドリー", r"コインランドリー", r"7-eleven", r"seven-eleven", r"セブン", r"lawson", r"ローソン", r"familymart", r"ファミリーマート",
 r"\batm\b", r"\bbank\b", r"銀行", r"post office", r"郵便局", r"pharmac", r"薬局", r"drug", r"ドラッグ", r"hospital", r"clinic", r"病院", r"クリニック",
 r"rent.?a.?car", r"car rental", r"レンタカー", r"\borix\b", r"times car", r"parking", r"駐車場", r"gas station", r"ガソリン", r"eneos",
 r"don quijote", r"ドン・キホーテ", r"uniqlo", r"daiso", r"ダイソー", r"aeon", r"イオン", r"supermarket", r"スーパー", r"shinkansen",
]
CATS = [
 ("cafe",  r"caf[eé]|tea house|cream puff|neko|coffee|カフェ|珈琲|コーヒー|喫茶|kissa|tea ?room|matcha|starbucks|% ?arabica|roaster"),
 ("food",  r"hot ?pot|haidilao|roast duck|quanjude|dumpling|noodle house|weixiangzhai|ippudo|mensho|hamazushi|yoshinoya|wolfbrau|torihiko|torikiku|toriton|snoopy chocolat|佳長|ラーメン|らーめん|sushi|寿司|鮨|udon|うどん|soba|そば|蕎麦|izakaya|居酒屋|yakiniku|焼肉|yakitori|焼鳥|curry|カレー|burger|バーガー|pizza|gyoza|餃子|okonomi|お好み|takoyaki|たこ焼|unagi|うなぎ|鰻|tonkatsu|とんかつ|katsu|tempura|天ぷら|kaisen|海鮮|market|市場|bakery|パン|pancake|パンケーキ|sweets|スイーツ|dessert|ice ?cream|アイス|soft cream|crepe|クレープ|mochi|餅|dango|団子|wagashi|和菓子|restaurant|レストラン|食堂|diner|kitchen|bistro|grill|steak|ステーキ|wagyu|和牛|sandwich|サンド|donut|ドーナツ|cheesecake|letao|genghis|ジンギスカン|jingisukan|food|bar\b|beer|brewery|sake|酒|gelato|chocolate|チョコ|salmon|kani|蟹|かに|oyster|牡蠣|noodle|麺"),
 ("sleep", r"ryokan|旅館|onsen inn|shukubo|宿坊|minshuku|民宿|glamping|camp"),
 ("activity", r"universal|ice & snow|elevator|art district|art gallery|science|film museum|museum|panda|opera|paradise|ghost city|fairy|cable|cruise|pokemon|chiikawa|gundam|hangar|edo wonderland|wonderland|loft|lucua|sunshine city|fujifilm|mori mori|tanuki mura|workshop|kobo|shisa farm|buaisou|donguri|温泉|spa\b|sento|銭湯|aquarium|水族館|\bzoo\b|動物園|teamlab|pokemon|ポケモン|nintendo|kirby|ghibli|ジブリ|universal|disney|ディズニー|museum|美術館|博物館|gallery|theme park|amusement|game|ゲーム|karaoke|カラオケ|ski|スキー|snow|kart|カート|cruise|クルーズ|ropeway|ロープウェイ|cable car|tour|experience|体験|workshop|kimono|着物|sports|スポーツ|arcade|shop|store|店|mall|outlet|mercari|book|本屋|sanrio|サンリオ|character|toy|figure|anime|アニメ|manga|village|park"),
 ("photo", r"sinkhole|stone forest|scenic|风景|景区|platform|mountain|mont |monts |shan\b|lake|湖|valley|canyon|gorge|waterfall|瀑布|terrace|棚田|梯田|bridge|river|wharf|glass bridge|beach|plage|island|forest park|wetland|grassland|desert|倒影|waterfall|chute|lac |cascade|canyon|rice terrace|terrace|skyline|tunnel|mont |coast|rock|岩|lighthouse|phare|wisteria|tree road|crossing|展望|observ|lookout|scenic|絶景|falls|滝|lake|湖|beach|ビーチ|浜|bay\b|湾|cape|岬|island|島|mount|mt\.|山|hill|丘|gorge|渓谷|valley|flower|花|sakura|桜|light ?up|illumination|イルミ|tower|タワー|bridge|橋|street|通り|alley|横丁|pond|池|forest|森|bamboo|竹"),
 ("see",   r"monastery|grotto|great wall|chang cheng|长城|ancient (town|city)|古镇|old town|palace|palais|mosquee|mosque|pagoda|pagode|tomb|museum of|musee|remparts|wall|gate|tower of|bell tower|drum tower|鼓楼|hutong|xiang\b|jie\b|street|terre cuite|terracotta|bouddha|buddha|cite interdite|temple du|place |square|mansion|confucius|lama|chateau|sanctuaire|pagode|jardin|parc |-jo\b|jingu|myojin|-in\b|daibutsu|statue|fort|mausoleum|mausolee|-den\b|kokyo|palais|path|dori|-dori|road|chaya|juku|-zaka|zaka|canal|golden gai|honten|mikasa|tomonoura|former|eglise|church|cathedral|gyoen|kodo|koen|-en\b|kami-senbon|gion|kayabuki|寺|shrine|神社|jinja|jingu|神宮|taisha|大社|-ji\b|\bji\b|dera|castle|城|garden|庭園|palace|御所|pagoda|塔|torii|鳥居|buddha|大仏|kannon|観音|historic|old town|宿場|district|街並|monument|memorial|記念"),
]
ICON = {"food":"ramen","cafe":"cup","see":"torii","photo":"camera","activity":"ticket","sleep":"pagoda","hidden":"gem"}

def override_for(name):
    """Exact name, else the longest override key the name starts with (CSV names can be longer)."""
    if name in OVERRIDES: return OVERRIDES[name]
    keys = [k for k in OVERRIDES if len(k) > 12 and name.startswith(k)]
    return OVERRIDES[max(keys, key=len)] if keys else None

def dms(name):
    m = re.match(r"(\d+)°(\d+)'([\d.]+)\"N (\d+)°(\d+)'([\d.]+)\"E", name)
    if not m: return None
    a = [float(x) for x in m.groups()]
    return round(a[0] + a[1] / 60 + a[2] / 3600, 4), round(a[3] + a[4] / 60 + a[5] / 3600, 4)

def decode(url):
    m = re.search(r"!1s(0x[0-9a-f]+):0x[0-9a-f]+", url)
    if not m: return None
    ll = s2sphere.CellId(int(m.group(1), 16)).to_lat_lng()
    return round(ll.lat().degrees, 4), round(ll.lng().degrees, 4)

def nearest_city(lat, lng):
    best = min(CITIES.items(), key=lambda kv: (kv[1][0]-lat)**2 + ((kv[1][1]-lng)*math.cos(math.radians(lat)))**2)
    d = math.hypot(best[1][0]-lat, (best[1][1]-lng)*math.cos(math.radians(lat))) * 111
    return best[0], round(d)

_cities_from_config()
rows = list(csv.DictReader(open(src, encoding="utf-8")))
keep, dropped, outside, areas = [], [], [], []
seen = set()
for r in rows:
    name = (r.get("Titre") or "").strip(); url = (r.get("URL") or "").strip()
    if not name or not url: continue
    key = norm(name)
    if key in seen: continue
    seen.add(key)
    pos = tuple(FIX[name]) if name in FIX else (dms(name) or decode(url))
    if not pos: dropped.append({"name": name, "why": "pas de position"}); continue
    lat, lng = pos
    if not (BBOX[0] <= lat <= BBOX[1] and BBOX[2] <= lng <= BBOX[3]) or any(b[0] <= lat <= b[1] and b[2] <= lng <= b[3] for b in EXCLUDE):
        outside.append({"name": name, "lat": lat, "lng": lng}); continue
    n = norm(name)
    ov = override_for(name)
    if ov == "drop": dropped.append({"name": name, "why": "tri manuel"}); continue
    if ov == "area": areas.append({"name": name, "lat": lat, "lng": lng, "url": url}); continue
    hit = None if (ov or re.search(KEEP_ANYWAY, n) or dms(name)) else next((p for p in DROP if re.search(p, n)), None)
    if hit: dropped.append({"name": name, "why": hit}); continue
    cat = ov or ("photo" if dms(name) else None) or next((c for c, p in CATS if re.search(p, n)), None)
    city, dist = nearest_city(lat, lng)
    keep.append({"name": name, "url": url, "lat": lat, "lng": lng, "category": cat or "see", "guessed": bool(cat),
                 "city": city if dist <= 40 else f"près de {city}", "note": (r.get("Note") or "").strip(), "comment": (r.get("Commentaire") or "").strip()})
json.dump({"keep": keep, "dropped": dropped, "outside": outside, "areas": areas}, open(out_json, "w"), ensure_ascii=False, indent=1)
from collections import Counter
print("lignes:", len(rows), "| gardés:", len(keep), "| zones:", len(areas), "| retirés:", len(dropped), "| hors Japon:", len(outside))
print("catégories:", Counter(k["category"] for k in keep), "| non devinées:", sum(not k["guessed"] for k in keep))
print("villes:", Counter(k["city"] for k in keep).most_common(18))
