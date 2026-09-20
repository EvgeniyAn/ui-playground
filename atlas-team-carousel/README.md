# ATLAS — Team carousel

Откройте `index.html` напрямую в браузере. Сервер, установка пакетов и интернет не нужны.

- Кнопки ← / → и полоски под портретами переключают участников.
- Карточки можно перетаскивать мышью или свайпом; колесо работает над каруселью.
- После фокусировки карусели: ← / →, Home / End. Enter и Space активируют кнопки.
- Replay показывает полный круг и возвращает первую карточку. Любое ручное управление прерывает Replay; Escape останавливает показ и выравнивает ближайшую карточку.
- При `prefers-reduced-motion: reduce` переключение мгновенное, Replay возвращает первую карточку без автоматического круга.

## Референс и точность

Источник: https://www.instagram.com/reel/DcXvXTOIv4Z/

Воссозданы светлый фон, объёмная раскладка семи карточек, цветной центр, монохромные боковые портреты, счётчик и акцентные полоски. В ролике первый переход начинается около 0,74 с и завершается около 1,0 с; по пожеланию пользователя переход в демо замедлен до примерно 650 мс с синусоидальным разгоном и замедлением (ease-in-out). Перетаскивание, отмена, повтор и управление клавиатурой реализованы независимо: их полное поведение в ролике не показано.

Портреты извлечены существующим `video-reference-tool` из самого видео. Подписи — настоящие HTML-элементы. Исходники ролика и кадров хранятся отдельно в `../video-reference-tool/downloads/2026-09-10-code_and_chill_-Only-one-person-in-colour-at-a-time.-Turn-the-deck-and-the-colour-travels-with-them-a-team-page-where-the-spotlight/`; дополнительные выборки — `2026-09-10-atlas-turn-detail` и `2026-09-10-atlas-portrait-*`.

Ограничения: качество портретов ограничено видеозаписью. Для Naomi создана цветная реконструкция `assets/naomi-color.png` встроенным imagegen: в ролике она видна только в чёрно-белом виде. Цвета приблизительные, генерация может менять мелкие детали портрета. Исходный кадр сохранён в `assets/naomi.png`. Оба слоя карточки используют новую картинку; монохромный слой формируется CSS-фильтром, поэтому цвет появляется по той же анимации, что у остальных участников. Нижняя часть фотографий реконструирована затемнением под HTML-подписью. Кнопка Start a project заменена на Replay для демонстрации; фрагменты редактора и оформление видеоплеера исключены.

Промпт цветной реконструкции (built-in imagegen): “Use case: identity-preserve. Edit target: the supplied grayscale portrait asset. Colorize this exact photo naturally, keeping the same woman, facial features, braided hairstyle, expression, pose, body proportions, framing and charcoal studio backdrop. Keep the dark charcoal blazer and black hair; natural warm brown skin, a muted lavender/plum satin blouse consistent with the purple accent of her team carousel card. Change only color, preserve luminance and all geometry as closely as possible. Preserve the narrow portrait aspect ratio 304:589 and entire crop. No text, no border, no added objects. This asset will crossfade with a grayscale copy of itself in a website.”

Проверка: синтаксис JS, целостность PNG и наличие локальных ресурсов; отдельная проверка логики событий в Node. Реальный рендеринг, свайпы на устройстве, адаптивность и системный reduced motion в браузере не проверены: браузерный инструмент отклонил локальный URL по политике безопасности. Публикация не выполнялась.
