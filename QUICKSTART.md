# Rychlý Start Guide

## ✅ Co bylo vytvořeno

Kompletní Stealth YouTube Player aplikace s následujícími funkcemi:

### 🎯 Hlavní Funkce
- ✅ Google OAuth autentifikace (NextAuth.js)
- ✅ Privacy Mode defaultně zapnutý (video skryté pod černou vrstvou)
- ✅ Vlastní ovládací prvky (Play/Pause/Volume/Progress)
- ✅ Možnost dočasného odkrytí videa (podrž tlačítko)
- ✅ Moderní UI s Tailwind CSS
- ✅ Plně responzivní design

### 📂 Struktura Projektu
```
Projekty/
├── .github/
│   └── copilot-instructions.md
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts              # NextAuth API endpoint
│   ├── globals.css               # Globální styly
│   ├── layout.tsx                # Root layout s SessionProvider
│   └── page.tsx                  # Hlavní stránka aplikace
├── components/
│   ├── AuthButton.tsx            # Tlačítko pro přihlášení/odhlášení
│   ├── Player.tsx                # YouTube player s overlay controls
│   └── SessionProvider.tsx       # Client-side session wrapper
├── lib/
│   └── auth.ts                   # NextAuth konfigurace
├── types/
│   └── next-auth.d.ts            # TypeScript typy pro NextAuth
├── .env                          # Environment variables (DOPLŇ!)
├── .env.example                  # Příklad .env souboru
├── next.config.js                # Next.js konfigurace
├── tailwind.config.ts            # Tailwind CSS konfigurace
├── tsconfig.json                 # TypeScript konfigurace
├── package.json                  # npm dependencies
└── README.md                     # Dokumentace
```

## 🚀 KROK 1: Nastavení Google OAuth

1. **Jdi na [Google Cloud Console](https://console.cloud.google.com/)**

2. **Vytvoř nový projekt** (nebo vyber existující)

3. **Aktivuj Google+ API:**
   - V levém menu: APIs & Services → Library
   - Vyhledej "Google+ API"
   - Klikni "Enable"

4. **Vytvoř OAuth 2.0 Credentials:**
   - V levém menu: APIs & Services → Credentials
   - Klikni "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Stealth YouTube Player"
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Klikni "Create"

5. **Zkopíruj Client ID a Client Secret**

## 🔑 KROK 2: Nastavení .env souboru

Otevři soubor `.env` v kořenovém adresáři a doplň:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### Generování NEXTAUTH_SECRET:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Nebo použij online generátor:**
https://generate-secret.vercel.app/32

## ▶️ KROK 3: Spuštění Aplikace

Development server už běží! Otevři v prohlížeči:

**👉 http://localhost:3000**

Pokud server neběží, spusť:
```bash
npm run dev
```

## 📝 Jak Používat Aplikaci

1. **Přihlášení:**
   - Klikni na "Přihlásit se přes Google"
   - Vyber svůj Google účet
   - Povol přístup

2. **Načtení Videa:**
   - Zkopíruj YouTube URL (např. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
   - Vlož do input pole
   - Klikni "Načíst" nebo stiskni Enter

3. **Přehrávání:**
   - Video se automaticky načte v Privacy Mode (černá obrazovka)
   - Používej vlastní ovládací prvky:
     - ▶️ Play/Pause tlačítko
     - 🔊 Volume slider
     - ⏱️ Progress bar

4. **Odkrytí Videa (volitelné):**
   - Podrž tlačítko "🔒 Podrž pro odkrytí"
   - Video se zobrazí, dokud držíš tlačítko
   - Po puštění se video opět skryje

5. **Trvalé vypnutí Privacy Mode:**
   - Klikni na "Trvale vypnout" tlačítko dole
   - Video bude permanentně viditelné

## 🎨 Vlastnosti Privacy Mode

- **Default State:** Video je VŽDY skryté při načtení
- **Blind Controls:** Všechny ovládací prvky fungují i když je video skryté
- **Reveal on Hold:** Dočasné zobrazení videa podržením tlačítka
- **Toggle Mode:** Možnost trvale vypnout/zapnout privacy mode

## 🛠️ NPM Příkazy

```bash
# Development mode
npm run dev

# Production build
npm run build

# Spustit production server
npm start

# Lint kód
npm run lint
```

## 📚 Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **React:** 18.3
- **Styling:** Tailwind CSS 3.4
- **Auth:** NextAuth.js 4.24
- **Player:** react-youtube 10.1
- **Language:** TypeScript 5

## 🐛 Řešení Problémů

### Chyba: "Cannot find module 'next-auth'"
```bash
npm install
```

### Chyba: "Invalid credentials"
- Zkontroluj, že jsi správně nastavil `.env` soubor
- Ujisti se, že GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET jsou správné
- Restart dev serveru: `Ctrl+C` a pak `npm run dev`

### Video se nenačítá
- Zkontroluj, že je URL validní YouTube odkaz
- YouTube API může blokovat některá videa (copyright, region lock)

### Dev server neběží
```bash
npm run dev
```

## 🚀 Deployment (Volitelné)

Pro nasazení na Vercel:

1. Push do GitHub repozitáře
2. Importuj projekt na [vercel.com](https://vercel.com)
3. Přidej environment variables ve Vercel dashboard
4. Aktualizuj Google OAuth redirect URI:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

## ✨ Co Dál?

### Možná Vylepšení:
- 🎵 Playlist podpora
- 💾 Uložení oblíbených videí
- 🔍 Vyhledávání videí přímo v aplikaci
- 📱 PWA podpora pro mobilní instalaci
- 🌙 Dark/Light mode toggle
- ⌨️ Keyboard shortcuts
- 📊 History přehraných videí

## 📄 Licence

MIT - Volně použitelné pro osobní i komerční účely

---

**Vytvořeno s ❤️ pro maximální soukromí při přehrávání YouTube videí**
