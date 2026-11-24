# Kommentarer i prototypen

## För testpersoner

1. Öppna den delade Netlify-adressen och klicka på **Kommentera** bredvid personsökningen högst upp. Knappen ligger även ovanpå öppna dialoger och detaljvyer.
2. Klicka eller högerklicka där kommentaren hör hemma, skriv din kommentar och välj **Spara kommentar**.
3. Markeringarna visar kommentarer från alla testpersoner på den plats och i den vy där de skrevs. **Kommentarer här** visar dem som lista. **Uppdatera** hämtar nytillkomna kommentarer. `Esc` stänger formuläret eller kommentarsläget.

Kommentarerna sparas via `/api/feedback` i Netlify Blobs i EU-regionen `eu-central-1`. Varje kommentar har en egen nyckel. Nycklarna delas upp per webbplatsens värdnamn, så grenadressen och huvudadressen har skilda kommentarer även om de använder samma Netlify-projekt. Data ligger kvar efter nya deployer.
Projektets `.node-version` låser Netlify-bygget och funktionerna till Node.js 24, vilket krävs av den använda versionen av `@netlify/blobs`.

## Delning och integritet

Sammanställningssidan har tagits bort. Det finns inget namnfält och nya kommentarer lagras med visningsnamnet **Anonym**. Äldre kommentarer kan fortfarande ha namn i lagringen, men det publika läs-API:et ersätter alltid namnet med **Anonym** och skickar endast en hash av besökar-id:t.

Alla som känner till webbplatsens adress kan läsa kommentarerna via `/api/feedback-public`. Undvik riktiga personuppgifter och känslig information i fritextfältet. Det slumpmässiga besökar-id:t används fortfarande internt när en kommentar sparas, men formuläret frågar inte efter identitet.

Den äldre serverfunktionen `/api/feedback-admin` är fortsatt skyddad för eventuell underhållsåtkomst, men används inte av gränssnittet.


## Begränsningar

- Besökar-id gäller en webbläsare och en domän. Det är ingen verifierad identitet eller synkronisering mellan enheter.
- Markeringar i schemat fästs vid person, datum och vy. Om ett objekt tas bort, byter identitet eller inte visas i den aktuella vyn finns kommentaren kvar i sammanställningen, men dess markering kan inte visas förrän objektet syns igen.
- Vid lokal Vite-utveckling visas en tydligt märkt förhandsvisning som sparar i webbläsarens `localStorage`. Den delas inte med Netlify. Den delade Netlify-sajten använder endast serverfunktionen.
- Dialoger som byggs om med ändrad DOM-struktur kan förlora sin tidigare markering; kommentaren finns då kvar i lagringen.
- Inga verkliga personuppgifter bör matas in i en testprototyp utan att organisationen har bestämt ändamål, åtkomst och gallring.
