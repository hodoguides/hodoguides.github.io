# Importer une liste Google Maps (Google Takeout)

Outil utilisé pour transformer les listes « Enregistré » de Google Takeout en lieux pour la carte.
Les fichiers de l'export (Takeout) ne sont **pas** dans ce dépôt : ils restent privés.

```bash
pip install s2sphere openpyxl
# Japon (réglages par défaut)
python3 tools/import-google-maps/triage.py "Takeout/Enregistré/Japon.csv" japon.json
# Un autre pays : un fichier de réglages (zone, villes, corrections, tri manuel)
python3 tools/import-google-maps/triage.py "Takeout/Enregistré/Chine.csv" chine.json tools/import-google-maps/china.json
# Tableau Excel à remplir à partir du résultat
python3 tools/import-google-maps/make_xlsx.py japon.json Japon-a-trier.xlsx
```

- La position vient du code caché dans le lien Google Maps : elle est **approximative** (quelques km).
- `overrides-*.json` : décisions manuelles par nom de lieu (`drop`, `area` pour une ville/région, ou une catégorie).
