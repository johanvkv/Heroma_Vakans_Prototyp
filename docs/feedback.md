# Kommentarer i prototypen

## För testpersoner

1. Öppna den delade Netlify-adressen och klicka på **Kommentera** bredvid personsökningen högst upp.
2. Klicka eller högerklicka där kommentaren hör hemma, skriv namn och kommentar och välj **Spara kommentar**.
3. **Mina kommentarer** visar dina kommentarer i samma webbläsare. Namn och ett slumpmässigt besökar-id sparas lokalt för kommande sessioner. `Esc` stänger formuläret eller kommentarsläget.

Kommentarerna sparas via `/api/feedback` i Netlify Blobs i EU-regionen `eu-central-1`. Varje kommentar har en egen nyckel. Nycklarna delas upp per webbplatsens värdnamn, så grenadressen och huvudadressen har skilda kommentarer även om de använder samma Netlify-projekt. Data ligger kvar efter nya deployer.
Projektets `.node-version` låser Netlify-bygget och funktionerna till Node.js 24, vilket krävs av den använda versionen av `@netlify/blobs`.

## Sammanställning

Öppna **Meny → Personligt → Övriga uppgifter → Nämnder**. Det leder till `/kommentarer/sammanstallning` med sökning, filter per sida, status och testperson, antal per sida och testperson samt CSV-export. Sammanställningen är skrivskyddad och kräver inget separat administratörskonto. Besökar-id maskeras i sammanställningssvaret så att det inte kan användas för att hämta en persons egna kommentarer.

Menylänken är undanskymd men inte ett åtkomstskydd. Alla med tillgång till prototypen kan öppna sidan eller anropa `/api/feedback-summary` och läsa namn och kommentarer. Använd bara testuppgifter som får delas med samtliga testpersoner.

Den äldre serverfunktionen `/api/feedback-admin` är fortsatt skyddad för eventuell underhållsåtkomst, men används inte av gränssnittet. `FEEDBACK_ADMIN_PASSWORD` och `FEEDBACK_SESSION_SECRET` behövs inte för att läsa sammanställningen.


## Begränsningar

- Testpersonernas namn är självrapporterade och besökar-id gäller en webbläsare och en domän. Det är ingen verifierad identitet eller synkronisering mellan enheter.
- Markeringar i schemat fästs vid person, datum och vy. Om ett objekt tas bort, byter identitet eller inte visas i den aktuella vyn finns kommentaren kvar i sammanställningen, men dess markering kan inte visas förrän objektet syns igen.
- Vid lokal Vite-utveckling visas en tydligt märkt förhandsvisning som sparar i webbläsarens `localStorage`. Den delas inte med Netlify. Den delade Netlify-sajten använder endast serverfunktionen.
- Inga verkliga personuppgifter bör matas in i en testprototyp utan att organisationen har bestämt ändamål, åtkomst och gallring. Sammanställningen kan exporteras, men kommentarer kan inte ändras eller raderas där.
