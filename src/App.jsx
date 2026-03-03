import React, { useState, useRef } from "react";
import "./App.css";
import foodtruckIcon from './assets/foodtruck.svg';
import crIcon from './assets/caferacersvg.svg';
import crlogoIcon from './assets/crlogosvg.svg';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { Menu, MenuItem, Box } from "@mui/material";



import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Radio, TablePagination, TextField
} from "@mui/material";

/* -------------------- STORAGE -------------------- */

const STORAGE_KEY = "inventory_v1";
const STORAGE_VERSION = 1;
/* -------------------- UNITS -------------------- */

const UNIT_CATEGORIES = {
  Count: ["whole", "sticks", "buns", "container"],
  Volume: ["qt", "cup", "oz"],
  Bulk: ["case", "flat", "sheet", "lbs"]
};

const UNITS = Object.values(UNIT_CATEGORIES).flat();

const EXPIRABLE_ITEMS = [
  "Whole milk",
  "½ & ½",
  "Oatmilk",
  "Heavy Cream"
];


/* -------------------- RECIPES -------------------- */

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
      { name: "Salt", amount: 7, unit: "g" }
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
      { name: "Dilla Spice Blend", amount: 65, unit: "g" }
    ]
  },

  dillaspiceblend: {
    name: "Dilla Spice Blend",
    baseYield: { amount: 228, unit: "g" },
    note:
      "Whisk all ingredients together thoroughly. 1x batch yields spice blend (228 g) for one 3.5 QT batch of Dilla sauce.",
    ingredients: [
      { name: "Paprika", amount: 52, unit: "g" },
      { name: "Cumin", amount: 49, unit: "g" },
      { name: "Garlic Powder", amount: 34, unit: "g" },
      { name: "Onion Powder", amount: 44, unit: "g" },
      { name: "Kosher Salt", amount: 36, unit: "g" },
      { name: "Chili Powder", amount: 13, unit: "g" }
    ]
  }
};


/* -------------------- INVENTORY -------------------- */

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


/* -------------------- BUILD INVENTORY -------------------- */

const buildBlankInventory = () => {

  const tabs = ["FoodTruck", "CR"];

  const inventory = {};

  tabs.forEach(tab => {

    inventory[tab] = {};

    INVENTORY_GROUPS.forEach(group => {

      group.items.forEach(item => {

        inventory[tab][item.name] = {
          logs: [],
          undone: []
        };

      });

    });

  });

  return inventory;

};

function loadInventorySafe() {

  try {

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildBlankInventory();

    const parsed = JSON.parse(raw);

    if (!parsed.version || parsed.version !== STORAGE_VERSION) {
      return buildBlankInventory();
    }

    const blank = buildBlankInventory();

    // merge so new items added in code don't break storage
    Object.keys(blank).forEach(tab => {

      Object.keys(blank[tab]).forEach(item => {

        if (parsed.data?.[tab]?.[item]) {
          blank[tab][item] = parsed.data[tab][item];
        }

      });

    });

    return blank;

  } catch (err) {

    console.warn("Inventory storage failed, resetting", err);
    return buildBlankInventory();

  }

}
function saveInventorySafe(data) {

  try {

    const payload = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  } catch (err) {

    console.warn("Inventory save failed", err);

  }

}

/* =========================================================
APP
========================================================= */

export default function App() {

  const [view, setView] = useState("inventory");
  const [tab, setTab] = useState("FoodTruck");
  const [navValue, setNavValue] = useState("foodtruck");

  //const [inventoryData, setInventoryData] = useState(buildBlankInventory());
  const [inventoryData, setInventoryData] = useState(() => loadInventorySafe());
  React.useEffect(() => {

  saveInventorySafe(inventoryData);

}, [inventoryData]);

const [snackbarOpen, setSnackbarOpen] = useState(false);
const [error, setError] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
const [clearDialogOpen, setClearDialogOpen] = useState(false);

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


  /* ---------------- NAV ---------------- */

  const handleNavChange = (event, newValue) => {

    setNavValue(newValue);

    if (newValue === "foodtruck") { setView("inventory"); handleTabChange("FoodTruck"); }
    if (newValue === "cr") { setView("inventory"); handleTabChange("CR"); }
    if (newValue === "calculator") { setView("calculator"); }

  };


  /* ---------------- MENU ---------------- */

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);


  /* ---------------- GRID TAP ---------------- */

  const handleGridTap = (item) => {

    setModalItem(item);
    setConfirmModal(true);

    setInputQty("");
    setInputUnit(UNIT_CATEGORIES[unitCategory][0]);
    setCustomUnit("");
    setExpiryEnabled(false);
    setExpiryDate("");

  };


  /* ---------------- SAVE ---------------- */

  const handleSave = () => {

    const qty = parseFloat(inputQty);
    if (isNaN(qty)) return;

    const finalUnit = customUnit || inputUnit;

    const tabInventory = inventoryData[tab];
    const item = tabInventory[modalItem];

    const newLogs = [

      ...item.logs,

      {
        qty,
        unit: finalUnit,
        expiry: expiryEnabled ? expiryDate : null,
        date: Date.now()
      }

    ];

    setInventoryData({

      ...inventoryData,
      [tab]: {
        ...tabInventory,
        [modalItem]: {
          logs: newLogs,
          undone: []
        }
      }

    });

    setModalItem(null);
    setConfirmModal(false);

  };


  /* ---------------- UNDO ---------------- */

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
        [modalItem]: {

          logs: newLogs,
          undone: [...item.undone, undoneEntry]

        }

      }

    });

  };


  /* ---------------- REDO ---------------- */

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
        [modalItem]: {

          logs: [...item.logs, redoEntry],
          undone: newUndone

        }

      }

    });

  };


  /* ---------------- OUTPUT ---------------- */

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


  /* ---------------- TAB CHANGE ---------------- */

  const handleTabChange = (newTab) => {

    setTab(newTab);

    if (inventoryRef.current) {

      inventoryRef.current.scrollTo({ top: 0, behavior: "smooth" });

    }

    window.scrollTo({ top: 0, behavior: "smooth" });

  };


  /* =========================================================
  UI
  ========================================================= */

  return (

    <div className="app-container">

      {/* TOP BAR */}

      <div className="top-bar">
<img className="logo" alt="Logo" src="https://images.squarespace-cdn.com/content/v1/62e97bd57cf7b479ef527b84/4e4b9191-5560-4514-bbd7-82206ecdbefd/CafeRacer-Lettering-WO-coffeedonuts_02.png?format=1500w"></img>
        <h2 className="tab-title">
          {view === "calculator" ? "Calculator" : `Inventory`}
        </h2>

        <Button onClick={handleClick} variant="contained">
          Dashboard
        </Button>

<Menu open={open}
  anchorEl={anchorEl}
  onClose={handleClose}
  disableAutoFocusItem
  >
  {view === "inventory" && (
    <Box>
      <MenuItem
        onClick={() => {
          handleDone();
          handleClose();
        }}
      >
        Done
      </MenuItem>

      <MenuItem
        onClick={() => setClearDialogOpen(true)} // open confirm dialog
      >
        Clear Inventory
      </MenuItem>
    </Box>
  )}
</Menu>

<Dialog
  open={clearDialogOpen}
  onClose={() => setClearDialogOpen(false)}
>
  <DialogTitle>Clear Inventory</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to clear all inventory? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
    <Button
      onClick={() => {
        setInventoryData(buildBlankInventory()); // actually clear inventory
        setClearDialogOpen(false);
      }}
      variant="contained"
      color="error"
    >
      Clear
    </Button>
  </DialogActions>
</Dialog>

      </div>

      {/* INVENTORY GRID */}

      {view === "inventory" && (

        <div className="tab-inventory" ref={inventoryRef}>

          <div className="inventory-grid">

            {INVENTORY_GROUPS.map(group => (

              <React.Fragment key={group.title}>

                <div className="section-title">{group.title}</div>

                {group.items.map(item => {

                  const itemData = currentInventory[item.name] || { logs: [] };
                  const logs = itemData.logs;

                  const display = Object.entries(

                    logs.reduce((m, l) => {
                      m[l.unit] = (m[l.unit] || 0) + l.qty;
                      return m;
                    }, {}

                    )

                  )

                    .map(([u, q]) => `${q} ${u}`)
                    .join(" + ");

                  return (

                    <div
                      key={item.name}
                      className={`inventory-item ${logs.length === 0 ? "dim" : ""}`}
                      onClick={() => handleGridTap(item.name)}
                    >

                      {item.name}

                      {display && (
                        <div className="item-logs highlight-count">
                          {display}
                        </div>
                      )}

                    </div>

                  );

                })}

              </React.Fragment>

            ))}

          </div>

        </div>

      )}


      {/* CALCULATOR */}

      {view === "calculator" && <Calculator />}


  {/* MODAL */}
{confirmModal && modalItem && (
  <div className="modal-backdrop">
    <div className="modal-content">
      <h3>Edit {modalItem}</h3>

      {/* Quantity input */}
    <TextField
  label="Quantity"
  type="number"
  value={inputQty}
  onChange={e => setInputQty(e.target.value)}
  fullWidth
  margin="normal"
  InputLabelProps={{ shrink: true }}
  inputProps={{
    pattern: "[0-9]*",
    inputMode: "decimal",
    step: "0.01",
    min: 0,
  }}
/>

      {/* Unit Category */}
      <TextField
        select
        label="Unit Category"
        value={unitCategory}
        onChange={e => {
          setUnitCategory(e.target.value);
          setInputUnit(UNIT_CATEGORIES[e.target.value][0]);
        }}
        fullWidth
        margin="normal"
        SelectProps={{ native: true }}
      >
        {Object.keys(UNIT_CATEGORIES).map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </TextField>

      {/* Unit */}
      <TextField
        select
        label="Unit"
        value={inputUnit}
        onChange={e => setInputUnit(e.target.value)}
        fullWidth
        margin="normal"
        SelectProps={{ native: true }}
      >
        {UNIT_CATEGORIES[unitCategory].map(u => (
          <option key={u} value={u}>{u}</option>
        ))}
      </TextField>

      {/* Custom Unit */}
      <TextField
        label="Custom Unit"
        value={customUnit}
        onChange={e => setCustomUnit(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      {/* History */}
      {currentInventory[modalItem].logs.length > 0 && (
        <div style={{ fontSize: 12, maxHeight: 120, overflowY: "auto", marginBottom: 10 }}>
          <strong>History:</strong>
          <ul>
            {currentInventory[modalItem].logs.map((log, idx) => (
              <li key={idx}>{log.qty} {log.unit}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="modal-buttons" style={{ display: 'flex', gap: 10 }}>
        <Button
          onClick={() => {
            setConfirmModal(false);
            setModalItem(null);
            setInputQty("");
            setCustomUnit("");
          }}
        >
          Cancel
        </Button>

        <Button onClick={handleUndo}>Undo</Button>
        <Button onClick={handleRedo}>Redo</Button>

        <Button
          onClick={() => {
            const qty = Number(inputQty);

            if (!Number.isInteger(qty)) {
              setError("Please enter a valid integer quantity");
              setSnackbarOpen(true);
              return;
            }

            const itemLogs = currentInventory[modalItem].logs || [];
            const lastLog = itemLogs[itemLogs.length - 1];

            if (
              lastLog &&
              lastLog.qty === qty &&
              (customUnit || inputUnit) === lastLog.unit
            ) {
              setError("No new quantity/unit to save. Modify the number or unit.");
              setSnackbarOpen(true);
              return;
            }

            const finalUnit = customUnit || inputUnit;
            const newLogs = [...itemLogs, { qty, unit: finalUnit, date: Date.now(), expiry: expiryEnabled ? expiryDate : null }];

            setInventoryData({
              ...inventoryData,
              [tab]: {
                ...inventoryData[tab],
                [modalItem]: {
                  logs: newLogs,
                  undone: []
                }
              }
            });

            setConfirmModal(false);
            setModalItem(null);
            setInputQty("");
            setCustomUnit("");
          }}
          variant="contained"
        >
          Save
        </Button>
      </div>

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  </div>
)}
      {/* OUTPUT */}

{view === "inventory" && doneOutput && (

        <div style={{ padding: 20 }}>

          <pre style={{backgroundColor: "white",}}>
            {doneOutput}
          </pre>

          <button 
          onClick={copyToClipboard}
          style={{backgroundColor: "white",}}
          >
            Copy Output
          </button>
          <div style={{paddingBottom: 100, marginTop: 10}}>
          </div>

        </div>

      )}


      {/* BOTTOM NAV */}

      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 5,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderTop: "1px solid #ccc",
        width: "100%",
        justifyContent: "center",
        
      }}>

 <BottomNavigation
  value={navValue}
  style={{backgroundColor: "var(--secondary-bg)", borderRadius: 120, width: "100%", margin: "0 auto", boxShadow: "0 2px 5px rgba(0,0,0,0.15)"}}
  onChange={handleNavChange}
  sx={{
    "& .MuiBottomNavigationAction-root": {
      paddingTop: 0,
      paddingBottom: 0,
      minWidth: 70, // optional: control icon spacing
      "&.Mui-selected": {
        backgroundColor: "var(--secondary-bg)",
        boxShadow: "none !important",
      },
      "&:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      "&:active": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      "& .MuiBottomNavigationAction-label": {
      fontSize: "0.85rem",
      fontWeight: 500,
      fontFamily: 'Modak, cursive',
      color: "#28283a",
      textTransform: "none",
    }
    },
    "& .MuiTouchRipple-body": {
      display: "none",
    }
    
  }}
>
  <BottomNavigationAction
    label="Food Truck"
    value="foodtruck"
        style={{paddingTop: 10, paddingLeft: 0, paddingRight: 0, paddingBottom: 0,}}

    icon={<img src={foodtruckIcon} alt="Food Truck" style={{ width: 80, height: 80, display: "block", }} />}
    disableRipple
  />
  <BottomNavigationAction
    label="CR"
    value="cr"
    style={{paddingTop: 10, paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}
    icon={<img src={crIcon} alt="CR" style={{ width: 80, height: 80, display: "block", }} />}
    disableRipple
  />
  <BottomNavigationAction
    label="Calculator"
    value="calculator"
    style={{padding: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 10}}
    icon={<img src={crlogoIcon} alt="Calculator Logo" style={{ width: 60, height: 60, display: "block", }} />}
    disableRipple
  />
</BottomNavigation>
      </div>

    </div>

  );

}


/* =========================================================
CALCULATOR (TABLE VERSION)
========================================================= */

function Calculator() {

  const recipeList = Object.values(recipes);

  const [selected, setSelected] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [qty, setQty] = useState(1);

  const recipe = recipeList[selected];

  const multiplier = qty / recipe.baseYield.amount;

  return (
  <div
    style={{
      display: "flex",
      gap: 20,
      margin: 20,
      flexWrap: "wrap",
      contain: "layout",
    }}
  >
    {/* Recipe Selector Table */}
    <TableContainer
      sx={{ bgcolor: "#f2ecd8", color: "#28283a", flex: 1, minWidth: 300 }}
    >
      <Table size="small" sx={{ bgcolor: "#f2ecd8", color: "#28283a" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Recipe</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recipeList
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((r, i) => {
              const index = page * rowsPerPage + i;
              return (
                <TableRow
                  key={r.name}
                  hover
                  onClick={() => setSelected(index)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: selected === index ? "#d0e6ff" : "inherit",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Radio checked={selected === index} />
                  </TableCell>
                  <TableCell>{r.name}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <TablePagination
        sx={{ bgcolor: "#f2ecd8", color: "#28283a" }}
        rowsPerPageOptions={[10]}
        component="div"
        count={recipeList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
      />
    </TableContainer>

    {/* Ingredients Table */}
    <TableContainer
      sx={{
        bgcolor: "#f2ecd8",
        color: "var(--dusk-blue)",
        
        flex: 1.8,
        minWidth: 300,
        maxWidth: 500,
      }}
    >
      <div style={{ padding: 10, display: "flex", gap: 10 }}>
        <TextField
          label="Batch Qty"
          type="number"
          size="small"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          style={{ width: 120 }}
        />
        <div style={{ alignSelf: "center" }}>{recipe.baseYield.unit}</div>
      </div>

      <Table size="small" sx={{ bgcolor: "#f2ecd8", color: "#28283a" }}>
        <TableHead>
          <TableRow>
            <TableCell>Ingredient</TableCell>
            <TableCell width={90}>Amount</TableCell>
            <TableCell width={70}>Unit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recipe.ingredients.map((ing, i) => (
            <TableRow key={i}>
              <TableCell>{ing.name}</TableCell>
              <TableCell>{(ing.amount * multiplier).toFixed(2)}</TableCell>
              <TableCell>{ing.unit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </div>
);

}