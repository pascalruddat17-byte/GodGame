"use client";

import {
  Armchair,
  BadgeDollarSign,
  Bird,
  ChevronLeft,
  Footprints,
  Hand,
  HeartPulse,
  Menu,
  Mountain,
  PackageOpen,
  Play,
  Rabbit,
  Save,
  ScrollText,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  TreePine,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Screen = "slots" | "lobby" | "editor" | "shop" | "world";
type Category =
  | "Bodies"
  | "Heads"
  | "Wings"
  | "Legs"
  | "Cores"
  | "Horns"
  | "Tails"
  | "Arms"
  | "Hands"
  | "Feet";
type Pack = "Forest" | "Stone" | "Water" | "Fire" | "Ancient";
type Stat = "Leben" | "Angriff" | "Sammeln" | "Bauen" | "Geschwindigkeit";

type Part = {
  id: string;
  category: Category;
  pack: Pack;
  name: string;
  coinCost: number;
  gemCost: number;
  stats: Record<Stat, number>;
  symbol: string;
  color: string;
};

type SlotSave = {
  used: boolean;
  creatureName: string;
  progress: number;
  creatures: number;
  equipped: Partial<Record<Category, string>>;
};

type GlobalState = {
  coins: number;
  gems: number;
  unlocked: string[];
};

const categories: Category[] = [
  "Bodies",
  "Heads",
  "Wings",
  "Legs",
  "Cores",
  "Horns",
  "Tails",
  "Arms",
  "Hands",
  "Feet",
];

const packs: Pack[] = ["Forest", "Stone", "Water", "Fire", "Ancient"];

const stats: Stat[] = [
  "Leben",
  "Angriff",
  "Sammeln",
  "Bauen",
  "Geschwindigkeit",
];

const packStyles: Record<Pack, { color: string; prefix: string }> = {
  Forest: { color: "#4d7b56", prefix: "Moss" },
  Stone: { color: "#777068", prefix: "Basalt" },
  Water: { color: "#347f91", prefix: "Reef" },
  Fire: { color: "#b96239", prefix: "Ember" },
  Ancient: { color: "#857247", prefix: "Rune" },
};

const categorySymbols: Record<Category, string> = {
  Bodies: "B",
  Heads: "H",
  Wings: "W",
  Legs: "L",
  Cores: "C",
  Horns: "R",
  Tails: "T",
  Arms: "A",
  Hands: "N",
  Feet: "F",
};

const categoryNames: Record<Category, string> = {
  Bodies: "Korper",
  Heads: "Kopf",
  Wings: "Flugel",
  Legs: "Beine",
  Cores: "Kern",
  Horns: "Horner",
  Tails: "Schwanz",
  Arms: "Arme",
  Hands: "Hande",
  Feet: "Fusse",
};

const statProfiles: Record<Category, Record<Stat, number>> = {
  Bodies: { Leben: 14, Angriff: 2, Sammeln: 3, Bauen: 2, Geschwindigkeit: 1 },
  Heads: { Leben: 2, Angriff: 5, Sammeln: 4, Bauen: 2, Geschwindigkeit: 2 },
  Wings: { Leben: 1, Angriff: 2, Sammeln: 3, Bauen: 1, Geschwindigkeit: 9 },
  Legs: { Leben: 3, Angriff: 2, Sammeln: 2, Bauen: 3, Geschwindigkeit: 7 },
  Cores: { Leben: 7, Angriff: 4, Sammeln: 4, Bauen: 6, Geschwindigkeit: 1 },
  Horns: { Leben: 1, Angriff: 9, Sammeln: 1, Bauen: 1, Geschwindigkeit: 2 },
  Tails: { Leben: 3, Angriff: 4, Sammeln: 5, Bauen: 2, Geschwindigkeit: 4 },
  Arms: { Leben: 3, Angriff: 5, Sammeln: 4, Bauen: 6, Geschwindigkeit: 1 },
  Hands: { Leben: 1, Angriff: 4, Sammeln: 7, Bauen: 7, Geschwindigkeit: 2 },
  Feet: { Leben: 2, Angriff: 2, Sammeln: 4, Bauen: 3, Geschwindigkeit: 8 },
};

const packBonus: Record<Pack, Partial<Record<Stat, number>>> = {
  Forest: { Sammeln: 3, Leben: 1 },
  Stone: { Leben: 4, Bauen: 2 },
  Water: { Geschwindigkeit: 2, Sammeln: 2 },
  Fire: { Angriff: 4 },
  Ancient: { Bauen: 3, Angriff: 1 },
};

const allParts: Part[] = packs.flatMap((pack, packIndex) =>
  categories.map((category, categoryIndex) => {
    const base = statProfiles[category];
    const bonus = packBonus[pack];
    return {
      id: `${pack}-${category}`.toLowerCase(),
      category,
      pack,
      name: `${packStyles[pack].prefix} ${categoryNames[category]}`,
      coinCost: 80 + packIndex * 45 + categoryIndex * 9,
      gemCost: 2 + Math.floor(packIndex / 2),
      stats: Object.fromEntries(
        stats.map((stat) => [stat, base[stat] + (bonus[stat] ?? 0)]),
      ) as Record<Stat, number>,
      symbol: categorySymbols[category],
      color: packStyles[pack].color,
    };
  }),
);

const initialSlots: SlotSave[] = [
  {
    used: true,
    creatureName: "Mira-Spezies",
    progress: 12,
    creatures: 3,
    equipped: {
      Bodies: "forest-bodies",
      Heads: "forest-heads",
      Legs: "stone-legs",
      Cores: "water-cores",
    },
  },
  { used: false, creatureName: "Neue Welt", progress: 0, creatures: 0, equipped: {} },
  { used: false, creatureName: "Neue Welt", progress: 0, creatures: 0, equipped: {} },
];

const initialGlobal: GlobalState = {
  coins: 0,
  gems: 0,
  unlocked: ["forest-bodies", "forest-heads", "stone-legs", "water-cores"],
};

function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getPart(id?: string) {
  return allParts.find((part) => part.id === id);
}

function emptyStats(): Record<Stat, number> {
  return { Leben: 12, Angriff: 8, Sammeln: 8, Bauen: 8, Geschwindigkeit: 8 };
}

function Creature({
  equipped,
  compact = false,
  onClick,
}: {
  equipped: Partial<Record<Category, string>>;
  compact?: boolean;
  onClick?: () => void;
}) {
  const parts = Object.fromEntries(
    categories.map((category) => [category, getPart(equipped[category])]),
  ) as Partial<Record<Category, Part>>;
  const bodyColor = parts.Bodies?.color ?? "#697b62";
  const coreColor = parts.Cores?.color ?? "#65a391";
  const wingColor = parts.Wings?.color ?? "#8aa47a";
  const sizeClass = compact ? "creature creature--compact" : "creature";

  return (
    <button className={sizeClass} onClick={onClick} aria-label="Kreatur bearbeiten">
      {parts.Wings && (
        <>
          <span className="part wing wing-left" style={{ background: wingColor }} />
          <span className="part wing wing-right" style={{ background: wingColor }} />
        </>
      )}
      {parts.Tails && (
        <span className="part tail" style={{ background: parts.Tails.color }} />
      )}
      {parts.Legs && (
        <>
          <span className="part leg leg-left" style={{ background: parts.Legs.color }} />
          <span className="part leg leg-right" style={{ background: parts.Legs.color }} />
        </>
      )}
      {parts.Feet && (
        <>
          <span className="part foot foot-left" style={{ background: parts.Feet.color }} />
          <span className="part foot foot-right" style={{ background: parts.Feet.color }} />
        </>
      )}
      {parts.Arms && (
        <>
          <span className="part arm arm-left" style={{ background: parts.Arms.color }} />
          <span className="part arm arm-right" style={{ background: parts.Arms.color }} />
        </>
      )}
      {parts.Hands && (
        <>
          <span className="part hand hand-left" style={{ background: parts.Hands.color }} />
          <span className="part hand hand-right" style={{ background: parts.Hands.color }} />
        </>
      )}
      <span className="body" style={{ background: bodyColor }}>
        <span className="core" style={{ background: coreColor }} />
      </span>
      <span className="head" style={{ background: parts.Heads?.color ?? "#8a9b72" }}>
        {parts.Horns && (
          <>
            <span className="horn horn-left" style={{ borderBottomColor: parts.Horns.color }} />
            <span className="horn horn-right" style={{ borderBottomColor: parts.Horns.color }} />
          </>
        )}
        <span className="eye eye-left" />
        <span className="eye eye-right" />
      </span>
    </button>
  );
}

function PartIcon({ part }: { part: Part }) {
  return (
    <span className="part-icon" style={{ "--part-color": part.color } as React.CSSProperties}>
      <span>{part.symbol}</span>
    </span>
  );
}

function StatBars({ totals }: { totals: Record<Stat, number> }) {
  return (
    <div className="stat-list">
      {stats.map((stat) => (
        <div className="stat-row" key={stat}>
          <span>{stat}</span>
          <div className="stat-track">
            <i style={{ width: `${Math.min(100, totals[stat])}%` }} />
          </div>
          <b>{totals[stat]}</b>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("slots");
  const [slots, setSlots] = useState<SlotSave[]>(initialSlots);
  const [global, setGlobal] = useState<GlobalState>(initialGlobal);
  const [activeSlot, setActiveSlot] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | "Alle">("Alle");
  const [packFilter, setPackFilter] = useState<Pack | "Alle">("Alle");
  const [ad, setAd] = useState<null | { reward?: "coins" | "part"; backTo: Screen }>(null);
  const [adCountdown, setAdCountdown] = useState(3);
  const current = slots[activeSlot];

  useEffect(() => {
    setSlots(loadState("earthcraft-v3-slots", initialSlots));
    setGlobal(loadState("earthcraft-v3-global", initialGlobal));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("earthcraft-v3-slots", JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    window.localStorage.setItem("earthcraft-v3-global", JSON.stringify(global));
  }, [global]);

  useEffect(() => {
    if (!ad) return;
    setAdCountdown(3);
    const timer = window.setInterval(() => {
      setAdCountdown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [ad]);

  const totals = useMemo(() => {
    const next = emptyStats();
    Object.values(current.equipped).forEach((id) => {
      const part = getPart(id);
      if (!part) return;
      stats.forEach((stat) => {
        next[stat] += part.stats[stat];
      });
    });
    return next;
  }, [current.equipped]);

  const filteredParts = allParts.filter((part) => {
    const byCategory = categoryFilter === "Alle" || part.category === categoryFilter;
    const byPack = packFilter === "Alle" || part.pack === packFilter;
    return byCategory && byPack;
  });

  function chooseSlot(index: number) {
    setActiveSlot(index);
    setSlots((saveSlots) =>
      saveSlots.map((slot, slotIndex) =>
        slotIndex === index && !slot.used
          ? {
              used: true,
              creatureName: `Spezies ${index + 1}`,
              progress: 1,
              creatures: 1,
              equipped: {
                Bodies: "forest-bodies",
                Heads: "forest-heads",
                Cores: "forest-cores",
              },
            }
          : slot,
      ),
    );
    setAd({ backTo: "lobby" });
  }

  function finishAd() {
    if (!ad) return;
    if (ad.reward === "coins") {
      setGlobal((value) => ({ ...value, coins: value.coins + 160 }));
    }
    if (ad.reward === "part") {
      const locked = allParts.find((part) => !global.unlocked.includes(part.id));
      if (locked) {
        setGlobal((value) => ({
          ...value,
          unlocked: [...value.unlocked, locked.id],
        }));
      }
    }
    setScreen(ad.backTo);
    setAd(null);
  }

  function equip(part: Part) {
    if (!global.unlocked.includes(part.id)) return;
    setSlots((saveSlots) =>
      saveSlots.map((slot, slotIndex) =>
        slotIndex === activeSlot
          ? {
              ...slot,
              equipped: { ...slot.equipped, [part.category]: part.id },
              progress: Math.max(slot.progress, 4 + Object.keys(slot.equipped).length * 3),
              creatures: Math.max(slot.creatures, 1),
            }
          : slot,
      ),
    );
  }

  function buy(part: Part, currency: "coins" | "gems") {
    if (global.unlocked.includes(part.id)) {
      equip(part);
      setScreen("editor");
      return;
    }
    if (currency === "coins" && global.coins >= part.coinCost) {
      setGlobal((value) => ({
        ...value,
        coins: value.coins - part.coinCost,
        unlocked: [...value.unlocked, part.id],
      }));
      equip(part);
    }
    if (currency === "gems" && global.gems >= part.gemCost) {
      setGlobal((value) => ({
        ...value,
        gems: value.gems - part.gemCost,
        unlocked: [...value.unlocked, part.id],
      }));
      equip(part);
    }
  }

  return (
    <main className="game-shell">
      <section className="phone-frame" aria-label="2D Mobile God Game Prototype">
        {screen !== "slots" && <UtilityBar global={global} onMenu={() => setMenuOpen(true)} />}

        {screen === "slots" && (
          <section className="slot-screen">
            <div className="slot-sky" />
            <div className="slot-copy">
              <p>Weltenspeicher</p>
              <h1>Wahle eine ruhende Erde</h1>
            </div>
            <div className="slot-list">
              {slots.map((slot, index) => (
                <button className="save-slot" key={index} onClick={() => chooseSlot(index)}>
                  <span className="slot-number">Slot {index + 1}</span>
                  <strong>{slot.used ? slot.creatureName : "Neue Welt starten"}</strong>
                  {slot.used ? (
                    <span>
                      Fortschritt {slot.progress}% · {slot.creatures} Kreaturen
                    </span>
                  ) : (
                    <span>Leere Erde, bereit fur den ersten Atemzug</span>
                  )}
                  <b>{slot.used ? "Spielen" : "Starten"}</b>
                </button>
              ))}
            </div>
          </section>
        )}

        {screen === "lobby" && (
          <section className="earth-scene">
            <Landscape />
            <div className="creature-stage">
              <img
                className="pedestal-art"
                src="/reference-pedestal.png"
                alt=""
                aria-hidden="true"
              />
              <Creature equipped={current.equipped} onClick={() => setScreen("editor")} />
              <p>{current.creatureName}</p>
            </div>
            <Hotbar setScreen={setScreen} />
          </section>
        )}

        {screen === "editor" && (
          <section className="panel-screen editor-screen">
            <TopBack label="Creature" onBack={() => setScreen("lobby")} />
            <div className="editor-preview">
              <div className="slot-point point-head">Kopf</div>
              <div className="slot-point point-wing">Flugel</div>
              <div className="slot-point point-core">Kern</div>
              <div className="slot-point point-tail">Schwanz</div>
              <Creature equipped={current.equipped} />
            </div>
            <StatBars totals={totals} />
            <div className="inventory-grid">
              {allParts
                .filter((part) => global.unlocked.includes(part.id))
                .map((part) => (
                  <button
                    className={`inventory-item ${
                      current.equipped[part.category] === part.id ? "is-equipped" : ""
                    }`}
                    key={part.id}
                    onClick={() => equip(part)}
                  >
                    <PartIcon part={part} />
                    <span>{categoryNames[part.category]}</span>
                  </button>
                ))}
            </div>
            <div className="editor-actions">
              <button className="primary-action" onClick={() => setScreen("lobby")}>
                <Save size={17} /> Speichern
              </button>
              <button className="quiet-action" onClick={() => setScreen("lobby")}>
                Zuruck
              </button>
            </div>
          </section>
        )}

        {screen === "shop" && (
          <section className="panel-screen shop-screen">
            <TopBack label="Shop" onBack={() => setScreen("lobby")} />
            <div className="reward-strip">
              <button onClick={() => setAd({ reward: "coins", backTo: "shop" })}>
                <BadgeDollarSign size={18} /> Werbung schauen fur Coins
              </button>
              <button onClick={() => setAd({ reward: "part", backTo: "shop" })}>
                <PackageOpen size={18} /> Bonus-Korperteil
              </button>
            </div>
            <div className="filters">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as Category | "Alle")}
                aria-label="Kategorie filtern"
              >
                <option>Alle</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <select
                value={packFilter}
                onChange={(event) => setPackFilter(event.target.value as Pack | "Alle")}
                aria-label="Pack filtern"
              >
                <option>Alle</option>
                {packs.map((pack) => (
                  <option key={pack}>{pack}</option>
                ))}
              </select>
            </div>
            <div className="shop-grid">
              {filteredParts.map((part) => {
                const unlocked = global.unlocked.includes(part.id);
                return (
                  <article className="shop-card" key={part.id}>
                    <PartIcon part={part} />
                    <div>
                      <strong>{part.name}</strong>
                      <span>
                        {part.pack} · {part.category}
                      </span>
                    </div>
                    <div className="buy-row">
                      <button onClick={() => buy(part, "coins")}>
                        {unlocked ? "Ausrusten" : `${part.coinCost} C`}
                      </button>
                      {!unlocked && <button onClick={() => buy(part, "gems")}>{part.gemCost} D</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {screen === "world" && (
          <section className="world-screen">
            <TopBack label="World" onBack={() => setScreen("lobby")} />
            <div className="map">
              {Array.from({ length: 34 }, (_, index) => (
                <span className={`map-tile tile-${index % 7}`} key={index} />
              ))}
              <Creature equipped={current.equipped} compact />
              <span className="map-creature one" />
              <span className="map-creature two" />
            </div>
            <div className="world-caption">
              <h2>Erste 2D-Welt-Vorschau</h2>
              <p>Gras, Wasser, Baume, Steine und Platzhalter fur Kreaturen.</p>
            </div>
          </section>
        )}

        {menuOpen && (
          <aside className="menu-sheet">
            <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Menu schliessen">
              <X size={20} />
            </button>
            <h2>Menu</h2>
            <button onClick={() => setScreen("lobby")}>
              <Shield size={17} /> Lobby
            </button>
            <button onClick={() => setScreen("shop")}>
              <ShoppingBag size={17} /> Globaler Shop
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                setScreen("slots");
              }}
            >
              <ScrollText size={17} /> Save-Slots
            </button>
            <div className="mini-slots">
              {slots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveSlot(index);
                    setMenuOpen(false);
                    setAd({ backTo: "lobby" });
                  }}
                >
                  Slot {index + 1}
                  <span>{slot.used ? slot.creatureName : "Leer"}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {ad && (
          <section className="ad-screen">
            <div>
              <h2>Werbung</h2>
              <p>{adCountdown > 0 ? `Skippen in ${adCountdown}...` : "Bereit zum Skippen"}</p>
            </div>
            <button onClick={finishAd} disabled={adCountdown > 0}>
              Skippen
            </button>
          </section>
        )}
      </section>
    </main>
  );
}

function UtilityBar({
  global,
  onMenu,
}: {
  global: GlobalState;
  onMenu: () => void;
}) {
  return (
    <header className="utility-bar">
      <span>
        <i className="currency-icon coin-icon" aria-hidden="true" /> {global.coins.toLocaleString("de-DE")}
      </span>
      <span>
        <i className="currency-icon gem-icon" aria-hidden="true" /> {global.gems.toLocaleString("de-DE")}
      </span>
      <button onClick={onMenu} aria-label="Menu offnen">
        <Menu size={21} />
      </button>
    </header>
  );
}

function TopBack({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="top-back">
      <button onClick={onBack} aria-label="Zuruck">
        <ChevronLeft size={20} />
      </button>
      <strong>{label}</strong>
    </div>
  );
}

function Hotbar({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <nav className="hotbar" aria-label="Hauptnavigation">
      <button onClick={() => setScreen("shop")}>
        <ShoppingBag size={20} /> Shop
      </button>
      <button className="world-button" onClick={() => setScreen("world")}>
        <Play size={24} /> World
      </button>
      <button onClick={() => setScreen("editor")}>
        <Sparkles size={20} /> Creature
      </button>
    </nav>
  );
}

function Landscape() {
  return (
    <div className="landscape" aria-hidden="true">
      <span className="sun" />
      <span className="hill hill-one" />
      <span className="hill hill-two" />
      <span className="water" />
      <span className="plant plant-one" />
      <span className="plant plant-two" />
      <span className="plant plant-three" />
      <TreePine className="tree tree-one" />
      <TreePine className="tree tree-two" />
      <Mountain className="stone stone-one" />
      <Waves className="wave-mark" />
      <Wind className="wind-mark" />
      <HeartPulse className="life-mark" />
      <Swords className="hidden-icon" />
      <Rabbit className="hidden-icon" />
      <Bird className="hidden-icon" />
      <Armchair className="hidden-icon" />
      <Footprints className="hidden-icon" />
      <Hand className="hidden-icon" />
    </div>
  );
}
