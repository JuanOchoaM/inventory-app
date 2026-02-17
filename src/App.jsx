import React, { useState, useRef } from "react";
import "./App.css";

const UNITS = ["case", "sheets", "heads", "lbs", "qts", "packs", "dozen", "G", "st", "container"];

const INVENTORY_GROUPS = [
  {
    title: "Meat & Breads",
    items: [
      { name: "Chorizo" },
      { name: "Hot Dogs" },
      { name: "Chx Sausage" },
      { name: "GF Buns" },
      { name: "Buns" },
      { name: "Hot Dog Buns" },
      { name: "Biscuits" },
      { name: "Racer" },
      { name: "Veggie patties" }
    ]
  },
  {
    title: "Produce",
    items: [
      { name: "Tomatoes" },
      { name: "Lettuce" },
      { name: "Red Onion" },
      { name: "Yellow Onion" },
      { name: "Peppers" },
      { name: "Whole Eggs" },
      { name: "Avos" },
      { name: "Cilantro" },
      { name: "Limes" },
      { name: "Plantain" }
    ]
  },
  {
    title: "Dairy & Misc",
    items: [
      { name: "Crm Chz" },
      { name: "Sour cream" },
      { name: "Unsalted Butter" },
      { name: "Jalps" }
    ]
  }
];

const buildBlankInventory = () => {
  const tabs = ["FoodTruck", "CR"];
  const inventory = {};
  tabs.forEach(tab => {
    inventory[tab] = {};
    INVENTORY_GROUPS.forEach(group => {
      group.items.forEach(item => {
        inventory[tab][item.name] = { logs: [], undone: [] };
      });
    });
  });
  return inventory;
};

export default function App() {
  
  const [tab, setTab] = useState("FoodTruck");
  const [inventoryData, setInventoryData] = useState(buildBlankInventory());
  const [modalItem, setModalItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [inputQty, setInputQty] = useState("");
  const [inputUnit, setInputUnit] = useState(UNITS[0]);
  const [doneOutput, setDoneOutput] = useState("");

  const inventoryRef = useRef(null);
  const currentInventory = inventoryData[tab];

  // ---------- Single Tap Modal ----------
  const handleGridTap = (item) => {
    setModalItem(item);
    setConfirmModal(true);
    setInputQty("");
    setInputUnit(UNITS[0]);
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
    INVENTORY_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if (combined[item.name]) {
          const unitsStr = Object.entries(combined[item.name])
            .map(([u,q])=>`${q} ${u}`)
            .join(" + ");
          output += `${item.name}:  ${unitsStr}\n`;
        }
      });
    });
    return output;
  };

  const handleDone = () => {
    setDoneOutput(generateOutput());
    alert("Done! Output ready.");
  };

  const copyToClipboard = () => {
    if (!doneOutput) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(doneOutput).then(()=>alert("Copied!"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = doneOutput;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Copied!");
    }
  };

  // ---------- Tab Change with scroll-to-top ----------
const handleTabChange = (newTab) => {
  setTab(newTab);

  // Scroll the inventory container
  if (inventoryRef.current) {
    inventoryRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Scroll window to top (accounts for iPhone nav bar)
  window.scrollTo({ top: 0, behavior: "smooth" });
};


  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="top-bar">
        <img
          className="logo"
          src="https://images.squarespace-cdn.com/content/v1/62e97bd57cf7b479ef527b84/4e4b9191-5560-4514-bbd7-82206ecdbefd/CafeRacer-Lettering-WO-coffeedonuts_02.png?format=1500w"
          alt="Logo"
        />
        <div className="top-bar-grid">
          <button onClick={handleDone}>Done</button>
          <button onClick={clearAll}>Clear All</button>
        </div>
      </div>

      {/* Inventory */}
      <div className="tab-inventory" ref={inventoryRef}>
        <h2 className="tab-title">{tab} Inventory</h2>
        <div className="inventory-grid">
          {INVENTORY_GROUPS.map(group => (
            <React.Fragment key={group.title}>
              <div className="section-title">{group.title}</div>
              {group.items.map(item => {
                const logs = currentInventory[item.name].logs;
                const display = Object.entries(
                  logs.reduce((m,l)=>{ m[l.unit]=(m[l.unit]||0)+l.qty; return m; }, {})
                ).map(([u,q])=>`${q} ${u}`).join(" + ");

                return (
                  <div
                    key={item.name}
                    className="inventory-item"
                    onClick={()=>handleGridTap(item.name)}
                  >
                    {item.name}
                    {display && <div className="item-logs highlight-count">{display}</div>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal */}
      {confirmModal && modalItem && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit {modalItem}</h3>
            <input
  type="number"
  inputMode="decimal"    // ensures numeric keyboard with decimal
  pattern="[0-9]*"      // hints numeric input
  step="0.01"
  value={inputQty}
  onChange={e => setInputQty(e.target.value)}
  className="modal-input"
/>
            <select value={inputUnit} onChange={e=>setInputUnit(e.target.value)} className="modal-select">
              {UNITS.map(u=><option key={u}>{u}</option>)}
            </select>
            <div className="modal-buttons">
              <button onClick={()=>{setConfirmModal(false); setModalItem(null)}}>Cancel</button>
              <button onClick={handleUndo}>Undo</button>
              <button onClick={handleRedo}>Redo</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Output */}
      {doneOutput && (
        <div style={{padding:10}}>
          <pre className="output-container">{doneOutput}</pre>
          <button style={{marginTop:10, padding: "10px 15px", marginBottom:100}} onClick={copyToClipboard}>Copy Output</button>
        </div>
      )}

      {/* Bottom Tabs */}
      <div className="bottom-tabs">
        <button className={tab==="FoodTruck"?"active":""} onClick={()=>handleTabChange("FoodTruck")}>Food Truck</button>
        <button className={tab==="CR"?"active":""} onClick={()=>handleTabChange("CR")}>CR</button>
      </div>
    </div>
  );
}
