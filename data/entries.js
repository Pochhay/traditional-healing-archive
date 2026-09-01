// data/entries.js
// Seed data for the Khmer Herbal Plant Archive.
// All entries are transcribed from the archive's existing notes in app/page.js.

const entries = [
  {
    id: "siamese-neem",
    nameKhmer: "ស្តៅ",
    nameEnglish: "Siamese Neem",
    scientificName: "Azadirachta indica var. siamensis",
    family: "Meliaceae (the mahogany family)",
    image: "/images/sdau-neem-shoots.jpg",
    description:
      "A drought-tolerant tree reaching about 12 m, with pinnate leaves of paired serrated leaflets and clusters of small, honey-scented white flowers followed by yellow-green drupes. Its tender young leaves and flower buds are eaten in Cambodia as a distinctly bitter fresh vegetable.",
    location:
      "Common throughout lowland Cambodia, especially in dry dipterocarp forest and along roadsides in Kampong Cham, Tboung Khmum, and Battambang provinces; widely planted in villages and home gardens.",
    chemicalCompounds: [
      "Azadirachtin",
      "Nimbin",
      "Nimbidin",
      "Salannin",
      "Quercetin",
    ],
    medicinalUses: [
      "Young leaves are chewed raw to cool the body and purify the blood",
      "Decoctions of leaves and bark are traditionally taken to reduce fever, including fever associated with malaria",
      "Crushed leaf paste and pressed seed oil are applied to skin infections, ulcers, and slow-healing wounds",
      "Fresh twigs serve as chewing sticks against gum disease",
    ],
  },
  {
    id: "cambodian-cinnamon",
    nameKhmer: "ខ្ជៃ",
    nameEnglish: "Cambodian Cinnamon",
    scientificName: "Cinnamomum cambodianum",
    family: "Lauraceae (the laurel family)",
    image: "/images/kcheay-cinnamon-bark.jpg",
    description:
      "An aromatic evergreen laurel tree growing 10–15 m tall, with glossy elliptical leaves marked by three prominent parallel veins and small greenish-white flowers. The inner bark is reddish-brown, strongly sweet-spiced, and curls into quills when dried.",
    location:
      "Native to Cambodia's Cardamom Mountains (Phnom Kravanh), growing in humid evergreen forest between roughly 300 and 800 m in Pursat and Koh Kong provinces; historically also cultivated in smallholder groves near Chhlong and in Kampot.",
    chemicalCompounds: [
      "Cinnamaldehyde",
      "Eugenol",
      "Cinnamyl acetate",
      "Coumarin",
    ],
    medicinalUses: [
      "Bark infusions are a standard household remedy for colds, coughs, diarrhea, and stomach cramps",
      "The warming spice is added to broths and teas to improve circulation and appetite",
      "Bark oil, rich in cinnamaldehyde and eugenol, is dabbed on toothaches and minor cuts as an antiseptic",
    ],
  },
  {
    id: "turmeric",
    nameKhmer: "រមៀត",
    nameEnglish: "Turmeric",
    scientificName: "Curcuma longa",
    family: "Zingiberaceae (the ginger family)",
    image: "/images/romiet-turmeric-powder.jpg",
    description:
      "A perennial herbaceous plant about 1 m tall with large lanceolate leaves rising directly from the soil. Beneath the ground it forms clusters of branched, finger-like rhizomes whose flesh is vivid orange-yellow and powerfully aromatic when cut.",
    location:
      "Cultivated nationwide in home gardens and smallholder plots, particularly in Kampong Thom and Takeo provinces, thriving in loose, moist, well-drained loam; wild Curcuma relatives grow along evergreen forest margins in the southwest.",
    chemicalCompounds: [
      "Curcumin",
      "Demethoxycurcumin",
      "Bisdemethoxycurcumin",
      "Ar-turmerone",
      "Alpha-turmerone",
      "Zingiberene",
    ],
    medicinalUses: [
      "Rhizome paste is applied externally to sprains, bruises, insect bites, and ringworm",
      "Taken stirred into warm water or milk for indigestion, stomach pain, and jaundice",
      "A core ingredient of kroeung, the fragrant curry paste base of Khmer cuisine, valued as a daily anti-inflammatory food",
    ],
  },
  {
    id: "hophead-philippine-violet",
    nameKhmer: "ម្ជុលមាស, ម្ជុលពេជ្រ",
    nameEnglish: "Hophead Philippine Violet",
    scientificName: "Barleria lupulina Lindl.",
    family: "Acanthaceae (the acanthus family)",
    image: "/images/mchul-mas-philippine-violet.jpg",
    description:
      "An erect, spiny evergreen shrub growing 1 to 2 m in height, featuring dark green, narrow-lanceolate leaves marked by a distinct reddish-purple midrib and paired sharp spines at leaf axils. It bears attractive tubular, golden-yellow flowers emerging from overlapping, hop-like terminal bract spikes, followed by small capsule fruits.",
    location:
      "Widely cultivated across Cambodia and Southeast Asia as an ornamental plant and living boundary hedge; commonly found in home gardens, temple grounds, and naturalized in disturbed lowland areas. Easily propagated by stem cuttings and seeds.",
    chemicalCompounds: [
      "Cyclobutane derivatives",
      "2-Hexyl-1-octanol",
      "1-Hentetracontanol",
      "Phthalate esters",
      "Barlerin (iridoid glycoside)",
      "Shanzhiside methyl ester (iridoid glycoside)",
      "Polyphenolic flavonoids",
    ],
    medicinalUses: [
      "The fresh leaves, stems, and roots are widely used to detoxify venoms, relieve inflammation, and alleviate pain",
      "Fresh crushed leaf paste or juice is applied topically to soothe centipede bites, wasp stings, insect bites, boils, and toothaches",
      "Decoctions are taken internally for gastrointestinal discomfort and to stop bleeding (contraindicated during pregnancy)",
    ],
  },
  {
  id: "little-ironweed",
    nameKhmer: "ក្បាលរុយ",
    nameEnglish: "Little Ironweed",
    scientificName: "Vernonia cinerea Less.",
    family: "Asteraceae (the daisy family)",
    image: "/images/kbal-roy-little-ironweed.jpg",
    description:
      "An erect, branched annual or short-lived perennial herb growing 20 to 80 cm tall. It features slender, ribbed green stems and alternate, ovate to lanceolate leaves (2–3 cm long by 0.5–2.5 cm wide) with serrated margins. The plant produces terminal corymb-like clusters of small, fuzzy florets that range from pinkish-purple to light violet, maturing into small cypselae with a white pappus. The herb has a slightly bitter, sweet, and cooling taste.",
    location:
      "Naturally widespread and common across Cambodia and tropical Asia; frequently found in open wastelands, roadsides, disturbed soils, cultivated fields, and dry forest borders. Propagated easily by wind-dispersed seeds.",
    chemicalCompounds: [
      "Alkaloids",
      "Phenolic compounds",
      "Tannins",
      "Flavonoids",
      "Sterols",
      "Triterpenoids",
      "Cardiac glycosides",
      "Saponins",
      "Quinones",
      "Polypeptides",
      "Resins",
      "Essential oils",
    ],
    medicinalUses: [
      "The whole plant (fresh or dried) is boiled as a decoction or crushed into a poultice",
      "Traditionally used to clear internal heat, reduce fever and malaria symptoms, relieve coughs, soothe asthma, detoxify snake venom and insect bites, resolve inflammation, and treat eye redness",
      "In folk medicine, brewed as a therapeutic tea to assist with smoking cessation and promote urinary health",
    ],
  },
];

export default entries;