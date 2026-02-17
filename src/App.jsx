import { useState, useEffect } from "react";

// Units
const UNITS = ["case", "sheets", "heads", "lbs", "qts", "packs", "dozen", "G", "st", "container"];

// Item order
const GROUPED_ITEMS = [
  "TEST",
  "GF Buns",
  "Buns",
  "Biscuits",
  "Hot Dogs",
  "Hot Dog Buns",
  "Racer",
  "Veggie patties",
  "Tomatoes",
  "Lettuce",
  "Red Onion",
  "Yellow Onion",
  "Peppers",
  "Whole Eggs",
  "Avos",
  "Cilantro",
  "Limes",
  "Plantain",
  "Crm Chz",
  "Sour cream",
  "Unsalted Butter",
  "Jalps"
];

// Build blank inventory safely
const buildBlankInventory = () => ({
  FoodTruck: GROUPED_ITEMS.reduce((acc, item) => { acc[item] = { logs: [], undone: [] }; return acc; }, {}),
  CR: GROUPED_ITEMS.reduce((acc, item) => { acc[item] = { logs: [], undone: [] }; return acc; }, {})
});

export default function App() {
  const [tab, setTab] = useState("FoodTruck");

  // Always start safe
  const [inventoryData, setInventoryData] = useState(buildBlankInventory);
  const [loaded, setLoaded] = useState(false);

  // Safe load AFTER mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inventoryData");
      if (saved) {
        const parsed = JSON.parse(saved);

        // Ensure all keys exist (prevents blank grid if items changed)
        const safe = buildBlankInventory();
        Object.keys(parsed || {}).forEach(tabKey => {
          Object.keys(parsed[tabKey] || {}).forEach(item => {
            if (safe[tabKey] && safe[tabKey][item]) {
              safe[tabKey][item] = parsed[tabKey][item];
            }
          });
        });

        setInventoryData(safe);
      }
    } catch (e) {
      console.warn("Storage load failed, using blank inventory");
    }

    setLoaded(true);
  }, []);

  // Save only AFTER load completed
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
    } catch (e) {}
  }, [inventoryData, loaded]);

  const [modalItem, setModalItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [inputQty, setInputQty] = useState("");
  const [inputUnit, setInputUnit] = useState(UNITS[0]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [doneOutput, setDoneOutput] = useState("");

  // Double tap logic
  const handleGridTap = (item) => {
    if (selectedItem === item) {
      setConfirmModal(true);
      setModalItem(item);
      setInputQty("");
      setInputUnit(UNITS[0]);
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
      setTimeout(() => setSelectedItem(null), 2000);
    }
  };

  const handleSave = () => {
    const qty = parseFloat(inputQty);
    if (isNaN(qty)) return;

    const tabInventory = inventoryData[tab];
    const item = tabInventory[modalItem];

    const newLogs = [...item.logs, { qty, unit: inputUnit }];

    setInventoryData({
      ...inventoryData,
      [tab]: { ...tabInventory, [modalItem]: { logs: newLogs, undone: [] } }
    });

    setModalItem(null);
    setConfirmModal(false);
    setInputQty("");
  };

  const handleUndo = () => {
    if (!modalItem) return;
    const item = inventoryData[tab][modalItem];
    if (!item.logs.length) return;

    const newLogs = [...item.logs];
    const undoneEntry = newLogs.pop();

    setInventoryData({
      ...inventoryData,
      [tab]: {
        ...inventoryData[tab],
        [modalItem]: { logs: newLogs, undone: [...item.undone, undoneEntry] }
      }
    });
  };

  const handleRedo = () => {
    if (!modalItem) return;
    const item = inventoryData[tab][modalItem];
    if (!item.undone.length) return;

    const newUndone = [...item.undone];
    const redoEntry = newUndone.pop();

    setInventoryData({
      ...inventoryData,
      [tab]: {
        ...inventoryData[tab],
        [modalItem]: { logs: [...item.logs, redoEntry], undone: newUndone }
      }
    });
  };

  const clearAll = () => {
    if (!window.confirm("Clear ALL inventory?")) return;
    setInventoryData(buildBlankInventory());
    setDoneOutput("");
  };

  const generateOutput = () => {
    const today = new Date().toLocaleDateString();
    let output = `Inventory ${today}\n\nUS Foods:\n`;

    const combined = {};

    Object.values(inventoryData).forEach(tabData => {
      Object.entries(tabData).forEach(([name, val]) => {
        val.logs.forEach(log => {
          if (!combined[name]) combined[name] = {};
          combined[name][log.unit] = (combined[name][log.unit] || 0) + log.qty;
        });
      });
    });

    GROUPED_ITEMS.forEach(item => {
      if (combined[item]) {
        const unitsStr = Object.entries(combined[item])
          .map(([u, q]) => `${q} ${u}`)
          .join(" + ");
        output += `${item}:  ${unitsStr}\n`;
      }
    });

    return output;
  };

  const handleDone = () => {
    setDoneOutput(generateOutput());
    alert("Done! Output ready.");
  };

  const fallbackCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = doneOutput;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Copied!");
  };

  const copyToClipboard = () => {
    if (!doneOutput) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(doneOutput).then(() => alert("Copied!"));
    } else {
      fallbackCopy();
    }
  };

  const currentInventory = inventoryData[tab];

  if (!loaded) {
    return <div style={{ padding: 40 }}>Loading inventory...</div>;
  }

  return (
    <div style={{ fontFamily: "sans-serif", paddingBottom: 70 }}>

      {/* Top Bar */}
      <div style={{ position: "sticky", top: 0, background: "#fff", padding: 10, borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", zIndex: 50 }}>
        <h2>{tab} Inventory</h2>
        <div>
          <button onClick={handleDone} style={{ marginRight: 10 }}>Done</button>
          <button onClick={clearAll} style={{ color: "red" }}>Clear All</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10, padding: 10 }}>
        {GROUPED_ITEMS.map(item => {
          const logs = currentInventory[item].logs;
          const display = Object.entries(
            logs.reduce((m, l) => { m[l.unit] = (m[l.unit] || 0) + l.qty; return m; }, {})
          ).map(([u, q]) => `${q} ${u}`).join(" + ");

          return (
            <div
              key={item}
              onClick={() => handleGridTap(item)}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 10,
                textAlign: "center",
                background: selectedItem === item ? "#b2ebf2" : "#f9f9f9"
              }}
            >
              {item}
              <div style={{ fontSize: 12 }}>{display}</div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {confirmModal && modalItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10, width: 300 }}>
            <h3>Edit {modalItem}</h3>

            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              pattern="[0-9]*"
              value={inputQty}
              onChange={(e) => setInputQty(e.target.value)}
              style={{ width: "100%", fontSize: 16, marginBottom: 10 }}
            />

            <select value={inputUnit} onChange={(e) => setInputUnit(e.target.value)} style={{ width: "100%", fontSize: 16, marginBottom: 10 }}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setConfirmModal(false); setModalItem(null); }}>Cancel</button>
              <div>
                <button onClick={handleUndo}>Undo</button>
                <button onClick={handleRedo}>Redo</button>
                <button onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output */}
      {doneOutput && (
        <div style={{ padding: 10 }}>
          <pre style={{ background: "#f4f4f4", padding: 10 }}>{doneOutput}</pre>
          <button onClick={copyToClipboard}>Copy Output</button>
        </div>
      )}

      {/* Bottom Tabs */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", borderTop: "1px solid #ccc", background: "#fff" }}>
        <button style={{ flex: 1, padding: 12, fontWeight: tab === "FoodTruck" ? "bold" : "normal" }} onClick={() => setTab("FoodTruck")}>Food Truck</button>
        <button style={{ flex: 1, padding: 12, fontWeight: tab === "CR" ? "bold" : "normal" }} onClick={() => setTab("CR")}>CR</button>
      </div>

    </div>
  );
}