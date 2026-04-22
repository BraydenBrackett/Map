from models import Country

COUNTRIES: list[Country] = [
    # Western democracies / NATO
    Country(id=1,   name="United States",   iso_code="USA", lat=38.90,  lon=-77.04),
    Country(id=2,   name="United Kingdom",  iso_code="GBR", lat=51.51,  lon=-0.13),
    Country(id=3,   name="Germany",         iso_code="DEU", lat=52.52,  lon=13.40),
    Country(id=4,   name="France",          iso_code="FRA", lat=48.85,  lon=2.35),
    Country(id=5,   name="Japan",           iso_code="JPN", lat=35.68,  lon=139.69),
    Country(id=6,   name="Canada",          iso_code="CAN", lat=45.42,  lon=-75.69),
    Country(id=7,   name="Australia",       iso_code="AUS", lat=-35.28, lon=149.13),
    Country(id=8,   name="Italy",           iso_code="ITA", lat=41.90,  lon=12.49),
    Country(id=9,   name="Spain",           iso_code="ESP", lat=40.42,  lon=-3.70),
    Country(id=10,  name="Netherlands",     iso_code="NLD", lat=52.37,  lon=4.90),
    Country(id=11,  name="Belgium",         iso_code="BEL", lat=50.85,  lon=4.35),
    Country(id=12,  name="Sweden",          iso_code="SWE", lat=59.33,  lon=18.07),
    Country(id=13,  name="Norway",          iso_code="NOR", lat=59.91,  lon=10.75),
    Country(id=14,  name="Denmark",         iso_code="DNK", lat=55.68,  lon=12.57),
    Country(id=15,  name="Finland",         iso_code="FIN", lat=60.17,  lon=24.94),
    Country(id=16,  name="Poland",          iso_code="POL", lat=52.23,  lon=21.01),
    Country(id=17,  name="Switzerland",     iso_code="CHE", lat=46.95,  lon=7.45),
    Country(id=18,  name="Austria",         iso_code="AUT", lat=48.21,  lon=16.37),
    Country(id=19,  name="Portugal",        iso_code="PRT", lat=38.72,  lon=-9.14),
    Country(id=20,  name="Greece",          iso_code="GRC", lat=37.98,  lon=23.73),
    Country(id=21,  name="South Korea",     iso_code="KOR", lat=37.57,  lon=126.98),
    Country(id=22,  name="New Zealand",     iso_code="NZL", lat=-41.29, lon=174.78),
    Country(id=23,  name="Ireland",         iso_code="IRL", lat=53.33,  lon=-6.25),
    Country(id=24,  name="Czech Republic",  iso_code="CZE", lat=50.09,  lon=14.42),
    Country(id=25,  name="Israel",          iso_code="ISR", lat=31.77,  lon=35.22),
    Country(id=26,  name="Ukraine",         iso_code="UKR", lat=50.45,  lon=30.52),

    # Russia & CSTO
    Country(id=27,  name="Russia",          iso_code="RUS", lat=55.75,  lon=37.62),
    Country(id=28,  name="Belarus",         iso_code="BLR", lat=53.90,  lon=27.57),
    Country(id=29,  name="Kazakhstan",      iso_code="KAZ", lat=51.18,  lon=71.45),
    Country(id=30,  name="Serbia",          iso_code="SRB", lat=44.80,  lon=20.46),

    # China sphere
    Country(id=31,  name="China",           iso_code="CHN", lat=39.91,  lon=116.39),
    Country(id=32,  name="North Korea",     iso_code="PRK", lat=39.02,  lon=125.74),
    Country(id=33,  name="Vietnam",         iso_code="VNM", lat=21.03,  lon=105.85),
    Country(id=34,  name="Cambodia",        iso_code="KHM", lat=11.56,  lon=104.92),
    Country(id=35,  name="Myanmar",         iso_code="MMR", lat=16.87,  lon=96.20),

    # South / Southeast Asia (non-aligned)
    Country(id=36,  name="India",           iso_code="IND", lat=28.61,  lon=77.21),
    Country(id=37,  name="Pakistan",        iso_code="PAK", lat=33.69,  lon=73.06),
    Country(id=38,  name="Bangladesh",      iso_code="BGD", lat=23.72,  lon=90.41),
    Country(id=39,  name="Indonesia",       iso_code="IDN", lat=-6.21,  lon=106.85),
    Country(id=40,  name="Thailand",        iso_code="THA", lat=13.75,  lon=100.52),
    Country(id=41,  name="Malaysia",        iso_code="MYS", lat=3.15,   lon=101.70),
    Country(id=42,  name="Philippines",     iso_code="PHL", lat=14.60,  lon=120.98),
    Country(id=43,  name="Singapore",       iso_code="SGP", lat=1.35,   lon=103.82),

    # Middle East
    Country(id=44,  name="Saudi Arabia",    iso_code="SAU", lat=24.69,  lon=46.72),
    Country(id=45,  name="Iran",            iso_code="IRN", lat=35.70,  lon=51.42),
    Country(id=46,  name="Iraq",            iso_code="IRQ", lat=33.34,  lon=44.40),
    Country(id=47,  name="UAE",             iso_code="ARE", lat=24.47,  lon=54.37),
    Country(id=48,  name="Qatar",           iso_code="QAT", lat=25.29,  lon=51.53),
    Country(id=49,  name="Kuwait",          iso_code="KWT", lat=29.37,  lon=47.98),
    Country(id=50,  name="Jordan",          iso_code="JOR", lat=31.95,  lon=35.93),
    Country(id=51,  name="Lebanon",         iso_code="LBN", lat=33.89,  lon=35.50),
    Country(id=52,  name="Syria",           iso_code="SYR", lat=33.51,  lon=36.29),
    Country(id=53,  name="Yemen",           iso_code="YEM", lat=15.35,  lon=44.21),
    Country(id=54,  name="Oman",            iso_code="OMN", lat=23.58,  lon=58.59),
    Country(id=55,  name="Turkey",          iso_code="TUR", lat=39.93,  lon=32.86),
    Country(id=56,  name="Egypt",           iso_code="EGY", lat=30.06,  lon=31.25),

    # Africa
    Country(id=57,  name="Nigeria",         iso_code="NGA", lat=9.07,   lon=7.40),
    Country(id=58,  name="Ethiopia",        iso_code="ETH", lat=9.03,   lon=38.74),
    Country(id=59,  name="Kenya",           iso_code="KEN", lat=-1.29,  lon=36.82),
    Country(id=60,  name="Ghana",           iso_code="GHA", lat=5.56,   lon=-0.20),
    Country(id=61,  name="Tanzania",        iso_code="TZA", lat=-6.18,  lon=35.74),
    Country(id=62,  name="Algeria",         iso_code="DZA", lat=36.74,  lon=3.06),
    Country(id=63,  name="Morocco",         iso_code="MAR", lat=33.99,  lon=-6.85),
    Country(id=64,  name="Angola",          iso_code="AGO", lat=-8.84,  lon=13.23),
    Country(id=65,  name="Mozambique",      iso_code="MOZ", lat=-25.97, lon=32.59),
    Country(id=66,  name="Cameroon",        iso_code="CMR", lat=3.87,   lon=11.52),
    Country(id=67,  name="Senegal",         iso_code="SEN", lat=14.69,  lon=-17.45),
    Country(id=68,  name="Zimbabwe",        iso_code="ZWE", lat=-17.83, lon=31.05),
    Country(id=69,  name="Sudan",           iso_code="SDN", lat=15.55,  lon=32.53),
    Country(id=70,  name="South Africa",    iso_code="ZAF", lat=-25.75, lon=28.19),

    # Latin America
    Country(id=71,  name="Brazil",          iso_code="BRA", lat=-15.78, lon=-47.93),
    Country(id=72,  name="Mexico",          iso_code="MEX", lat=19.43,  lon=-99.13),
    Country(id=73,  name="Argentina",       iso_code="ARG", lat=-34.60, lon=-58.38),
    Country(id=74,  name="Colombia",        iso_code="COL", lat=4.71,   lon=-74.07),
    Country(id=75,  name="Chile",           iso_code="CHL", lat=-33.46, lon=-70.65),
    Country(id=76,  name="Peru",            iso_code="PER", lat=-12.05, lon=-77.03),
    Country(id=77,  name="Venezuela",       iso_code="VEN", lat=10.49,  lon=-66.88),
    Country(id=78,  name="Cuba",            iso_code="CUB", lat=23.13,  lon=-82.38),
    Country(id=79,  name="Bolivia",         iso_code="BOL", lat=-16.50, lon=-68.15),
    Country(id=80,  name="Ecuador",         iso_code="ECU", lat=-0.23,  lon=-78.52),
    Country(id=81,  name="Uruguay",         iso_code="URY", lat=-34.90, lon=-56.19),
]

# 4-dim attribute vectors for the original cosine-similarity model
# [democracy_score, western_alignment, economic_openness, military_power]
ATTRIBUTE_VECTORS: dict[str, list[float]] = {
    "USA": [1.0,  1.0,  0.9,  1.0],
    "RUS": [0.1,  0.0,  0.3,  0.85],
    "CHN": [0.1,  0.1,  0.6,  0.9],
    "DEU": [1.0,  0.95, 0.85, 0.5],
    "BRA": [0.75, 0.5,  0.65, 0.3],
    "IND": [0.7,  0.45, 0.6,  0.6],
    "SAU": [0.15, 0.55, 0.7,  0.4],
    "FRA": [1.0,  0.9,  0.8,  0.6],
    "ZAF": [0.65, 0.45, 0.55, 0.2],
    "JPN": [0.95, 0.9,  0.8,  0.4],
}
