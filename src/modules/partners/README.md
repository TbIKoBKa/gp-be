# partners: статистика рекламных кампаний

Рекламщик получает свой поддомен сервера (`promo.go-play.gg`) и секретную ссылку
`https://go-play.gg/partner/<token>`. На ней видны только регистрации, сделанные через его адрес.

## Откуда данные

- `GOPLAY_REG_SOURCE` (база LimboAuth, подключение `minecraft`): пишет GoPlayBridge 1.4.0+ на прокси.
  Хост, который игрок ввёл в клиенте, время в игре, возврат в другой день по МСК. Таблицу создаёт
  плагин, бэкенд только читает.
- `partner_campaigns` (сайтовая база): создаётся сама (`synchronize: true`).

## Завести кампанию

1. DNS в Cloudflare: **серая** A-запись `promo.go-play.gg` → `65.108.227.90`. Без SRV и AAAA.
2. Строка в сайтовой базе:

```sql
INSERT INTO partner_campaigns (name, token, hosts, starts_at, active)
VALUES ('Имя рекламщика', LOWER(HEX(RANDOM_BYTES(16))), '["promo.go-play.gg"]', '2026-10-05 00:00:00', 1);

SELECT token FROM partner_campaigns WHERE name = 'Имя рекламщика';
```

`starts_at` и `ends_at` в UTC. Полночь по МСК = `21:00` предыдущего дня UTC.
Регистрации до `starts_at` кампании не засчитываются.

3. Ссылка рекламщику: `https://go-play.gg/partner/<token>`.

Отозвать ссылку: `UPDATE partner_campaigns SET active = 0 WHERE id = ...`. Новая ссылка:
сменить `token`. Ответ API на кеше 60 с.

## API

`GET /partners/:token/stats?from=YYYY-MM-DD&to=YYYY-MM-DD` (дни по МСК, оба необязательны).
Неизвестный или выключенный токен: 404. Только агрегаты:

- `registrations`: новые учётки через адреса кампании;
- `played`: из них провели в игре от 30 минут (лимбо не считается);
- `returned`: зашли снова в другой день по МСК;
- `uniqueIps`: разных IP среди регистраций (заметно меньше `registrations` - твинки);
- `bedrock`: с телефона/консоли через Geyser.
