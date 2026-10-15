# Ajouter un lieu sur la carte

Les lieux du Japon sont dans **`data/japan.yaml`**. Chaque lieu est un bloc qui commence par `- id:`.
Pour en ajouter un, copie un bloc existant, colle-le à la fin et modifie-le.

## Modèle à copier

```yaml
  - id: nom-du-lieu-sans-espaces        # unique, minuscules, tirets (sert au lien de partage)
    name: { fr: Nom en français, en: Name in English }   # ou juste : name: Nom identique
    name_ja: 伏見稲荷大社          # facultatif · nom en japonais (ou dans la langue du pays)
    icon: torii                   # facultatif · dessin sur la carte (liste ci-dessous)
    city: Kyoto
    category: food        # food · cafe · see · photo · activity · sleep · hidden
    visited: true         # true = j'y suis allée · false = sur ma liste (pas encore testé)
    verdict: love         # love · recommend · optional   (seulement si visited: true)
    lat: 35.0050
    lng: 135.7649
    photo: nom-du-lieu.jpg        # facultatif · fichier dans images/places/japan/
    guide: asia/japan/...         # facultatif · lien vers un guide complet
    google_maps: https://maps.app.goo.gl/...   # facultatif · ton lien Google Maps
    review:                        # ton avis court (1–2 phrases)
      fr: "..."
      en: "..."
    experience:                    # ton expérience détaillée (future partie premium)
      fr: "..."
      en: "..."
    info:                          # tout est facultatif
      when:     { fr: "...", en: "..." }   # quand y aller
      price:    { fr: "...", en: "..." }   # prix
      duration: { fr: "...", en: "..." }   # durée
      booking:  { fr: "...", en: "..." }   # réservation
      access:   { fr: "...", en: "..." }   # accès / transport
    tips:                          # astuces (autant que tu veux)
      - fr: "..."
        en: "..."
```

## Les catégories

| Code | Français | English |
|---|---|---|
| `food` | Manger | Eat |
| `cafe` | Café | Coffee |
| `see` | À voir | Sights |
| `photo` | Spot photo | Photo spot |
| `activity` | Activité | Activity |
| `sleep` | Dormir | Stay |
| `hidden` | Pépite cachée | Hidden gem |

## Le verdict

- `love` → **Coup de cœur** (petit cœur rose sur la carte)
- `recommend` → **Recommandé**
- `optional` → **Si tu as le temps**
- Si `visited: false`, le lieu s'affiche en pointillés avec « Pas encore testé · sur ma liste ».

## Trouver les coordonnées (lat / lng)

Dans Google Maps, **clic droit sur le lieu** (ou appui long sur mobile) : la première ligne affiche
par exemple `34.9671, 135.7727`. Le premier nombre est `lat`, le second `lng`.

## Les règles à respecter (sinon le lieu n'apparaît pas)

1. **L'indentation compte** : garde exactement les mêmes espaces que les autres blocs (pas de tabulation).
2. Mets les textes entre **guillemets** `"..."` s'ils contiennent `:` ou `#`.
3. Si une langue manque, l'autre s'affiche à la place : tu peux écrire en français d'abord et traduire plus tard.

## Photos

Mets tes photos dans `images/places/japan/` en **JPG de moins de 300 Ko**
(largeur ~1200 px ; tu peux compresser sur squoosh.app), puis indique le nom du fichier dans `photo:`.

## Ajouter un pays avec ses lieux

1. Crée un fichier `data/<pays>.yaml` sur le modèle de `data/japan.yaml` (bloc `country:` puis `places:`).
2. Dans `data/countries.yaml`, ajoute la ligne `places: <pays>.yaml` sous le pays concerné.
   Le pays affiche alors une grande bulle avec le nombre de lieux, et on peut zoomer dessus.

Les pays sans `places:` affichent « J'y suis allée · guide bientôt » quand on clique dessus.
Pour changer la photo ronde d'un pays, modifie `cover:` dans `data/countries.yaml`.

## Les dessins (`icon:`)

Chaque lieu peut avoir son petit dessin sur la carte et dans la liste :

| Code | Dessin | Code | Dessin |
|---|---|---|---|
| `torii` | portail de sanctuaire | `deer` | daim |
| `funaya` | maison-bateau | `bamboo` | bambous |
| `dango` | brochette de dango | `cup` | tasse de café |
| `lantern` | lanterne de pierre | `pagoda` | pagode / temple |
| `acorn` | gland (forêt, Ghibli) | `wheel` | grande roue (parc d'attractions) |
| `takoyaki` | takoyaki | `boat` | bateau sur l'eau |
| `ramen` | bol de ramen | `camera` | appareil photo |
| `ticket` | billet | `gem` | pierre précieuse (pépite) |
| `wall` | Grande Muraille | `panda` | panda |
| `castle` | château japonais | `temple` | temple bouddhiste |
| `onsen` | source chaude | `waterfall` | cascade |
| `mountain` | montagne (Fuji) | `lake` | lac |
| `beach` | plage, île | `garden` | jardin, parc |
| `shop` | boutique | `museum` | musée |
| `house` | maison au toit de chaume (Shirakawa-gō) | `bridge` | pont |
| `tower` | tour | `cablecar` | téléphérique |
| `train` | train, gare | `flower` | fleurs |

Les lieux très connus ont leur propre dessin :

| Code | Lieu | Code | Lieu |
|---|---|---|---|
| `kinkakuji` | Pavillon d'or | `senbon` | torii de Fushimi Inari |
| `itsukushima` | torii flottant de Miyajima | `chureito` | pagode Chūreitō et Fuji |
| `daibutsu` | Grand Bouddha | `kiyomizu` | Kiyomizu-dera |
| `pokeball` | Pokémon Center / Café | `star` | Kirby Café |
| `gamepad` | Nintendo | `monkey` | singes (Jigokudani, Arashiyama) |
| `teamlab` | teamLab | `terraces` | rizières en terrasses |
| `crossing` | carrefour de Shibuya | `heaven` | Temple du Ciel |
| `warrior` | guerriers de terre cuite | `forbidden` | Cité interdite |
| `karst` | pics de Guilin et Yangshuo | `pillars` | piliers de Zhangjiajie |
| `potala` | palais du Potala | `pearl` | tour de la Perle d'Orient |

## Les régions (`region:`)

Dans un pays, les lieux sont rangés par grandes régions, puis par villes (`city:`).
La liste des régions est en haut du fichier du pays (`regions:`), avec leur nom long et leur nom court (`short`, affiché sur la carte).

- Japon : `hokkaido`, `tohoku`, `kanto` (Tokyo et Fuji), `chubu` (Alpes japonaises), `kansai`, `west` (Chūgoku et Shikoku), `kyushu`, `okinawa`
- Chine : `beijing`, `xian`, `shanghai`, `sichuan`, `hunan` (Zhangjiajie), `guilin`, `yunnan`, `west` (Ouest et Tibet)

Sans `icon:`, le lieu prend le dessin de sa catégorie (Manger → ramen, À voir → torii…).
Seuls les plats, les boissons et le lapin ont un petit visage : c'est voulu.
Besoin d'un nouveau dessin ? Demande-le, je l'ajoute à la collection.
