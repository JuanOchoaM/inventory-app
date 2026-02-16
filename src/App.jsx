import { useState, useEffect } from "react";

// Units for logging inventory
const UNITS = ["case", "sheets", "heads", "lbs", "qts", "packs", "dozen", "G", "st", "container"];

// Grouped items (ordered for inventory grid)
const GROUPED_ITEMS = [
  // US Foods / meats & breads
  "Chorizo",
  "GF Buns",
  "Buns",
  "Biscuits",
  "Hot Dogs",
  "Hot Dog Buns",
  "Racer",
  "Veggie patties",

  // Produce
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

  // Dairy / misc
  "Crm Chz",
  "Sour cream",
  "Unsalted Butter",
  "Jalps"
];

function App() {
  const [tab, setTab] = useState("FoodTruck");

  const [inventoryData, setInventoryData] = useState(() => {
    const saved = localStorage.getItem("inventoryData");
    if (saved) return JSON.parse(saved);
    return {
      FoodTruck: GROUPED_ITEMS.reduce((acc, item) => { acc[item] = { logs: [], undone: [] }; return acc; }, {}),
      CR: GROUPED_ITEMS.reduce((acc, item) => { acc[item] = { logs: [], undone: [] }; return acc; }, {})
    };
  });

  const [modalItem, setModalItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [inputQty, setInputQty] = useState("");
  const [inputUnit, setInputUnit] = useState(UNITS[0]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [doneOutput, setDoneOutput] = useState(""); // store output after Done

  useEffect(() => {
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
  }, [inventoryData]);

  // Tap logic: first tap highlight, second tap opens modal
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

  // Save new log
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

  // Undo last log
  const handleUndo = () => {
    if (!modalItem) return;
    const item = inventoryData[tab][modalItem];
    if (item.logs.length === 0) return;

    const newLogs = [...item.logs];
    const undoneEntry = newLogs.pop();

    setInventoryData({
      ...inventoryData,
      [tab]: { ...inventoryData[tab], [modalItem]: { logs: newLogs, undone: [...item.undone, undoneEntry] } }
    });
  };

  // Redo last undone
  const handleRedo = () => {
    if (!modalItem) return;
    const item = inventoryData[tab][modalItem];
    if (item.undone.length === 0) return;

    const newUndone = [...item.undone];
    const redoEntry = newUndone.pop();
    const newLogs = [...item.logs, redoEntry];

    setInventoryData({
      ...inventoryData,
      [tab]: { ...inventoryData[tab], [modalItem]: { logs: newLogs, undone: newUndone } }
    });
  };

  const clearAll = () => {
    if (!window.confirm("Are you sure you want to clear all inventory?")) return;
    setInventoryData({
      FoodTruck: GROUPED_ITEMS.reduce((acc, item) => { acc[item] = { logs: [], undone: [] }; return acc; }, {}),
      CR: GROUPED_ITEMS.reduce((acc, item) => { acc[item] = { logs: [], undone: [] }; return acc; }, {})
    });
    setDoneOutput("");
  };

  // Generate formatted output
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
          .map(([u,q]) => `${q} ${u}`)
          .join(" + ");
        output += `${item}:  ${unitsStr}\n`;
      }
    });

    return output;
  };

  const handleDone = () => {
    const output = generateOutput();
    setDoneOutput(output);
    alert("Done! Output generated below.");
  };

  const copyToClipboard = () => {
    if (!doneOutput) return;
    navigator.clipboard.writeText(doneOutput)
      .then(() => alert("Copied inventory to clipboard!"))
      .catch(() => alert("Copy failed"));
  };

  const currentInventory = inventoryData[tab];

  return (
    <div style={{ fontFamily: "sans-serif", paddingBottom: 60 }}>
      {/* Top Bar */}
      <div style={{ position: "sticky", top: 0, background: "#fff", padding: 10, borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", zIndex: 50 }}>
        <h2>{tab} Inventory</h2>
        <div>
          <button onClick={handleDone} style={{ marginRight: 10 }}>Done</button>
          <button onClick={clearAll} style={{ color: "red" }}>Clear All</button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, padding: 10 }}>
        {GROUPED_ITEMS.map(item => {
          const logs = currentInventory[item].logs;
          const displayText = Object.entries(logs.reduce((map,l)=>{map[l.unit]=(map[l.unit]||0)+l.qty;return map;},{}))
            .map(([u,q])=>`${q} ${u}`).join(" + ");

          return (
            <div
              key={item}
              onClick={() => handleGridTap(item)}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 10,
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: selectedItem===item?"#b2ebf2":"#f9f9f9",
                transition: "all 0.2s"
              }}
            >
              {item}
              <div style={{ fontSize: 12, color: "#555" }}>{displayText}</div>
            </div>
          )
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && modalItem && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
          overflowY: "auto", WebkitOverflowScrolling: "touch"
        }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10, width: 300 }}>
            <h3>Edit {modalItem}?</h3>
            <div style={{ marginBottom: 10 }}>
              <label>Qty:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="2000"
                pattern="[0-9]*"
                inputMode="decimal"
                value={inputQty}
                onChange={(e)=>setInputQty(e.target.value)}
                style={{ width: "100%", fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Unit:</label>
              <select value={inputUnit} onChange={(e)=>setInputUnit(e.target.value)} style={{ width: "100%", fontSize: 16 }}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <button type="button" onClick={()=>{setConfirmModal(false); setModalItem(null);}}>No</button>
              <div>
                <button type="button" onClick={handleUndo} style={{ marginRight: 5 }}>Undo</button>
                <button type="button" onClick={handleRedo} style={{ marginRight: 5 }}>Redo</button>
                <button type="button" onClick={handleSave}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output & Copy button only after Done */}
      {doneOutput && (
        <div style={{ padding: 10 }}>
          <pre style={{ backgroundColor: "#f4f4f4", padding: 10, whiteSpace: "pre-wrap" }}>{doneOutput}</pre>
          <button onClick={copyToClipboard}>Copy Output</button>
        </div>
      )}

      {/* Bottom Tabs */}
      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", display: "flex", borderTop: "1px solid #ccc", background: "#fff" }}>
        <button onClick={()=>setTab("FoodTruck")} style={{ flex:1, padding:10, fontWeight: tab==="FoodTruck"?"bold":"normal" }}>Food Truck</button>
        <button onClick={()=>setTab("CR")} style={{ flex:1, padding:10, fontWeight: tab==="CR"?"bold":"normal" }}>CR</button>
      </div>
    </div>
  );
}

export default App;
