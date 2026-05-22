# Mortgage Profile API

Профиль ипотеки + расчёт графика в воркере Bull, кэш результата в Redis.

## Запуск

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Эндпоинты

`POST /mortgage-profiles`, заголовок `x-user-id` (tgId), тело:

```json
{
  "propertyPrice": 10000000,
  "propertyType": "apartment_in_new_building",
  "downPaymentAmount": 2000000,
  "matCapitalAmount": 586946.72,
  "matCapitalIncluded": true,
  "mortgageTermYears": 20,
  "interestRate": 12
}
```

Ответ: `{ "id": "1" }`.

`GET /mortgage-profiles/:id`, расчёт + `mortgagePaymentSchedule`.

## Допущения

ТЗ не задаёт:

- `savingsDueMotherCapital`: разница `totalPayment` без МК и с ним. При `matCapitalIncluded=false` равно `0`.
- `recommendedIncome`: `monthlyPayment * 2` (платёж <= 50% дохода).
- `userId` источник: берётся из заголовка `x-user-id` (auth в проекте нет).
- Ключ кэша: sha256 от нормализованного входа (без `userId`), TTL 7 дней.
- В воркер вынесен весь расчёт, а не только график. Числовые поля и schedule считаются из общих промежуточных значений.

## FigJam

https://www.figma.com/board/5D7BzsINYcOUGtsZWStK7R/Untitled?node-id=0-1&t=OuTjTBhXaMCKNj8Q-1
