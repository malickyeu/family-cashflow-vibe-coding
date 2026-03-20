# Kalendář - Dokumentace

## Přehled
Kalendářový systém pro rodinnou i osobní správu událostí s podporou opakujících se akcí a drag & drop funkcionalit.

## Funkce

### Základní funkce
- **Zobrazení kalendáře**: Měsíční/týdenní/denní pohled
- **Osobní události**: Události viditelné pouze pro uživatele
- **Rodinné události**: Události sdílené mezi všemi členy rodiny
- **Drag & Drop**: Přesouvání událostí mezi dny
- **Barevné kódování**: Události mají vlastní barvy

### Opakující se události
- Denní opakování
- Týdenní opakování
- Měsíční opakování
- Roční opakování
- Nastavitelné datum ukončení opakování

### Správa událostí
- Vytvoření nové události
- Úprava existující události
- Smazání události
- Drag & Drop přesunutí události na jiný den

## Databázová struktura

### Tabulka `calendar_events`
- `id`: Primární klíč
- `title`: Název události
- `description`: Detailní popis
- `start_datetime`: Začátek události
- `end_datetime`: Konec události
- `all_day`: Celodenní událost (boolean)
- `location`: Místo konání
- `color`: Barva události v kalendáři
- `user_id`: Vlastník události
- `created_by`: Tvůrce události  
- `family_id`: NULL pro osobní, ID pro rodinné události
- `recurrence_type`: Typ opakování (none/daily/weekly/monthly/yearly)
- `recurrence_days`: JSON pole dnů v týdnu pro týdenní opakování
- `recurrence_interval`: Interval opakování (každý X den/týden/měsíc)
- `recurrence_end_date`: Datum ukončení opakování
- `parent_event_id`: Odkaz na rodičovskou událost (pro opakované instance)
- `reminder_minutes`: Připomínka X minut před událostí

## API Endpointy

### GET `/calendar`
Zobrazení kalendáře s událostmi

**Query parametry:**
- `start`: Začátek období (YYYY-MM-DD)
- `end`: Konec období (YYYY-MM-DD)

### POST `/calendar`
Vytvoření nové události

**Body:**
```json
{
  "title": "Schůzka",
  "description": "Popis události",
  "start_datetime": "2026-03-20 09:00",
  "end_datetime": "2026-03-20 10:00",
  "all_day": false,
  "location": "Kancelář",
  "color": "#0d6efd",
  "recurrence_type": "weekly",
  "recurrence_interval": 1,
  "recurrence_end_date": "2026-12-31",
  "reminder_minutes": 30
}
```

### PATCH `/calendar/{event}`
Aktualizace události

### PATCH `/calendar/{event}/move`
Přesunutí události pomocí drag & drop

**Body:**
```json
{
  "start_datetime": "2026-03-21 09:00",
  "end_datetime": "2026-03-21 10:00"
}
```

### DELETE `/calendar/{event}`
Smazání události

## Frontend komponenty

### Index.tsx
Hlavní kalendářová komponenta

**Props:**
- `events`: Pole událostí k zobrazení
- `currentDate`: Aktuální datum

**State:**
- `view`: Typ zobrazení (month/week/day)
- `currentMonth`: Aktuálně zobrazený měsíc
- `showEventModal`: Zobrazení modalu pro vytvoření/úpravu události
- `editingEvent`: Událost k úpravě
- `draggedEvent`: Přetahovaná událost

## Použití

### Vytvoření události
1. Klikněte na tlačítko "Nová událost" nebo klikněte na den v kalendáři
2. Vyplňte formulář (název, čas, popis, atd.)
3. Vyberte typ opakování (pokud potřeba)
4. Klikněte "Vytvořit"

### Přesunutí události
1. Uchopte událost myší (drag)
2. Přetáhněte na jiný den
3. Pusťte (drop)

### Úprava události
1. Klikněte na existující událost
2. Upravte formulář
3. Klikněte "Uložit"

## Personální vs. Rodinný mód

### Personální mód
- Události jsou viditelné pouze pro přihlášeného uživatele
- `family_id` je NULL

### Rodinný mód
- Události jsou sdílené mezi všemi členy rodiny
- `family_id` obsahuje ID rodiny
- Všichni členové rodiny vidí tyto události ve svém kalendáři

## Budoucí rozšíření
- [ ] Týdenní a denní pohledy
- [ ] Export do iCal formátu
- [ ] Push notifikace pro připomínky
- [ ] Kalendářové pozvánky
- [ ] Přidání účastníků k událostem
- [ ] Sdílení kalendáře s externími uživateli
- [ ] Integrace s Google Calendar
