# Instrukcije za pokretanje projekta za pregledanje

Ispratite instrukcije za pokretanje ovog projekta.

## Preuzimanje projekta

```sh
git clone https://github.com/PIIVT-2019-2020/Aplikacija.git
cd Aplikacija
```

## Instalacija potrebnih komponenata

```sh
npm install --silent
```

## Podizanje baze podataka

SQL dump baze podataka se nalazi na lokaciji .BAZA PODATAKA/aplikacija.sql.

Podici na lokalni MySQL/MariaDB server dump ove baze.

## Konfiguracija baze podataka

Definicija konfiguracionih parametara je u datoteci /config/database.configuration.ts

Primer izgleda konfiguracione datoteke:
```typescript
export const DatabaseConfiguration = {
    hostname: "localhost",
    username: "root",
    password: "",
    database: "aplikacija"
};
```

## Pokretanje aplikacije

```sh
npm run start:dev
```

U Internet pregledacu otvoriti: http://localhost:3000/

## Instrukcije za testiranje

Instalirajte Postman i uvezite kolekciju iz datoteke .POSTMAN/aplikacija.json

Autori: ~~~
