---
title: MySQL
subTitle: Problem z formatowaniem liczb
category: "mysql"
cover: mysql.png
---

Męczyłem się dość długo z zapytaniem do bazy w MySQL gdzie trzymamy sobie ceny (np 10$ to 1000 - przyp. centów - ponieważ mogą być ceny typu $10.50).
W DQL chciałem sobie wyciągnąć tą cenę i przy SELECT'cie dawałem price/100 to zwracało mi 10.0000 (wtf?) - zamiast 10.00.
Nie można użyć MYSQL'owego FORMAT() ponieważ w DQL'u jest funkcMy niedostępną.
Do raportu, który jest bezpośrednio po sparsowaniu eksportowany do CSV wrzucało niestety cenę 10.0000 ..


**Rozwiązanie:**


Okazało się, że wystarczyło zamiast /100 zrobić * 0.01
