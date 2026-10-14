# Модели OzoneBox - кто покупает каждый товар

Задача владельца (13.10.2026): сгенерировать моделей всех возрастов и типов, чтобы у каждого товара был свой покупатель. Качество - как на обложке бьюти-журнала, без нейрослопа, итог в 4K. Файлы лежат в папке на Drive «03 Модели - сгенерированные».

## Как генерируем

1. **Higgsfield Soul 2.0**, 2k, портрет 3:4, по 2 варианта на каждого.
2. Лучший вариант - **апскейл до 4K** (Higgsfield upscale).
3. **Один человек - один Soul ID**, чтобы в следующих кадрах (с товаром, крупно, в полный рост) было то же лицо.

Фоны только из фирменных: кислотный зелёный, чёрный, светло-серый `#eceeec`, белый.

Ни в одном промпте нет брендов, текста и товара в руках: этикетки нейросеть рисует с ошибками. Товар ставим на сайте вёрсткой рядом с портретом.

## Карта: модель → товары

| № | Кто | Фон | Товары |
|---|---|---|---|
| M01 | Девушка 18-20, студентка, веснушки, живая кожа | кислотный | Бокс «Стоп акне», крем точечного действия, озоновое очищение |
| M02 | Парень 19-22, студент | светло-серый | Крем 3%, «Два крема 3%», крем точечного действия |
| M03 | Девушка 22-26, городская, собранная | белый | Дневной крем, эмульсия, «Супер дуэт» |
| M04 | Девушка 26-30 | кислотный | «Супер трио», «Безупречно чистая кожа», комплекты с эмульсией |
| M05 | Женщина 30-35 | чёрный | Ночной крем, маска «Бьюти» |
| M06 | Женщина 35-40 | светло-серый | Маска «Бьюти восстановление», «Супер комбо», сет для лица |
| M07 | Женщина 40-45 | белый | Масло «Отри 6000» и 12000, крем 10% |
| M08 | Девушка 25-32, длинные волосы | чёрный | Шампунь, маска для волос, «Полное восстановление волос», набор маска и шампунь |
| M09 | Мужчина 30-40, борода | светло-серый | «СОС бокс», шампунь, Озодермик 5% |
| M10 | Девушка 25-32, спортивная | кислотный | Массажный крем для тела, «Идеальное тело» |
| M11 | Женщина 48-55 | белый | Крем для ног, Озодермик 5%, масло |
| M12 | Мужчина 50-60, активный | чёрный | Крем для ног, масло |
| M13 | Пара 28-35 | кислотный | Подарочный «Супер дуэт», наборы в подарок |

## Промпты (Soul 2.0, 3:4, 2k)

Общий хвост для всех (добавляется в конец): *Medium format camera with 100mm portrait lens at f/8, tack-sharp focus across the face, luxury skincare campaign photograph, clean frame with only the person and the seamless paper backdrop, plain background edges, high-end retouching that keeps real skin texture with visible natural pores, rule of thirds.*

- **M01.** Beauty editorial portrait of a nineteen-year-old woman with light freckles across her nose, messy honey-blonde hair in a loose clip, head turned three-quarters to the left with a playful half-smile, against a seamless vivid acid lime-green paper backdrop. Fresh young skin with real texture and a couple of faint marks on the chin, bare shoulders, natural brows, tinted lip balm. Large softbox key light front-left, white bounce fill, crisp rim light on the hair. Palette of 70% acid lime green, 25% warm skin tones, 5% honey blonde.
- **M02.** Clean grooming portrait of a twenty-year-old man with short tousled dark-blond hair and a light stubble, three-quarter view looking slightly past the camera, relaxed confident expression, against a seamless pale cool-grey backdrop. Real young skin texture with a few faint marks on the jawline, plain white crew-neck t-shirt. Large softbox key light from the right, soft fill, subtle rim light. Palette of 65% pale cool grey, 25% warm skin tones, 10% white cotton.
- **M03.** Minimal beauty portrait of a twenty-four-year-old woman with a sleek dark-brown low ponytail, strict side profile facing right, calm composed expression, against a seamless clean white backdrop. Dewy even skin with visible fine pores, bare shoulders, groomed brows, glossy nude lips, small gold stud earring. Large octabox key light front-right, gentle fill, crisp profile rim. Palette of 70% clean white, 25% warm skin, 5% dark brown hair.
- **M04.** Beauty magazine portrait of a twenty-eight-year-old Latina woman with shoulder-length wavy black hair, head slightly tilted, looking straight into the camera with a soft confident gaze, against a seamless vivid acid lime-green backdrop. Glowing olive skin with real texture, bare shoulders, natural brows, satin rosy lips. Beauty-dish key light from above front, white fill, thin rim light on the hair. Palette of 70% acid lime green, 25% warm olive skin, 5% black hair.
- **M05.** Luxury night-skincare portrait of a thirty-three-year-old woman with a short chic dark bob, eyes gently closed, face tilted up toward the light, against a seamless deep matte black backdrop. Smooth hydrated skin with visible pores and a soft sheen on the cheekbones, bare shoulders. Single narrow strip key light from the left, deep falloff into black, faint lime-green rim from behind. Palette of 70% deep black, 25% warm skin, 5% lime-green rim.
- **M06.** Elegant beauty portrait of a thirty-eight-year-old woman with long straight chestnut hair tucked behind one ear, three-quarter view, faint natural expression lines around the eyes, warm self-assured smile, against a seamless pale cool-grey backdrop. Well-cared-for skin with real texture, bare shoulders, light natural makeup. Large softbox key light front-left, white fill, soft rim. Palette of 65% pale cool grey, 30% warm skin and chestnut hair, 5% soft pink lips.
- **M07.** Honest beauty portrait of a forty-three-year-old woman with a chin-length auburn bob and natural freckles, looking into the camera over her bare shoulder, natural smile lines, against a seamless clean white backdrop. Healthy hydrated skin with visible pores and fine texture, softly groomed brows, warm hazel eyes with crisp catchlights. Large octabox key light front-left, soft white fill, gentle shadow under the jaw. Palette of 70% clean white, 25% warm skin and copper hair, 5% hazel.
- **M08.** Haircare editorial portrait of a twenty-eight-year-old woman with very long glossy dark-brown hair falling over one shoulder, back three-quarters to the camera, face turned in profile, against a seamless deep matte black backdrop. Hair with individual strands catching light, healthy shine, bare back and shoulders, real skin texture. Large softbox key light from above right to sculpt the hair, thin lime-green rim along the hair edge. Palette of 65% deep black, 25% dark brown hair, 10% warm skin.
- **M09.** Grooming magazine portrait of a thirty-five-year-old man in strict side profile facing left, short neatly cut dark hair, well-groomed short beard with clean edges, calm focused expression, against a seamless pale cool-grey backdrop. Healthy skin with visible pores, bare shoulders. Large softbox key light at 45 degrees from the front, subtle fill, crisp rim along the profile and beard. Palette of 65% pale cool grey, 25% warm skin, 10% dark brown hair and beard.
- **M10.** Bodycare campaign photograph of a twenty-nine-year-old athletic woman, waist-up, in a plain black sports bra, body turned three-quarters, looking over her shoulder at the camera, toned shoulders and arms with a soft natural sheen, against a seamless vivid acid lime-green backdrop. Hair in a high sleek ponytail, real skin texture with visible pores. Large softbox key light from the front-left, crisp rim light along the shoulders and waist. Palette of 60% acid lime green, 30% warm skin, 10% black fabric.
- **M11.** Warm beauty portrait of a fifty-two-year-old woman with short silver-grey hair styled softly, looking into the camera with a calm kind smile, natural fine lines and real mature skin texture, against a seamless clean white backdrop. Bare shoulders, small pearl earring, light natural makeup. Large octabox key light front-right, soft fill, gentle falloff. Palette of 70% clean white, 25% warm skin, 5% silver hair.
- **M12.** Outdoor-spirit studio portrait of a fifty-seven-year-old man with short salt-and-pepper hair and a trimmed grey beard, three-quarter view, confident relaxed expression, weathered real skin with visible texture, plain dark charcoal t-shirt, against a seamless deep matte black backdrop. Single softbox key light from the left, deep falloff, faint lime-green rim from behind. Palette of 70% deep black, 25% warm skin, 5% lime-green rim.
- **M13.** Tender gift-moment portrait of a couple in their early thirties, the woman resting her cheek on the man's shoulder, both smiling softly with eyes toward the camera, head-and-shoulders crop, plain white tees, against a seamless vivid acid lime-green backdrop. Real skin textures on both faces, natural hair. Large softbox key light from the front, white fill, rim light separating them from the background. Palette of 65% acid lime green, 25% warm skin tones, 10% white cotton.

## Статус

- **14.10.2026, 03:15 UTC:** льготный период пропустил 5 кадров из 26: M01, M02, M04 (два варианта), M06. Лица хорошие, но из-за слов «magazine cover» нейросеть дорисовала логотип VOGUE, штрихкоды и мусорный текст. **Чужой товарный знак - такие кадры целиком не публикуем.** Обрезали верх и низ кадра (1536×1260 → webp 1200), промпты исправлены: вместо «обложки» - «campaign photograph, clean frame». Апскейл до 4K не делали: генерации ограничены.

- [ ] 13.10.2026: генерация не запустилась. Higgsfield отвечает «дневной лимит льготного периода»: подписка в льготном периоде (обычно это значит, что не прошёл платёж). Кредитов на балансе 2114, генерация стоит около 0,12 кредита за кадр.
