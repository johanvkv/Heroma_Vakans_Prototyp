# UX-granskning av prototypen mot designriktlinjerna

Datum: 2026-09-21

## Sammanfattning

Prototypen har en bra grund i hub-and-modal-principen: schemat fungerar som en central översikt och inställningar, kandidater och beställningar öppnas i sammanhanget. Den största avvikelsen är att flera viktiga funktioner fortfarande är dolda eller beroende av musinteraktioner som högerklick, dubbelklick, hover och drag-and-drop.

För att bättre följa riktlinjerna bör designen framför allt göra åtgärder synliga, minska den visuella komplexiteten, ge tydligare återkoppling och säkerställa att alla centrala flöden fungerar med tangentbord och touch.

## 1. Var prototypen avviker

### User-centricity

Prototypen stödjer främst bemannaren och den operativa överblicken. Vikariens perspektiv är ännu mindre synligt i själva flödet: vilken information vikarien får, hur ett svar justeras och hur nästa steg ser ut behöver framgå tydligare.

### Consistency

Flera olika interaktionssätt används samtidigt:

- klick för att öppna och välja
- dubbelklick för fördjupning
- högerklick för kontextmeny
- drag-and-drop för vissa arbetsflöden
- hover för kompletterande information

Det gör att användaren behöver lära sig flera olika regler för liknande objekt. Samma typ av objekt bör i första hand bete sig på samma sätt.

### Hierarchy

Schemat visar mycket information samtidigt: närvaro, frånvaro, pass, pooltjänst, minimibemanning, teamstruktur och olika färgmarkeringar. Det är funktionellt, men den viktigaste informationen riskerar att försvinna i mängden.

Det behöver vara tydligare vad som är:

1. primär information för snabb bedömning
2. sekundär information för beslut
3. detaljer som kan öppnas vid behov

### Context

Grundvyn behåller användaren i schemat, vilket är bra. Däremot kan modal, panel, filtrering och valt pass ibland skapa osäkerhet kring vilket team, datum eller passtyp som bearbetas. Kontexten bör alltid synas i rubrik och åtgärdsområde.

### User control

Användaren får begränsad synlig hjälp med att ångra, avbryta eller återhämta sig från ändringar. Dolda kontextmenyer gör också att användaren inte alltid vet vilka åtgärder som finns.

Förändringar bör bekräftas direkt och kunna avbrytas eller återställas när det är rimligt.

### Accessibility

Färg, små pluppar och position används för att kommunicera status. Det räcker inte ensamt för användare med nedsatt färgseende eller kognitiva svårigheter. Högerklick, dubbelklick, hover och drag-and-drop saknar dessutom naturliga motsvarigheter på touch och behöver tydliga alternativ.

### Usability

Det går att genomföra centrala uppgifter, men det kräver att användaren först upptäcker prototypens dolda interaktioner. Det ökar inlärningströskeln och minskar effektiviteten i ett system som används ofta och under tidspress.

### Touch first

Högerklick, hover, dubbelklick och drag-and-drop är problematiska på pekskärm. Alla viktiga funktioner behöver ha synliga tryckbara kontroller och tillräcklig träffyta.

### Instant reaction

Interaktioner behöver alltid ge tydlig återkoppling: vad ändrades, sparades, filtrerades eller skickades? Detta gäller särskilt inställningar, beställningar, förfrågningar och svar.

### Support the mental model

Hierarkin och schemats grundmodell är tydlig, men beteendet blir mindre förutsägbart när olika rader öppnas med olika interaktioner eller när resultatet av en åtgärd inte syns direkt.

### Support a sense of direction

Hubben är tydlig, men modalens och panelens rubriker bör alltid ange sammanhanget, exempelvis team, datum, pass och aktuell status. Användaren ska förstå både var den befinner sig och vad nästa steg är.

## 2. Förändringar som bör göras i designen

### Prioritet 1: Gör viktiga åtgärder synliga

- Lägg till synliga åtgärdsknappar eller en tydlig menyknapp på team-, person- och beställningsrader.
- Behåll högerklick som ett sekundärt snabbt sätt, men gör inte kritiska funktioner beroende av det.
- Visa alltid relevanta åtgärder för valt objekt, exempelvis Öppna, Inställningar, Skapa beställning och Visa svar.
- Ersätt dubbelklick som enda väg till fördjupning med en synlig knapp eller länk.
- Ersätt drag-and-drop som enda väg till en åtgärd med en knappbaserad variant.

### Prioritet 2: Förenkla visualiseringen

Använd en tydligare informationshierarki:

- stapeln visar bemanningsläge och miniminivå
- texten visar aktuellt antal och total
- ikon eller text visar frånvaro, poolpass och varning
- detaljer visas i en rad, panel eller modal först när de behövs

Undvik att flera färger, pluppar och staplar samtidigt konkurrerar om uppmärksamheten.

### Prioritet 3: Använd inte färg som enda signal

Alla statusar bör ha minst två uttryck, exempelvis färg plus text, ikon eller mönster. Det gäller särskilt:

- underbemanning
- frånvaro
- poolpass
- positivt svar
- valt eller aktivt pass

Ljusröd bakgrund bör kompletteras med exempelvis texten Under minimibemanning eller en varningsikon.

### Prioritet 4: Stärk hub-and-modal-modellen

Behåll schemat som hubb och öppna redigering och detaljer i modal eller sidopanel. Varje modal bör visa:

- vilken verksamhet, avdelning eller vilket team som berörs
- valt datum och passtyp
- aktuell status
- vad användaren kan göra härnäst
- tydliga primära och sekundära knappar

Stängning ska fungera med X, klick utanför och Escape där det inte finns skäl att kräva ett uttryckligt beslut.

### Prioritet 5: Ge omedelbar återkoppling och möjlighet att ångra

- Visa bekräftelse när inställningar sparas.
- Visa återkoppling när en förfrågan skickas eller ett svar tas emot.
- Markera nya eller ändrade svar tydligt i beställningsöversikten.
- Erbjud Ångra efter relevanta ändringar.
- Behåll användarens val vid filtrering, stängning av modal och återöppning av panel.
- Visa laddning och fel på ett lugnt och begripligt sätt utan att tappa inmatad information.

### Prioritet 6: Anpassa för touch och frekvent användning

- Säkerställ stora tryckytor och tydliga knappar.
- Gör centrala flöden möjliga utan hover eller högerklick.
- Placera filter och vyval ovanför tabellen.
- Placera primära bekräftande åtgärder under innehållet och till höger.
- Lägg till tangentbordsstöd för Tab, Shift+Tab, Enter, Escape, Space och Ctrl+S där det är relevant.
- Säkerställ synlig fokusmarkering och logisk tabbordning.

### Prioritet 7: Gör beställningsstatus mer handlingsinriktad

En badge på “Visa beställningar” är bra återkoppling, men statusen bör också säga vad som kräver handling, exempelvis:

> 2 positiva svar väntar på granskning

Kombinera badgen med en synlig åtgärd som “Granska svar” och visa samma status i beställningsöversikten.

### Prioritet 8: Förbättra tillgängligheten

Testa prototypen med:

- endast tangentbord
- touch utan mus
- 200 procent zoom
- hög kontrast och färgblindhetssimulering
- skärmläsare
- tydlig fokusordning

Säkerställ särskilt att team kan öppnas och stängas, att inställningar kan ändras och att beställningar kan följas upp utan högerklick, dubbelklick, hover eller drag-and-drop.

## Rekommenderad ordning för nästa designiteration

1. Gör alla centrala åtgärder synliga och ersätt dolda musberoenden.
2. Förenkla mängden visuella signaler i schemat.
3. Lägg till tydlig återkoppling, sparstatus och Ångra.
4. Standardisera modal-, panel- och kontextmenybeteende.
5. Komplettera färg med text och ikoner.
6. Testa hela flödet med touch, tangentbord och hjälpmedel.

## Kort slutsats

Prototypen har en stark funktionell kärna och en bra central översikt. Den största designrisken är inte att information saknas, utan att för mycket funktionalitet kommuniceras genom dolda eller musberoende interaktioner. Nästa iteration bör därför fokusera på synlighet, prioritering, återkoppling, återställning och tillgänglig interaktion.
