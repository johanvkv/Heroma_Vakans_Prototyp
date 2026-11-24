# Kommentarer i prototypen

## För testpersoner

1. Öppna den delade Netlify-adressen och klicka på **Kommentera** nere till höger.
2. Klicka eller högerklicka där kommentaren hör hemma, skriv namn och kommentar och välj **Spara kommentar**.
3. **Mina kommentarer** visar dina kommentarer i samma webbläsare. Namn och ett slumpmässigt besökar-id sparas lokalt för kommande sessioner. `Esc` stänger formuläret eller kommentarsläget.

Kommentarerna sparas via `/api/feedback` i Netlify Blobs i EU-regionen `eu-central-1`. Varje kommentar har en egen nyckel. Nycklarna delas upp per webbplatsens värdnamn, så grenadressen och huvudadressen har skilda kommentarer även om de använder samma Netlify-projekt. Data ligger kvar efter nya deployer.
Projektets `.node-version` låser Netlify-bygget och funktionerna till Node.js 24, vilket krävs av den använda versionen av `@netlify/blobs`.

## För administratören

Öppna `/feedback-admin` på samma domän. Där finns sökning, filter per sida och status, antal per sida och testperson, statusändring, CSV-export och borttagning. Sidan hämtar all data först efter serverkontrollerad administratörsinloggning.

I Netlify: **Project configuration → Environment variables**. Lägg till följande som variabler tillgängliga för **Functions** (om valet för scope visas). Välj värde för grenen `ny_bransch_1` eller för Branch deploys, och skapa därefter en ny deploy:

| Namn | Värde |
| --- | --- |
| `FEEDBACK_ADMIN_PASSWORD` | Ett eget starkt lösenord på minst 12 tecken. Skilt från prototypens vanliga lösenord. |
| `FEEDBACK_SESSION_SECRET` | Ett slumpmässigt hemligt värde på minst 32 tecken. |

Lägg inte hemligheterna i GitHub, `netlify.toml` eller en variabel med prefixet `VITE_`. Utan dessa två variabler fungerar insamlingen, men administratörsvyn visar ett konfigurationsmeddelande.

## Begränsningar

- Testpersonernas namn är självrapporterade och besökar-id gäller en webbläsare och en domän. Det är ingen verifierad identitet eller synkronisering mellan enheter.
- Markeringar i schemat fästs vid person, datum och vy. Om ett objekt tas bort, byter identitet eller inte visas i den aktuella vyn finns kommentaren kvar i sammanställningen, men dess markering kan inte visas förrän objektet syns igen.
- Vid lokal Vite-utveckling visas en tydligt märkt förhandsvisning som sparar i webbläsarens `localStorage`. Den delas inte med Netlify. Den delade Netlify-sajten använder endast serverfunktionen.
- Inga verkliga personuppgifter bör matas in i en testprototyp utan att organisationen har bestämt ändamål, åtkomst och gallring. Administratören kan exportera eller radera kommentarer i gränssnittet.
