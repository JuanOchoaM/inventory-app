import React, { useState, useRef } from "react";
import "./App.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Button from '@mui/material/Button';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import FolderIcon from '@mui/icons-material/Folder';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const UNIT_CATEGORIES = {
  Count: ["whole", "sticks", "buns", "container"],
  Volume: ["qt", "cup", "oz"],
  Bulk: ["case", "flat", "sheet", "lbs"]
};

const UNITS = Object.values(UNIT_CATEGORIES).flat();
const EXPIRABLE_ITEMS = ["Whole milk", "½ & ½", "Oatmilk", "Heavy Cream"];

const recipes = {
  racer: {
    name: "Racer",
    baseYield: { amount: 1, unit: "qt" },
    ingredients: [
      { name: "Ketchup", amount: 447, unit: "g" },
      { name: "Mayo", amount: 375, unit: "g" },
      { name: "Spicy Brown Mustard", amount: 96, unit: "g" },
      { name: "Sriracha", amount: 50, unit: "g" },
      { name: "Ground Black Pepper", amount: 0.125, unit: "tbsp" }
    ]
  },
  crema: {
    name: "Crema",
    baseYield: { amount: 1, unit: "qt" },
    ingredients: [
      { name: "Sour Cream", amount: 638, unit: "g" },
      { name: "Jalepeños", amount: 200, unit: "g" },
      { name: "Cilantro", amount: 108, unit: "g" },
      { name: "~ Limes for Zest/Juice", amount: 3, unit: "whole" },
      { name: "Zest", amount: 9, unit: "g" },
      { name: "Juice", amount: 122, unit: "g" },
      { name: "Garlic", amount: 29, unit: "g" },
      { name: "Salt", amount: 7, unit: "g" },
    ]
  },
  dilla: {
    name: "Dilla",
    baseYield: { amount: 1, unit: "qt" },
    ingredients: [
      { name: "Sour Cream", amount: 368, unit: "g" },
      { name: "Mayo", amount: 323, unit: "g" },
      { name: "Pickled Jalepeños", amount: 97, unit: "g" },
      { name: "Pickled Jalepeño Juice", amount: 137, unit: "g" },
      { name: "Dilla Spice Blend", amount: 65, unit: "g" },
    ]
  },
  dillaspiceblend: {
    name: "Dilla Spice Blend",
    baseYield: { amount: 228, unit: "g" },
    note: "Whisk all ingredients together thoroughly. 1x batch yields spice blend (228 g) for one 3.5 QT batch of Dilla sauce. Can be stored in an airtight container for several months.",
    ingredients: [
      { name: "Paprika", amount: 52, unit: "g" },
      { name: "Cumin", amount: 49, unit: "g" },
      { name: "Garlic Powder", amount: 34, unit: "g" },
      { name: "Onion Powder", amount: 44, unit: "g" },
      { name: "Kosher Salt", amount: 36, unit: "g" },
      { name: "Chili Powder", amount: 13, unit: "g" },
    ]
  }
};

const INVENTORY_GROUPS = [
  {
    title: "Meat & Breads",
    items: [
      { name: "Chorizo" }, { name: "Hot Dogs" }, { name: "Chx Sausage" },
      { name: "GF Buns" }, { name: "Buns" }, { name: "Hot Dog Buns" },
      { name: "Biscuits" }, { name: "Racer" }, { name: "Veggie patties" },
      { name: "Bacon" }, { name: "Sausage" }, { name: "Burrito Torts" },
      { name: "Taco Torts" }, { name: "Corn Torts" }
    ]
  },
  {
    title: "Produce",
    items: [
      { name: "Tomatoes" }, { name: "Lettuce" }, { name: "Red Onion" },
      { name: "Yellow Onion" }, { name: "Peppers" }, { name: "Whole Eggs" },
      { name: "Avos" }, { name: "Cilantro" }, { name: "Limes" }, { name: "Plantain" }
    ]
  },
  {
    title: "Dairy & Misc",
    items: [
      { name: "Crm Chz" }, { name: "Sour cream" }, { name: "Unsalted Butter" },
      { name: "Jalps" }, { name: "Hash" }, { name: "Fries" }, { name: "Cheddar" },
      { name: "PJ" }, { name: "Shreddy" }, { name: "Oat Milk" }, { name: "1/2+1/2" },
      { name: "Whole milk" }, { name: "Clarified Butter" }, { name: "Fryer Oil" },
      { name: "Season All" }, { name: "Salt" }, { name: "Mayo" },
      { name: "Yellow Mustard" }, { name: "Ketchup packets" }, { name: "Ketchup" },
      { name: "Tapatio" }, { name: "Sriracha" }
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
  const [view, setView] = useState("inventory");
  const [tab, setTab] = useState("FoodTruck");
  const [navValue, setNavValue] = useState("foodtruck");
  const [inventoryData, setInventoryData] = useState(buildBlankInventory());
  const [modalItem, setModalItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [inputQty, setInputQty] = useState("");
  const [inputUnit, setInputUnit] = useState(UNITS[0]);
  const [unitCategory, setUnitCategory] = useState("Volume");
  const [customUnit, setCustomUnit] = useState("");
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [doneOutput, setDoneOutput] = useState("");
  const inventoryRef = useRef(null);
  const currentInventory = inventoryData[tab];

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleNavChange = (event, newValue) => {
    setNavValue(newValue);
    if (newValue === "foodtruck") { setView("inventory"); handleTabChange("FoodTruck"); }
    if (newValue === "cr") { setView("inventory"); handleTabChange("CR"); }
    if (newValue === "calculator") { setView("calculator"); }
  };

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleGridTap = (item) => {
    setModalItem(item);
    setConfirmModal(true);
    setInputQty("");
    setInputUnit(UNIT_CATEGORIES[unitCategory][0]);
    setCustomUnit("");
    setExpiryEnabled(false);
    setExpiryDate("");
  };

  const handleSave = () => {
    const qty = parseFloat(inputQty);
    if (isNaN(qty)) return;
    const finalUnit = customUnit || inputUnit;
    const tabInventory = inventoryData[tab];
    const item = tabInventory[modalItem];
    const newLogs = [
      ...item.logs,
      { qty, unit: finalUnit, expiry: expiryEnabled ? expiryDate : null, date: Date.now() }
    ];
    setInventoryData({
      ...inventoryData,
      [tab]: { ...tabInventory, [modalItem]: { logs: newLogs, undone: [] } }
    });
    setModalItem(null);
    setConfirmModal(false);
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
            .map(([u, q]) => `${q} ${u}`).join(" + ");
          output += `${item.name}: ${unitsStr}\n`;
        }
      });
    });
    return output;
  };

  const handleDone = () => {
    setDoneOutput(generateOutput());
    alert("Done! Output ready.");
  };

  const copyToClipboard = () => navigator.clipboard.writeText(doneOutput);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (inventoryRef.current) inventoryRef.current.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      <div className="top-bar">
        <img
          className="logo"
          src="https://images.squarespace-cdn.com/content/v1/62e97bd57cf7b479ef527b84/4e4b9191-5560-4514-bbd7-82206ecdbefd/CafeRacer-Lettering-WO-coffeedonuts_02.png?format=1500w"
          alt="Logo"
        />
        <h2 className="tab-title">
          {view === "calculator" ? "Calculator" : `${tab} Inventory`}
        </h2>
        <div className="top-bar-grid">
          <Button
            id="demo-positioned-button"
            aria-controls={open ? "demo-positioned-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            variant="contained"
          >
            Dashboard
          </Button>

          <Menu
            id="demo-positioned-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            {view === "inventory" ? [
              <MenuItem key="done" onClick={() => { handleDone(); handleClose(); }}>Done</MenuItem>,
              <MenuItem key="clear" onClick={() => { clearAll(); handleClose(); }}>Clear Inventory</MenuItem>
            ] : [
              <MenuItem key="toggle" onClick={() => { handleClose(); }}>Toggle View</MenuItem>,
              <MenuItem key="test" onClick={handleClose}>Test</MenuItem>
            ]}
          </Menu>
        </div>
      </div>

      {view === "inventory" && (
        <div className="tab-inventory" ref={inventoryRef}>
          <div className="inventory-grid">
            {INVENTORY_GROUPS.map(group => (
              <React.Fragment key={group.title}>
                <div className="section-title">{group.title}</div>
                {group.items.map(item => {
                  const logs = currentInventory[item.name].logs;
                  const display = Object.entries(
                    logs.reduce((m, l) => { m[l.unit] = (m[l.unit] || 0) + l.qty; return m; }, {})
                  ).map(([u, q]) => `${q} ${u}`).join(" + ");
                  return (
                    <div
                      key={item.name}
                      className={`inventory-item ${logs.length === 0 ? "dim" : ""}`}
                      onClick={() => handleGridTap(item.name)}
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
      )}

      {view === "calculator" && <Calculator setView={setView} />}

      {/* Modal */}
      {confirmModal && modalItem && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit {modalItem}</h3>
            <input
              type="number"
              value={inputQty}
              onChange={e => setInputQty(e.target.value)}
                            className="modal-select-qty"

            />
            <select
              value={unitCategory}
                            className="modal-select"

              onChange={e => { setUnitCategory(e.target.value); setInputUnit(UNIT_CATEGORIES[e.target.value][0]); }}
            >
              {Object.keys(UNIT_CATEGORIES).map(cat => <option key={cat}>{cat}</option>)}
            </select>
            <select
              value={inputUnit}
              className="modal-select"
              onChange={e => setInputUnit(e.target.value)}
            >
              {UNIT_CATEGORIES[unitCategory].map(u => <option key={u}>{u}</option>)}
            </select>
            <input
                          className="modal-select"

              placeholder="Custom unit"
              value={customUnit}
              onChange={e => setCustomUnit(e.target.value)}
            />

            {EXPIRABLE_ITEMS.includes(modalItem) && (
              <>
                <button onClick={() => setExpiryEnabled(!expiryEnabled)}>Expire</button>
                {expiryEnabled && (
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                  />
                )}
              </>
            )}

            {currentInventory[modalItem].logs.length > 0 && (
              <div style={{ fontSize: 12, maxHeight: 120, overflowY: "auto", marginBottom: 10 }}>
                <strong>History:</strong>
                <ul>
                  {currentInventory[modalItem].logs.map((log, idx) => (
                    <li key={idx}>{log.qty} {log.unit}{log.expiry && ` (exp ${log.expiry})`}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-buttons">
              <button onClick={() => { setConfirmModal(false); setModalItem(null); }}>Cancel</button>
              <button onClick={handleUndo}>Undo</button>
              <button onClick={handleRedo}>Redo</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {doneOutput && (
        <div style={{ padding: 10 }}>
          <pre className="output-container">{doneOutput}</pre>
          <button style={{ marginTop: 10 }} onClick={copyToClipboard}>Copy Output</button>
        </div>
      )}

      <div className="bottom-tabs">
        <button className={tab === "FoodTruck" ? "active" : ""} onClick={() => handleTabChange("FoodTruck")}>Food Truck</button>
        <button className={tab === "CR" ? "active" : ""} onClick={() => handleTabChange("CR")}>CR</button>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", background: "white", borderTop: "1px solid #ccc", zIndex: 1000 }}>
        <BottomNavigation sx={{ width: 500 }} value={navValue} onChange={handleNavChange}>
          <BottomNavigationAction label="Food Truck" value="foodtruck" icon={<RestoreIcon />} />
          <BottomNavigationAction label="CR" value="cr" icon={<FavoriteIcon />} />
          <BottomNavigationAction label="Calculator" value="calculator" icon={<FolderIcon />} />
        </BottomNavigation>
      </div>
    </div>
  );
}

function Calculator({ setView }) {
  const [expanded, setExpanded] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [qty, setQty] = useState({});

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", backgroundColor: "#ffc844", paddingBottom: 100 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setView("inventory")}>Back</button>
        <button onClick={() => setShowAll(!showAll)}>{showAll ? "Minimal View" : "Toggle All"}</button>
      </div>
      {Object.entries(recipes).map(([name, recipe]) => {
        const isOpen = showAll || expanded === name;
        const recipeQty = qty[name] ?? recipe.baseYield.amount;
        const multiplier = recipeQty / recipe.baseYield.amount;
        return (
          <div key={name} style={{ marginBottom: 20, borderBottom: "1px solid #333", paddingBottom: 10 }}>
            <div style={{ fontSize: 18, cursor: "pointer" }} onClick={() => setExpanded(expanded === name ? null : name)}>
              {recipe.name}
            </div>
            {isOpen && (
              <div className="recipe-details" style={{ marginTop: 10 }}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={qty[name] ?? ""}
                  onChange={e => setQty({ ...qty, [name]: Number(e.target.value) })}
                  style={{ marginBottom: 10 }}
                />
                {recipe.ingredients.map((ing, i) => (
                  <div key={i}>{ing.name} — {(ing.amount * multiplier).toFixed(2)} {ing.unit}</div>
                ))}
                {recipe.note && <div style={{ marginTop: 10, fontStyle: "italic", color: "#555" }}>{recipe.note}</div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}