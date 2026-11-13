NED HOME v1.0 — само информационен панел

Съдържание: index.html, app.js, server.py, docker-compose.yml.

1. На NAS създайте папка /volume1/Docker/ned-home (или коригирайте пътя в docker-compose.yml).
2. Копирайте в нея index.html, app.js и server.py.
3. В Home Assistant: профил (долу вляво) -> Security -> Long-lived access tokens -> Create token. Копирайте токена, не го изпращайте в чат.
4. В docker-compose.yml заменете HA_TOKEN с токена и APP_PASSWORD със силна парола.
5. В Portainer -> Stacks -> Add stack -> Web editor поставете съдържанието на docker-compose.yml -> Deploy the stack.
6. От телефона (домашен Wi-Fi или VPN): http://192.168.1.114:8765

ВАЖНО: Това е HTTP услуга за доверена локална мрежа/VPN. Паролата на панела се изпраща по HTTP; за чувствителни мрежи използвайте HTTPS reverse proxy. Не отваряйте порт 8765 към интернет. Токенът стои само на NAS в настройките на контейнера. За по-сигурно управление на тайни използвайте Portainer environment variables / Docker secrets. Ако NAS папката ви е с различно име/главни букви, коригирайте volumes.

Имената на сензорите се групират автоматично по „Дружба“ и „Царево“. Не се изпращат команди към устройства. Приложението чете /api/states на Home Assistant през сървърен посредник и обновява на 30 секунди. Поддържа стари браузъри (без модерни JS зависимости).
