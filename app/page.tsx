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
  Plus,
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
import { useEffect, useMemo, useRef, useState } from "react";

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
type Pack = "Forest-Mutant" | "Swamp-Tech" | "River-Glass" | "Fungus" | "Solar-Clay";
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
  image: string;
};

type SlotSave = {
  used: boolean;
  creatureName: string;
  progress: number;
  creatures: CreatureSave[];
};

type CreatureSave = {
  name: string;
  equipped: Partial<Record<Category, string>>;
};

type GlobalState = {
  coins: number;
  gems: number;
  unlocked: string[];
};

const categories: Category[] = [
  "Wings",
  "Legs",
  "Cores",
  "Horns",
  "Tails",
  "Arms",
  "Hands",
  "Feet",
  "Heads",
  "Bodies",
];

const packs: Pack[] = [
  "Forest-Mutant",
  "Swamp-Tech",
  "River-Glass",
  "Fungus",
  "Solar-Clay",
];

const stats: Stat[] = [
  "Leben",
  "Angriff",
  "Sammeln",
  "Bauen",
  "Geschwindigkeit",
];

const statShortNames: Record<Stat, string> = {
  Leben: "LP",
  Angriff: "ATK",
  Sammeln: "SAM",
  Bauen: "BAU",
  Geschwindigkeit: "SPD",
};

const packStyles: Record<Pack, { color: string; prefix: string }> = {
  "Forest-Mutant": { color: "#5c9b3b", prefix: "Forest-Mutant" },
  "Swamp-Tech": { color: "#247f86", prefix: "Swamp-Tech" },
  "River-Glass": { color: "#20aeea", prefix: "River-Glass" },
  Fungus: { color: "#9b55ba", prefix: "Fungus" },
  "Solar-Clay": { color: "#c8752c", prefix: "Solar-Clay" },
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
  "Forest-Mutant": { Sammeln: 3, Leben: 1 },
  "Swamp-Tech": { Leben: 2, Bauen: 4 },
  "River-Glass": { Geschwindigkeit: 2, Sammeln: 2 },
  Fungus: { Leben: 2, Angriff: 2, Sammeln: 1 },
  "Solar-Clay": { Bauen: 3, Angriff: 2 },
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
      image: `/parts/${pack.toLowerCase()}-${category.toLowerCase()}.png`,
    };
  }),
);

const initialSlots: SlotSave[] = [
  {
    used: true,
    creatureName: "Mira-Spezies",
    progress: 12,
    creatures: [
      {
        name: "Mira-Spezies",
        equipped: {
          Bodies: "forest-mutant-bodies",
          Heads: "forest-mutant-heads",
          Legs: "swamp-tech-legs",
          Cores: "river-glass-cores",
        },
      },
      { name: "Kreatur 2", equipped: {} },
      { name: "Kreatur 3", equipped: {} },
    ],
  },
  { used: false, creatureName: "Neue Welt", progress: 0, creatures: [] },
  { used: false, creatureName: "Neue Welt", progress: 0, creatures: [] },
];

const initialGlobal: GlobalState = {
  coins: 0,
  gems: 0,
  unlocked: [
    "forest-mutant-bodies",
    "forest-mutant-heads",
    "swamp-tech-legs",
    "river-glass-cores",
  ],
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

function defaultCreature(name = "Neue Kreatur"): CreatureSave {
  return {
    name,
    equipped: {
      Bodies: "forest-mutant-bodies",
      Heads: "forest-mutant-heads",
      Cores: "forest-mutant-cores",
    },
  };
}

function normalizeSlots(raw: SlotSave[]): SlotSave[] {
  return raw.map((slot) => {
    const legacy = (slot as SlotSave & { equipped?: CreatureSave["equipped"] }).equipped;
    const creatures = Array.isArray(slot.creatures)
      ? slot.creatures
      : [{ name: slot.creatureName, equipped: legacy ?? {} }];
    return {
      ...slot,
      creatures: Array.from({ length: 3 }, (_, index) =>
        creatures[index] ?? { name: `Kreatur ${index + 1}`, equipped: {} },
      ),
    };
  });
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
      <img src={part.image} alt="" />
    </span>
  );
}

function partSummary(part: Part) {
  return stats
    .map((stat) => `${stat}: ${part.stats[stat] >= 0 ? "+" : ""}${part.stats[stat]}`)
    .join(" · ");
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

function CreatureSlots({
  creatures,
  activeCreature,
  onChoose,
}: {
  creatures: CreatureSave[];
  activeCreature: number;
  onChoose: (index: number) => void;
}) {
  return (
    <div className="creature-slots" aria-label="Kreaturen-Slots">
      {creatures.slice(0, 3).map((creature, index) => {
        const isCreated = Object.keys(creature.equipped).length > 0;
        return (
          <button
            className={activeCreature === index ? "is-active" : ""}
            key={index}
            onClick={() => onChoose(index)}
          >
            <span>Slot {index + 1}</span>
            <strong>{isCreated ? creature.name : <><Plus size={14} /> Neu</>}</strong>
          </button>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("slots");
  const [slots, setSlots] = useState<SlotSave[]>(initialSlots);
  const [global, setGlobal] = useState<GlobalState>(initialGlobal);
  const [activeSlot, setActiveSlot] = useState(0);
  const [activeCreature, setActiveCreature] = useState(0);
  const [deviceMode, setDeviceMode] = useState<"mobile" | "pc">("mobile");
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [mapZoom, setMapZoom] = useState(1);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchOrigin = useRef<{ distance: number; zoom: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | "Alle">("Alle");
  const [packFilter, setPackFilter] = useState<Pack | "Alle">("Alle");
  const [editorCategory, setEditorCategory] = useState<Category | "Alle">("Alle");
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [ad, setAd] = useState<null | { reward?: "coins" | "part"; backTo: Screen }>(null);
  const [adCountdown, setAdCountdown] = useState(3);
  const current = slots[activeSlot];
  const currentCreature = current.creatures[activeCreature] ?? current.creatures[0] ?? defaultCreature();

  useEffect(() => {
    setSlots(normalizeSlots(loadState("earthcraft-v4-slots", initialSlots)));
    setGlobal(loadState("earthcraft-v4-global", initialGlobal));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("earthcraft-v4-slots", JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    window.localStorage.setItem("earthcraft-v4-global", JSON.stringify(global));
  }, [global]);

  useEffect(() => {
    if (screen !== "world" || deviceMode !== "pc") return;
    function handleKeyDown(event: KeyboardEvent) {
      const speed = event.shiftKey ? 34 : 18;
      const direction = event.key.toLowerCase();
      if (!["w", "a", "s", "d"].includes(direction)) return;
      event.preventDefault();
      setMapOffset((offset) => ({
        x: offset.x + (direction === "a" ? speed : direction === "d" ? -speed : 0),
        y: offset.y + (direction === "w" ? speed : direction === "s" ? -speed : 0),
      }));
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deviceMode, screen]);

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
    Object.values(currentCreature.equipped).forEach((id) => {
      const part = getPart(id);
      if (!part) return;
      stats.forEach((stat) => {
        next[stat] += part.stats[stat];
      });
    });
    return next;
  }, [currentCreature]);

  const filteredParts = allParts.filter((part) => {
    const byCategory = categoryFilter === "Alle" || part.category === categoryFilter;
    const byPack = packFilter === "Alle" || part.pack === packFilter;
    const isAvailableToBuy = !global.unlocked.includes(part.id);
    return byCategory && byPack && isAvailableToBuy;
  });

  const editorParts = allParts.filter(
    (part) =>
      global.unlocked.includes(part.id) &&
      (editorCategory === "Alle" || part.category === editorCategory),
  );
  const hoveredPart = editorParts.find((part) => part.id === hoveredPartId) ?? editorParts[0];

  function chooseSlot(index: number) {
    setActiveSlot(index);
    setSlots((saveSlots) =>
      saveSlots.map((slot, slotIndex) =>
        slotIndex === index && !slot.used
          ? {
              used: true,
              creatureName: `Spezies ${index + 1}`,
              progress: 1,
              creatures: [
                defaultCreature(`Spezies ${index + 1}`),
                { name: "Kreatur 2", equipped: {} },
                { name: "Kreatur 3", equipped: {} },
              ],
            }
          : slot,
      ),
    );
    setActiveCreature(0);
    setAd({ backTo: "lobby" });
  }

  function chooseCreature(index: number) {
    if (!current.creatures[index]) return;
    setActiveCreature(index);
    if (Object.keys(current.creatures[index].equipped).length === 0) {
      setSlots((saveSlots) =>
        saveSlots.map((slot, slotIndex) =>
          slotIndex === activeSlot
            ? {
                ...slot,
                creatures: slot.creatures.map((creature, creatureIndex) =>
                  creatureIndex === index
                    ? defaultCreature(`Spezies ${index + 1}`)
                    : creature,
                ),
              }
            : slot,
        ),
      );
    }
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
              creatures: slot.creatures.map((creature, creatureIndex) =>
                creatureIndex === activeCreature
                  ? { ...creature, equipped: { ...creature.equipped, [part.category]: part.id } }
                  : creature,
              ),
              progress: Math.max(
                slot.progress,
                4 + Object.keys(slot.creatures[activeCreature]?.equipped ?? {}).length * 3,
              ),
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

  function handleMapPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (activePointers.current.size === 2) {
      const points = [...activePointers.current.values()];
      pinchOrigin.current = {
        distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
        zoom: mapZoom,
      };
      dragOrigin.current = null;
      return;
    }
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: mapOffset.x,
      y: mapOffset.y,
    };
  }

  function handleMapPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (activePointers.current.has(event.pointerId)) {
      activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (pinchOrigin.current && activePointers.current.size >= 2) {
      const points = [...activePointers.current.values()];
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      setMapZoom(Math.min(1.8, Math.max(0.55, pinchOrigin.current.zoom * (distance / pinchOrigin.current.distance))));
      return;
    }
    if (!dragOrigin.current) return;
    setMapOffset({
      x: dragOrigin.current.x + event.clientX - dragOrigin.current.pointerX,
      y: dragOrigin.current.y + event.clientY - dragOrigin.current.pointerY,
    });
  }

  function handleMapPointerUp(event?: React.PointerEvent<HTMLDivElement>) {
    if (event) activePointers.current.delete(event.pointerId);
    if (activePointers.current.size < 2) pinchOrigin.current = null;
    if (activePointers.current.size === 0) dragOrigin.current = null;
  }

  function handleMapWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setMapZoom((zoom) => Math.min(1.8, Math.max(0.55, zoom - event.deltaY * 0.0015)));
  }

  function resetMapView() {
    setMapOffset({ x: 0, y: 0 });
    setMapZoom(1);
  }

  return (
    <main className="game-shell">
      <link rel="preload" as="image" href="/reference-lobby-empty.jpg" />
      <section className={`phone-frame ${deviceMode === "pc" ? "pc-mode" : ""}`} aria-label="2D Mobile God Game Prototype">
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
                      Fortschritt {slot.progress}% · {slot.creatures.filter((creature) => Object.keys(creature.equipped).length > 0).length}/3 Kreaturen
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
            <img
              className="reference-art"
              src="/reference-lobby-empty.jpg"
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
            />
            <div className="lobby-title">
              <span>EARTHFORM // 01</span>
              <strong>PRIMAL CORE ONLINE</strong>
              <i />
            </div>
            <div className="lobby-status">
              <span>WELT {String(activeSlot + 1).padStart(2, "0")}</span>
              <b>{current.progress}% EVOLUTION</b>
            </div>
            <div className="creature-stage">
              <CreatureSlots
                creatures={current.creatures}
                activeCreature={activeCreature}
                onChoose={chooseCreature}
              />
              <Creature equipped={currentCreature.equipped} onClick={() => setScreen("editor")} />
              <p>{currentCreature.name}</p>
            </div>
            <Hotbar setScreen={setScreen} />
          </section>
        )}

        {screen === "editor" && (
          <section className="panel-screen editor-screen">
            <TopBack label="Creature" onBack={() => setScreen("lobby")} />
            <div className="editor-preview">
              <div className="editor-stat-overlay">
                <span>CREATURE STATS</span>
                <StatBars totals={totals} />
              </div>
              <Creature equipped={currentCreature.equipped} />
            </div>
            <CreatureSlots
              creatures={current.creatures}
              activeCreature={activeCreature}
              onChoose={chooseCreature}
            />
            <div className="builder-heading">
              <div>
                <span>GENETIC LOADOUT</span>
                <strong>Körperteile wählen</strong>
              </div>
              <b>{Object.keys(currentCreature.equipped).length}/10</b>
            </div>
            <div className="builder-filter" aria-label="Körperteil-Kategorie">
              <button
                className={editorCategory === "Alle" ? "is-active" : ""}
                onClick={() => setEditorCategory("Alle")}
              >
                Alle
              </button>
              {categories.map((category) => (
                <button
                  className={editorCategory === category ? "is-active" : ""}
                  key={category}
                  onClick={() => setEditorCategory(category)}
                >
                  {categoryNames[category]}
                </button>
              ))}
            </div>
            {hoveredPart && (
              <div className="part-details" aria-live="polite">
                <div>
                  <span>DETAILS</span>
                  <strong>{hoveredPart.name}</strong>
                  <small>{hoveredPart.pack} · {categoryNames[hoveredPart.category]}</small>
                </div>
                <div className="part-details-stats">
                  {stats.map((stat) => (
                    <i key={stat}>
                      <b>{statShortNames[stat]}</b> {hoveredPart.stats[stat] >= 0 ? "+" : ""}{hoveredPart.stats[stat]}
                    </i>
                  ))}
                </div>
              </div>
            )}
            <div className="inventory-grid">
              {editorParts.map((part) => (
                  <button
                    className={`inventory-item ${
                      currentCreature.equipped[part.category] === part.id ? "is-equipped" : ""
                    }`}
                    key={part.id}
                    title={`${part.name}: ${partSummary(part)}`}
                    onMouseEnter={() => setHoveredPartId(part.id)}
                    onFocus={() => setHoveredPartId(part.id)}
                    onClick={() => equip(part)}
                  >
                    <PartIcon part={part} />
                    <span className="part-description">
                      <b>{part.name}</b>
                      <i>{part.pack} · {categoryNames[part.category]}</i>
                    </span>
                    <small className="part-stat-strip">
                      {stats.slice(0, 3).map((stat) => (
                        <i key={stat}>{statShortNames[stat]} {part.stats[stat] >= 0 ? "+" : ""}{part.stats[stat]}</i>
                      ))}
                    </small>
                  </button>
                ))}
              {editorParts.length === 0 && <div className="builder-empty">Noch kein Körperteil in dieser Kategorie freigeschaltet.</div>}
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
              {filteredParts.length === 0 && (
                <div className="shop-empty">
                  <strong>Alles aus diesem Filter ist schon im Inventar.</strong>
                  <span>Gekaufte Teile findest du im Creature-Editor.</span>
                </div>
              )}
              {filteredParts.map((part) => (
                <article className="shop-card" key={part.id}>
                  <div title={`${part.name}: ${partSummary(part)}`}>
                    <PartIcon part={part} />
                  </div>
                  <div>
                    <strong>{part.name}</strong>
                    <span>
                      {part.pack} · {part.category}
                    </span>
                    <small className="shop-stats">{partSummary(part)}</small>
                  </div>
                  <div className="buy-row">
                    <button onClick={() => buy(part, "coins")}>{part.coinCost} C</button>
                    <button onClick={() => buy(part, "gems")}>{part.gemCost} D</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {screen === "world" && (
          <section className="world-screen">
            <TopBack label="World" onBack={() => setScreen("lobby")} />
            <div
              className={`map ${dragOrigin.current ? "is-dragging" : ""}`}
              onPointerDown={handleMapPointerDown}
              onPointerMove={handleMapPointerMove}
              onPointerUp={handleMapPointerUp}
              onPointerCancel={handleMapPointerUp}
              onWheel={handleMapWheel}
            >
              <div
                className="map-pan-layer"
                style={{
                  transform: `translate(calc(-50% + ${mapOffset.x}px), calc(-50% + ${mapOffset.y}px)) scale(${mapZoom})`,
                }}
              >
                <div className="world-ground" />
                <div className="world-river" />
                <div className="world-path" />
                {Array.from({ length: 96 }, (_, index) => {
                  const kinds = ["tree", "tree", "pine", "bush", "rock", "flower", "tree", "shrine"];
                  const kind = kinds[index % kinds.length];
                  const left = (index * 173 + (index % 5) * 47) % 1700;
                  const top = (index * 97 + (index % 7) * 31) % 1040;
                  const scale = 0.72 + (index % 5) * 0.1;
                  return (
                    <span
                      className={`world-node ${kind}`}
                      key={index}
                      style={{ left, top, "--node-scale": scale } as React.CSSProperties}
                    >
                      {(kind === "tree" || kind === "pine" || kind === "bush") && <><i /><b /><em /></>}
                      {kind === "shrine" && <><i /><b /></>}
                    </span>
                  );
                })}
                <Creature equipped={currentCreature.equipped} compact />
                <span className="map-creature one" />
                <span className="map-creature two" />
              </div>
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
            <div className="mode-picker">
              <span>Steuerung</span>
              <button
                className={deviceMode === "mobile" ? "is-selected" : ""}
                onClick={() => setDeviceMode("mobile")}
              >
                Mobile
              </button>
              <button
                className={deviceMode === "pc" ? "is-selected" : ""}
                onClick={() => setDeviceMode("pc")}
              >
                PC · WASD
              </button>
            </div>
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
                    setActiveCreature(0);
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
