# Stealth YouTube Player

Aplikace pro diskrétní přehrávání YouTube videí s výchozím režimem soukromí.

## Vlastnosti

- 🔐 Google OAuth autentifikace
- 👻 Privacy Mode - video skryto pod černou vrstvou
- 🎮 Vlastní ovládací prvky (Play/Pause, Volume, Progress Bar)
- 🎵 Přehrávání YouTube videí pomocą URL
- 🎨 Moderní UI s Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Autentifikace:** NextAuth.js s Google Provider
- **Přehrávač:** react-youtube

## Instalace

1. Naklonuj repozitář a nainstaluj závislosti:

```bash
npm install
```

2. Vytvoř `.env` soubor v kořenovém adresáři s následujícím obsahem:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth Credentials
# Získej z: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

3. **Jak získat Google OAuth přihlašovací údaje:**

   a. Jdi na [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Vytvoř nový projekt nebo vyber existující
   
   c. Povolit Google+ API
   
   d. Jdi na "Credentials" → "Create Credentials" → "OAuth client ID"
   
   e. Vyber "Web application"
   
   f. Přidej Authorized redirect URIs:
      - `http://localhost:3000/api/auth/callback/google` (pro development)
   
   g. Zkopíruj `Client ID` a `Client Secret` do `.env` souboru

4. Vygeneruj NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

## Spuštění

### Development mode:

```bash
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000)

### Production build:

```bash
npm run build
npm start
```

## Použití

1. **Přihlášení:** Klikni na "Sign in with Google" pro přístup k aplikaci
2. **Načti video:** Vlož YouTube URL do vstupního pole
3. **Přehrávej:** Video se načte ve skrytém režimu (černá obrazovka)
4. **Ovládej:** Použij vlastní ovládací prvky na černé vrstvě
5. **Odkryj (volitelně):** Pro zobrazení videa klikni a podrž tlačítko "Odkrýt"

## Struktura projektu

```
.
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts       # NextAuth konfigurace
│   ├── globals.css                # Globální styly
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Hlavní stránka
├── components/
│   ├── Player.tsx                 # YouTube přehrávač s overlay
│   └── AuthButton.tsx             # Přihlašovací tlačítko
├── lib/
│   └── auth.ts                    # NextAuth helper
└── types/
    └── next-auth.d.ts             # TypeScript definice
```

## Poznámky pro vývoj

- Video je ve výchozím stavu **vždy skryto** černou vrstvou
- Všechna ovládání fungují i když je video zakryto
- Pro production nasazení nezapomeň aktualizovat `NEXTAUTH_URL` a Google OAuth Authorized redirect URIs

## Licence

MIT
