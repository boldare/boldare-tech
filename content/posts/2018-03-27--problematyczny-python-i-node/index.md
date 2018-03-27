---
title: Travis
subTitle: Problematyczny Python i Node
category: "travis"
cover: photo-1490474418585-ba9bad8fd0ea-cover.jpg
---

Projekt z language: node_js, ale wymagał też aws-cli (do odświeżania CloudFronta). Buildy sypały się losowo, bo dostępny był tylko “najświeższy” Python dla Ubuntu Trusty, czyli 2.7.6, któremu najwyraźniej brakowało jakichś rzeczy związanych z SSL.
Podanie w `.travis.yml`:

    python:
        - 3.6

albo jakiejkolwiek innej wersji, skutkowało… niczym.

Rozwiązanie
Wystarczyło ustawić language: python w .travis.yml w naszej frontendowej apce. Wtedy Travis poprawnie pobrał nowego Pythona.

Stara wersja Node
Mamy projekt np. `language: php`, wtedy Node będzie dostępny ale w przedpotopowej wersji 0.10 bodajże. Należy dodać:

before_install:
 - nvm install 7
aby cieszyć się Node w wersji 7. Inna opcja to dodanie pliku .nvmrc, w którym będzie siedzieć numer wersji.
