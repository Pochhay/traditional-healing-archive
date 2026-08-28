import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";

const entries = [
  {
    nameKhmer: "ស្តៅ",
    nameEnglish: "Siamese Neem",
    scientificName: "Azadirachta indica var. siamensis",
    family: "Meliaceae (the mahogany family)",
    image: "/images/sdau-neem-shoots.jpg",
    description:
      "A drought-tolerant tree reaching about 12 m, with pinnate leaves of paired serrated leaflets and clusters of small, honey-scented white flowers followed by yellow-green drupes. Its tender young leaves and flower buds are eaten in Cambodia as a distinctly bitter fresh vegetable.",
    habitat:
      "Common throughout lowland Cambodia, especially in dry dipterocarp forest and along roadsides in Kampong Cham, Tboung Khmum, and Battambang provinces; widely planted in villages and home gardens.",
    compounds:
      "Limonoid triterpenes including azadirachtin, nimbin, nimbidin, and salannin, plus the flavonoid quercetin.",
    uses:
      "Young leaves are chewed raw to cool the body and purify the blood. Decoctions of leaves and bark are traditionally taken to reduce fever, including fever associated with malaria. Crushed leaf paste and pressed seed oil are applied to skin infections, ulcers, and slow-healing wounds; fresh twigs serve as chewing sticks against gum disease.",
  },
  {
    nameKhmer: "ខ្ជៃ",
    nameEnglish: "Cambodian Cinnamon",
    scientificName: "Cinnamomum cambodianum",
    family: "Lauraceae (the laurel family)",
    image: "/images/kcheay-cinnamon-bark.jpg",
    description:
      "An aromatic evergreen laurel tree growing 10–15 m tall, with glossy elliptical leaves marked by three prominent parallel veins and small greenish-white flowers. The inner bark is reddish-brown, strongly sweet-spiced, and curls into quills when dried.",
    habitat:
      "Native to Cambodia's Cardamom Mountains (Phnom Kravanh), growing in humid evergreen forest between roughly 300 and 800 m in Pursat and Koh Kong provinces; historically also cultivated in smallholder groves near Chhlong and in Kampot.",
    compounds:
      "Bark essential oil dominated by cinnamaldehyde, with eugenol, cinnamyl acetate, and trace coumarin.",
    uses:
      "Bark infusions are a standard household remedy for colds, coughs, diarrhea, and stomach cramps. The warming spice is added to broths and teas to improve circulation and appetite. Bark oil, rich in cinnamaldehyde and eugenol, is dabbed on toothaches and minor cuts as an antiseptic.",
  },
  {
    nameKhmer: "រមៀត",
    nameEnglish: "Turmeric",
    scientificName: "Curcuma longa",
    family: "Zingiberaceae (the ginger family)",
    image: "/images/romiet-turmeric-powder.jpg",
    description:
      "A perennial herbaceous plant about 1 m tall with large lanceolate leaves rising directly from the soil. Beneath the ground it forms clusters of branched, finger-like rhizomes whose flesh is vivid orange-yellow and powerfully aromatic when cut.",
    habitat:
      "Cultivated nationwide in home gardens and smallholder plots, particularly in Kampong Thom and Takeo provinces, thriving in loose, moist, well-drained loam; wild Curcuma relatives grow along evergreen forest margins in the southwest.",
    compounds:
      "Curcuminoids — curcumin, demethoxycurcumin, and bisdemethoxycurcumin — alongside essential oils containing ar-turmerone, alpha-turmerone, and zingiberene.",
    uses:
      "Rhizome paste is applied externally to sprains, bruises, insect bites, and ringworm. Taken stirred into warm water or milk for indigestion, stomach pain, and jaundice. It is also a core ingredient of kroeung, the fragrant curry paste base of Khmer cuisine, valued as a daily anti-inflammatory food.",
  },
];



const styles = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "80px 24px",
  },
  kicker: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    color: "#4D6B58",
    fontSize: 15,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    color: "#1A2820",
    margin: "16px 0 12px",
    lineHeight: 1.1,
  },
  description: {
    fontSize: 19,
    color: "#1A2820",
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    marginTop: 48,
    padding: 24,
    backgroundColor: "#FFFFFF",
    border: "1px solid #D3CEBE",
    borderLeft: "3px solid #4D6B58",
    borderRadius: 10,
  },
  cardLabel: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 13,
    color: "#4D6B58",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 17,
    color: "#1A2820",
    margin: "6px 0 0",
  },
  count: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontSize: 15,
    color: "#4D6B58",
    marginTop: 48,
  },
  footer: {
    marginTop: 64,
    paddingTop: 24,
    borderTop: "1px solid #D3CEBE",
    fontSize: 14,
    color: "#4D6B58",
  },
};

export default function Home() {
  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER HERBAL PLANT ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      <div style={styles.card}>
        <p style={styles.cardLabel}>CURATED BY</p>
        <p style={styles.cardValue}>{collection.curator}</p>
      </div>
      <div style={styles.card}>
        <p style={styles.cardLabel}>SOURCE</p>
        <p style={styles.cardValue}>{collection.source}</p>
      </div>

      <p style={styles.count}>entries in the archive: {entries.length}</p>

      <div style={{ display: "grid", gap: 24 }}>
        {entries.map((entry) => (
          <EntryCard key={entry.nameEnglish} {...entry} />
        ))}
      </div>


      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
        2026. 
      </footer>
    </main>
  );
}
