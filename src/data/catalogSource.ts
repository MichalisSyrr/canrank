// Compact catalog source. Parsed by catalog.ts.
//
//   # Brand
//   > Line (anything after the first "|" is ignored)
//   Name | flags | flavor tags | body,accent | year | other names (separated by ";")
//
// Flags: s = sugar free, x = discontinued, regions U (North America), E (Europe),
// J (Japan/Asia), G (global).
// One row per drink, not per can: when a drink is renamed or sold under another name
// elsewhere, list the other names in the last column instead of adding a row.
// IDs are derived from brand + name, so renaming a drink changes its id: add an
// alias in catalog.ts (ID_ALIASES) if you ever rename one.

export const CATALOG_SOURCE = `
# Monster
> Core | G | #101010,#8cd600
Monster Energy Original | G | original | #101010,#8cd600 | 2002
Monster Zero Sugar | sG | original | #1a1a1a,#8cd600 | 2023 | Zero Sugar Monster Energy (green M)
Monster Lo-Carb | UE | original | #101010,#2f9bff | 2003
Monster Absolutely Zero | sE | original | #101010,#3aa0ff |  | Zero Sugar (blue can)
Monster Assault | E | cola,punch | #3a3a3a,#e3262e
Monster Nitro Super Dry | UE | citrus | #101010,#e8ff3a |  | Maxx Super Dry
Monster Nitro Cosmic Peach | E | peach | #101010,#ff9a5a
Monster The Doctor VR46 | E | citrus,orange | #f2e600,#101010 |  | VR46; Valentino Rossi
Monster Lewis Hamilton 44 | xE | peach | #7a1d2e,#e6c15a | 2017 | LH44
Monster Lando Norris Zero Sugar | sE | melon,citrus | #c8ff3a,#101010 | 2025
Monster VR46 Zero Sugar | sE | citrus | #1a1a1a,#f2e600
Monster Top Speed Zero Sugar | sE | peach | #1a1a1a,#ff7a00 |  | Lewis Hamilton Zero Sugar; LH44 Zero Sugar; Full Throttle Zero Sugar (UK)
Monster Vanilla Shot | U | vanilla | #101010,#e9dfb8
Monster Zero Sugar Vanilla Shot | sU | vanilla | #e9dfb8,#101010
Monster Strawberry Shot | U | strawberry | #101010,#f06a8a
Monster Zero Sugar Strawberry Shot | sU | strawberry | #f7c0cc,#101010
Monster Electric Blue | U |  | #101010,#2a8aff
Monster Mule Ginger Brew | UE | ginger,lime | #b06a2c,#101010 |  | Monster Mule
Monster Import | U | original | #101010,#8cd600
Monster Import Light | sxU | original | #101010,#7fd0ff
Monster DUB Edition Baller's Blend | xU | punch,berry | #101010,#b0b0b0
Monster DUB Edition Mad Dog | xU | grape | #101010,#8a3fd0
Monster Heavy Metal | xU | original | #2a2a2a,#c0c0c0
Monster Cuba-Lima | xU | lime,cola | #101010,#b7e33a
Monster Ubermonster | xU | original | #3a2a12,#e6b23a
Monster Extra Strength Anti-Gravity | xU | orange | #101010,#ff8a00
Monster Extra Strength Killer-B | xU | berry | #101010,#3a6bff
Monster Extra Strength Black Ice | xU | berry | #101010,#9ad8ff
Monster M3 Super Concentrate | xUEJ | original | #101010,#8cd600
Monster Super Cola | J | cola | #101010,#e3262e
Monster Cuba Libre | xJ | cola,lime | #101010,#d9a441
> Reserve | U | #101010,#ffd24a
Monster Reserve White Pineapple | UE | pineapple | #f1f1f1,#f2c230
Monster Reserve Watermelon | UE | watermelon | #101010,#ff4d6d
Monster Reserve Orange Dreamsicle | UE | orange,vanilla | #101010,#ff9a2e
Monster Reserve Kiwi Strawberry | U | kiwi,strawberry | #101010,#9be04a
Monster Reserve Peaches n' Creme | U | peach,vanilla | #101010,#ffb38a
> Juice | UE | #101010,#ff4fa3
Monster Pipeline Punch | G | punch,tropical,passionfruit | #f58fb8,#101010
Monster Mango Loco | G | mango | #2b7bd6,#ffb400
Monster Pacific Punch | UE | punch,berry | #7a1d2e,#e6c15a
Monster Khaotic | UE | orange,tropical | #ff7a00,#101010 |  | Khaos
Monster Monarch | UE | peach,tropical | #ffe7c2,#ff7a5a |  | Papillon (North America)
Monster Aussie Style Lemonade | UE | lemonade,citrus | #f6e94a,#1d6b3a |  | Aussie Lemonade
Monster Rio Punch | U | punch,tropical | #19a974,#ffd23a | 2023
Monster Viking Berry | U | berry | #2a3f8f,#e6e6e6 | 2025
Monster Bad Apple | UE | apple | #7a0f14,#d6b24a | 2023
Monster Ripper | E | tropical,punch | #101010,#ffb400 |  | M-80 (North America)
Monster Mixxd Punch | E | grape,punch | #4a1f7a,#c9a2ff |  | Mixxd
Monster Voodoo Grape | U | grape | #4a1f7a,#b7e33a
Monster Juice Strawberry Lemonade | U | strawberry,lemonade | #f27a8a,#f6e94a
> Ultra | sG | #f1f1f1,#b9c0c7
Monster Ultra White | sG | citrus | #f4f4f4,#b9c0c7 | 2012 | Zero Ultra; Ultra Zero
Monster Ultra Blue | sUE | berry,citrus | #7fc4f0,#1f4f8f
Monster Ultra Red | sUE | berry | #d92b3a,#ffffff
Monster Ultra Black | sUE | cherry | #1b1b1b,#b0b0b0
Monster Ultra Sunrise | sU | orange | #ff9a2e,#ffffff
Monster Ultra Citron | sxU | citrus | #f3e63a,#ffffff
Monster Ultra Violet | sUE | grape | #8a4fd0,#ffffff
Monster Ultra Paradise | sG | kiwi,lime,apple | #6fd06a,#ffffff
Monster Ultra Fiesta Mango | sG | mango | #2f7fd6,#ffb400 |  | Ultra Fiesta
Monster Ultra Watermelon | sG | watermelon | #f04a5a,#ffffff
Monster Ultra Gold | sG | pineapple | #e6b93a,#ffffff |  | Ultra Golden Pineapple
Monster Ultra Rosa | sG | grapefruit,berry | #f29ab8,#ffffff
Monster Ultra Peachy Keen | sG | peach | #ffb38a,#ffffff
Monster Ultra Strawberry Dreams | sG | strawberry | #f7a8c4,#ffffff
Monster Ultra Fantasy Ruby Red | sUE | grapefruit | #e0344a,#ffffff | 2024
Monster Ultra Blue Hawaiian | sU | tropical,pineapple | #2aa8e0,#ffffff | 2025
Monster Ultra Vice Guava | sU | guava | #ff6fa8,#3ad6c8 | 2025
Monster Ultra Wild Passion | sU | passionfruit | #f04a9a,#ffffff
Monster Ultra Punk Punch | sU | punch | #f03a8a,#101010
Monster Ultra Red White Blue Razz | sU | berry | #2a4fc0,#d0202a
> Rehab | U | #e9d9a6,#101010
Monster Rehab Tea + Lemonade | UE | tea,lemonade | #f0d84a,#101010
Monster Rehab Peach Tea | U | tea,peach | #f4a86a,#101010
Monster Rehab Raspberry Tea | U | tea,berry | #c93a5a,#101010
Monster Rehab Strawberry Lemonade | U | lemonade,strawberry | #f27a8a,#101010
Monster Rehab Wild Berry Tea | U | tea,berry | #5a3a8a,#101010
Monster Rehab Watermelon | xU | watermelon | #f0566a,#101010
Monster Rehab Green Tea | U | tea | #8fbf4a,#101010
Monster Rehab Rojo Tea | xU | tea | #b0302a,#101010
Monster Rehab Tea + Orangeade | xU | tea,orange | #ff9a2e,#101010
Monster Rehab Tea + Pink Lemonade | xU | tea,lemonade | #f59ab0,#101010
Monster Dragon Tea Green Tea | xU | tea | #6fae3a,#101010
Monster Dragon Tea White Tea | xU | tea | #e6e6e6,#101010
Monster Dragon Tea Yerba Mate | xU | tea | #b0802a,#101010
> Java | U | #3a2414,#d9b38a
Java Monster Mean Bean | U | coffee,vanilla | #3a2414,#d9b38a
Java Monster Loca Moca | U | coffee,chocolate | #2a1a10,#b07a4a
Java Monster Salted Caramel | U | coffee,caramel | #3a2414,#e0a84a
Java Monster Irish Creme | U | coffee | #1d4a2a,#d9b38a |  | Irish Blend
Java Monster Kona Blend | xU | coffee | #3a2414,#c98a3a
Java Monster Cafe Latte | U | coffee | #6a4a32,#f0e0c8
Java Monster Dubai Chocolate | U | coffee,chocolate | #3a2414,#3fa66a
Monster Killer Brew Loca Moca | U | coffee,chocolate | #101010,#b07a4a
Monster Killer Brew Mean Bean | U | coffee,vanilla | #101010,#d9b38a
Java Monster Vanilla Light | xU | coffee,vanilla | #d9c9a8,#3a2414
Java Monster Russian | xU | coffee | #2a2a2a,#d9b38a
Java Monster Lo-Ball | xU | coffee | #3a2414,#7fb0e0
Java Monster Nut-Up | xU | coffee | #3a2414,#c9a06a
Java Monster Toffee | xU | coffee,caramel | #3a2414,#d99a4a
Java Monster Chai Hai | xU | coffee,tea | #5a3a1a,#e0b06a
Espresso Monster Espresso and Cream | UE | coffee | #101010,#e6d3b3
Espresso Monster Vanilla Espresso | UE | coffee,vanilla | #101010,#f0e2a8
Espresso Monster Salted Caramel | UE | coffee,caramel | #101010,#e0a84a
> Hydro | U | #1f6fd6,#ffffff
Monster Hydro Blue Ice | U | berry | #2a8ae0,#ffffff
Monster Hydro Tropical Thunder | U | tropical | #ff8a2e,#ffffff
Monster Hydro Manic Melon | U | melon | #f0566a,#ffffff
Monster Hydro Mean Green | xU | apple,kiwi | #5ac03a,#ffffff
Monster Hydro Purple Passion | xU | grape,passionfruit | #7a3fd0,#ffffff
Monster Hydro Zero Sugar | sxU | berry | #e6e6e6,#2a8ae0
> Maxx | xU | #101010,#ffffff
Monster Maxx Eclipse | xU | berry | #2a2a6a,#ffffff
Monster Maxx Solaris | xU | orange,citrus | #ffb400,#101010
Monster Maxx Mango Matic | xU | mango | #ff8a00,#101010
Monster Maxx Rad Red | xU | berry | #d0202a,#ffffff
Muscle Monster Vanilla | xU | vanilla | #e6dcc0,#101010
Muscle Monster Chocolate | xU | chocolate | #4a2a1a,#e6dcc0

# Red Bull
> Core | G | #1d3f8f,#d0d4da
Red Bull Energy Drink | G | original | #1d3f8f,#c9ced6 | 1987
Red Bull Sugarfree | sG | original | #6fb6e6,#c9ced6 | 2003
Red Bull Zero | sG | original | #9aa3ad,#1d3f8f
Red Bull Total Zero | sxUE | original | #8a9099,#101010
Red Bull Simply Cola | E | cola | #7a1414,#d9c08a
Red Bull Energy Shot | xUE | original | #1d3f8f,#c9ced6
> Editions | UE | #e6e6e6,#d0202a
Red Bull Red Edition Cranberry | xUE | berry | #d0202a,#ffffff | 2013
Red Bull Red Edition Watermelon | G | watermelon | #e0303a,#ffffff | 2020
Red Bull Blue Edition Blueberry | UE | berry | #2a4fc0,#ffffff | 2013
Red Bull Silver Edition Lime | xUE | lime | #c0c4c8,#2a8a3a | 2013
Red Bull Yellow Edition Tropical | G | tropical | #f2c81a,#ffffff | 2014 | Tropical Edition (UK)
Red Bull Orange Edition Tangerine | xU | orange | #ff8a1a,#ffffff | 2015
Red Bull Orange Edition Sugarfree | sxU | orange | #ffb066,#ffffff
Red Bull Cherry Edition Sugarfree | sxU | cherry | #b01a3a,#ffffff
Red Bull Lime Edition Limeade | xU | lime | #7ac03a,#ffffff
Red Bull Purple Edition Acai Sugarfree | sxUE | berry | #6a2a9a,#ffffff
Red Bull Green Edition Kiwi Apple | xUE | kiwi,apple | #5ab03a,#ffffff | 2016 | Summer Edition Kiwi Twist
Red Bull Green Edition Cactus Fruit | UE | tropical | #3aa85a,#ffffff | 2021 | Green Edition Dragon Fruit (North America); Summer Edition 2021
Red Bull Coconut Edition Coconut Berry | G | coconut,berry | #e9eef2,#2a6fd0 | 2018 | White Edition (Europe); Summer Edition 2018
Red Bull Peach Edition Peach-Nectarine | xU | peach | #ffb08a,#ffffff | 2019
Red Bull Apricot Edition Apricot-Strawberry | UE | peach,strawberry | #f5a04a,#ffffff | 2022 | Amber Edition Strawberry Apricot (North America); Summer Edition 2022
Red Bull Sea Blue Edition Juneberry | UE | berry | #2aa6c8,#ffffff | 2023 | Blue Edition Juneberry (UK); Summer Edition 2023
Red Bull Pink Edition Sugarfree Wild Berries | sUE | berry | #f06a9a,#ffffff | 2024
Red Bull Pink Edition Wild Berries | U | berry | #f06a9a,#ffffff
Red Bull Sea Blue Edition Juneberry Sugarfree | sUE | berry | #9ad8e6,#ffffff
Red Bull Iced Edition Sugarfree | sUE | vanilla,berry | #cfe6f7,#ffffff
Red Bull Glacier Edition Frosty Raspberry | E | berry,mint | #7ad0e6,#ffffff
Red Bull Cherry Edition Cherry Sakura | E | cherry | #f29ab8,#ffffff
Red Bull Lilac Edition Sugarfree | sE |  | #c9a2e6,#ffffff
Red Bull Ruby Edition Spiced Pear | UE | pear | #a8203a,#ffffff | 2023 | Winter Edition Pear Cinnamon; Winter Edition 2023
> Seasonal | xUE | #e6e6e6,#d0202a
Red Bull Summer Edition Beach Breeze | xU | tropical | #5ac8e0,#ffffff | 2019
Red Bull Summer Edition Curuba Elderflower | UE | tropical | #c8e03a,#ffffff | 2024 | Green Edition Curuba-Elderflower (UK)
Red Bull Summer Edition White Peach | UE | peach | #ffd9c8,#f06a5a | 2025 | Peach Edition White Peach
Red Bull Summer Edition White Peach Sugarfree | sUE | peach | #ffe9e0,#f06a5a | 2025 | Peach Edition Sugarfree
Red Bull Spring Edition Grapefruit & Blossom | UE | grapefruit | #f59ab8,#ffffff | 2025
Red Bull Winter Edition Plum Twist | xU | berry | #6a2a6a,#ffffff | 2018
Red Bull Winter Edition Arctic Berry | xU | berry | #5ac0e0,#ffffff | 2020
Red Bull Winter Edition Pomegranate | xUE | pomegranate | #b0203a,#ffffff | 2021
Red Bull Winter Edition Fig Apple | xUE | apple | #7a2a5a,#ffffff | 2022
Red Bull Winter Edition Iced Vanilla Berry | UE | vanilla,berry | #9ac8f0,#ffffff | 2024 | Iced Edition; Ice Edition (UK)
Red Bull Winter Edition Fuji Apple & Ginger | UE | apple,ginger | #d03a3a,#ffffff | 2025 | Apple Edition
Red Bull Winter Edition Pistachio & Berries | UE | berry | #7ab08a,#ffffff | 2026
Red Bull Winter Edition Pistachio & Berries Sugarfree | sUE | berry | #b9d6c0,#ffffff | 2026
Red Bull Summer Edition Sudachi Lime | sUE | citrus,lime | #d6e03a,#ffffff | 2026 | Yellow Edition Citrus Zest (UK); Yellow Edition Sudachi Lime

# Rockstar
> Core | G | #101010,#f2c81a
Rockstar Original | G | original | #101010,#f2c81a
Rockstar Sugar Free | sUE | original | #e6e6e6,#f2c81a
Rockstar Zero Carb | sxU | original | #2a4fc0,#f2c81a
Rockstar Punched Fruit Punch | U | punch | #d0202a,#f2c81a
Rockstar Punched Blackberry | U | berry,punch | #3a1a5a,#f2c81a
Rockstar Punched Pineapple | U | pineapple,punch | #f2c81a,#101010
Rockstar Pure Zero Silver Ice | sU | citrus | #c8ccd0,#101010
Rockstar Pure Zero Punched | sU | punch | #e03a4a,#101010 |  | Pure Zero Fruit Punch
Rockstar Pure Zero Tangerine Mango Guava Strawberry | sU | mango,guava,strawberry,orange | #ff8a2e,#101010 |  | Pure Zero Mango Guava
Rockstar Pure Zero Watermelon | sxU | watermelon | #f0566a,#101010
Rockstar Recovery Lemonade | U | lemonade | #f2e03a,#101010
Rockstar Recovery Orange | U | orange | #ff8a1a,#101010 |  | Recovery Orangeade
Rockstar Juiced Mango | xUE | mango | #ffa01a,#101010
Rockstar Juiced Tropical Guava | E | guava,tropical | #f05a8a,#101010
Rockstar Xdurance Blueberry Pomegranate Acai | UE | berry,pomegranate | #2a2a8a,#f2c81a
Rockstar Super Sours Green Apple | UE | apple,candy | #6ad03a,#101010
Rockstar Super Sours Bubbleburst | xUE | candy | #f06ab0,#101010
Rockstar Hardcore Apple | UE | apple | #3ab03a,#101010
Rockstar Boom Whipped Strawberry | U | strawberry,vanilla | #f08aa0,#101010
Rockstar Boom Pina Colada | U | pineapple,coconut | #f2e9c0,#101010
Rockstar Lime Freeze | U | lime | #8ad03a,#101010
Rockstar Revolt Killer Grape | xE | grape | #6a2ab0,#f2c81a
Rockstar Roasted Light Vanilla | xU | coffee,vanilla | #6a4a2a,#f2c81a

# Bang
> Core | sU | #101010,#ff2ea6
Bang Rainbow Unicorn | sU | candy,berry | #c06af0,#3ad6f0
Bang Purple Haze | sU | grape | #6a2ab0,#ffffff
Bang Star Blast | sU | berry,candy | #2a4fc0,#f03a3a
Bang Blue Razz | sU | berry | #1a7ae0,#ffffff
Bang Peach Mango | sU | peach,mango | #ff9a4a,#ffffff
Bang Cotton Candy | sU | candy | #f59ad0,#7ac8f0
Bang Black Cherry Vanilla | sU | cherry,vanilla | #5a0f1f,#ffffff
Bang Sour Heads | sU | apple,candy | #7ad03a,#101010
Bang Candy Apple Crisp | sU | apple,candy | #d0202a,#7ad03a
Bang Lemon Drop | sU | citrus,candy | #f2e03a,#101010
Bang Radical Skadattle | sU | candy,berry | #e03a8a,#f2e03a
Bang Lime Pop Drop | sU | lime,candy | #8ad03a,#101010
Bang Pina Colada | sxU | pineapple,coconut | #f2e9c0,#3ab0a0
Bang Champagne | sxU | citrus | #e6d08a,#101010
Bang Root Beer | sxU | cola | #4a2a1a,#f2c81a

# Reign
> Total Body Fuel | sU | #101010,#f25a1a
Reign Orange Dreamsicle | sU | orange,vanilla | #ff8a1a,#101010
Reign Melon Mania | sU | melon | #f0566a,#101010
Reign Razzle Berry | sU | berry | #2a5ae0,#101010
Reign Lemon HDZ | sU | citrus | #f2e03a,#101010
Reign Cherry Limeade | sU | cherry,lime | #d0203a,#7ad03a
Reign White Gummy Bear | sU | candy | #f1f1f1,#101010
Reign Sour Apple | sxU | apple | #7ad03a,#101010
Reign Peach Fizz | sxU | peach | #ffb08a,#101010
Reign Strawberry Sublime | sxU | strawberry | #f06a8a,#101010
Reign Mang-O-Matic | sxU | mango | #ffa01a,#101010
Reign Storm Valencia Orange | sU | orange | #ffb066,#ffffff
Reign Storm Kiwi Blend | sU | kiwi | #9ad06a,#ffffff
Reign Watermelon Sour Gummy | sU | watermelon,candy | #f0566a,#101010
Reign Sour Gummy Worm | sU | candy | #7ad03a,#f03a8a
Reign White Haze | sU |  | #f1f1f1,#101010
Reign Reignbow Sherbet | sU | candy,orange | #ff8a5a,#3ad6c8
Reign Lilikoi Lychee | sU | passionfruit,tropical | #f5c23a,#f06a9a

# Celsius
> Core | sU | #f4f4f4,#f25a1a
Celsius Sparkling Orange | sUE | orange | #ff8a1a,#ffffff
Celsius Sparkling Kiwi Guava | sUE | kiwi,guava | #9ad03a,#f06a8a
Celsius Sparkling Wild Berry | sUE | berry | #c03a6a,#ffffff
Celsius Sparkling Watermelon | sU | watermelon | #f0566a,#ffffff
Celsius Sparkling Grape Rush | sU | grape | #6a2ab0,#ffffff
Celsius Peach Vibe | sUE | peach | #ffb08a,#ffffff
Celsius Tropical Vibe | sU | tropical,pineapple | #3ad6c8,#f2c81a
Celsius Arctic Vibe | sUE | berry | #9ad8f0,#ffffff
Celsius Mango Passionfruit | sUE | mango,passionfruit | #ffa01a,#ffffff
Celsius Fantasy Vibe | sUE | candy,berry | #f08ad0,#ffffff
Celsius Cosmic Vibe | sU | punch | #5a2ab0,#f06ab0
Celsius Strawberry Guava | sU | strawberry,guava | #f06a7a,#ffffff
Celsius Sparkling Cola | sxU | cola | #7a1414,#ffffff
Celsius Peach Mango Green Tea | sU | tea,peach,mango | #ffb84a,#3a8a3a

# Ghost
> Energy | sU | #101010,#ffffff
Ghost Sour Patch Kids Redberry | sU | candy,berry | #e0203a,#f2e03a
Ghost Sour Patch Kids Blue Raspberry | sU | candy,berry | #1a7ae0,#f2e03a
Ghost Warheads Sour Watermelon | sU | candy,watermelon | #3ab03a,#f0566a
Ghost Warheads Sour Green Apple | sU | candy,apple | #7ad03a,#101010
Ghost Swedish Fish | sU | candy,berry | #d0202a,#f2c81a
Ghost Bubblicious Cotton Candy | sU | candy | #f59ad0,#7ac8f0
Ghost Orange Cream | sU | orange,vanilla | #ff9a2e,#ffffff
Ghost Citrus | sU | citrus | #e6f03a,#101010
Ghost Tropical Mango | sU | mango,tropical | #ffa01a,#101010
Ghost Faze Pop | sU | cherry,lime | #d0202a,#2a4fc0
Ghost Strawbango Margarita | sU | strawberry,mango | #f06a7a,#7ad03a

# Prime
> Energy | sUE | #101010,#ffffff
Prime Energy Blue Raspberry | sUE | berry | #1a7ae0,#ffffff
Prime Energy Tropical Punch | sUE | punch,tropical | #e0203a,#ffffff
Prime Energy Lemon Lime | sUE | citrus,lime | #b7e33a,#ffffff
Prime Energy Strawberry Watermelon | sUE | strawberry,watermelon | #f0566a,#ffffff
Prime Energy Orange Mango | sUE | orange,mango | #ff9a1a,#ffffff
Prime Energy Ice Pop | sUE | candy,cherry | #e6eef5,#d0202a
Prime Energy Dream Pop | sU | orange,vanilla | #ffb84a,#ffffff
Prime Energy Original | sU |  | #101010,#ffffff
Prime Energy Cherry Limeade | sU | cherry,lime | #d0203a,#7ad03a
Prime Energy Dripsicle | sU | candy | #ff8a5a,#ffffff
Prime Energy Strawberry Lemonade | sU | strawberry,lemonade | #f27a8a,#f6e94a

# C4
> Performance Energy | sU | #101010,#f2e03a
C4 Frozen Bombsicle | sU | cherry,lime,candy | #e6eef5,#d0202a
C4 Strawberry Watermelon Ice | sU | strawberry,watermelon | #f0566a,#101010
C4 Orange Slice | sU | orange | #ff8a1a,#101010
C4 Midnight Cherry | sU | cherry | #5a0f1f,#f2e03a
C4 Cotton Candy | sU | candy | #f59ad0,#7ac8f0
C4 Skittles | sU | candy | #d0202a,#ffffff
C4 Starburst Strawberry | sU | candy,strawberry | #f06a9a,#f2e03a
C4 Purple Frost | sU | grape | #6a2ab0,#f2e03a
C4 Tropical Blast | sxU | tropical | #3ad6c8,#f2e03a

# Alani Nu
> Energy | sU | #f7c6d9,#ffffff
Alani Nu Cosmic Stardust | sU | grape,berry | #6a3ab0,#f59ad0
Alani Nu Cherry Slush | sU | cherry | #e0304a,#ffffff
Alani Nu Hawaiian Shaved Ice | sU | tropical,candy | #3ac8e0,#f06a8a
Alani Nu Breezeberry | sU | berry | #7ab0f0,#f59ad0
Alani Nu Mimosa | sU | orange,citrus | #ffb84a,#ffffff
Alani Nu Tropsicle | sU | tropical,orange | #ff9a4a,#f06a8a
Alani Nu Juicy Peach | sU | peach | #ffb08a,#ffffff
Alani Nu Pink Slush | sU | strawberry,candy | #f59ab8,#ffffff
Alani Nu Kiwi Guava | sU | kiwi,guava | #9ad03a,#f06a8a
Alani Nu Witch's Brew | sU | apple,caramel | #5a2a8a,#7ad03a
Alani Nu Cherry Twist | sU | cherry,lime | #d0203a,#7ad03a
Alani Nu Orange Kiss | sU | orange | #ff9a2e,#ffffff
Alani Nu Blue Slush | sU | berry,candy | #3a9af0,#ffffff
Alani Nu Dream Float | sU | orange,vanilla | #ffc08a,#ffffff
Alani Nu Sherbet Swirl | sU | candy,orange | #ff9ab0,#ffd23a
Alani Nu Cotton Candy | sU | candy | #f59ad0,#7ac8f0
Alani Nu Strawberry Sunrise | sU | strawberry | #f06a7a,#ffb84a
Alani Nu Watermelon Wave | sU | watermelon | #f0566a,#3ad6c8
Alani Nu Lime Slush | sU | lime | #8ad03a,#ffffff

# NOS
> Core | U | #1a4fc0,#ff8a1a
NOS Original | U | original,citrus | #1a4fc0,#ff8a1a
NOS Zero Sugar | sU | original | #9aa3ad,#1a4fc0
NOS GT Grape | U | grape | #5a2ab0,#ff8a1a
NOS Nitro Mango | U | mango | #ffa01a,#1a4fc0
NOS Sonic Sour | U | candy,citrus | #9ad03a,#1a4fc0
NOS Grand Prix Guava | U | guava,peach | #f06a8a,#1a4fc0
NOS Cherried Out | xU | cherry | #b01a2a,#ff8a1a |  | Loaded Cherry
NOS Charged Citrus | xU | citrus | #f2c81a,#1a4fc0

# Full Throttle
> Core | U | #101010,#e0203a
Full Throttle Original Citrus | U | citrus | #101010,#e6e03a
Full Throttle Blue Agave | U | citrus | #1a4fc0,#e6e6e6
Full Throttle Red Berry | xU | berry | #b01a2a,#e6e6e6
Full Throttle Fury Orange | xU | orange | #ff7a1a,#101010
Full Throttle Night | xU | original | #101010,#6a2ab0

# Burn
> Core | E | #101010,#ff5a1a
Burn Original | E | original | #101010,#ff5a1a
Burn Zero Sugar | sE | original | #101010,#3a9af0
Burn Apple Kiwi | E | apple,kiwi | #101010,#7ad03a
Burn Passion Punch | E | passionfruit,punch | #101010,#f03a8a
Burn Mango | E | mango | #101010,#ffa01a
Burn Lemon Ice | xE | citrus | #101010,#e6f03a
Burn Cherry | E | cherry | #101010,#d0203a
Burn Sour Twist | E | candy,citrus | #101010,#b7e33a
Burn Fruit Punch | E | punch | #101010,#e0203a
Burn Dark Energy | E | berry | #101010,#6a2ab0
Burn Blue Refresh | xE | berry | #101010,#3a6af0

# Relentless
> Core | E | #101010,#c0a04a
Relentless Origin | E | original | #101010,#c0a04a
Relentless Zero Sugar Origin | sE | original | #e6e6e6,#101010
Relentless Passion Punch | E | passionfruit,punch | #f03a7a,#101010
Relentless Apple Kiwi | E | apple,kiwi | #7ad03a,#101010
Relentless Mango Ice | E | mango | #ffa01a,#101010
Relentless Cherry | E | cherry | #b01a2a,#101010
Relentless White Citrus | E | citrus | #f1f1f1,#101010
Relentless Guava | E | guava | #f06a8a,#101010
Relentless Zero Sugar Raspberry | sE | berry | #e03a6a,#101010
Relentless Zero Sugar Peach | sE | peach | #ffb08a,#101010
Relentless Lemon Ice | xE | citrus | #e6f03a,#101010
Relentless Inferno | xE | orange | #ff5a1a,#101010
Relentless Juiced Orange & Tropical | xE | orange,tropical | #ff8a1a,#101010

# Hell
> Core | E | #101010,#e0202a
Hell Classic | E | original | #101010,#e0202a
Hell Zero | sE | original | #e6e6e6,#e0202a
Hell Strong Red Grape | E | grape | #7a1430,#e6e6e6
Hell Strong Apple | E | apple | #5ab03a,#101010
Hell Strong Cola | E | cola | #4a1a12,#e0202a
Hell Strong Watermelon | E | watermelon | #f0566a,#101010
Hell Strong Focus | E | original | #101010,#3a9af0
Hell Summer Cool Coconut Bang | E | coconut | #e9eef2,#3ab0d0
Hell Summer Cool Lychee | E | tropical | #f59ab8,#101010
Hell Black Cherry | E | cherry | #3a0a14,#e0202a
Hell Ice Cool Wild Berries | E | berry | #3a5ae0,#e6e6e6
Hell Multivitamin | E | tropical,orange | #ffa01a,#101010
Hell Gamer Arctic | E | berry,mint | #5ac8e0,#101010
Hell Energy Coffee Latte | E | coffee | #6a4a32,#f0e0c8

# Effect
> Core | E | #101010,#e6e6e6
Effect Energy | E | original | #101010,#e6e6e6
Effect Zero | sE | original | #e6e6e6,#101010
Effect Massive Mango | E | mango | #ffa01a,#101010
Effect Wild Cherry | xE | cherry | #b01a2a,#101010
Effect Sour Apple | xE | apple | #7ad03a,#101010
Effect Acai Berry | E | berry | #5a2a8a,#e6e6e6

# 28 Black
> Core | E | #101010,#e6e6e6
28 Black Acai | E | berry | #101010,#6a2ab0
28 Black Acai Zero | sE | berry | #e6e6e6,#6a2ab0
28 Black Sour Mango-Kiwi | E | mango,kiwi | #101010,#9ad03a
28 Black Sour Cherry | E | cherry | #101010,#d0203a
28 Black Pink Grapefruit Mint | E | grapefruit,mint | #101010,#f06a9a
28 Black Classic | E | original | #101010,#c0a04a
28 Black Zero Peach | sE | peach | #e6e6e6,#ffb08a
28 Black Absinth | xE | original | #101010,#7ad03a

# Tiger
> Core | E | #101010,#ff8a1a
Tiger Classic | E | original | #101010,#ff8a1a
Tiger Zero Sugar | sE | original | #e6e6e6,#ff8a1a
Tiger Mango | E | mango | #ffa01a,#101010
Tiger Hyper Splash Passion Fruit Lemon | E | passionfruit,citrus | #f2c81a,#f03a8a
Tiger Speed Restart Kiwi Lime | E | kiwi,lime | #7ad03a,#101010
Tiger Ultimate | E | original | #2a2a2a,#e0202a
Tiger Wild Watermelon | E | watermelon | #f0566a,#101010

# Battery
> Core | E | #101010,#e6e6e6
Battery Energy Drink | E | original | #101010,#e6e6e6
Battery No Calories | sE | original | #e6e6e6,#101010
Battery Fresh | E | citrus | #8ad03a,#101010
Battery Juiced | xE | orange,tropical | #ff8a1a,#101010
Battery Cranberry | E | berry | #b01a3a,#e6e6e6
Battery Gold Kick | xE | ginger | #c0a04a,#101010
Battery Mango Drop | E | mango | #ffa01a,#101010

# Nocco
> BCAA | sE | #101010,#e6e6e6
Nocco Caribbean | sE | pineapple,tropical | #f2c81a,#101010
Nocco Tropical | sE | tropical | #ff8a2e,#101010
Nocco Limon Del Sol | sE | citrus | #e6f03a,#101010
Nocco Miami Strawberry | sE | strawberry | #f06a8a,#101010
Nocco Juicy Melba | sE | peach,berry | #ffb08a,#101010
Nocco Blood Orange Del Sol | sE | orange | #e0402a,#101010
Nocco Ice Soda | sE | citrus,lime | #9ad8f0,#101010
Nocco Passion | sE | passionfruit | #f03a8a,#101010
Nocco Cloudy Soda | sE | citrus | #e6eef5,#101010
Nocco Focus Raspberry Blast | sE | berry | #e03a6a,#101010
Nocco Focus Ramonade | sE | lemonade | #f2e03a,#101010
Nocco Mango Del Sol | sE | mango | #ffa01a,#101010
Nocco Pear | sE | pear | #b7d06a,#101010
Nocco Apple | sE | apple | #7ad03a,#101010
Nocco Melon Blast | sE | melon | #f0566a,#101010
Nocco Peach | sE | peach | #ffb08a,#101010
Nocco Golden Grape | sE | grape | #e6c23a,#101010
Nocco Cherry Berry | sE | cherry,berry | #c0203a,#101010
Nocco Pomelo | sE | grapefruit | #f59a8a,#101010
Nocco Juicy Breeze | sE | tropical | #f5a03a,#101010
Nocco Sunny Soda | sE | orange | #ffb01a,#101010
Nocco Focus Cola | sE | cola | #4a1a12,#e6e6e6
Nocco Focus Grand Sour | sE | candy | #7ad03a,#101010
Nocco Citrus Elderflower | sE | citrus | #e6f08a,#101010

# Boost
> Core | E | #1a2a8a,#f2c81a
Boost Energy Original | E | original | #1a2a8a,#f2c81a
Boost Energy Sugar Free | sE | original | #9ad8f0,#1a2a8a |  | Zero Original
Boost Energy Red Berry | E | berry | #b01a2a,#f2c81a
Boost Energy Mango | E | mango | #ffa01a,#1a2a8a
Boost Energy Citrus Zing | E | citrus | #b7e33a,#1a2a8a
Boost Energy Exotic Fruits | E | tropical | #f03a8a,#f2c81a
Boost Energy Cherry Burst | E | cherry | #d0203a,#f2c81a
Boost Energy Lemon & Lime | E | citrus,lime | #b7e33a,#1a2a8a
Boost Energy Zero Dark Fruits | sE | berry | #3a1a5a,#f2c81a
Boost Energy Zero Citrus Zest | sE | citrus | #e6f03a,#1a2a8a
Boost Energy White Peach | sE | peach | #ffd9c8,#1a2a8a

# Emerge
> Core | E | #101010,#3ad03a
Emerge Original | E | original | #101010,#3ad03a
Emerge Sugar Free | sE | original | #e6e6e6,#3ad03a
Emerge Mango | E | mango | #ffa01a,#101010
Emerge Tropical | E | tropical | #f2c81a,#101010
Emerge Mixed Berry | E | berry | #6a2ab0,#e6e6e6

# Dark Dog
> Core | E | #101010,#e0202a
Dark Dog Original | E | original | #101010,#e0202a
Dark Dog Sugar Free | sE | original | #e6e6e6,#e0202a
Dark Dog Blood Orange | E | orange | #e0402a,#101010
Dark Dog Mojito | xE | lime,mint | #7ad03a,#101010

# Shark
> Core | EJ | #1a2a6a,#e6e6e6
Shark Energy Drink | EJ | original | #1a2a6a,#e6e6e6
Shark Sugar Free | sEJ | original | #9ad8f0,#1a2a6a
Shark Lemon Ice | E | citrus | #e6f03a,#1a2a6a
Shark Wild Berry | E | berry | #6a2ab0,#e6e6e6
`
