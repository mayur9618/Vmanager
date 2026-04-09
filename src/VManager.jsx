import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@supabase/supabase-js";

// ─── Google Fonts ────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  navy: "#0B1437",
  navyMid: "#162050",
  amber: "#F5A623",
  amberLight: "#FFF3D6",
  amberDark: "#D4881A",
  emerald: "#0DBF8C",
  emeraldLight: "#E6FBF5",
  rose: "#F04770",
  roseLight: "#FEEAEE",
  blue: "#3B82F6",
  blueLight: "#EFF6FF",
  bg: "#F4F6FC",
  card: "#FFFFFF",
  text: "#0B1437",
  textMid: "#4A5568",
  textLight: "#8896A5",
  border: "#E8EDF5",
};

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: ${T.bg}; color: ${T.text}; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
.syne { font-family: 'Syne', sans-serif; }
.app-wrap { max-width: 430px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: ${T.bg}; position: relative; overflow: hidden; }
.topbar { background: ${T.navy}; padding: 16px 20px 14px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
.topbar-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; letter-spacing: -0.5px; }
.topbar-title span { color: ${T.amber}; }
.topbar-right { display: flex; gap: 8px; align-items: center; }
.icon-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.1); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; transition: background 0.2s; }
.icon-btn:hover { background: rgba(255,255,255,0.2); }
.content { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 90px; }
.bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 430px; background: white; border-top: 1px solid ${T.border}; display: flex; justify-content: space-around; padding: 8px 0 12px; z-index: 100; box-shadow: 0 -4px 20px rgba(11,20,55,0.08); }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; padding: 4px 10px; border-radius: 12px; transition: all 0.2s; border: none; background: none; }
.nav-item.active .nav-icon { color: ${T.amber}; }
.nav-item.active .nav-label { color: ${T.amber}; font-weight: 600; }
.nav-icon { font-size: 20px; color: ${T.textLight}; transition: color 0.2s; }
.nav-label { font-size: 9px; color: ${T.textLight}; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: color 0.2s; }
.card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 12px rgba(11,20,55,0.06); border: 1px solid ${T.border}; }
.card + .card { margin-top: 12px; }
.section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: ${T.text}; margin-bottom: 14px; }
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-amber { background: ${T.amberLight}; color: ${T.amberDark}; }
.badge-green { background: ${T.emeraldLight}; color: ${T.emerald}; }
.badge-red { background: ${T.roseLight}; color: ${T.rose}; }
.badge-blue { background: ${T.blueLight}; color: ${T.blue}; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: ${T.navy}; color: white; }
.btn-primary:hover { background: ${T.navyMid}; transform: translateY(-1px); }
.btn-amber { background: ${T.amber}; color: ${T.navy}; }
.btn-amber:hover { background: ${T.amberDark}; }
.btn-ghost { background: ${T.bg}; color: ${T.textMid}; border: 1px solid ${T.border}; }
.btn-ghost:hover { background: ${T.border}; }
.btn-danger { background: ${T.roseLight}; color: ${T.rose}; }
.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 8px; }
.btn-full { width: 100%; }
.input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.input-label { font-size: 12px; font-weight: 600; color: ${T.textMid}; text-transform: uppercase; letter-spacing: 0.5px; }
.input { width: 100%; padding: 10px 14px; border: 1.5px solid ${T.border}; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: ${T.text}; background: white; outline: none; transition: border-color 0.2s; }
.input:focus { border-color: ${T.amber}; }
select.input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238896A5' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(11,20,55,0.5); z-index: 200; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); }
.modal { background: white; border-radius: 24px 24px 0 0; padding: 24px; width: 100%; max-width: 430px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-handle { width: 40px; height: 4px; background: ${T.border}; border-radius: 2px; margin: 0 auto 20px; }
.modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 20px; }
.table-row { display: grid; align-items: center; padding: 12px 0; border-bottom: 1px solid ${T.border}; }
.table-row:last-child { border-bottom: none; }
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1.5px solid ${T.border}; background: white; color: ${T.textMid}; }
.chip.active { background: ${T.navy}; color: white; border-color: ${T.navy}; }
.alert-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 12px; margin-bottom: 10px; }
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.stat-card { background: white; border-radius: 16px; padding: 14px; border: 1px solid ${T.border}; }
.stat-value { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; color: ${T.text}; }
.stat-label { font-size: 11px; color: ${T.textLight}; font-weight: 500; margin-top: 2px; }
.stat-icon { font-size: 22px; margin-bottom: 8px; }
.progress-bar { height: 6px; background: ${T.border}; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.divider { height: 1px; background: ${T.border}; margin: 12px 0; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; }
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
.empty-text { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; color: ${T.textMid}; }
.empty-sub { font-size: 13px; color: ${T.textLight}; margin-top: 4px; }
.fab { position: fixed; bottom: 90px; right: calc(50% - 200px); background: ${T.amber}; color: ${T.navy}; width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(245,166,35,0.4); transition: all 0.2s; z-index: 50; }
.fab:hover { transform: scale(1.05); }
.hero-card { background: linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 100%); border-radius: 20px; padding: 20px; color: white; margin-bottom: 14px; position: relative; overflow: hidden; }
.hero-card::after { content: ''; position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; border-radius: 50%; background: rgba(245,166,35,0.15); }
.hero-card::before { content: ''; position: absolute; bottom: -30px; right: 40px; width: 100px; height: 100px; border-radius: 50%; background: rgba(245,166,35,0.08); }
.quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
.qa-btn { background: white; border: 1px solid ${T.border}; border-radius: 14px; padding: 14px 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
.qa-btn:hover { border-color: ${T.amber}; background: ${T.amberLight}; }
.qa-btn span:first-child { font-size: 22px; }
.qa-btn span:last-child { font-size: 11px; font-weight: 600; color: ${T.textMid}; }
.tab-row { display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 4px; }
.tab-row::-webkit-scrollbar { display: none; }
.edu-card { background: white; border: 1px solid ${T.border}; border-radius: 16px; overflow: hidden; margin-bottom: 12px; }
.edu-card-img { height: 80px; display: flex; align-items: center; justify-content: center; font-size: 36px; }
.edu-card-body { padding: 14px; }
.toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: ${T.navy}; color: white; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 500; z-index: 300; animation: fadeInOut 2.5s ease forwards; white-space: nowrap; }
@keyframes fadeInOut { 0% { opacity: 0; transform: translateX(-50%) translateY(-10px); } 15% { opacity: 1; transform: translateX(-50%) translateY(0); } 80% { opacity: 1; } 100% { opacity: 0; } }
.profile-header { background: linear-gradient(135deg, ${T.navy}, ${T.navyMid}); border-radius: 20px; padding: 24px; color: white; text-align: center; margin-bottom: 14px; }
.profile-avatar { width: 70px; height: 70px; border-radius: 20px; background: ${T.amber}; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: ${T.navy}; margin: 0 auto 12px; }
.invoice-preview { background: white; border: 2px solid ${T.border}; border-radius: 16px; padding: 20px; }
.invoice-header { text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px dashed ${T.border}; }
.invoice-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
.invoice-total { display: flex; justify-content: space-between; padding: 10px 0; font-weight: 700; font-size: 15px; border-top: 2px solid ${T.navy}; margin-top: 8px; }
`;

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const seedProducts = [
  // ── AYURVEDIC PROPRIETARY MEDICINES ──────────────────────────────────────
  { id: 1,   name: "Vestige Noni 90 Capsules",                          category: "Ayurvedic",      buyPrice: 491,  mrp: 0, stock: 0, unit: "Pack",    code: "20004C" },
  { id: 2,   name: "Vestige Aloe Vera 60 Capsules",                     category: "Ayurvedic",      buyPrice: 269,  mrp: 0, stock: 0, unit: "Pack",    code: "20005C" },
  { id: 3,   name: "Vestige Ganoderma 90 Capsules",                     category: "Ayurvedic",      buyPrice: 765,  mrp: 0, stock: 0, unit: "Pack",    code: "20007B" },
  { id: 4,   name: "Vestige Colostrum 60 Capsules",                     category: "Ayurvedic",      buyPrice: 570,  mrp: 0, stock: 0, unit: "Pack",    code: "20008B" },
  { id: 5,   name: "Ayusante Procard 60 Capsules",                      category: "Ayurvedic",      buyPrice: 761,  mrp: 0, stock: 0, unit: "Pack",    code: "20009B" },
  { id: 6,   name: "Ayusante Gluco Health 60 Capsules",                 category: "Ayurvedic",      buyPrice: 631,  mrp: 0, stock: 0, unit: "Pack",    code: "20010B" },
  { id: 7,   name: "Ayusante Toxclean 60 Capsules",                     category: "Ayurvedic",      buyPrice: 654,  mrp: 0, stock: 0, unit: "Pack",    code: "20011B" },
  { id: 8,   name: "Ayusante Vital Complex 60 Capsules",                category: "Ayurvedic",      buyPrice: 710,  mrp: 0, stock: 0, unit: "Pack",    code: "20012B" },
  { id: 9,   name: "Ayusante Kidneyhealth 60 Capsules",                 category: "Ayurvedic",      buyPrice: 603,  mrp: 0, stock: 0, unit: "Pack",    code: "20013B" },
  { id: 10,  name: "Ayusante Liverhealth 60 Capsules",                  category: "Ayurvedic",      buyPrice: 607,  mrp: 0, stock: 0, unit: "Pack",    code: "20014B" },
  { id: 11,  name: "Ayusante Respocare 60 Capsules",                    category: "Ayurvedic",      buyPrice: 580,  mrp: 0, stock: 0, unit: "Pack",    code: "20015B" },
  { id: 12,  name: "Vestige Curcumin Plus 60 Capsules",                 category: "Ayurvedic",      buyPrice: 835,  mrp: 0, stock: 0, unit: "Pack",    code: "20016B" },
  { id: 13,  name: "Vestige Shatavari Max 60 Capsules",                 category: "Ayurvedic",      buyPrice: 426,  mrp: 0, stock: 0, unit: "Pack",    code: "20017B" },
  { id: 14,  name: "Ayusante Prostate Care 60 Capsules",                category: "Ayurvedic",      buyPrice: 417,  mrp: 0, stock: 0, unit: "Pack",    code: "20022B" },
  { id: 15,  name: "Vestige Spirulina 100 Capsules",                    category: "Ayurvedic",      buyPrice: 352,  mrp: 0, stock: 0, unit: "Pack",    code: "20023C" },
  { id: 16,  name: "Vestige Amla 60 Capsules",                          category: "Ayurvedic",      buyPrice: 171,  mrp: 0, stock: 0, unit: "Pack",    code: "20025B" },
  { id: 17,  name: "Vestige Neem 100 Softgels",                         category: "Ayurvedic",      buyPrice: 334,  mrp: 0, stock: 0, unit: "Pack",    code: "20026C" },
  { id: 18,  name: "Vestige Flax Oil 90 Softgels",                      category: "Ayurvedic",      buyPrice: 529,  mrp: 0, stock: 0, unit: "Pack",    code: "20027C" },
  { id: 19,  name: "Vestige Prime Energy Booster 30 Capsules",          category: "Ayurvedic",      buyPrice: 830,  mrp: 0, stock: 0, unit: "Pack",    code: "20028B" },
  { id: 20,  name: "Invigo Health Drops Panch Tulsi Ark 30ml",          category: "Ayurvedic",      buyPrice: 162,  mrp: 0, stock: 0, unit: "Bottle",  code: "20029B" },
  // ── HEALTH SUPPLEMENTS ───────────────────────────────────────────────────
  { id: 21,  name: "Vestige Folic & Iron Plus 60 Capsules",             category: "Health Suppl.",  buyPrice: 211,  mrp: 0, stock: 0, unit: "Pack",    code: "21006B" },
  { id: 22,  name: "Vestige Detox Foot Patches 10 Pieces",              category: "Health Suppl.",  buyPrice: 1270, mrp: 0, stock: 0, unit: "Pack",    code: "21012B" },
  { id: 23,  name: "Vestige Veslim Capsules 90 Capsules",               category: "Health Suppl.",  buyPrice: 969,  mrp: 0, stock: 0, unit: "Pack",    code: "21017B" },
  { id: 24,  name: "Vestige Prime Combiotics 30 Capsules",              category: "Health Suppl.",  buyPrice: 502,  mrp: 0, stock: 0, unit: "Pack",    code: "21020C" },
  { id: 25,  name: "Vestige Calcium 100 Tablets",                       category: "Health Suppl.",  buyPrice: 220,  mrp: 0, stock: 0, unit: "Pack",    code: "21023C" },
  { id: 26,  name: "Vestige Prime Sea Buckthorn 60 Capsules",           category: "Health Suppl.",  buyPrice: 748,  mrp: 0, stock: 0, unit: "Pack",    code: "21028B" },
  { id: 27,  name: "Vestige Prime Multi Vita+Min Gummies 60",           category: "Health Suppl.",  buyPrice: 660,  mrp: 0, stock: 0, unit: "Pack",    code: "21035B" },
  { id: 28,  name: "Vestige Veslim Shake Mango 500g",                   category: "Health Suppl.",  buyPrice: 1629, mrp: 0, stock: 0, unit: "Pack",    code: "21040C" },
  { id: 29,  name: "Vestige Protein Powder 200g",                       category: "Health Suppl.",  buyPrice: 876,  mrp: 0, stock: 0, unit: "Pack",    code: "21041C" },
  { id: 30,  name: "Vestige Prime Absorvit Vitamin D Spray 9ml",        category: "Health Suppl.",  buyPrice: 422,  mrp: 0, stock: 0, unit: "Piece",   code: "21044B" },
  { id: 31,  name: "Vestige Prime Absorvit Vitamin C Spray 22ml",       category: "Health Suppl.",  buyPrice: 422,  mrp: 0, stock: 0, unit: "Piece",   code: "21045B" },
  { id: 32,  name: "Vestige Prime Absorvit Vitamin B12 Spray 9ml",      category: "Health Suppl.",  buyPrice: 475,  mrp: 0, stock: 0, unit: "Piece",   code: "21046B" },
  { id: 33,  name: "Vestige Prime Absorvit Biotin Spray 14ml",          category: "Health Suppl.",  buyPrice: 607,  mrp: 0, stock: 0, unit: "Piece",   code: "21053B" },
  { id: 34,  name: "Vestige Prime Absorvit Melatonin Spray 7ml",        category: "Health Suppl.",  buyPrice: 484,  mrp: 0, stock: 0, unit: "Piece",   code: "21052B" },
  { id: 35,  name: "Vestige Prime Mineral Drops CMD 60ml",              category: "Health Suppl.",  buyPrice: 970,  mrp: 0, stock: 0, unit: "Bottle",  code: "21048B" },
  { id: 36,  name: "Vestige Protein Powder 400g",                       category: "Health Suppl.",  buyPrice: 1647, mrp: 0, stock: 0, unit: "Pack",    code: "21051B" },
  { id: 37,  name: "Vestige Veslim ShakeMix 500g",                      category: "Health Suppl.",  buyPrice: 466,  mrp: 0, stock: 0, unit: "Pack",    code: "22053B" },
  { id: 38,  name: "Vestige Veslim Energy Drink Mix Elaichi 50g",       category: "Health Suppl.",  buyPrice: 594,  mrp: 0, stock: 0, unit: "Pack",    code: "22055A" },
  { id: 39,  name: "Vestige Veslim Shake Dutch Chocolate 500g",         category: "Health Suppl.",  buyPrice: 1629, mrp: 0, stock: 0, unit: "Pack",    code: "22056Z" },
  { id: 40,  name: "Vestige Veslim Energy Drink Mix Peach 50g",         category: "Health Suppl.",  buyPrice: 594,  mrp: 0, stock: 0, unit: "Pack",    code: "22057A" },
  { id: 41,  name: "Invigo Nutritional Protein Powder Vanilla 200g",    category: "Health Suppl.",  buyPrice: 550,  mrp: 0, stock: 0, unit: "Pack",    code: "22039C" },
  { id: 42,  name: "Invigo Nutritional Protein Powder Choco 500g",      category: "Health Suppl.",  buyPrice: 1140, mrp: 0, stock: 0, unit: "Pack",    code: "22040C" },
  { id: 43,  name: "Invigo Nutritional Protein Powder Choco 200g",      category: "Health Suppl.",  buyPrice: 568,  mrp: 0, stock: 0, unit: "Pack",    code: "22043C" },
  { id: 44,  name: "Vestige Veslim Shake Vanilla 500g",                 category: "Health Suppl.",  buyPrice: 1629, mrp: 0, stock: 0, unit: "Pack",    code: "22048B" },
  { id: 45,  name: "Vestige Veslim Shake Rose Kheer 500g",              category: "Health Suppl.",  buyPrice: 1629, mrp: 0, stock: 0, unit: "Pack",    code: "22049B" },
  { id: 46,  name: "Vestige Veslim Shake Kulfi 500g",                   category: "Health Suppl.",  buyPrice: 1629, mrp: 0, stock: 0, unit: "Pack",    code: "22050B" },
  { id: 47,  name: "Vestige Veslim Energy Drink Kashmiri Kahwa 40g",    category: "Health Suppl.",  buyPrice: 594,  mrp: 0, stock: 0, unit: "Pack",    code: "22051B" },
  { id: 48,  name: "Vestige Veslim Energy Drink Lemon 50g",             category: "Health Suppl.",  buyPrice: 594,  mrp: 0, stock: 0, unit: "Pack",    code: "22052B" },
  { id: 49,  name: "Vestige Veslim Personalised Protein Powder 400g",   category: "Health Suppl.",  buyPrice: 1761, mrp: 0, stock: 0, unit: "Pack",    code: "21054Z" },
  { id: 50,  name: "Vestige Veslim Personalised Protein Powder 200g",   category: "Health Suppl.",  buyPrice: 880,  mrp: 0, stock: 0, unit: "Pack",    code: "21055A" },
  { id: 51,  name: "Vestige Veslim Energy Drink Ginger 50g",            category: "Health Suppl.",  buyPrice: 594,  mrp: 0, stock: 0, unit: "Pack",    code: "22054A" },
  { id: 52,  name: "Vestige Veslim Cell Power 60 Tablets",              category: "Health Suppl.",  buyPrice: 1448, mrp: 0, stock: 0, unit: "Pack",    code: "21057Z" },
  { id: 53,  name: "Vestige Veslim Cell-U-Lean 90 Tablets",             category: "Health Suppl.",  buyPrice: 1109, mrp: 0, stock: 0, unit: "Pack",    code: "21058Z" },
  // ── NUTRACEUTICALS ───────────────────────────────────────────────────────
  { id: 54,  name: "Vestige Glucosamine 60 Tablets",                    category: "Nutraceuticals", buyPrice: 458,  mrp: 0, stock: 0, unit: "Pack",    code: "21001AZ" },
  { id: 55,  name: "Vestige Glucosamine 100 Tablets",                   category: "Nutraceuticals", buyPrice: 713,  mrp: 0, stock: 0, unit: "Pack",    code: "21001B" },
  { id: 56,  name: "Vestige L-Arginine 15x10g",                         category: "Nutraceuticals", buyPrice: 1200, mrp: 0, stock: 0, unit: "Pack",    code: "21002B" },
  { id: 57,  name: "Vestige Prime Krill Oil 30 Softgels",               category: "Nutraceuticals", buyPrice: 1158, mrp: 0, stock: 0, unit: "Pack",    code: "21013B" },
  { id: 58,  name: "Vestige Cranberry 60 Capsules",                     category: "Nutraceuticals", buyPrice: 1435, mrp: 0, stock: 0, unit: "Pack",    code: "21018B" },
  { id: 59,  name: "Vestige Eye Support 30 Softgels",                   category: "Nutraceuticals", buyPrice: 506,  mrp: 0, stock: 0, unit: "Pack",    code: "21019B" },
  { id: 60,  name: "Vestige Veslim Tea 150g",                           category: "Nutraceuticals", buyPrice: 656,  mrp: 0, stock: 0, unit: "Pack",    code: "21021C" },
  { id: 61,  name: "Vestige Collagen 10x7.5g",                          category: "Nutraceuticals", buyPrice: 700,  mrp: 0, stock: 0, unit: "Pack",    code: "21026C" },
  { id: 62,  name: "Vestige Hair Skin & Nail 60 Softgels",              category: "Nutraceuticals", buyPrice: 475,  mrp: 0, stock: 0, unit: "Pack",    code: "21029C" },
  { id: 63,  name: "Vestige Coenzyme Q10 30 Softgels",                  category: "Nutraceuticals", buyPrice: 876,  mrp: 0, stock: 0, unit: "Pack",    code: "21030C" },
  { id: 64,  name: "Vestige Fibre 200g",                                category: "Nutraceuticals", buyPrice: 836,  mrp: 0, stock: 0, unit: "Pack",    code: "21032C" },
  { id: 65,  name: "Vestige Veg-Collagen 10x7.5g",                      category: "Nutraceuticals", buyPrice: 740,  mrp: 0, stock: 0, unit: "Pack",    code: "21056A" },
  // ── CONSUMABLES / HEALTH FOOD ─────────────────────────────────────────────
  { id: 66,  name: "Vestige Stevia 100 Tablets",                        category: "Health Food",    buyPrice: 123,  mrp: 0, stock: 0, unit: "Pack",    code: "21008B" },
  { id: 67,  name: "Invigo FreshnUp 200g",                              category: "Health Food",    buyPrice: 240,  mrp: 0, stock: 0, unit: "Pack",    code: "21022AZ" },
  { id: 68,  name: "Enerva Choco-Flaxseed Bar 30g",                     category: "Health Food",    buyPrice: 44,   mrp: 0, stock: 0, unit: "Piece",   code: "22006C" },
  { id: 69,  name: "Enerva Hi-Nutrition Breakfast Cereal 350g",         category: "Health Food",    buyPrice: 263,  mrp: 0, stock: 0, unit: "Pack",    code: "22007B" },
  { id: 70,  name: "Enerva Energy Snack Bar 30g",                       category: "Health Food",    buyPrice: 44,   mrp: 0, stock: 0, unit: "Piece",   code: "22013C" },
  { id: 71,  name: "Zeta Premium Spice Tea 200g",                       category: "Health Food",    buyPrice: 295,  mrp: 0, stock: 0, unit: "Pack",    code: "22015A" },
  { id: 72,  name: "Zeta Premium Coffee 50g",                           category: "Health Food",    buyPrice: 193,  mrp: 0, stock: 0, unit: "Pack",    code: "22041B" },
  { id: 73,  name: "Lite House Rice Bran Oil 2 Litre",                  category: "Health Food",    buyPrice: 540,  mrp: 0, stock: 0, unit: "Bottle",  code: "22042D" },
  { id: 74,  name: "Zeta Special Tea 200g",                             category: "Health Food",    buyPrice: 135,  mrp: 0, stock: 0, unit: "Pack",    code: "22044B" },
  // ── PERSONAL CARE ────────────────────────────────────────────────────────
  { id: 75,  name: "Assure Hair Spa 150g",                              category: "Personal Care",  buyPrice: 350,  mrp: 0, stock: 0, unit: "Pack",    code: "23009" },
  { id: 76,  name: "Assure Hair Conditioner 75g",                       category: "Personal Care",  buyPrice: 208,  mrp: 0, stock: 0, unit: "Pack",    code: "23010A" },
  { id: 77,  name: "Assure Hair Oil 200ml",                             category: "Personal Care",  buyPrice: 158,  mrp: 0, stock: 0, unit: "Bottle",  code: "23011C" },
  { id: 78,  name: "Assure Foot Cream 50g",                             category: "Personal Care",  buyPrice: 141,  mrp: 0, stock: 0, unit: "Pack",    code: "23014A" },
  { id: 79,  name: "Vescare Insta Relief Cream 50g",                    category: "Personal Care",  buyPrice: 129,  mrp: 0, stock: 0, unit: "Pack",    code: "23015A" },
  { id: 80,  name: "Assure BB Cream 30g",                               category: "Personal Care",  buyPrice: 340,  mrp: 0, stock: 0, unit: "Pack",    code: "23016A" },
  { id: 81,  name: "Assure Deep Cleanse Shampoo 200ml",                 category: "Personal Care",  buyPrice: 154,  mrp: 0, stock: 0, unit: "Bottle",  code: "23020B" },
  { id: 82,  name: "Assure Moisture Rich Shampoo 200ml",                category: "Personal Care",  buyPrice: 154,  mrp: 0, stock: 0, unit: "Bottle",  code: "23021B" },
  { id: 83,  name: "Assure Daily Care Shampoo 200ml",                   category: "Personal Care",  buyPrice: 154,  mrp: 0, stock: 0, unit: "Bottle",  code: "23022B" },
  { id: 84,  name: "Assure Anti-Ageing Night Cream 60g",                category: "Personal Care",  buyPrice: 219,  mrp: 0, stock: 0, unit: "Pack",    code: "23023A" },
  { id: 85,  name: "Assure Complete Fairness Cream 50g",                category: "Personal Care",  buyPrice: 169,  mrp: 0, stock: 0, unit: "Pack",    code: "23024A" },
  { id: 86,  name: "Assure Instant Glow Face Pack 60g",                 category: "Personal Care",  buyPrice: 146,  mrp: 0, stock: 0, unit: "Pack",    code: "23025A" },
  { id: 87,  name: "Assure Sun Defense SPF 30+ 60g",                    category: "Personal Care",  buyPrice: 225,  mrp: 0, stock: 0, unit: "Pack",    code: "23029A" },
  { id: 88,  name: "Assure Clarifying Face Wash 60g",                   category: "Personal Care",  buyPrice: 146,  mrp: 0, stock: 0, unit: "Pack",    code: "23030A" },
  { id: 89,  name: "Assure Arctic Perfume Spray 100ml",                 category: "Personal Care",  buyPrice: 275,  mrp: 0, stock: 0, unit: "Bottle",  code: "23031A" },
  { id: 90,  name: "Assure Pulse Perfume Spray 100ml",                  category: "Personal Care",  buyPrice: 275,  mrp: 0, stock: 0, unit: "Bottle",  code: "23032A" },
  { id: 91,  name: "Assure Aura Perfume Spray 100ml",                   category: "Personal Care",  buyPrice: 275,  mrp: 0, stock: 0, unit: "Bottle",  code: "23033A" },
  { id: 92,  name: "Assure Hand & Body Lotion 250ml",                   category: "Personal Care",  buyPrice: 191,  mrp: 0, stock: 0, unit: "Bottle",  code: "23035A" },
  { id: 93,  name: "Assure Daily Moisturiser 250ml",                    category: "Personal Care",  buyPrice: 248,  mrp: 0, stock: 0, unit: "Bottle",  code: "23036A" },
  { id: 94,  name: "Assure Purifying Cleanser + Toner 250ml",           category: "Personal Care",  buyPrice: 270,  mrp: 0, stock: 0, unit: "Bottle",  code: "23037A" },
  { id: 95,  name: "Assure Hand Wash 250ml",                            category: "Personal Care",  buyPrice: 130,  mrp: 0, stock: 0, unit: "Bottle",  code: "23038A" },
  { id: 96,  name: "Assure Captive Pocket Perfume 18ml",                category: "Personal Care",  buyPrice: 85,   mrp: 0, stock: 0, unit: "Piece",   code: "23040A" },
  { id: 97,  name: "Assure Blossom Pocket Perfume 18ml",                category: "Personal Care",  buyPrice: 85,   mrp: 0, stock: 0, unit: "Piece",   code: "23041A" },
  { id: 98,  name: "Assure Charisma Pocket Perfume 18ml",               category: "Personal Care",  buyPrice: 85,   mrp: 0, stock: 0, unit: "Piece",   code: "23042A" },
  { id: 99,  name: "Assure Aloe Cucumber Aquagel 100ml",                category: "Personal Care",  buyPrice: 270,  mrp: 0, stock: 0, unit: "Bottle",  code: "23043A" },
  { id: 100, name: "Assure Natural Sunscreen SPF 40+ 75g",              category: "Personal Care",  buyPrice: 435,  mrp: 0, stock: 0, unit: "Pack",    code: "23048A" },
  { id: 101, name: "Assure Natural Lightening Cream SPF15 75g",         category: "Personal Care",  buyPrice: 360,  mrp: 0, stock: 0, unit: "Pack",    code: "23049A" },
  { id: 102, name: "Assure Natural Day Cream 100g",                     category: "Personal Care",  buyPrice: 310,  mrp: 0, stock: 0, unit: "Pack",    code: "23050A" },
  { id: 103, name: "Assure Natural Face Scrub 75g",                     category: "Personal Care",  buyPrice: 265,  mrp: 0, stock: 0, unit: "Pack",    code: "23054A" },
  { id: 104, name: "Assure Natural Charcoal Peel-Off Mask 75g",         category: "Personal Care",  buyPrice: 245,  mrp: 0, stock: 0, unit: "Pack",    code: "23055A" },
  { id: 105, name: "Assure Natural Hair Mask 150g",                     category: "Personal Care",  buyPrice: 365,  mrp: 0, stock: 0, unit: "Pack",    code: "23060A" },
  { id: 106, name: "Assure Force Fresh Body Talc For Him 100g",         category: "Personal Care",  buyPrice: 51,   mrp: 0, stock: 0, unit: "Pack",    code: "23073B" },
  { id: 107, name: "Assure Enchant Body Talc For Her 100g",             category: "Personal Care",  buyPrice: 51,   mrp: 0, stock: 0, unit: "Pack",    code: "23074B" },
  { id: 108, name: "Assure Cherry Blossom Body Butter 100g",            category: "Personal Care",  buyPrice: 320,  mrp: 0, stock: 0, unit: "Pack",    code: "23079A" },
  { id: 109, name: "Assure Vitamin C Facial Foam 100ml",                category: "Personal Care",  buyPrice: 335,  mrp: 0, stock: 0, unit: "Bottle",  code: "23080A" },
  { id: 110, name: "Assure Vitamin C Gel Creme 50g",                    category: "Personal Care",  buyPrice: 240,  mrp: 0, stock: 0, unit: "Pack",    code: "23081B" },
  { id: 111, name: "Assure Insta Glow Facial Kit Pack of 5",            category: "Personal Care",  buyPrice: 620,  mrp: 0, stock: 0, unit: "Pack",    code: "23085A" },
  { id: 112, name: "Assure Complexion Bar 100g",                        category: "Personal Care",  buyPrice: 61,   mrp: 0, stock: 0, unit: "Bar",     code: "23086B" },
  { id: 113, name: "Assure Active Deo For Men 150ml",                   category: "Personal Care",  buyPrice: 185,  mrp: 0, stock: 0, unit: "Bottle",  code: "23087A" },
  { id: 114, name: "Assure Rapture Deo For Women 125ml",                category: "Personal Care",  buyPrice: 175,  mrp: 0, stock: 0, unit: "Bottle",  code: "23088A" },
  { id: 115, name: "Assure Germ Protection Soap 75g",                   category: "Personal Care",  buyPrice: 46,   mrp: 0, stock: 0, unit: "Bar",     code: "23089C" },
  { id: 116, name: "Assure Soap 100g",                                  category: "Personal Care",  buyPrice: 44,   mrp: 0, stock: 0, unit: "Bar",     code: "23090D" },
  { id: 117, name: "Assure Creamy Cleansing Bar 75g",                   category: "Personal Care",  buyPrice: 51,   mrp: 0, stock: 0, unit: "Bar",     code: "23091C" },
  { id: 118, name: "Assure Colour Protect Shampoo 150ml",               category: "Personal Care",  buyPrice: 171,  mrp: 0, stock: 0, unit: "Bottle",  code: "23092AZ" },
  { id: 119, name: "Assure Keratin Smoothening Shampoo 150ml",          category: "Personal Care",  buyPrice: 171,  mrp: 0, stock: 0, unit: "Bottle",  code: "23093B" },
  { id: 120, name: "Assure Anti-Hairfall Bounce Restore Shampoo 150ml", category: "Personal Care",  buyPrice: 171,  mrp: 0, stock: 0, unit: "Bottle",  code: "23094B" },
  { id: 121, name: "Assure Intensive Care Rinse Off Conditioner 100ml", category: "Personal Care",  buyPrice: 240,  mrp: 0, stock: 0, unit: "Bottle",  code: "23095A" },
  { id: 122, name: "Assure Damage Protection Leave-On Hair Serum 30ml", category: "Personal Care",  buyPrice: 165,  mrp: 0, stock: 0, unit: "Bottle",  code: "23096A" },
  // ── WOMEN HYGIENE ─────────────────────────────────────────────────────────
  { id: 123, name: "DewGarden Foaming Intimate Wash 80ml",              category: "Women Hygiene",  buyPrice: 180,  mrp: 0, stock: 0, unit: "Bottle",  code: "23039A" },
  { id: 124, name: "DewGarden Fly Sanitary Napkin Pack of 10",          category: "Women Hygiene",  buyPrice: 190,  mrp: 0, stock: 0, unit: "Pack",    code: "23101" },
  // ── ORAL CARE ─────────────────────────────────────────────────────────────
  { id: 125, name: "Dentassure Whitening Toothpaste 90g",               category: "Oral Care",      buyPrice: 110,  mrp: 0, stock: 0, unit: "Pack",    code: "24004B" },
  { id: 126, name: "Dentassure Mouthwash 250ml",                        category: "Oral Care",      buyPrice: 175,  mrp: 0, stock: 0, unit: "Bottle",  code: "24005A" },
  { id: 127, name: "Dentassure Gano Toothpaste 100g",                   category: "Oral Care",      buyPrice: 132,  mrp: 0, stock: 0, unit: "Pack",    code: "24007B" },
  { id: 128, name: "Dentassure Toothpaste 100g",                        category: "Oral Care",      buyPrice: 63,   mrp: 0, stock: 0, unit: "Pack",    code: "24010B" },
  { id: 129, name: "Dentassure Multi-Action Toothbrush Set of 4",       category: "Oral Care",      buyPrice: 196,  mrp: 0, stock: 0, unit: "Set",     code: "24011B" },
  // ── HOME HYGIENE ──────────────────────────────────────────────────────────
  { id: 130, name: "Hyvest Ultra Swab Floor Cleaning Solution 500ml",   category: "Home Care",      buyPrice: 186,  mrp: 0, stock: 0, unit: "Bottle",  code: "25003B" },
  { id: 131, name: "Hyvest Ultra Guard Disinfectant Toilet Cleaner 500ml", category: "Home Care",   buyPrice: 110,  mrp: 0, stock: 0, unit: "Bottle",  code: "25015B" },
  { id: 132, name: "Hyvest Ultra Scrub Dishwashing Liquid 500ml",       category: "Home Care",      buyPrice: 200,  mrp: 0, stock: 0, unit: "Bottle",  code: "25016B" },
  { id: 133, name: "Hyvest Ultra Wash Liquid Laundry Detergent 500ml",  category: "Home Care",      buyPrice: 350,  mrp: 0, stock: 0, unit: "Bottle",  code: "25017B" },
  { id: 134, name: "Hyvest Ultra Matic Detergent Powder 500g",          category: "Home Care",      buyPrice: 155,  mrp: 0, stock: 0, unit: "Pack",    code: "25018B" },
  { id: 135, name: "Hyvest Ultra Shine Glass & Household Cleaner 500ml",category: "Home Care",      buyPrice: 150,  mrp: 0, stock: 0, unit: "Bottle",  code: "25012B" },
  // ── AGRI PRODUCTS ─────────────────────────────────────────────────────────
  { id: 136, name: "Vestige Agri Moss 500ml",                           category: "Agri Care",      buyPrice: 1500, mrp: 0, stock: 0, unit: "Bottle",  code: "26001A" },
  { id: 137, name: "Vestige Agri Gold 100g",                            category: "Agri Care",      buyPrice: 500,  mrp: 0, stock: 0, unit: "Pack",    code: "26002A" },
  { id: 138, name: "Vestige Agri Nanotek 500g",                         category: "Agri Care",      buyPrice: 1250, mrp: 0, stock: 0, unit: "Pack",    code: "26004A" },
  { id: 139, name: "Vestige Agri-Humic Granules 5kg",                   category: "Agri Care",      buyPrice: 740,  mrp: 0, stock: 0, unit: "Pack",    code: "26009C" },
  { id: 140, name: "Vestige Agri Moss 100ml",                           category: "Agri Care",      buyPrice: 330,  mrp: 0, stock: 0, unit: "Bottle",  code: "26011A" },
  { id: 141, name: "Vestige Agri-Protek 500g",                          category: "Agri Care",      buyPrice: 1250, mrp: 0, stock: 0, unit: "Pack",    code: "26012A" },
  { id: 142, name: "Vestige Agri82 3x100ml",                            category: "Agri Care",      buyPrice: 372,  mrp: 0, stock: 0, unit: "Pack",    code: "26014B" },
  { id: 143, name: "Vestige Agri82 500ml",                              category: "Agri Care",      buyPrice: 525,  mrp: 0, stock: 0, unit: "Bottle",  code: "26015B" },
  { id: 144, name: "Vestige Agri82 5 Litre",                            category: "Agri Care",      buyPrice: 4200, mrp: 0, stock: 0, unit: "Bottle",  code: "26016B" },
  { id: 145, name: "Vestige Agri Nanotek 250g",                         category: "Agri Care",      buyPrice: 630,  mrp: 0, stock: 0, unit: "Pack",    code: "26017A" },
  { id: 146, name: "Vestige Agri-Protek 250g",                          category: "Agri Care",      buyPrice: 630,  mrp: 0, stock: 0, unit: "Pack",    code: "26018A" },
  { id: 147, name: "Vestige Agri82 Nano 3x100ml",                       category: "Agri Care",      buyPrice: 345,  mrp: 0, stock: 0, unit: "Pack",    code: "26019B" },
  { id: 148, name: "Vestige Agri82 Nano 500ml",                         category: "Agri Care",      buyPrice: 475,  mrp: 0, stock: 0, unit: "Bottle",  code: "26020A" },
  { id: 149, name: "Vestige Agri82 Nano 5 Litre",                       category: "Agri Care",      buyPrice: 3780, mrp: 0, stock: 0, unit: "Bottle",  code: "26021A" },
  { id: 150, name: "Vestige Agri Aquagel 1kg",                          category: "Agri Care",      buyPrice: 1800, mrp: 0, stock: 0, unit: "Pack",    code: "26022B" },
  { id: 151, name: "Vestige Agri Humic 500ml",                          category: "Agri Care",      buyPrice: 580,  mrp: 0, stock: 0, unit: "Bottle",  code: "26023A" },
  // ── MEN'S RANGE ───────────────────────────────────────────────────────────
  { id: 152, name: "Truman Face Wash 75ml",                             category: "Men's Range",    buyPrice: 230,  mrp: 0, stock: 0, unit: "Bottle",  code: "29005A" },
  { id: 153, name: "Truman Deodorant 150ml",                            category: "Men's Range",    buyPrice: 255,  mrp: 0, stock: 0, unit: "Bottle",  code: "29012A" },
  { id: 154, name: "Truman Bathing Bar 125g",                           category: "Men's Range",    buyPrice: 105,  mrp: 0, stock: 0, unit: "Bar",     code: "29103B" },
  // ── MACH-DRIVE ────────────────────────────────────────────────────────────
  { id: 155, name: "MACH-DRIVE NanoEnergizer 2/3 Wheeler 30ml",         category: "Vehicle Care",   buyPrice: 1450, mrp: 0, stock: 0, unit: "Bottle",  code: "40001B" },
  { id: 156, name: "MACH-DRIVE NanoEnergizer 4 Wheeler 30ml",           category: "Vehicle Care",   buyPrice: 1850, mrp: 0, stock: 0, unit: "Bottle",  code: "40002B" },
  // ── HOME APPLIANCES ───────────────────────────────────────────────────────
  { id: 157, name: "Sharp Replacement Hepa Filter 1 Unit",              category: "Home Appliances",buyPrice: 3325, mrp: 0, stock: 0, unit: "Piece",   code: "27001" },
  { id: 158, name: "Sharp Pitcher Consumable 1 Unit",                   category: "Home Appliances",buyPrice: 1050, mrp: 0, stock: 0, unit: "Piece",   code: "27005" },
  { id: 159, name: "Carbon Filter 1 Unit",                              category: "Home Appliances",buyPrice: 2850, mrp: 0, stock: 0, unit: "Piece",   code: "27008" },
  { id: 160, name: "Sharp Water Purifier 1 Unit",                       category: "Home Appliances",buyPrice: 33795,mrp: 0, stock: 0, unit: "Piece",   code: "27013B" },
  // ── BUSINESS TOOLS ────────────────────────────────────────────────────────
  { id: 161, name: "Vestige Distributor Laptop Bag",                    category: "Business Tools", buyPrice: 2950, mrp: 0, stock: 0, unit: "Piece",   code: "317" },
  { id: 162, name: "Cloth Carry Bag Plain",                             category: "Business Tools", buyPrice: 15,   mrp: 0, stock: 0, unit: "Piece",   code: "318A" },
  { id: 163, name: "Success Plan Book",                                 category: "Business Tools", buyPrice: 40,   mrp: 0, stock: 0, unit: "Book",    code: "3625E" },
  { id: 164, name: "Health Guide Book",                                 category: "Business Tools", buyPrice: 85,   mrp: 0, stock: 0, unit: "Book",    code: "4725" },
  { id: 165, name: "Vestige Shaker",                                    category: "Business Tools", buyPrice: 299,  mrp: 0, stock: 0, unit: "Piece",   code: "781" },
  { id: 166, name: "Veslim Paper Cup Set of 40",                        category: "Business Tools", buyPrice: 120,  mrp: 0, stock: 0, unit: "Set",     code: "323" },
  { id: 167, name: "Veslim Paper Cup 200ml Set of 100",                 category: "Business Tools", buyPrice: 125,  mrp: 0, stock: 0, unit: "Set",     code: "324" },
  { id: 168, name: "Product Catalogue English",                         category: "Business Tools", buyPrice: 75,   mrp: 0, stock: 0, unit: "Piece",   code: "1925E" },
  { id: 169, name: "Product Catalogue Hindi",                           category: "Business Tools", buyPrice: 75,   mrp: 0, stock: 0, unit: "Piece",   code: "1925H" },
  { id: 170, name: "Product Catalogue Gujarati",                        category: "Business Tools", buyPrice: 32,   mrp: 0, stock: 0, unit: "Piece",   code: "7002G" },
  { id: 171, name: "Leading Ladies Book",                               category: "Business Tools", buyPrice: 1125, mrp: 0, stock: 0, unit: "Book",    code: "7201" },
  { id: 172, name: "Vestige Car Book",                                  category: "Business Tools", buyPrice: 1125, mrp: 0, stock: 0, unit: "Book",    code: "7501" },
  { id: 173, name: "Wellth on Wheels Luxury Car Book",                  category: "Business Tools", buyPrice: 1700, mrp: 0, stock: 0, unit: "Book",    code: "7502" },
  // ── UNIFORMS ──────────────────────────────────────────────────────────────
  { id: 174, name: "Vestige Tie",                                       category: "Uniforms",       buyPrice: 400,  mrp: 0, stock: 0, unit: "Piece",   code: "7401" },
  { id: 175, name: "Vestige Crepe Saree",                               category: "Uniforms",       buyPrice: 1950, mrp: 0, stock: 0, unit: "Piece",   code: "7601A" },
  { id: 176, name: "Vestige T-Shirt S/M/L/XL/XXL/XXXL",                category: "Uniforms",       buyPrice: 450,  mrp: 0, stock: 0, unit: "Piece",   code: "7804" },
];




// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const genUid = () => Date.now() + Math.random().toString(36).slice(2, 6);

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title syne">{title}</div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className="input" {...props} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <select className="input" {...props}>
        <option value="">– Select –</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
      <input
        className="input"
        style={{ paddingLeft: 38, background: "white" }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "Search…"}
      />
      {value.length > 0 && (
        <button
          onClick={() => onChange("")}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#8896A5", padding: "4px" }}
        >✕</button>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ products, sales, customers, onNavigate }) {
  const today = new Date().toISOString().slice(0, 10);

  // ── Real calculations from actual data ──
  const todaySales    = sales.filter(s => s.date === today).reduce((a, s) => a + s.total, 0);
  const totalInventoryValue = products.reduce((a, p) => a + p.mrp * p.stock, 0);
  const lowStock      = products.filter(p => p.stock < 5).length;
  const pendingPayments = sales.filter(s => s.paymentStatus === "pending").reduce((a, s) => a + s.total, 0);

  // ── Current month stats ──
  const nowDate   = new Date();
  const thisMonth = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}`;
  const lastMonth = (() => { const d = new Date(nowDate); d.setMonth(d.getMonth() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; })();

  const thisMonthSales  = sales.filter(s => s.date?.startsWith(thisMonth)).reduce((a, s) => a + s.total, 0);
  const lastMonthSales  = sales.filter(s => s.date?.startsWith(lastMonth)).reduce((a, s) => a + s.total, 0);
  const thisMonthOrders = sales.filter(s => s.date?.startsWith(thisMonth)).length;
  const thisMonthProfit = sales.filter(s => s.date?.startsWith(thisMonth)).reduce((a, s) => {
    return a + s.items.reduce((b, item) => {
      const prod = products.find(p => p.id === item.productId);
      const profit = prod ? (prod.mrp - prod.buyPrice) * item.qty : 0;
      return b + profit;
    }, 0);
  }, 0);
  const growthPct = lastMonthSales > 0
    ? (((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1)
    : null;

  // ── Last 6 months chart data ──
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(nowDate);
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    const monthSales = sales.filter(s => s.date?.startsWith(key)).reduce((a, s) => a + s.total, 0);
    const monthProfit = sales.filter(s => s.date?.startsWith(key)).reduce((a, s) => {
      return a + s.items.reduce((b, item) => {
        const prod = products.find(p => p.id === item.productId);
        return b + (prod ? (prod.mrp - prod.buyPrice) * item.qty : 0);
      }, 0);
    }, 0);
    return { month: label, sales: monthSales, profit: monthProfit };
  });

  const monthLabel = nowDate.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();

  return (
    <div>
      <div className="hero-card">
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginBottom: 4 }}>{monthLabel}</div>
        <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: T.amber, lineHeight: 1.1 }}>{fmt(thisMonthProfit)}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
          Monthly Profit {growthPct !== null ? (growthPct >= 0 ? `· ↑ ${growthPct}% vs last month` : `· ↓ ${Math.abs(growthPct)}% vs last month`) : ""}
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>This Month Sales</div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "white", fontSize: 16 }}>{fmt(thisMonthSales)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Orders</div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "white", fontSize: 16 }}>{thisMonthOrders}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Customers</div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "white", fontSize: 16 }}>{customers.length}</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="qa-btn" onClick={() => onNavigate("sales")}>
          <span>🛒</span><span>New Sale</span>
        </button>
        <button className="qa-btn" onClick={() => onNavigate("inventory")}>
          <span>📦</span><span>Add Stock</span>
        </button>
        <button className="qa-btn" onClick={() => onNavigate("customers")}>
          <span>👤</span><span>Customer</span>
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{fmt(todaySales)}</div>
          <div className="stat-label">Today's Sales</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏬</div>
          <div className="stat-value">{fmt(totalInventoryValue)}</div>
          <div className="stat-label">Inventory Value</div>
        </div>
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-value" style={{ color: lowStock > 0 ? T.rose : T.emerald }}>{lowStock}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color: pendingPayments > 0 ? T.rose : T.emerald }}>{fmt(pendingPayments)}</div>
          <div className="stat-label">Pending Payments</div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 12, color: T.text }}>Sales Trend (Last 6 Months)</div>
        {last6Months.every(m => m.sales === 0) ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: T.textLight, fontSize: 13 }}>
            No sales data yet — start recording sales to see your trend 📈
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={last6Months} barSize={20}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: T.textLight }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12 }} />
              <Bar dataKey="sales" fill={T.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne" }}>Recent Sales</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("sales")}>View All</button>
        </div>
        {sales.slice(0, 3).map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <div className="avatar" style={{ background: T.amberLight, color: T.amberDark }}>
              {s.customerName[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.customerName}</div>
              <div style={{ fontSize: 11, color: T.textLight }}>{s.date} · {s.items.length} item(s)</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>{fmt(s.total)}</div>
              <span className={`badge ${s.paymentStatus === "paid" ? "badge-green" : "badge-red"}`}>
                {s.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lowStock > 0 && (
        <div className="card" style={{ marginTop: 12, border: `1px solid ${T.roseLight}`, background: T.roseLight }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <div>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: T.rose }}>Low Stock Alert</div>
              <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>
                {products.filter(p => p.stock < 5).map(p => p.name).join(", ")} running low
              </div>
            </div>
            <button className="btn btn-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => onNavigate("inventory")}>View</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INVENTORY ───────────────────────────────────────────────────────────────
function Inventory({ products, setProducts, showToast }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "Ayurvedic", buyPrice: "", mrp: "", stock: "", unit: "Pack" });
  const cats = ["All", "Ayurvedic", "Health Suppl.", "Nutraceuticals", "Health Food", "Personal Care", "Women Hygiene", "Oral Care", "Home Care", "Agri Care", "Men's Range", "Vehicle Care", "Home Appliances", "Business Tools", "Uniforms"];

  const openAdd = () => { setEditing(null); setForm({ name: "", category: "Ayurvedic", buyPrice: "", mrp: "", stock: "", unit: "Pack" }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, category: p.category, buyPrice: p.buyPrice, mrp: p.mrp, stock: p.stock, unit: p.unit }); setModal(true); };
  const save = () => {
    if (!form.name || !form.buyPrice || !form.mrp || !form.stock) return showToast("Fill all fields");
    if (editing) {
      setProducts(products.map(p => p.id === editing.id ? { ...p, ...form, buyPrice: +form.buyPrice, mrp: +form.mrp, stock: +form.stock } : p));
      showToast("Product updated ✓");
    } else {
      setProducts([...products, { id: genUid(), ...form, buyPrice: +form.buyPrice, mrp: +form.mrp, stock: +form.stock }]);
      showToast("Product added ✓");
    }
    setModal(false);
  };
  const del = (id) => { setProducts(products.filter(p => p.id !== id)); showToast("Product deleted"); };
  const byCat = filter === "All" ? products : products.filter(p => p.category === filter);
  const filtered = search.trim() === "" ? byCat : byCat.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="syne" style={{ fontSize: 20, fontWeight: 800 }}>Inventory</div>
        <button className="btn btn-amber btn-sm" onClick={openAdd}>+ Add Product</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, background: T.navy, borderRadius: 14, padding: "12px 14px", color: "white" }}>
          <div style={{ fontSize: 11, opacity: 0.6 }}>Total Value</div>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>{fmt(products.reduce((a, p) => a + p.mrp * p.stock, 0))}</div>
        </div>
        <div style={{ flex: 1, background: T.amberLight, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: T.amberDark }}>Products</div>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: T.navy }}>{products.length}</div>
        </div>
        <div style={{ flex: 1, background: T.roseLight, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: T.rose }}>Low Stock</div>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: T.navy }}>{products.filter(p => p.stock < 5).length}</div>
        </div>
      </div>

      <SearchBox value={search} onChange={setSearch} placeholder="Search products by name or category..." />

      <div className="tab-row">
        {cats.map(c => <button key={c} className={`chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}
      </div>

      {filtered.map(p => {
        const profit = p.mrp - p.buyPrice;
        const margin = ((profit / p.mrp) * 100).toFixed(0);
        const isLow = p.stock < 5;
        return (
          <div key={p.id} className="card" style={{ padding: "14px", marginBottom: 10, border: isLow ? `1px solid ${T.roseLight}` : `1px solid ${T.border}` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div className="avatar" style={{ background: isLow ? T.roseLight : T.amberLight, color: isLow ? T.rose : T.amberDark, fontSize: 20, width: 46, height: 46 }}>
                {isLow ? "⚠️" : "📦"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="badge badge-blue" style={{ fontSize: 10 }}>{p.category}</span>
                  {isLow && <span className="badge badge-red" style={{ fontSize: 10 }}>Low Stock</span>}
                </div>
                <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                  {[["Buy", fmt(p.buyPrice)], ["MRP", fmt(p.mrp)], ["Profit", fmt(profit)], ["Stock", `${p.stock} ${p.unit}s`]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 9, color: T.textLight, textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: l === "Profit" ? T.emerald : T.text }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textLight, marginBottom: 4 }}>
                    <span>Profit Margin</span><span>{margin}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${margin}%`, background: margin > 25 ? T.emerald : T.amber }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>🗑️</button>
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-text">{search ? "No products found" : "No products"}</div>
          <div className="empty-sub">{search ? `No results for "${search}"` : "Add your first product"}</div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Product" : "Add Product"}>
        <Input label="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vestige Noni Juice" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            options={["Ayurvedic", "Health Suppl.", "Nutraceuticals", "Health Food", "Personal Care", "Women Hygiene", "Oral Care", "Home Care", "Agri Care", "Men's Range", "Vehicle Care", "Home Appliances", "Business Tools", "Uniforms"].map(c => ({ value: c, label: c }))} />
          <Select label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
            options={["Bottle", "Box", "Bar", "Pack", "Piece"].map(u => ({ value: u, label: u }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Input label="Buy Price (₹)" type="number" value={form.buyPrice} onChange={e => setForm({ ...form, buyPrice: e.target.value })} />
          <Input label="MRP (₹)" type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
          <Input label="Stock Qty" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
        </div>
        {form.buyPrice && form.mrp && (
          <div style={{ background: T.emeraldLight, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: T.emerald, fontWeight: 600 }}>
              Profit per unit: {fmt(+form.mrp - +form.buyPrice)} ({((+form.mrp - +form.buyPrice) / +form.mrp * 100).toFixed(0)}% margin)
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>{editing ? "Update" : "Add Product"}</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── SALES & INVOICE ─────────────────────────────────────────────────────────
function Sales({ products, setProducts, customers, sales, setSales, showToast, profile }) {
  const [view, setView] = useState("list");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [payMethod, setPayMethod] = useState("UPI");
  const [viewInvoice, setViewInvoice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [salesSearch, setSalesSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [custSearch, setCustSearch] = useState("");
  const [custDropOpen, setCustDropOpen] = useState(false);
  const [editSale, setEditSale] = useState(null); // sale being edited
  const [editForm, setEditForm] = useState(null); // { customerName, date, paymentMethod, paymentStatus, items, total }

  const openEditSale = (s) => {
    setEditSale(s);
    setEditForm({
      customerName:  s.customerName,
      customerId:    s.customerId,
      date:          s.date,
      paymentMethod: s.paymentMethod,
      paymentStatus: s.paymentStatus,
      items:         s.items.map(i => ({ ...i })),
      total:         s.total,
    });
  };

  const saveEditSale = () => {
    if (!editForm) return;
    const recalcTotal = editForm.items.reduce((a, i) => a + i.price * i.qty, 0);
    const updated = { ...editSale, ...editForm, total: recalcTotal };
    setSales(prev => prev.map(s => s.id === editSale.id ? updated : s));
    setEditSale(null);
    setEditForm(null);
    showToast("✅ Sale updated!");
  };

  const addToCart = (product) => {
    const ex = cartItems.find(i => i.productId === product.id);
    if (ex) { setCartItems(cartItems.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i)); }
    else { setCartItems([...cartItems, { productId: product.id, name: product.name, qty: 1, price: product.mrp }]); }
  };
  const removeFromCart = (pid) => setCartItems(cartItems.filter(i => i.productId !== pid));
  const updateQty = (pid, qty) => {
    if (qty < 1) return removeFromCart(pid);
    setCartItems(cartItems.map(i => i.productId === pid ? { ...i, qty } : i));
  };
  const total = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const cust = customers.find(c => String(c.id) === String(selectedCustomer));

  const completeSale = () => {
    if (!selectedCustomer) return showToast("Select a customer first");
    if (!cust) return showToast("Customer not found, please reselect");
    if (cartItems.length === 0) return showToast("Add at least one product");
    const sale = {
      id: genUid(),
      customerId: selectedCustomer,
      customerName: cust.name,
      date: new Date().toISOString().slice(0, 10),
      items: [...cartItems],
      total,
      paymentStatus: payMethod === "Pending (Pay Later)" ? "pending" : "paid",
      paymentMethod: payMethod,
    };
    setSales(prev => [sale, ...prev]);
    cartItems.forEach(item => {
      setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p));
    });
    setCartItems([]);
    setSelectedCustomer("");
    setViewInvoice(sale);
    setView("invoice");
    showToast("Sale recorded ✓");
  };

  const byStatus = filter === "all" ? sales : filter === "pending" ? sales.filter(s => s.paymentStatus === "pending") : sales.filter(s => s.paymentStatus === "paid");
  const filtered = salesSearch.trim() === "" ? byStatus : byStatus.filter(s =>
    s.customerName.toLowerCase().includes(salesSearch.toLowerCase()) ||
    s.items.some(i => i.name.toLowerCase().includes(salesSearch.toLowerCase())) ||
    s.paymentMethod.toLowerCase().includes(salesSearch.toLowerCase())
  );

  if (view === "invoice" && viewInvoice) {
    const invCust = customers.find(c => String(c.id) === String(viewInvoice.customerId));
    const phone = invCust ? invCust.phone.replace(/\D/g, "") : null;
    const paid = viewInvoice.paymentStatus === "paid";
    const num = String(viewInvoice.id).slice(-6).toUpperCase();
    const msg =
      "*🧾 INVOICE - VManager*\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "📋 Invoice #" + num + "\n" +
      "📅 Date: " + viewInvoice.date + "\n\n" +
      "*Customer Details:*\n" +
      "👤 " + viewInvoice.customerName + "\n" +
      (invCust && invCust.phone ? "📞 " + invCust.phone + "\n" : "") +
      (invCust && invCust.address ? "📍 " + invCust.address + "\n" : "") +
      "\n*Items Purchased:*\n" +
      viewInvoice.items.map(i => "  • " + i.name + " × " + i.qty + "  =  ₹" + (i.price * i.qty).toLocaleString("en-IN")).join("\n") +
      "\n\n━━━━━━━━━━━━━━━━━━━━\n" +
      "*Total: ₹" + viewInvoice.total.toLocaleString("en-IN") + "*\n" +
      "💳 " + viewInvoice.paymentMethod + " — " + (paid ? "✅ Paid" : "⏳ Pending") + "\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "*Distributor:*\n" +
      "👤 " + (profile ? profile.name : "") + "\n" +
      "📞 " + (profile ? profile.phone : "") + "\n" +
      "🆔 Vestige ID: " + (profile ? profile.vestId : "") + "\n" +
      "📍 " + (profile ? profile.address : "") + "\n\n" +
      "*Thank you for your purchase!* 🙏";
    const encoded = encodeURIComponent(msg);
    const waUrl = phone ? "https://wa.me/91" + phone + "?text=" + encoded : "https://wa.me/?text=" + encoded;

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setView("list")}>← Back</button>
          <div className="syne" style={{ fontSize: 18, fontWeight: 800 }}>Invoice</div>
          <span className="badge badge-green" style={{ marginLeft: "auto" }}>✓ Generated</span>
        </div>
        <div className="invoice-preview">
          <div className="invoice-header">
            <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: T.navy }}>V<span style={{ color: T.amber }}>Manager</span></div>
            <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>Vestige Distributor Invoice</div>
            <div style={{ fontSize: 11, color: T.textLight, marginTop: 8 }}>Invoice #{String(viewInvoice.id).slice(-6).toUpperCase()} · {viewInvoice.date}</div>
          </div>
          <div className="invoice-row"><span style={{ color: T.textMid }}>Customer</span><span style={{ fontWeight: 600 }}>{viewInvoice.customerName}</span></div>
          {invCust && (
            <>
              {invCust.phone && <div className="invoice-row"><span style={{ color: T.textMid }}>📞 Mobile</span><span style={{ fontWeight: 600 }}>{invCust.phone}</span></div>}
              {invCust.address && <div className="invoice-row"><span style={{ color: T.textMid }}>📍 Address</span><span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{invCust.address}</span></div>}
            </>
          )}
          <div className="invoice-row"><span style={{ color: T.textMid }}>Payment</span><span>{viewInvoice.paymentMethod}</span></div>
          <div className="divider" />
          <div style={{ fontWeight: 700, fontSize: 12, color: T.textMid, marginBottom: 6 }}>ITEMS</div>
          {viewInvoice.items.map((item, i) => (
            <div key={i} className="invoice-row">
              <span>{item.name} × {item.qty}</span>
              <span style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="invoice-total"><span>TOTAL AMOUNT</span><span style={{ color: T.amber }}>{fmt(viewInvoice.total)}</span></div>
          <div style={{ textAlign: "center", marginTop: 16, padding: "10px", background: viewInvoice.paymentStatus === "pending" ? T.amberLight : T.emeraldLight, borderRadius: 10 }}>
            <span style={{ fontSize: 12, color: viewInvoice.paymentStatus === "pending" ? T.amberDark : T.emerald, fontWeight: 600 }}>
              {viewInvoice.paymentStatus === "pending" ? "⏳ Payment Pending — collect from customer" : "✓ Paid via " + viewInvoice.paymentMethod}
            </span>
          </div>
          {viewInvoice.paymentStatus === "pending" && (
            <button
              className="btn btn-full"
              style={{ marginTop: 10, padding: "13px", fontSize: 14, fontWeight: 700, background: T.emeraldLight, color: T.emerald, border: `1.5px solid ${T.emerald}` }}
              onClick={() => {
                setSales(prev => prev.map(s => s.id === viewInvoice.id ? { ...s, paymentStatus: "paid" } : s));
                setViewInvoice({ ...viewInvoice, paymentStatus: "paid" });
                showToast("✓ Marked as Paid!");
              }}
            >✓ Mark as Paid</button>
          )}
        </div>
        <button
          className="btn btn-full"
          style={{ marginTop: 10, padding: "16px", fontSize: 16, fontWeight: 800, background: "#25D366", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          onClick={() => { window.open(waUrl, "_blank"); showToast("Opening WhatsApp ✓"); }}
        >
          <span style={{ fontSize: 22 }}>💬</span>
          <span>Send to {invCust ? invCust.name.split(" ")[0] : "Customer"}{phone ? " (" + invCust.phone + ")" : ""}</span>
        </button>
        <button className="btn btn-ghost btn-full" style={{ marginTop: 10, padding: "13px", fontSize: 14 }} onClick={() => setView("list")}>← Back to Sales</button>
      </div>
    );
  }

  if (view === "new") return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      {/* Fixed header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setView("list")}>← Back</button>
          <div className="syne" style={{ fontSize: 18, fontWeight: 800 }}>New Sale</div>
          {cartItems.length > 0 && (
            <span className="badge badge-amber" style={{ marginLeft: "auto" }}>🛒 {cartItems.length} item{cartItems.length > 1 ? "s" : ""}</span>
          )}
        </div>
        {/* Searchable customer picker */}
        <div style={{ marginBottom: 12, position: "relative" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Customer *</label>
          {/* Selected customer pill */}
          {selectedCustomer && !custDropOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.amberLight, border: `1.5px solid ${T.amber}`, borderRadius: 12, cursor: "pointer" }}
              onClick={() => { setCustSearch(""); setCustDropOpen(true); setSelectedCustomer(""); }}>
              <div className="avatar" style={{ background: T.amber, color: "white", width: 30, height: 30, fontSize: 13 }}>
                {(customers.find(c => String(c.id) === String(selectedCustomer))?.name || "?")[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{customers.find(c => String(c.id) === String(selectedCustomer))?.name}</div>
                <div style={{ fontSize: 11, color: T.amberDark }}>Tap to change</div>
              </div>
              <span style={{ color: T.amber, fontSize: 18 }}>✓</span>
            </div>
          ) : (
            <div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
                <input className="input" style={{ paddingLeft: 40 }}
                  value={custSearch} onChange={e => { setCustSearch(e.target.value); setCustDropOpen(true); }}
                  onFocus={() => setCustDropOpen(true)}
                  placeholder="Search customer by name or phone…" autoFocus={custDropOpen} />
                {custSearch.length > 0 && (
                  <button onClick={() => setCustSearch("")}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#8896A5" }}>✕</button>
                )}
              </div>
              {custDropOpen && (
                <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 12, marginTop: 4, maxHeight: 200, overflowY: "auto", boxShadow: "0 8px 24px rgba(11,20,55,0.12)", zIndex: 50, position: "relative" }}>
                  {customers.filter(c =>
                    !custSearch.trim() ||
                    c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
                    (c.phone || "").includes(custSearch)
                  ).length === 0 ? (
                    <div style={{ padding: "14px 16px", fontSize: 13, color: T.textLight, textAlign: "center" }}>No customers found</div>
                  ) : (
                    customers.filter(c =>
                      !custSearch.trim() ||
                      c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
                      (c.phone || "").includes(custSearch)
                    ).map(c => (
                      <div key={c.id}
                        onClick={() => { setSelectedCustomer(String(c.id)); setCustDropOpen(false); setCustSearch(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, background: T.amberLight, color: T.amberDark }}>{c.name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                          {c.phone && <div style={{ fontSize: 11, color: T.textLight }}>📞 {c.phone}</div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "Syne", marginBottom: 8 }}>Select Products</div>
        {/* Product search */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
          <input className="input" style={{ paddingLeft: 38, paddingRight: productSearch ? 36 : 14, background: "white", padding: "8px 14px 8px 38px" }}
            value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search product name or category…" />
          {productSearch.length > 0 && (
            <button onClick={() => setProductSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#8896A5", padding: "4px" }}>✕</button>
          )}
        </div>
      </div>

      {/* Scrollable product list */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: cartItems.length > 0 ? 8 : 0 }}>
        {products.filter(p => !productSearch.trim() || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())).map(p => {
          const inCart = cartItems.find(i => i.productId === p.id);
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "white", borderRadius: 12, marginBottom: 8, border: `1px solid ${inCart ? T.amber : T.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: T.textLight }}>MRP: {fmt(p.mrp)} · Stock: {p.stock}</div>
              </div>
              {inCart ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" style={{ padding: "4px 10px", minWidth: 28 }} onClick={() => updateQty(p.id, inCart.qty - 1)}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center" }}>{inCart.qty}</span>
                  <button className="btn btn-amber btn-sm" style={{ padding: "4px 10px", minWidth: 28 }} onClick={() => updateQty(p.id, inCart.qty + 1)}>+</button>
                </div>
              ) : (
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => addToCart(p)} disabled={p.stock === 0}>
                  {p.stock === 0 ? "Out" : "Add"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky cart summary at bottom */}
      {cartItems.length > 0 && (
        <div style={{ flexShrink: 0, background: "white", borderTop: `2px solid ${T.amber}`, borderRadius: "16px 16px 0 0", padding: "12px 14px", boxShadow: "0 -4px 20px rgba(11,20,55,0.1)" }}>
          {/* Collapsed summary row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textLight, fontWeight: 500 }}>{cartItems.length} item{cartItems.length > 1 ? "s" : ""} in cart</div>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: T.amber }}>{fmt(total)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {cartItems.slice(0, 2).map(i => (
                <div key={i.productId} style={{ fontSize: 11, color: T.textMid }}>{i.name.slice(0, 20)} ×{i.qty}</div>
              ))}
              {cartItems.length > 2 && <div style={{ fontSize: 11, color: T.textLight }}>+{cartItems.length - 2} more</div>}
            </div>
          </div>
          <Select label="Payment Method" value={payMethod} onChange={e => setPayMethod(e.target.value)}
            options={["UPI", "Cash", "Bank Transfer", "Credit", "Pending (Pay Later)"].map(m => ({ value: m, label: m }))} />
          {payMethod === "Pending (Pay Later)" && (
            <div style={{ background: T.amberLight, borderRadius: 10, padding: "8px 12px", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>⏳</span>
              <div style={{ fontSize: 11, color: T.amberDark, fontWeight: 600 }}>Sale saved as <b>Pending</b> — collect payment later.</div>
            </div>
          )}
          <button className="btn btn-amber btn-full" style={{ padding: "13px" }} onClick={completeSale}>
            ✅ Complete Sale & Generate Invoice →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="syne" style={{ fontSize: 20, fontWeight: 800 }}>Sales</div>
        <button className="btn btn-amber btn-sm" onClick={() => setView("new")}>+ New Sale</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: T.navy, borderRadius: 14, padding: "12px 14px", color: "white" }}>
          <div style={{ fontSize: 10, opacity: 0.6 }}>TOTAL REVENUE</div>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>{fmt(sales.reduce((a, s) => a + s.total, 0))}</div>
        </div>
        <div style={{ flex: 1, background: T.roseLight, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: T.rose }}>PENDING</div>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: T.navy }}>{fmt(sales.filter(s => s.paymentStatus === "pending").reduce((a, s) => a + s.total, 0))}</div>
        </div>
      </div>
      <div className="tab-row">
        {[["all", "All Sales"], ["paid", "Paid"], ["pending", "Pending"]].map(([v, l]) => (
          <button key={v} className={`chip ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      <SearchBox value={salesSearch} onChange={setSalesSearch} placeholder="Search by customer, product, payment..." />
      {filtered.map(s => (
        <div key={s.id} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            onClick={() => { setViewInvoice(s); setView("invoice"); }}>
            <div style={{ flex: 1, cursor: "pointer" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{s.customerName}</div>
              <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>{s.date} · {s.items.length} item(s) · {s.paymentMethod}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: T.textMid }}>{s.items.map(i => i.name).join(", ")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>{fmt(s.total)}</div>
              <span className={`badge ${s.paymentStatus === "paid" ? "badge-green" : "badge-red"}`}>
                {s.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
              </span>
            </div>
          </div>
          {/* Edit + Delete row */}
          <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 12 }}
              onClick={() => openEditSale(s)}>
              ✏️ Edit Sale
            </button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 12, color: s.paymentStatus === "paid" ? T.textLight : T.emerald, borderColor: s.paymentStatus === "paid" ? T.border : T.emerald }}
              onClick={() => { setSales(prev => prev.map(x => x.id === s.id ? { ...x, paymentStatus: s.paymentStatus === "paid" ? "pending" : "paid" } : x)); showToast(s.paymentStatus === "paid" ? "Marked as Pending" : "✅ Marked as Paid!"); }}>
              {s.paymentStatus === "paid" ? "↩ Mark Pending" : "✓ Mark Paid"}
            </button>
            <button className="btn btn-ghost btn-sm" style={{ color: T.rose, borderColor: T.roseLight, fontSize: 12 }}
              onClick={() => { if (window.confirm("Delete this sale?")) { setSales(prev => prev.filter(x => x.id !== s.id)); showToast("Sale deleted"); } }}>
              🗑️
            </button>
          </div>
        </div>
      ))}

      {/* ── EDIT SALE MODAL ── */}
      {editSale && editForm && (
        <Modal open={true} onClose={() => { setEditSale(null); setEditForm(null); }} title="Edit Sale">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Customer</label>
            <input className="input" value={editForm.customerName} onChange={e => setEditForm({ ...editForm, customerName: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Date</label>
            <input className="input" type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Payment Method</label>
            <select className="input" value={editForm.paymentMethod} onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })}>
              {["UPI", "Cash", "Bank Transfer", "Credit", "Pending (Pay Later)"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Status</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["paid", "pending"].map(st => (
                <button key={st} onClick={() => setEditForm({ ...editForm, paymentStatus: st })}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: `2px solid ${editForm.paymentStatus === st ? (st === "paid" ? T.emerald : T.amber) : T.border}`, background: editForm.paymentStatus === st ? (st === "paid" ? T.emeraldLight : T.amberLight) : "white", color: editForm.paymentStatus === st ? (st === "paid" ? T.emerald : T.amberDark) : T.textMid, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {st === "paid" ? "✓ Paid" : "⏳ Pending"}
                </button>
              ))}
            </div>
          </div>
          {/* Items edit */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>Items</label>
            {editForm.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, background: T.bg, borderRadius: 10, padding: "8px 10px" }}>
                <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: T.text }}>{item.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${T.border}`, background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
                    onClick={() => { const newItems = [...editForm.items]; if (newItems[idx].qty > 1) { newItems[idx] = { ...newItems[idx], qty: newItems[idx].qty - 1 }; } else { newItems.splice(idx, 1); } setEditForm({ ...editForm, items: newItems }); }}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center", fontSize: 13 }}>{item.qty}</span>
                  <button style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${T.amber}`, background: T.amberLight, cursor: "pointer", fontWeight: 700, fontSize: 14, color: T.amberDark }}
                    onClick={() => { const newItems = [...editForm.items]; newItems[idx] = { ...newItems[idx], qty: newItems[idx].qty + 1 }; setEditForm({ ...editForm, items: newItems }); }}>+</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, minWidth: 52, textAlign: "right" }}>{fmt(item.price * item.qty)}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 4px", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: T.amber }}>{fmt(editForm.items.reduce((a, i) => a + i.price * i.qty, 0))}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setEditSale(null); setEditForm(null); }}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEditSale}>💾 Save Changes</button>
          </div>
        </Modal>
      )}
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-text">{salesSearch ? "No results found" : "No sales yet"}</div>
          <div className="empty-sub">{salesSearch ? `No sales matching "${salesSearch}"` : 'Tap "+ New Sale" to get started'}</div>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
function Customers({ customers, setCustomers, sales, showToast }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const openAdd = () => { setEditing(null); setForm({ name: "", phone: "", address: "", notes: "" }); setModal(true); };
  const save = () => {
    if (!form.name || !form.phone) return showToast("Name and phone required");
    if (editing) {
      setCustomers(customers.map(c => c.id === editing.id ? { ...c, ...form } : c));
      showToast("Customer updated ✓");
    } else {
      setCustomers([...customers, { id: genUid(), ...form, lastOrder: "" }]);
      showToast("Customer added ✓");
    }
    setModal(false);
  };
  const del = (id) => { setCustomers(customers.filter(c => c.id !== id)); setSelected(null); showToast("Customer deleted"); };

  if (selected) {
    const c = selected;
    const custSales = sales.filter(s => s.customerId === c.id);
    const total = custSales.reduce((a, s) => a + s.total, 0);
    return (
      <div>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => setSelected(null)}>← Back</button>
        <div className="profile-header">
          <div className="profile-avatar">{c.name[0]}</div>
          <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>{c.name}</div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>📞 {c.phone}</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>📍 {c.address}</div>
        </div>
        <div className="stat-grid" style={{ marginBottom: 12 }}>
          <div className="stat-card"><div className="stat-icon">🛒</div><div className="stat-value">{custSales.length}</div><div className="stat-label">Total Orders</div></div>
          <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">{fmt(total)}</div><div className="stat-label">Total Spent</div></div>
        </div>
        {c.notes && (
          <div className="card" style={{ marginBottom: 12, background: T.amberLight, border: `1px solid ${T.amber}20` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.amberDark }}>NOTES</div>
            <div style={{ fontSize: 13, color: T.text, marginTop: 4 }}>{c.notes}</div>
          </div>
        )}
        <div className="card">
          <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 10 }}>Purchase History</div>
          {custSales.length === 0 && <div style={{ fontSize: 13, color: T.textLight, textAlign: "center", padding: "20px 0" }}>No purchases yet</div>}
          {custSales.map(s => (
            <div key={s.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.date}</div>
                <div style={{ fontSize: 11, color: T.textLight }}>{s.items.map(i => i.name).join(", ")}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 700 }}>{fmt(s.total)}</div>
                <span className={`badge ${s.paymentStatus === "paid" ? "badge-green" : "badge-red"}`} style={{ fontSize: 10 }}>
                  {s.paymentStatus === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setEditing(c); setForm({ name: c.name, phone: c.phone, address: c.address, notes: c.notes }); setModal(true); }}>✏️ Edit</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => del(c.id)}>🗑️ Delete</button>
        </div>
        <Modal open={modal} onClose={() => setModal(false)} title="Edit Customer">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Update</button>
          </div>
        </Modal>
      </div>
    );
  }

  const filteredCustomers = search.trim() === "" ? customers : customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="syne" style={{ fontSize: 20, fontWeight: 800 }}>Customers</div>
        <button className="btn btn-amber btn-sm" onClick={openAdd}>+ Add</button>
      </div>
      <div style={{ background: T.navy, borderRadius: 16, padding: "14px 16px", color: "white", marginBottom: 14, display: "flex", gap: 20 }}>
        <div><div style={{ fontSize: 10, opacity: 0.5 }}>TOTAL</div><div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20 }}>{customers.length}</div></div>
        <div><div style={{ fontSize: 10, opacity: 0.5 }}>REVENUE</div><div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20 }}>{fmt(sales.reduce((a, s) => a + s.total, 0))}</div></div>
        <div><div style={{ fontSize: 10, opacity: 0.5 }}>AVG ORDER</div><div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20 }}>{fmt(sales.length ? Math.round(sales.reduce((a, s) => a + s.total, 0) / sales.length) : 0)}</div></div>
      </div>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by name, phone or address..." />
      {filteredCustomers.map(c => {
        const custSales = sales.filter(s => s.customerId === c.id);
        return (
          <div key={c.id} className="card" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setSelected(c)}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="avatar" style={{ background: T.amberLight, color: T.amberDark, width: 46, height: 46, fontSize: 18 }}>
                {c.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: T.textLight }}>📞 {c.phone}</div>
                {c.address && <div style={{ fontSize: 11, color: T.textLight }}>📍 {c.address}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="badge badge-blue">{custSales.length} orders</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginTop: 4 }}>
                  {fmt(custSales.reduce((a, s) => a + s.total, 0))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {customers.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">No customers yet</div><div className="empty-sub">Add your first customer</div></div>}
      {customers.length > 0 && search.trim() !== "" && filteredCustomers.length === 0 && (
        <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">No results</div><div className="empty-sub">No customers matching "{search}"</div></div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Customer">
        <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
        <Input label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" type="tel" />
        <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City / Area" />
        <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Preferences, reorder schedule…" />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Add Customer</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── ALERTS ──────────────────────────────────────────────────────────────────
function Alerts({ products, sales, customers }) {
  const today = Date.now();
  const daysSince = (dateStr) => Math.floor((today - new Date(dateStr).getTime()) / 86400000);

  const lowStock = products.filter(p => p.stock < 5);
  const pending = sales.filter(s => s.paymentStatus === "pending");

  const weeklyPending = pending.map(s => {
    const days = daysSince(s.date);
    const weeks = Math.floor(days / 7);
    const isOverdue = days >= 7;
    const isUrgent = days >= 14;
    return { ...s, days, weeks, isOverdue, isUrgent };
  });

  const reminders = customers.filter(c => c.lastOrder && daysSince(c.lastOrder) > 25);

  const all = [
    ...lowStock.map(p => ({
      type: "stock", icon: "📦", color: T.roseLight, textColor: T.rose,
      title: "Low Stock: " + p.name,
      desc: "Only " + p.stock + " " + p.unit + "(s) remaining. Reorder now!",
      time: "Now", urgent: true,
    })),
    ...weeklyPending.map(s => ({
      type: "payment", icon: s.isUrgent ? "🚨" : "💰",
      color: s.isUrgent ? T.roseLight : T.amberLight,
      textColor: s.isUrgent ? T.rose : T.amberDark,
      title: (s.isUrgent ? "URGENT — " : s.isOverdue ? "Overdue — " : "Pending — ") + s.customerName,
      desc: fmt(s.total) + " unpaid · " + s.days + " days ago" +
        (s.weeks >= 1 ? " · " + s.weeks + " week" + (s.weeks > 1 ? "s" : "") + " reminder" : ""),
      time: s.date, urgent: s.isUrgent,
    })),
    ...reminders.map(c => ({
      type: "reorder", icon: "🔔", color: T.blueLight, textColor: T.blue,
      title: "Reorder Reminder: " + c.name,
      desc: c.name + " hasn't ordered in " + daysSince(c.lastOrder) + " days. Time to follow up!",
      time: "Today", urgent: false,
    })),
  ].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));

  return (
    <div>
      <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Smart Alerts</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["🚨", "Stock", lowStock.length, T.rose], ["💰", "Payments", pending.length, T.amberDark], ["🔔", "Reminders", reminders.length, T.blue]].map(([ic, l, n, c]) => (
          <div key={l} style={{ flex: 1, background: "white", border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{ic}</div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: n > 0 ? c : T.textLight }}>{n}</div>
            <div style={{ fontSize: 10, color: T.textLight, fontWeight: 500 }}>{l}</div>
          </div>
        ))}
      </div>

      {weeklyPending.filter(s => s.isOverdue).length > 0 && (
        <div style={{ background: T.roseLight, border: `1.5px solid ${T.rose}30`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>📅</span>
            <div>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: T.rose }}>Weekly Payment Reminders</div>
              <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>
                {weeklyPending.filter(s => s.isOverdue).length} pending payment{weeklyPending.filter(s => s.isOverdue).length > 1 ? "s" : ""} overdue · Total: {fmt(weeklyPending.filter(s => s.isOverdue).reduce((a, s) => a + s.total, 0))}
              </div>
            </div>
          </div>
        </div>
      )}

      {all.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-text">All clear!</div>
          <div className="empty-sub">No alerts at the moment</div>
        </div>
      )}

      {all.map((a, i) => (
        <div key={i} className="alert-item" style={{ background: a.color, borderRadius: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>{a.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: a.textColor }}>{a.title}</div>
            <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{a.desc}</div>
          </div>
          <div style={{ fontSize: 10, color: T.textLight, flexShrink: 0, textAlign: "right" }}>
            {a.time}
            {a.urgent && <div style={{ color: a.textColor, fontWeight: 700, fontSize: 10, marginTop: 2 }}>URGENT</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── EDUCATION ───────────────────────────────────────────────────────────────
const AAJ_KI_ENERGY_VIDEOS = [
  { title: "Vestige Result - Weight Loss", url: "https://www.youtube.com/watch?v=0IJUQo1ByNY" },
  { title: "Vestige Result - Allergy ( खुजली )", url: "https://www.youtube.com/watch?v=f0hQinMt0SM" },
  { title: "Vestige Result - Skin Infection", url: "https://www.youtube.com/watch?v=EpKTe42ByJI" },
  { title: "Vestige Result - સંધિ વા", url: "https://www.youtube.com/watch?v=VT1325c7I9w" },
  { title: "Vestige Result - डायाबीटीस, शरदी", url: "https://www.youtube.com/watch?v=JtZnG3e0Lnk" },
  { title: "Vestige Result - साइटिका, शरदी, खांसी", url: "https://www.youtube.com/watch?v=uB3KSO4Ipeg" },
  { title: "Vestige Result - Weight Loss (2)", url: "https://www.youtube.com/watch?v=0g8ajhwsusU" },
  { title: "Vestige Result - Time Period मे दर्द और पीड़ाए", url: "https://www.youtube.com/watch?v=ucqPnNGYuMs" },
  { title: "Vestige Result - सोरायसिस, एसिडिटी", url: "https://www.youtube.com/watch?v=vw_U7GYWXOg" },
  { title: "Vestige Result - कमर दर्द", url: "https://www.youtube.com/watch?v=LLEcKCc_puc" },
  { title: "Vestige Result - पैर के तलवे मे दर्द, कोलेस्ट्रॉल, Uric Acid", url: "https://www.youtube.com/watch?v=e2xIGlcdfy4" },
  { title: "Vestige Result - स्नायु दर्द, खून की कमी, दांत मे दर्द", url: "https://www.youtube.com/watch?v=aysJGIAkDR0" },
  { title: "Vestige Result - માથા માં ગાંઠ (રસોડી)", url: "https://www.youtube.com/watch?v=kyn5LN0YKiM" },
  { title: "Vestige Result - कब्ज और Piles", url: "https://www.youtube.com/watch?v=vqF0ElLwUO0" },
  { title: "Vestige Result - धान की खेती", url: "https://www.youtube.com/watch?v=-Wx7p8GBfuM" },
  { title: "Vestige Result - सोरायसिस | Psoriasis", url: "https://www.youtube.com/watch?v=Nm_7OuCkTtE" },
  { title: "Vestige Result - घुटनों मे दर्द", url: "https://www.youtube.com/watch?v=iZuuQrHleJg" },
  { title: "Vestige Result - Hair Fall", url: "https://www.youtube.com/watch?v=s5UiNHL-UoA" },
  { title: "Vestige Result - धान || ડાંગર की खेती", url: "https://www.youtube.com/watch?v=EzZniGdo1Bw" },
  { title: "Vestige Result - घुटनों मे दर्द (2)", url: "https://www.youtube.com/watch?v=ETjBC617TeM" },
  { title: "Vestige Result - સુરણ ની ખેતી", url: "https://www.youtube.com/watch?v=rZvm7P5WbT4" },
  { title: "Vestige Result - Weight Loss (3)", url: "https://www.youtube.com/watch?v=D2CJKauFmF8" },
  { title: "Vestige Result - कब्ज", url: "https://www.youtube.com/watch?v=7D-r9sc7qxA" },
  { title: "Vestige Result - कब्ज (2)", url: "https://www.youtube.com/watch?v=cNb5W6v0Snc" },
  { title: "Vestige Result - बार बार बुखार, थकान, खून की कमी", url: "https://www.youtube.com/watch?v=HpcnLqFFbcM" },
  { title: "Vestige Result - Cancer (जीभ मे)", url: "https://www.youtube.com/watch?v=fGy1mncj09Y" },
  { title: "Vestige Result - वैरिकोज़ वेन्स", url: "https://www.youtube.com/watch?v=v1kfpWCsSGg" },
  { title: "Vestige Result - मूंगफली की खेती || માંડવી ની ખેતી", url: "https://www.youtube.com/watch?v=GE6zEZNaC40" },
  { title: "Vestige Result - मूंगफली की खेती || માંડવી ની ખેતી (2)", url: "https://www.youtube.com/watch?v=wTlP_S8gs1g" },
  { title: "Vestige Result - मुँह में छाले होना || મોઢા માં ચાંદા પાડવા", url: "https://www.youtube.com/watch?v=LuF1-u-_u94" },
  { title: "Vestige Result - तम्बાકू की खेती", url: "https://www.youtube.com/watch?v=YsefBeY7Iwk" },
  { title: "Vestige Result - आँखों के नंबर कम हो गए", url: "https://www.youtube.com/watch?v=PQdGBsKg8oo" },
  { title: "Vestige Result - Pimple (ખીલ)", url: "https://www.youtube.com/watch?v=TgiuBEOkyls" },
  { title: "Vestige Result - बवासीर | મસા | Piles", url: "https://www.youtube.com/watch?v=gQzyda2a7As" },
  { title: "Vestige Result - Hair Fall (2)", url: "https://www.youtube.com/watch?v=VLBFo9wC7Co" },
  { title: "Vestige Result - एलर्जी", url: "https://www.youtube.com/watch?v=ZS0WeM4N0As" },
  { title: "Vestige Result - Dragon Fruit", url: "https://www.youtube.com/watch?v=uPeu4kY0b9k" },
  { title: "Vestige Result - Diabetes (2)", url: "https://www.youtube.com/watch?v=piskHp7BX5s" },
  { title: "Vestige Result - Weight Gain", url: "https://www.youtube.com/watch?v=J-Gkk8TNGoQ" },
  { title: "Vestige Result - Vitamin D की कमी", url: "https://www.youtube.com/watch?v=ZW4Dt5HliVA" },
  { title: "Vestige Result - Weight Gain & Immunity Boost", url: "https://www.youtube.com/watch?v=YwhgqA9OGQQ" },
  { title: "Vestige Result - Asthma (2)", url: "https://www.youtube.com/watch?v=kUWc0c0ivUQ" },
  { title: "Vestige Result - मूंगफली की खेती | માંડવી", url: "https://www.youtube.com/watch?v=L9ho20yq_38" },
  { title: "Vestige Result - स्नायु और कमर दर्द", url: "https://www.youtube.com/watch?v=HI-qOxJ8dz4" },
  { title: "Vestige Result - घुटनों में दर्द (3)", url: "https://www.youtube.com/watch?v=4DZQ3Ipav54" },
  { title: "Vestige Result - पैरो में दर्द", url: "https://www.youtube.com/watch?v=KalQHwZe3RE" },
  { title: "Vestige Result - फटी एड़िया | વાઢિયા ફાટવા", url: "https://www.youtube.com/watch?v=AdxLeqCE4DE" },
  { title: "Vestige Result - Skin Problem", url: "https://www.youtube.com/watch?v=Bd_wGqpaUtM" },
  { title: "Vestige Result - साइटिका और घुटनो में दर्द", url: "https://www.youtube.com/watch?v=yvc_1QLW0X0" },
  { title: "Vestige Result - कंधो में दर्द", url: "https://www.youtube.com/watch?v=giCsr6pB5Xs" },
  { title: "Vestige Result - मुँह में छाले और बवासीर (Piles)", url: "https://www.youtube.com/watch?v=z5aO8v8-aZQ" },
  { title: "Vestige Result - दांत और मसूड़ों में दर्द", url: "https://www.youtube.com/watch?v=KhsIPp7KpIc" },
  { title: "Vestige Result - Bone TB", url: "https://www.youtube.com/watch?v=rpx-EN3Fqk8" },
  { title: "Vestige Result - 3 महीने में 15 kg Weight Loss", url: "https://www.youtube.com/watch?v=Xd6ch359Epo" },
  { title: "Vestige Result - 1.5 माहीने में 8 कीलो Weight Loss", url: "https://www.youtube.com/watch?v=sIQ-6g4MKHw" },
  { title: "Vestige Result - मूंगफली की खेती (3)", url: "https://www.youtube.com/watch?v=mD5a7NX_2aM" },
  { title: "Vestige Result - धान | ડાંગર | ભાત ની ખેતી में बगडी गया result", url: "https://www.youtube.com/watch?v=26tUjZJznaM" },
  { title: "Vestige Result - तिल की खेती में बढ़िया रिजल्ट", url: "https://www.youtube.com/watch?v=EkAQJ9EmQwM" },
  { title: "Vestige Result - ध्रुजारी", url: "https://www.youtube.com/watch?v=liLA-ga7KYg" },
  { title: "Vestige Result - Skin Problem (2)", url: "https://www.youtube.com/watch?v=L0pi0ijeONY" },
  { title: "Vestige Result - कान में छेद", url: "https://www.youtube.com/watch?v=8rWL8WQ-H08" },
  { title: "Vestige Result - खून की कमी और हाथो में खाली चढ़ना", url: "https://www.youtube.com/watch?v=AgNaZMkY3KY" },
  { title: "Vestige Result - मुँह में छाले पड़ना", url: "https://www.youtube.com/watch?v=UG4WV9DHh1I" },
  { title: "Vestige Result - Asthma (3)", url: "https://www.youtube.com/watch?v=y5_lFDId220" },
  { title: "Vestige Result - आंत मे सूजन | આંતરડા માં સોજો", url: "https://www.youtube.com/watch?v=d1tTr77rjZ8" },
  { title: "Vestige Result - पैर में सूजन", url: "https://www.youtube.com/watch?v=U3AAIWtki60" },
  { title: "Vestige Result - मुह में चांदा / छाला", url: "https://www.youtube.com/watch?v=VdOPSqbv_c4" },
  { title: "Vestige Result - Prostate", url: "https://www.youtube.com/watch?v=GX1hRzmin90" },
  { title: "Vestige Result - बोहोत कफ जम गया", url: "https://www.youtube.com/watch?v=U4gvVE_YMV8" },
  { title: "Vestige Result - घुटनों मे पानी भर जाता था", url: "https://www.youtube.com/watch?v=VbXfrtW2qB8" },
  { title: "Vestige Result - शरदी - एलर्जी", url: "https://www.youtube.com/watch?v=5WdRrs5nsfc" },
  { title: "Vestige Result - कमर दर्द (2)", url: "https://www.youtube.com/watch?v=4w5dwSOCCN0" },
  { title: "Vestige Result - Thyroid", url: "https://www.youtube.com/watch?v=nmsZWD56vqI" },
  { title: "Vestige Result - Rashes", url: "https://www.youtube.com/watch?v=EvFS4w3Tu0s" },
  { title: "Vestige Result - Cholesterol", url: "https://www.youtube.com/watch?v=2E8ZYxOXQTo" },
  { title: "Special Session by M D Salim", url: "https://www.youtube.com/watch?v=xOy7erIpKq8" },
  { title: "Vestige Result - પગ માં ખરાજવા", url: "https://www.youtube.com/watch?v=TqyTeEAviGE" },
  { title: "Vestige Result - પગ ની ખૂંટી પર રસી", url: "https://www.youtube.com/watch?v=BI7WwS3vhT0" },
  { title: "Vestige Result - Diabetes (3)", url: "https://www.youtube.com/watch?v=R3iCme9QObE" },
  { title: "Vestige Result - घुटनों मर दर्द", url: "https://www.youtube.com/watch?v=m7xHNRLnzOM" },
  { title: "Vestige Result - पैरों में चीरे | પગ ના વાઢિયા ફાટવા", url: "https://www.youtube.com/watch?v=i22JCZYX3D0" },
  { title: "Vestige Result - पैरों मे सूजन", url: "https://www.youtube.com/watch?v=pVpnl0z0GfY" },
  { title: "Vestige Result - Prostate (2)", url: "https://www.youtube.com/watch?v=AngUdVIUy0g" },
  { title: "Vestige Result - आँखों मे तकलीफ", url: "https://www.youtube.com/watch?v=B-3T79G3kow" },
  { title: "Vestige Result - Weight Loss (4)", url: "https://www.youtube.com/watch?v=u2dZZ6nRkY0" },
  { title: "Vestige Result - घुटनों मे दर्द \\- Knee Pain", url: "https://www.youtube.com/watch?v=hXK4rSl5OPE" },
  { title: "Vestige Result - Weight Loss (5)", url: "https://www.youtube.com/watch?v=RkaIEryzXeU" },
  { title: "Vestige Result - Young age मे White Hair - छोटी उम्र मे सफेद बाल", url: "https://www.youtube.com/watch?v=7cAxLHszm6A" },
  { title: "Vestige Result - PCDO", url: "https://www.youtube.com/watch?v=2_Y7wupF9JQ" },
  { title: "Vestige Result - Weight Loss, खुजली, घुटन दर्द , स्वास मे तकलीफ", url: "https://www.youtube.com/watch?v=UZn-ss6Ov8g" },
  { title: "Vestige 21st Anniversary Offers/Schemes in Details", url: "https://www.youtube.com/watch?v=f-l1tMjgDY4" },
  { title: "Vestige Result - मूंग की खेती", url: "https://www.youtube.com/watch?v=mD5a7NX_2aM" },
  { title: "Vestige Result - Asthma (4)", url: "https://www.youtube.com/watch?v=y5_lFDId220" },
  { title: "Vestige Result - Diabetes (4)", url: "https://www.youtube.com/watch?v=1Yrc5taRgzg" },
  { title: "Vestige Result - Hair Damage", url: "https://www.youtube.com/watch?v=5Do0AsCsm2w" }
];

const CHANNEL_URL = "https://youtube.com/@kalpeshpatelsurat?si=cwFL5X3u-N1bnAmD";

const EDU_DATA = {
  products: [
    { name: "Vestige Noni Juice", emoji: "🍹", cat: "Health", benefits: ["Boosts immunity", "Detox & cleanse", "Anti-oxidant rich", "Improves digestion"], usage: "30ml daily on empty stomach", ingredients: "Morinda Citrifolia (Noni) fruit extract", selling: "Best for immunity & energy boosting" },
    { name: "Ganoderma Coffee", emoji: "☕", cat: "Wellness", benefits: ["Adaptogen properties", "Liver support", "Antifungal activity", "Stress relief"], usage: "1 sachet in hot water daily", ingredients: "Ganoderma mushroom extract + Coffee", selling: "Health-conscious coffee drinkers" },
    { name: "Vestige Flax Oil", emoji: "🌿", cat: "Health", benefits: ["Omega-3 fatty acids", "Heart health", "Reduces inflammation", "Brain function"], usage: "1 tsp with salad or smoothie", ingredients: "Cold pressed Flaxseed Oil", selling: "Perfect for heart health concerns" },
    { name: "Spirulina Tablets", emoji: "💚", cat: "Nutrition", benefits: ["Complete protein source", "Iron rich", "Detoxification", "Energy booster"], usage: "2 tablets twice daily with water", ingredients: "100% pure Spirulina algae", selling: "Gym-goers and health enthusiasts" },
  ],
  videos: [
    { title: "Sales Training Masterclass", duration: "32 min", emoji: "🎯", desc: "Learn how to close deals and handle objections effectively." },
    { title: "Vestige Marketing Plan Explained", duration: "45 min", emoji: "📊", desc: "Understand the compensation plan and income structure." },
    { title: "Product Demo Techniques", duration: "18 min", emoji: "🎥", desc: "How to demonstrate products effectively to customers." },
    { title: "Building Your Network", duration: "28 min", emoji: "🌐", desc: "Strategies for growing your distributor network." },
  ],
  docs: [
    { title: "Vestige Product Catalogue 2025", emoji: "📘", size: "4.2 MB" },
    { title: "Business Opportunity Brochure", emoji: "📄", size: "1.8 MB" },
    { title: "Compensation Plan PDF", emoji: "💼", size: "2.1 MB" },
    { title: "Health Benefits Guide", emoji: "🏥", size: "3.5 MB" },
  ],
};

function Education({ showToast }) {
  const [tab, setTab] = useState("products");
  const [selProd, setSelProd] = useState(null);
  const [videoSearch, setVideoSearch] = useState("");
  const [eduSearch, setEduSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [customItems, setCustomItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("edu_custom") || "{}"); } catch { return {}; }
  });
  const saveCustom = (tab, items) => {
    const updated = { ...customItems, [tab]: items };
    setCustomItems(updated);
    localStorage.setItem("edu_custom", JSON.stringify(updated));
  };

  if (selProd) return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => setSelProd(null)}>← Back</button>
      <div className="card" style={{ textAlign: "center", marginBottom: 12, background: T.amberLight, border: "none" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{selProd.emoji}</div>
        <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>{selProd.name}</div>
        <span className="badge badge-blue" style={{ marginTop: 6 }}>{selProd.cat}</span>
      </div>
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 10 }}>✨ Key Benefits</div>
        {selProd.benefits.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: i < selProd.benefits.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
            <span style={{ color: T.emerald, fontWeight: 700 }}>✓</span> {b}
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 8 }}>💊 Usage</div>
        <div style={{ fontSize: 13, color: T.textMid, background: T.bg, padding: "10px 12px", borderRadius: 10 }}>{selProd.usage}</div>
      </div>
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 8 }}>🔬 Ingredients</div>
        <div style={{ fontSize: 13, color: T.textMid }}>{selProd.ingredients}</div>
      </div>
      <div className="card" style={{ background: T.emeraldLight, border: "none" }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 8, color: T.emerald }}>🎯 Selling Point</div>
        <div style={{ fontSize: 13, color: T.text }}>{selProd.selling}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Education Hub</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="tab-row" style={{ marginBottom: 0, flex: 1 }}>
          {[["products","📚 Products"],["energy","⚡ Energy"],["videos","🎥 Videos"],["docs","📄 Docs"],["tools","🛠️ Tools"]].map(([v,l]) => (
            <button key={v} className={`chip ${tab === v ? "active" : ""}`} onClick={() => { setTab(v); setEduSearch(""); }}>{l}</button>
          ))}
        </div>
        {tab !== "energy" && (
          <button className="btn btn-amber btn-sm" style={{ flexShrink: 0, marginLeft: 8 }}
            onClick={() => { setNewTitle(""); setNewDesc(""); setNewUrl(""); setAddModal(true); }}>
            + Add
          </button>
        )}
      </div>

      {/* Search bar for all tabs (except energy which has its own) */}
      {tab !== "energy" && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
          <input className="input" style={{ paddingLeft: 40, paddingRight: eduSearch ? 36 : 14, background: "white" }}
            value={eduSearch} onChange={e => setEduSearch(e.target.value)}
            placeholder={tab === "products" ? "Search products…" : tab === "videos" ? "Search videos…" : tab === "docs" ? "Search documents…" : "Search tools…"} />
          {eduSearch.length > 0 && (
            <button onClick={() => setEduSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#8896A5", padding: "4px" }}>✕</button>
          )}
        </div>
      )}

      {tab === "energy" && (
        <div>
          {/* Channel Banner */}
          <div style={{ background: `linear-gradient(135deg, #FF0000, #cc0000)`, borderRadius: 16, padding: "18px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, background: "white", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: "white" }}>AAJ KI ENERGY</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>by Kalpesh Patel Surat</div>
            </div>
            <button
              onClick={() => window.open(CHANNEL_URL, "_blank")}
              style={{ background: "white", color: "#FF0000", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer", flexShrink: 0 }}
            >
              📺 Channel
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1, background: "white", border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px", textAlign: "center" }}>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 20, color: T.navy }}>{AAJ_KI_ENERGY_VIDEOS.length}</div>
              <div style={{ fontSize: 10, color: T.textLight, fontWeight: 500 }}>TOTAL VIDEOS</div>
            </div>
            <div style={{ flex: 2, background: "#FF000010", border: "1px solid #FF000030", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#cc0000" }}>Vestige Results</div>
                <div style={{ fontSize: 10, color: T.textLight }}>Real success stories</div>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
            <input
              className="input"
              style={{ paddingLeft: 40, paddingRight: videoSearch ? 36 : 14, background: "white" }}
              value={videoSearch}
              onChange={e => setVideoSearch(e.target.value)}
              placeholder="Search videos e.g. Weight Loss, Diabetes..."
            />
            {videoSearch.length > 0 && (
              <button onClick={() => setVideoSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.textLight, padding: 4 }}>✕</button>
            )}
          </div>

          {/* Result count when searching */}
          {videoSearch.trim() !== "" && (
            <div style={{ fontSize: 12, color: T.textMid, marginBottom: 10, fontWeight: 600 }}>
              {AAJ_KI_ENERGY_VIDEOS.filter(v => v.title.toLowerCase().includes(videoSearch.toLowerCase())).length} result(s) for "{videoSearch}"
            </div>
          )}

          {/* Video list */}
          {(() => {
            const filtered = videoSearch.trim() === ""
              ? AAJ_KI_ENERGY_VIDEOS
              : AAJ_KI_ENERGY_VIDEOS.filter(v => v.title.toLowerCase().includes(videoSearch.toLowerCase()));
            return filtered.length === 0 ? (
              <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 16, padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: T.textMid, marginBottom: 4 }}>No videos found</div>
                <div style={{ fontSize: 12, color: T.textLight }}>Try a different keyword</div>
              </div>
            ) : (
              <div>
                {filtered.map((v, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(v.url, "_blank")}
                    style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#FF0000"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                  >
                    {/* Number badge */}
                    <div style={{ width: 36, height: 36, background: "#FF000015", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #FF000025" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#cc0000" }}>
                        {videoSearch.trim() === "" ? `#${i + 1}` : "▶"}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: T.text, lineHeight: 1.4 }}>{v.title}</div>
                      <div style={{ fontSize: 11, color: "#FF0000", marginTop: 3, fontWeight: 500 }}>▶ Tap to watch on YouTube</div>
                    </div>
                    <span style={{ color: "#FF0000", fontSize: 18, flexShrink: 0 }}>›</span>
                  </div>
                ))}
                <button
                  onClick={() => window.open(CHANNEL_URL, "_blank")}
                  style={{ width: "100%", padding: "13px", background: "#FF000010", color: "#cc0000", border: "1.5px solid #FF000030", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 4 }}
                >
                  📺 View Full Channel on YouTube
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {tab === "products" && (
        <div>
          {EDU_DATA.products.filter(p => !eduSearch.trim() || p.name.toLowerCase().includes(eduSearch.toLowerCase()) || p.cat.toLowerCase().includes(eduSearch.toLowerCase())).map(p => (
            <div key={p.name} className="card" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setSelProd(p)}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 36, width: 54, height: 54, background: T.amberLight, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>{p.benefits.slice(0, 2).join(" · ")}</div>
                  <span className="badge badge-blue" style={{ marginTop: 5, fontSize: 10 }}>{p.cat}</span>
                </div>
                <span style={{ color: T.textLight, fontSize: 18 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "videos" && (
        <div>
          {EDU_DATA.videos.filter(v => !eduSearch.trim() || v.title.toLowerCase().includes(eduSearch.toLowerCase()) || v.desc.toLowerCase().includes(eduSearch.toLowerCase())).map(v => (
            <div key={v.title} className="card" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => showToast("Opening video player...")}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 54, height: 54, background: T.navy, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{v.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: T.textLight, marginTop: 2 }}>{v.desc}</div>
                  <span className="badge badge-amber" style={{ marginTop: 5 }}>⏱ {v.duration}</span>
                </div>
                <span style={{ color: T.textLight, fontSize: 18 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "docs" && (
        <div>
          {EDU_DATA.docs.filter(d => !eduSearch.trim() || d.title.toLowerCase().includes(eduSearch.toLowerCase())).map(d => (
            <div key={d.title} className="card" style={{ marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }} onClick={() => showToast("Downloading " + d.title + "...")}>
              <div style={{ fontSize: 32, width: 50, height: 50, background: T.blueLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{d.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{d.title}</div>
                <div style={{ fontSize: 11, color: T.textLight }}>PDF · {d.size}</div>
              </div>
              <button className="btn btn-ghost btn-sm">⬇️</button>
            </div>
          ))}
        </div>
      )}

      {/* Custom items added by user */}
      {tab !== "energy" && (customItems[tab] || []).length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>MY ADDITIONS</div>
          {(customItems[tab] || []).filter(item => !eduSearch.trim() || item.title.toLowerCase().includes(eduSearch.toLowerCase())).map((item, i) => (
            <div key={i} className="card" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12, border: `1px solid ${T.amber}30` }}>
              <div style={{ width: 46, height: 46, background: T.amberLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✨</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.title}</div>
                {item.desc && <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>{item.desc}</div>}
                {item.url && (
                  <div onClick={() => window.open(item.url, "_blank")}
                    style={{ fontSize: 11, color: T.blue, marginTop: 2, cursor: "pointer", textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🔗 Open Link
                  </div>
                )}
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => {
                const updated = (customItems[tab] || []).filter((_, j) => j !== i);
                saveCustom(tab, updated);
              }}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={`Add to ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Title *</label>
          <input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. New training video" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Description</label>
          <input className="input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Short description (optional)" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Link / URL</label>
          <input className="input" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://youtube.com/... (optional)" type="url" />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
            if (!newTitle.trim()) return showToast("Enter a title");
            const existing = customItems[tab] || [];
            saveCustom(tab, [...existing, { title: newTitle.trim(), desc: newDesc.trim(), url: newUrl.trim() }]);
            setAddModal(false);
            showToast("✅ Added!");
          }}>Add</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
// ─── REFER & EARN ────────────────────────────────────────────────────────────
function ReferEarn({ user, showToast }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  const myCode = user?.email?.split("@")[0]?.toUpperCase().slice(0, 8) || "REFER123";

  // Load referrals for this user from Supabase
  useEffect(() => {
    if (!user) return;
    getSB().from("referrals").select("*").eq("referred_by", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setReferrals(data || []); setLoading(false); });
  }, [user]);

  const totalEarned    = referrals.filter(r => r.status === "confirmed").reduce((a, r) => a + (r.amount || 0), 0);
  const totalPending   = referrals.filter(r => r.status === "pending").length;
  const totalConfirmed = referrals.filter(r => r.status === "confirmed").length;

  const handleSubmitReferral = async () => {
    if (!name.trim()) return showToast("Enter referral name");
    if (!phone.trim() || phone.trim().length < 10) return showToast("Enter valid phone number");
    setSubmitting(true);
    try {
      const { error } = await getSB().from("referrals").insert({
        referred_by:   user.id,
        referrer_email: user.email,
        referred_name: name.trim(),
        referred_phone: phone.trim(),
        status:        "pending",
        amount:        0,
        created_at:    new Date().toISOString(),
      });
      if (error) throw error;
      showToast("✅ Referral submitted! We will confirm shortly.");
      setName(""); setPhone("");
      // Reload
      const { data } = await getSB().from("referrals").select("*").eq("referred_by", user.id).order("created_at", { ascending: false });
      setReferrals(data || []);
    } catch (e) { showToast("❌ " + e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Refer & Earn</div>

      {/* Hero banner */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy}, #1a2a6c)`, borderRadius: 20, padding: "20px", marginBottom: 14, color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(245,166,35,0.15)" }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 4 }}>YOUR REFERRAL CODE</div>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 28, color: T.amber, letterSpacing: 3 }}>{myCode}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Share this code and earn ₹20–₹200 per referral</div>
        <button
          onClick={() => { navigator.clipboard?.writeText(myCode); showToast("✅ Code copied!"); }}
          style={{ marginTop: 12, background: T.amber, color: T.navy, border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          📋 Copy Code
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 14 }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value" style={{ color: T.emerald }}>{fmt(totalEarned)}</div>
          <div className="stat-label">Total Earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{referrals.length}</div>
          <div className="stat-label">Total Referrals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: T.emerald }}>{totalConfirmed}</div>
          <div className="stat-label">Confirmed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color: T.amber }}>{totalPending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>💡 How It Works</div>
        {[
          ["1️⃣", "Submit a referral below with name & phone"],
          ["2️⃣", "They register and use VManager"],
          ["3️⃣", "Admin confirms and approves reward"],
          ["4️⃣", "You earn ₹20–₹200 per confirmed referral"],
        ].map(([num, txt]) => (
          <div key={num} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 16 }}>{num}</span>
            <span style={{ fontSize: 13, color: T.textMid, alignSelf: "center" }}>{txt}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, background: T.amberLight, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: T.amberDark, fontWeight: 600 }}>
          ⚠️ Reward amount (₹20–₹200) is decided by admin based on referral quality. Payment is manual.
        </div>
      </div>

      {/* Submit referral */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>➕ Submit a Referral</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Referral Name *</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>👤</span>
            <input className="input" style={{ paddingLeft: 40 }} value={name} onChange={e => setName(e.target.value)} placeholder="Their full name" />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Phone Number *</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>📞</span>
            <input className="input" style={{ paddingLeft: 40 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" type="tel" />
          </div>
        </div>
        <button onClick={handleSubmitReferral} disabled={submitting}
          style={{ width: "100%", padding: "13px", background: submitting ? "#ccc" : T.amber, color: T.navy, border: "none", borderRadius: 12, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "⏳ Submitting…" : "Submit Referral →"}
        </button>
      </div>

      {/* My referrals list */}
      <div className="card">
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>📋 My Referrals</div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: T.textLight }}>Loading…</div>}
        {!loading && referrals.length === 0 && (
          <div className="empty-state" style={{ padding: "24px 0" }}>
            <div className="empty-icon">🤝</div>
            <div className="empty-text">No referrals yet</div>
            <div className="empty-sub">Submit your first referral above!</div>
          </div>
        )}
        {referrals.map((r, i) => (
          <div key={r.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
            <div className="avatar" style={{ background: r.status === "confirmed" ? T.emeraldLight : T.amberLight, color: r.status === "confirmed" ? T.emerald : T.amberDark, fontSize: 18 }}>
              {r.status === "confirmed" ? "✅" : "⏳"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.referred_name}</div>
              <div style={{ fontSize: 11, color: T.textLight }}>📞 {r.referred_phone} · {new Date(r.created_at).toLocaleDateString("en-IN")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {r.status === "confirmed"
                ? <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, color: T.emerald }}>{fmt(r.amount || 0)}</div>
                : <span className="badge badge-amber">Pending</span>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HELP & SUPPORT ──────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, padding: "10px 0" }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ fontWeight: 600, fontSize: 13, cursor: "pointer", color: T.navy, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {q}
        <span style={{ color: T.textLight, fontSize: 18, transform: open ? "rotate(90deg)" : "none", transition: "0.2s" }}>›</span>
      </div>
      {open && <div style={{ fontSize: 12, color: T.textMid, marginTop: 8, lineHeight: 1.6, paddingRight: 8 }}>{a}</div>}
    </div>
  );
}

function HelpSupport({ user, showToast }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    if (!user) return;
    getSB().from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setTickets(data || []); setLoadingTickets(false); });
  }, [user]);

  const handleSend = async () => {
    if (!subject.trim()) return showToast("Enter a subject");
    if (!message.trim()) return showToast("Enter your message");
    setSending(true);
    try {
      const { error } = await getSB().from("support_tickets").insert({
        user_id:    user.id,
        user_email: user.email,
        subject:    subject.trim(),
        message:    message.trim(),
        status:     "open",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      showToast("✅ Support ticket submitted! We will reply soon.");
      setSubject(""); setMessage("");
      const { data } = await getSB().from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setTickets(data || []);
    } catch (e) { showToast("❌ " + e.message); }
    finally { setSending(false); }
  };

  const faqs = [
    ["How do I add a product?", "Go to Stock tab → tap '+ Add Product' → fill details → Save."],
    ["How to record a sale?", "Go to Sales tab → tap '+ New Sale' → select customer → add products → complete sale."],
    ["How to share invoice on WhatsApp?", "After completing a sale, tap the green 'Send to WhatsApp' button on the invoice screen."],
    ["My data is not showing?", "Make sure you are logged in with the same email. Data syncs from Supabase cloud when you log in."],
    ["How to change my password?", "Go to Login screen → tap 'Forgot Password?' → enter your email → check inbox for reset link."],
    ["How does Refer & Earn work?", "Go to Refer tab → submit a referral with name & phone → admin confirms → you earn ₹20–₹200."],
  ];

  return (
    <div>
      <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Help & Support</div>

      {/* Support info card */}
      <div className="card" style={{ marginBottom: 14, background: T.amberLight, border: `1px solid ${T.amber}30` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>🎧</span>
          <div>
            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: T.navy }}>VManager Support</div>
            <div style={{ fontSize: 12, color: T.amberDark, marginTop: 3 }}>Submit a ticket below and we'll get back to you</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>❓ Frequently Asked Questions</div>
        {faqs.map(([q, a], i) => (
          <FaqItem key={i} q={q} a={a} />
        ))}
      </div>

      {/* Submit ticket */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>📝 Submit a Support Ticket</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Subject *</label>
          <input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Product not saving" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Message *</label>
          <textarea className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail…" rows={4} style={{ resize: "vertical", fontFamily: "DM Sans,sans-serif" }} />
        </div>
        <button onClick={handleSend} disabled={sending}
          style={{ width: "100%", padding: "13px", background: sending ? "#ccc" : T.navy, color: "white", border: "none", borderRadius: 12, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 14, cursor: sending ? "not-allowed" : "pointer" }}>
          {sending ? "⏳ Sending…" : "Send Message →"}
        </button>
      </div>

      {/* My tickets */}
      <div className="card">
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>🎫 My Tickets</div>
        {loadingTickets && <div style={{ textAlign: "center", padding: "16px", color: T.textLight }}>Loading…</div>}
        {!loadingTickets && tickets.length === 0 && <div style={{ fontSize: 13, color: T.textLight, textAlign: "center", padding: "16px 0" }}>No tickets yet</div>}
        {tickets.map((t, i) => (
          <div key={t.id || i} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.subject}</div>
                <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>{new Date(t.created_at).toLocaleDateString("en-IN")}</div>
              </div>
              <span className={`badge ${t.status === "resolved" ? "badge-green" : t.status === "in_progress" ? "badge-blue" : "badge-amber"}`}>
                {t.status === "resolved" ? "✅ Resolved" : t.status === "in_progress" ? "🔄 In Progress" : "🟡 Open"}
              </span>
            </div>
            {t.admin_reply && (
              <div style={{ marginTop: 8, background: T.emeraldLight, borderRadius: 8, padding: "8px 10px", fontSize: 12, color: T.emerald }}>
                💬 Admin: {t.admin_reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
// ─── SYNC MASTER PRODUCTS ────────────────────────────────────────────────────
function SyncMasterProducts({ products, setProducts, showToast }) {
  const [syncing, setSyncing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null); // { added, updated, skipped }

  const newInMaster    = seedProducts.filter(sp => !products.find(p => p.code === sp.code));
  const totalMaster    = seedProducts.length;

  const doSync = () => {
    setSyncing(true);
    setResult(null);
    setTimeout(() => {
      let added = 0, skipped = 0;
      const merged = [...products];

      seedProducts.forEach(sp => {
        const existing = merged.find(p => p.code === sp.code || p.name === sp.name);
        if (!existing) {
          // New product not in user's list → add it (keep stock=0, mrp=0)
          merged.push({ ...sp, id: genUid(), stock: 0, mrp: 0 });
          added++;
        } else {
          // Already exists → skip (preserve user's prices, stock, mrp)
          skipped++;
        }
      });

      setProducts(merged);
      setResult({ added, skipped });
      setSyncing(false);
      setShowConfirm(false);
      showToast(`✅ Sync done! ${added} new products added.`);
    }, 800);
  };

  return (
    <>
      {/* Sync button row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
        onClick={() => { setShowConfirm(true); setResult(null); }}>
        <div style={{ width: 40, height: 40, background: "#EEF2FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔄</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Sync Master Products</div>
          <div style={{ fontSize: 11, color: T.textLight }}>
            {newInMaster.length > 0
              ? `${newInMaster.length} new products available to add`
              : `All ${totalMaster} master products already in your list`}
          </div>
        </div>
        {newInMaster.length > 0 && (
          <span style={{ background: "#4F46E5", color: "white", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
            +{newInMaster.length}
          </span>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div style={{ marginTop: 8, background: T.emeraldLight, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: T.emerald, fontWeight: 600 }}>
          ✅ Sync complete! Added {result.added} new products · {result.skipped} already existed (prices & stock preserved).
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <Modal open={true} onClose={() => setShowConfirm(false)} title="Sync Master Products">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.7, marginBottom: 12 }}>
              This will add <b style={{ color: "#4F46E5" }}>{newInMaster.length} new products</b> from the master list to your account.
            </div>
            <div style={{ background: T.emeraldLight, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: T.emerald, fontWeight: 700, marginBottom: 6 }}>✅ What will be preserved:</div>
              {["Your existing product prices (DP & MRP)", "Your stock quantities", "Your custom products", "All your sales history"].map(t => (
                <div key={t} style={{ fontSize: 12, color: T.emerald, padding: "2px 0" }}>• {t}</div>
              ))}
            </div>
            <div style={{ background: T.amberLight, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: T.amberDark, fontWeight: 700, marginBottom: 6 }}>ℹ️ New products added with:</div>
              {["Price (DP) = from master list", "MRP = blank (fill yourself)", "Stock = 0 (fill yourself)"].map(t => (
                <div key={t} style={{ fontSize: 12, color: T.amberDark, padding: "2px 0" }}>• {t}</div>
              ))}
            </div>
          </div>

          {/* New products preview */}
          {newInMaster.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                New products to be added ({newInMaster.length}):
              </div>
              <div style={{ maxHeight: 160, overflowY: "auto", background: T.bg, borderRadius: 10, padding: "8px 12px" }}>
                {newInMaster.map(p => (
                  <div key={p.code} style={{ fontSize: 12, padding: "3px 0", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: T.text }}>{p.name}</span>
                    <span style={{ color: T.textLight, flexShrink: 0, marginLeft: 8 }}>₹{p.buyPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: "#4F46E5", opacity: syncing ? 0.7 : 1 }}
              disabled={syncing || newInMaster.length === 0}
              onClick={doSync}>
              {syncing ? "⏳ Syncing…" : newInMaster.length === 0 ? "Already Up to Date ✓" : `Add ${newInMaster.length} Products`}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function Profile({ showToast, profile, setProfile, onLogout, userProfile, user, products, customers, sales, setProducts, setCustomers, setSales }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ ...profile });
  // Init with best available profile (localStorage wins over Supabase when Supabase has bad data)
  const [freshProfile, setFreshProfile] = useState(() => {
    if (!user) return userProfile;
    return getBestProfile(user.id, userProfile) || userProfile;
  });

  // Refresh profile data — merge Supabase + localStorage, prefer local for subscription
  useEffect(() => {
    if (!user) return;
    sbGetProfile(user.id).then(pr => {
      const best = getBestProfile(user.id, pr);
      if (best) setFreshProfile(best);
    });
  }, [user]);

  const handleSave = async () => {
    if (!form.name.trim()) return showToast("Name cannot be empty");
    setSaving(true);
    try {
      setProfile({ ...form });
      // Sync to Supabase if logged in
      if (user) {
        // Update profile fields — use direct upsert since user IS logged in here
        const { error: pe } = await getSB().from("profiles").upsert({
          id:       user.id,
          name:     form.name.trim(),
          vest_id:  form.vestId.trim(),
          phone:    form.phone.trim(),
          address:  form.address.trim(),
          upline:   form.upline.trim(),
        });
        if (pe) console.error("Profile update error:", pe.message);
      }
      setEditing(false);
      showToast("✅ Profile updated!");
    } catch (e) {
      showToast("❌ Save failed: " + e.message);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>My Profile</div>

      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">{(profile.name || "D")[0].toUpperCase()}</div>
        <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22 }}>{profile.name || "Distributor"}</div>
        {profile.vestId && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Vestige ID: {profile.vestId}</div>}
        {user && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>📧 {user.email}</div>}
        <div style={{ marginTop: 10, display: "inline-flex", gap: 8, background: "rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: 20 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>⭐ Active Distributor · {freshProfile?.plan || userProfile?.plan || "Free"}</span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>Personal Info</div>
          {!editing && (
            <button className="btn btn-amber btn-sm" onClick={() => { setForm({ ...profile }); setEditing(true); }}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <div>
            <Input label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
            <Input label="Vestige Distributor ID" value={form.vestId} onChange={e => setForm({ ...form, vestId: e.target.value })} placeholder="e.g. VV123456" />
            <Input label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" type="tel" />
            <Input label="Address / City" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your city / area" />
            <Input label="Upline Distributor Name" value={form.upline} onChange={e => setForm({ ...form, upline: e.target.value })} placeholder="Sponsor name" />
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} disabled={saving} onClick={handleSave}>
                {saving ? "⏳ Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {[
              ["👤", "Full Name",    profile.name    || "—"],
              ["🆔", "Vestige ID",   profile.vestId  || "—"],
              ["📞", "Phone",        profile.phone   || "—"],
              ["📍", "Address",      profile.address || "—"],
              ["🤝", "Upline",       profile.upline  || "—"],
            ].map(([ic, l, v]) => (
              <div key={l} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 18, width: 24, flexShrink: 0 }}>{ic}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: T.textLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{l}</div>
                  <div style={{ fontSize: 13, color: v === "—" ? T.textLight : T.text, fontWeight: 500, marginTop: 2 }}>{v}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>Data Management</div>

        {/* ── SYNC MASTER PRODUCTS ── */}
        <SyncMasterProducts products={products} setProducts={setProducts} showToast={showToast} />

        {/* Export JSON */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
          onClick={() => {
            const data = { products, customers, sales, exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url;
            a.download = "vmanager_backup_" + new Date().toISOString().slice(0,10) + ".json";
            a.click(); URL.revokeObjectURL(url);
            showToast("✅ Backup downloaded!");
          }}>
          <div style={{ width: 40, height: 40, background: T.emeraldLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💾</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Backup Data</div>
            <div style={{ fontSize: 11, color: T.textLight }}>Download all data as JSON file</div>
          </div>
          <span style={{ color: T.textLight, fontSize: 16 }}>⬇️</span>
        </div>

        {/* Export CSV */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
          onClick={() => {
            const headers = ["Product Name","Category","Buy Price","MRP","Stock","Unit"];
            const rows = products.map(p => [p.name, p.category, p.buyPrice, p.mrp, p.stock, p.unit]);
            const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url;
            a.download = "vmanager_products_" + new Date().toISOString().slice(0,10) + ".csv";
            a.click(); URL.revokeObjectURL(url);
            showToast("✅ Products CSV downloaded!");
          }}>
          <div style={{ width: 40, height: 40, background: T.blueLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Export Products</div>
            <div style={{ fontSize: 11, color: T.textLight }}>Download products as CSV (Excel)</div>
          </div>
          <span style={{ color: T.textLight, fontSize: 16 }}>⬇️</span>
        </div>

        {/* Export Sales CSV */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
          onClick={() => {
            const headers = ["Date","Customer","Items","Total","Payment Method","Status"];
            const rows = sales.map(s => [s.date, s.customerName, s.items.map(i => i.name + "x" + i.qty).join("; "), s.total, s.paymentMethod, s.paymentStatus]);
            const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url;
            a.download = "vmanager_sales_" + new Date().toISOString().slice(0,10) + ".csv";
            a.click(); URL.revokeObjectURL(url);
            showToast("✅ Sales CSV downloaded!");
          }}>
          <div style={{ width: 40, height: 40, background: T.amberLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Export Sales</div>
            <div style={{ fontSize: 11, color: T.textLight }}>Download sales report as CSV (Excel)</div>
          </div>
          <span style={{ color: T.textLight, fontSize: 16 }}>⬇️</span>
        </div>

        {/* Import / Restore */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", cursor: "pointer" }}
          onClick={() => document.getElementById("restore-input").click()}>
          <div style={{ width: 40, height: 40, background: T.roseLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📥</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Restore Data</div>
            <div style={{ fontSize: 11, color: T.textLight }}>Import from a JSON backup file</div>
          </div>
          <span style={{ color: T.textLight, fontSize: 16 }}>⬆️</span>
        </div>
        <input id="restore-input" type="file" accept=".json" style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = evt => {
              try {
                const data = JSON.parse(evt.target.result);
                if (data.products) setProducts(data.products);
                if (data.customers) setCustomers(data.customers);
                if (data.sales) setSales(data.sales);
                showToast("✅ Data restored successfully!");
              } catch { showToast("❌ Invalid backup file"); }
              e.target.value = "";
            };
            reader.readAsText(file);
          }} />
      </div>

      {/* Subscription Card */}
      {(() => {
        const pr = freshProfile || userProfile || {};
        const sub = checkSubscription(pr);
        const planId = pr.plan_id || "trial";
        const planLabel = pr.plan || "Free Trial";
        const paidAt = pr.paid_at ? new Date(pr.paid_at) : null;
        const expiresAt = pr.expires_at ? new Date(pr.expires_at) : null;

        const planColors = {
          trial:    { bg: "#E6FBF5", text: "#0DBF8C", icon: "🆓" },
          monthly:  { bg: "#EEF2FF", text: "#4F46E5", icon: "📅" },
          yearly:   { bg: "#FFF3D6", text: "#D4881A", icon: "⭐" },
          lifetime: { bg: "#FFF3D6", text: "#D4881A", icon: "♾️" },
        };
        const colors = planColors[planId] || planColors.trial;

        return (
          <div className="card" style={{ marginBottom: 12, border: `1.5px solid ${colors.bg}` }}>
            <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, marginBottom: 14 }}>My Subscription</div>

            {/* Plan badge row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: colors.bg, borderRadius: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 28 }}>{colors.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 16, color: colors.text }}>{planLabel}</div>
                <div style={{ fontSize: 12, color: colors.text, opacity: 0.7, marginTop: 2 }}>
                  {planId === "lifetime" ? "Never expires · Forever access" : sub.expired ? "⚠️ Expired" : `${sub.daysLeft} days remaining`}
                </div>
              </div>
              <div style={{ background: sub.expired ? T.rose : colors.text, color: "white", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>
                {sub.expired ? "EXPIRED" : "ACTIVE"}
              </div>
            </div>

            {/* Details grid */}
            {[
              ["📅 Started On",   paidAt ? paidAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
              ["⏰ Expires On",    planId === "lifetime" ? "Never ♾️" : expiresAt ? expiresAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
              ["💳 Payment ID",   pr.payment_id && pr.payment_id !== "free_trial" ? pr.payment_id : (planId === "trial" ? "Free Trial" : "—")],
              ["📧 Email",        user?.email || "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 12, color: T.textMid, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text, maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
              </div>
            ))}

            {/* Expiry warning */}
            {!sub.expired && planId !== "lifetime" && sub.daysLeft <= 7 && (
              <div style={{ marginTop: 10, background: T.amberLight, borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div style={{ fontSize: 12, color: T.amberDark, fontWeight: 600 }}>
                  Your plan expires in {sub.daysLeft} day{sub.daysLeft !== 1 ? "s" : ""}! Renew to keep access.
                </div>
              </div>
            )}

            {/* Version */}
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textLight }}>
              <span>VManager</span><span>v1.0.0</span>
            </div>
          </div>
        );
      })()}

      {/* Subscription & Logout */}
      {onLogout && (
        <div style={{ marginTop: 12 }}>

          <button onClick={onLogout} style={{ width: "100%", padding: "13px", background: T.roseLight, color: T.rose, border: `1px solid ${T.rose}30`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  );
}



// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// ⚠️ Paste your values from: Supabase Dashboard → Settings → API
const SUPABASE_URL  = "https://sgiipkqvbqehlmacdebb.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaWlwa3F2YnFlaGxtYWNkZWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4OTg4NjUsImV4cCI6MjA4OTQ3NDg2NX0.2XFAcwkX-gftucrdHEOhGT3wqbuXuFoRJqfUfvB3C8M";

let _sb = null;
function getSB() {
  if (!_sb) _sb = createClient(SUPABASE_URL, SUPABASE_ANON);
  return _sb;
}

async function sbGetProfile(uid) {
  const { data } = await getSB().from("profiles").select("*").eq("id", uid).single();
  return data;
}
async function sbSaveProfile(uid, payload) {
  // Use RPC security definer function — bypasses RLS for initial insert
  // This is safe because the function enforces the correct uid
  const { error } = await getSB().rpc("save_profile", {
    p_id:         uid,
    p_name:       payload.name        || "",
    p_phone:      payload.phone       || "",
    p_email:      payload.email       || "",
    p_paid:       payload.paid        ?? true,
    p_plan:       payload.plan        || "Free Trial",
    p_plan_id:    payload.plan_id     || "trial",
    p_payment_id: payload.payment_id  || "free_trial",
    p_paid_at:    payload.paid_at     || new Date().toISOString(),
    p_expires_at: payload.expires_at  || null,
  });
  if (error) {
    console.error("sbSaveProfile RPC error:", error.message);
    // Fallback to direct upsert (works if session is established)
    const { error: e2 } = await getSB().from("profiles").upsert({ id: uid, ...payload });
    if (e2) console.error("sbSaveProfile fallback error:", e2.message);
  }
}

// ── Subscription check: returns { active, expired, daysLeft, status }
// ── Get best available profile (localStorage wins for subscription fields) ──
function getBestProfile(uid, supabaseProfile) {
  let localPr = null;
  try {
    const raw = localStorage.getItem("vm_pending_profile_" + uid);
    if (raw) localPr = JSON.parse(raw);
  } catch {}

  // If Supabase profile has good data, use it
  if (supabaseProfile?.paid === true && supabaseProfile?.paid_at) {
    // Supabase has valid data - but also check local for expires_at
    const merged = { ...supabaseProfile };
    if (!merged.expires_at && localPr?.expires_at) merged.expires_at = localPr.expires_at;
    if (!merged.plan_id && localPr?.plan_id) merged.plan_id = localPr.plan_id;
    if (!merged.plan && localPr?.plan) merged.plan = localPr.plan;
    return merged;
  }

  // Supabase has bad/missing data - use localStorage
  if (localPr?.paid === true && localPr?.paid_at) return localPr;

  // Nothing good - return whatever Supabase has
  return supabaseProfile;
}

function checkSubscription(pr) {
  if (!pr) return { active: false, expired: false, daysLeft: 0, status: "no_profile" };

  // Admin block: ONLY if paid is explicitly boolean false (not null/undefined)
  // paid=null or paid=undefined means profile not yet saved → allow via localStorage
  if (pr.paid === false && !pr.paid_at) return { active: false, expired: false, daysLeft: 0, status: "blocked" };
  if (pr.paid === false && pr.paid_at)  return { active: false, expired: false, daysLeft: 0, status: "blocked" };

  // Lifetime plan — never expires
  if (pr.plan_id === "lifetime") return { active: true, expired: false, daysLeft: -1, status: "lifetime" };

  const now = new Date();

  // Determine expiry date:
  // 1. Use expires_at if present in DB
  // 2. Otherwise calculate from paid_at based on plan
  let exp = null;
  if (pr.expires_at) {
    exp = new Date(pr.expires_at);
  } else if (pr.paid_at) {
    const base = new Date(pr.paid_at);
    if (pr.plan_id === "trial")   { exp = new Date(base); exp.setDate(exp.getDate() + 7); }
    if (pr.plan_id === "monthly") { exp = new Date(base); exp.setDate(exp.getDate() + 30); }
    if (pr.plan_id === "yearly")  { exp = new Date(base); exp.setFullYear(exp.getFullYear() + 1); }
  }

  // No expiry could be calculated → allow access (legacy/admin created accounts)
  if (!exp) return { active: true, expired: false, daysLeft: 999, status: "active" };

  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return { active: false, expired: true, daysLeft: 0, status: "expired" };
  return { active: true, expired: false, daysLeft, status: "active" };
}

// ── Per-user data helpers (all filtered by user_id via RLS) ──
async function sbLoadAll(table) {
  const { data, error } = await getSB().from(table).select("*");
  if (error) { console.error(`Load ${table}:`, error); return []; }
  return data || [];
}
async function sbUpsertRow(table, row) {
  const { error } = await getSB().from(table).upsert(row, { onConflict: "id" });
  if (error) console.error(`Upsert ${table}:`, error);
}
async function sbDeleteRow(table, id) {
  const { error } = await getSB().from(table).delete().eq("id", String(id));
  if (error) console.error(`Delete ${table}:`, error);
}

// ─── RAZORPAY CONFIG ─────────────────────────────────────────────────────────
const RAZORPAY_KEY = "rzp_live_STQVI4900SmZPY";

const PLANS = [
  { id: "trial",    label: "Free Trial",  price: 0,      display: "₹0",      desc: "Try VManager free",           popular: false, badge: "🆓" },
  { id: "monthly",  label: "Monthly",     price: 20000,  display: "₹200",    desc: "Per month · cancel anytime",  popular: false, badge: "" },
  { id: "yearly",   label: "Yearly",      price: 100000, display: "₹1,000",  desc: "Per year · save 58%",         popular: true,  badge: "⭐" },
  { id: "lifetime", label: "Lifetime",    price: 250000, display: "₹2,500",  desc: "One time · forever access",   popular: false, badge: "♾️" },
];

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ─── INSTALL PROMPT ──────────────────────────────────────────────────────────
function InstallPrompt({ name, onDismiss }) {
  const [step, setStep] = useState("prompt"); // prompt | ios | done
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const handleInstall = async () => {
    if (window.__installPrompt) {
      // Android Chrome — native prompt
      window.__installPrompt.prompt();
      const result = await window.__installPrompt.userChoice;
      window.__installPrompt = null;
      onDismiss();
    } else if (isIOS || isSafari) {
      // iOS Safari — show manual instructions
      setStep("ios");
    } else {
      onDismiss();
    }
  };

  if (step === "ios") return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 24, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 -20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, color: T.navy }}>Add to Home Screen</div>
          <div style={{ fontSize: 13, color: T.textMid, marginTop: 6, lineHeight: 1.6 }}>Follow these steps to install VManager as an app</div>
        </div>
        {[
          ["1️⃣", 'Tap the Share button', '📤 at the bottom of Safari'],
          ["2️⃣", 'Scroll and tap', '"Add to Home Screen" option'],
          ["3️⃣", 'Tap "Add"', 'VManager icon appears on your home screen!'],
        ].map(([num, title, sub]) => (
          <div key={num} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{num}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{title}</div>
              <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16, background: T.amberLight, borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div style={{ fontSize: 12, color: T.amberDark, lineHeight: 1.5 }}>
            Look for the <b>Share icon 📤</b> at the very bottom of your screen in Safari browser.
          </div>
        </div>
        <button onClick={onDismiss}
          style={{ width: "100%", marginTop: 16, padding: "13px", background: T.navy, color: "white", border: "none", borderRadius: 14, fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Got it! ✓
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ background: "white", borderRadius: 28, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 -20px 60px rgba(11,20,55,0.4)", animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* App icon + header */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(11,20,55,0.3)" }}>
            <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 28, color: T.amber }}>V</span>
          </div>
          <div>
            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, color: T.navy }}>
              Add VManager to<br />your Home Screen
            </div>
            <div style={{ fontSize: 12, color: T.textLight, marginTop: 3 }}>Use it like a native app — no browser needed</div>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ background: T.bg, borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
          {[
            ["⚡", "Opens instantly — no browser"],
            ["📱", "Full screen app experience"],
            ["🔔", "Easy to find on home screen"],
            ["🚀", "Works offline too"],
          ].map(([ic, txt]) => (
            <div key={txt} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0" }}>
              <span style={{ fontSize: 16 }}>{ic}</span>
              <span style={{ fontSize: 13, color: T.textMid }}>{txt}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button onClick={handleInstall}
          style={{ width: "100%", padding: "14px", background: T.amber, color: T.navy, border: "none", borderRadius: 14, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 10, boxShadow: `0 6px 20px ${T.amber}50`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          📲 Add to Home Screen
        </button>
        <button onClick={onDismiss}
          style={{ width: "100%", padding: "11px", background: "none", color: T.textLight, border: "none", borderRadius: 12, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
          Maybe later
        </button>

        {/* Arrow hint for iOS */}
        {(isIOS || isSafari) && (
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: T.textLight }}>
            👆 You'll see step-by-step instructions
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH SCREEN (Login + Register + Forgot Password) ───────────────────────
function AuthScreen({ onLogin }) {
  const [screen,  setScreen]  = useState("login"); // login | register | plan | paying | success | forgot
  const [showInstall, setShowInstall] = useState(false);
  const [savedPayload, setSavedPayload] = useState(null); // store profile after registration
  const [savedUser, setSavedUser]       = useState(null); // store supabase user after registration
  // Login
  const [lEmail,  setLEmail]  = useState(() => localStorage.getItem("vm_email") || "");
  const [lPass,   setLPass]   = useState(() => localStorage.getItem("vm_pass")  || "");
  const [lShowP,  setLShowP]  = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("vm_email"));
  // Register
  const [rName,   setRName]   = useState("");
  const [rPhone,  setRPhone]  = useState("");
  const [rEmail,  setREmail]  = useState("");
  const [rPass,   setRPass]   = useState("");
  const [rPass2,  setRPass2]  = useState("");
  const [rShowP,  setRShowP]  = useState(false);
  const [rCode,   setRCode]   = useState("");
  const [plan,    setPlan]    = useState("yearly");
  // Forgot
  const [fEmail,  setFEmail]  = useState("");
  const [fSent,   setFSent]   = useState(false);
  // Shared
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [info,    setInfo]    = useState("");

  // ── Check existing session ──
  useEffect(() => {
    getSB().auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      sbGetProfile(session.user.id).then(pr => {
        if (pr) onLogin(session.user, pr);
      });
    });
  }, []);

  const mapErr = msg => {
    if (!msg) return "Something went wrong. Please try again.";
    if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) return "Wrong email or password.";
    if (msg.includes("already registered") || msg.includes("User already registered")) return "This email is already registered. Please sign in.";
    if (msg.includes("Password should") || msg.includes("weak_password")) return "Password must be at least 6 characters.";
    if (msg.includes("Email not confirmed")) return "Please verify your email first. Check your inbox.";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) return "Network error. Check your internet.";
    if (msg.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
    return msg;
  };

  // ── LOGIN ──
  const handleLogin = async () => {
    setErr(""); setInfo("");
    if (!lEmail.trim()) return setErr("Enter your email address.");
    if (!lPass)         return setErr("Enter your password.");
    setLoading(true);
    try {
      const { data, error } = await getSB().auth.signInWithPassword({ email: lEmail.trim(), password: lPass });
      if (error) throw error;
      if (remember) {
        localStorage.setItem("vm_email", lEmail.trim());
        localStorage.setItem("vm_pass", lPass);
      } else {
        localStorage.removeItem("vm_email");
        localStorage.removeItem("vm_pass");
      }
      const pr = await sbGetProfile(data.user.id);
      onLogin(data.user, pr || {});
    } catch (e) { setErr(mapErr(e.message)); }
    finally { setLoading(false); }
  };

  // ── REGISTER STEP 1: Validate → go to plan selection ──
  const handleRegister = () => {
    setErr("");
    if (!rName.trim())  return setErr("Please enter your full name.");
    if (!rPhone.trim() || rPhone.trim().replace(/\D/g,"").length < 10) return setErr("Enter a valid 10-digit phone number.");
    if (!rEmail.trim()) return setErr("Please enter your email address.");
    if (!rPass)         return setErr("Please enter a password.");
    if (rPass.length < 6) return setErr("Password must be at least 6 characters.");
    if (rPass !== rPass2)  return setErr("Passwords do not match.");
    setErr("");
    setScreen("plan");
  };

  // ── PAYMENT / REGISTER STEP 2: Handle payment then create account ──
  const handlePayment = async () => {
    setErr(""); setLoading(true);
    const selected = PLANS.find(p => p.id === plan);

    const createAccount = async (paymentId) => {
      setScreen("paying");
      try {
        let supaUser;
        const { data, error } = await getSB().auth.signUp({ email: rEmail.trim(), password: rPass });
        if (error && error.message.includes("already registered")) {
          const { data: d2, error: e2 } = await getSB().auth.signInWithPassword({ email: rEmail.trim(), password: rPass });
          if (e2) throw e2;
          supaUser = d2.user;
        } else {
          if (error) throw error;
          supaUser = data.user;
        }
        if (!supaUser) throw new Error("Account creation failed.");

        // ── CRITICAL: sign in to establish session before saving profile ──
        // signUp alone doesn't always create a session (email confirmation may be required)
        // so we explicitly sign in to get a valid session with auth.uid()
        let sessionUser = supaUser;
        try {
          const { data: signInData } = await getSB().auth.signInWithPassword({
            email: rEmail.trim(), password: rPass
          });
          if (signInData?.user) sessionUser = signInData.user;
        } catch {}

        // Wait a tick for session to propagate
        await new Promise(r => setTimeout(r, 300));

        const now = new Date();
        let expiresAt = null;
        if (selected.id === "trial")    { const d = new Date(now); d.setDate(d.getDate() + 7);         expiresAt = d.toISOString(); }
        if (selected.id === "monthly")  { const d = new Date(now); d.setDate(d.getDate() + 30);        expiresAt = d.toISOString(); }
        if (selected.id === "yearly")   { const d = new Date(now); d.setFullYear(d.getFullYear() + 1); expiresAt = d.toISOString(); }
        if (selected.id === "lifetime") { expiresAt = null; }

        const profilePayload = {
          name:          rName.trim(),
          phone:         rPhone.trim(),
          email:         rEmail.trim(),
          paid:          true,
          plan:          selected.label,
          plan_id:       selected.id,
          payment_id:    paymentId || "free_trial",
          referral_code: rCode.trim() || null,
          paid_at:       now.toISOString(),
          expires_at:    expiresAt,
        };

        // Save profile using security definer function (bypasses RLS safely)
        await sbSaveProfile(sessionUser.id, profilePayload);
        let saved = true;

        // Always save to localStorage as guarantee
        localStorage.setItem("vm_pending_profile_" + sessionUser.id, JSON.stringify(profilePayload));

        // Store in state for immediate app access (bypasses Supabase read)
        setSavedUser(sessionUser);
        setSavedPayload(profilePayload);
        setScreen("success");
        setTimeout(() => { setShowInstall(true); }, 1800);
      } catch (e) {
        setErr("Error creating account: " + e.message);
        setScreen("plan");
        setLoading(false);
      }
    };

    // Free trial — skip payment
    if (selected.price === 0) {
      await createAccount(null);
      return;
    }

    // Paid plan — open Razorpay
    const ok = await loadRazorpay();
    if (!ok) { setErr("Payment gateway failed to load. Check your internet."); setLoading(false); return; }

    try {
      const rzp = new window.Razorpay({
        key:         RAZORPAY_KEY,
        amount:      selected.price,
        currency:    "INR",
        name:        "VManager",
        description: selected.label + " Plan",
        prefill:     { name: rName, contact: rPhone, email: rEmail },
        theme:       { color: "#F5A623" },
        modal:       { ondismiss: () => setLoading(false) },
        handler: async (response) => {
          await createAccount(response.razorpay_payment_id);
        },
      });
      rzp.on("payment.failed", r => {
        setErr("Payment failed: " + (r.error?.description || "Please try again."));
        setLoading(false);
      });
      rzp.open();
    } catch (e) {
      setErr("Could not open payment: " + e.message);
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD ──
  const handleForgot = async () => {
    setErr("");
    if (!fEmail.trim()) return setErr("Enter your email address.");
    setLoading(true);
    try {
      const { error } = await getSB().auth.resetPasswordForEmail(fEmail.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setFSent(true);
    } catch (e) { setErr(mapErr(e.message)); }
    finally { setLoading(false); }
  };

  // ── PAYING / SUCCESS SCREENS ──
  if (screen === "paying" || screen === "success") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.navy}, #1a2a6c)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes popIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{ textAlign: "center", color: "white" }}>
        {screen === "success"
          ? <>
              <div style={{ fontSize: 80, marginBottom: 16, animation: "popIn 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>🎉</div>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 28, color: T.amber }}>Welcome, {rName.split(" ")[0]}!</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>Account created successfully!</div>
              <div style={{ marginTop: 32 }}>
                <button onClick={() => onLogin(savedUser, savedPayload)}
                  style={{ background: T.amber, color: T.navy, border: "none", borderRadius: 14, padding: "14px 32px", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, margin: "0 auto", boxShadow: `0 8px 24px ${T.amber}50` }}>
                  🚀 Open VManager →
                </button>
              </div>
            </>
          : <><div style={{ width: 56, height: 56, border: `4px solid rgba(255,255,255,.15)`, borderTop: `4px solid ${T.amber}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }}>Setting up your account…</div></>
        }
      </div>
      {showInstall && (
        <InstallPrompt
          name={rName}
          onDismiss={() => {
            setShowInstall(false);
            onLogin(savedUser, savedPayload);
          }}
        />
      )}
    </div>
  );

  // ── PLAN SELECTION SCREEN ──
  if (screen === "plan") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.navy} 0%, #1a2a6c 60%, #0d3b6e 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "100%", maxWidth: 390 }}>
        <button onClick={() => { setScreen("register"); setErr(""); }}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back
        </button>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 32, color: T.amber }}>V<span style={{ color: "white" }}>Manager</span></div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 6 }}>Hi {rName.split(" ")[0]}! Choose your plan 👇</div>
        </div>

        {err && <div style={{ background: "rgba(240,71,112,0.15)", border: "1px solid rgba(240,71,112,0.4)", color: "#ff7c96", padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>⚠️ {err}</div>}

        {PLANS.map(p => (
          <div key={p.id} onClick={() => setPlan(p.id)}
            style={{ background: plan === p.id ? "white" : "rgba(255,255,255,0.07)", border: `2px solid ${plan === p.id ? T.amber : "rgba(255,255,255,0.12)"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
            {p.popular && <div style={{ position: "absolute", top: -11, right: 16, background: T.amber, color: T.navy, fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 20 }}>⭐ BEST VALUE</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, color: plan === p.id ? T.navy : "white" }}>{p.badge} {p.label}</div>
                <div style={{ fontSize: 12, color: plan === p.id ? T.textMid : "rgba(255,255,255,0.5)", marginTop: 3 }}>{p.desc}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, color: plan === p.id ? T.navy : T.amber }}>{p.display}</div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${plan === p.id ? T.amber : "rgba(255,255,255,0.3)"}`, background: plan === p.id ? T.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {plan === p.id && <span style={{ color: "white", fontSize: 13 }}>✓</span>}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>What you get</div>
          {["📦 Full Inventory Management","🛒 Sales & Invoice Generator","💬 WhatsApp Invoice Sharing","📊 Reports & Analytics","🔔 Smart Alerts","⚡ AAJ KI ENERGY Videos","☁️ Cloud Sync via Supabase"].map(f => (
            <div key={f} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", padding: "3px 0", display: "flex", gap: 8 }}>
              <span style={{ color: T.amber }}>✓</span><span>{f}</span>
            </div>
          ))}
        </div>

        <button onClick={handlePayment} disabled={loading}
          style={{ width: "100%", padding: "15px", background: loading ? "#999" : T.amber, color: T.navy, border: "none", borderRadius: 14, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : `0 8px 24px ${T.amber}50` }}>
          {loading
            ? <><span style={{ width: 20, height: 20, border: `3px solid ${T.navy}30`, borderTop: `3px solid ${T.navy}`, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /><span>Processing…</span></>
            : plan === "trial"
              ? <><span>🆓</span><span>Start Free Trial →</span></>
              : <><span>🔒</span><span>Pay {PLANS.find(p => p.id === plan)?.display} Securely →</span></>
          }
        </button>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          {plan === "trial" ? "No payment required · Start immediately" : "Powered by Razorpay · UPI · Cards · Net Banking"}
        </div>
      </div>
    </div>
  );

  // ── FORGOT PASSWORD SCREEN ──
  if (screen === "forgot") return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.navy} 0%, #1a2a6c 60%, #0d3b6e 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "100%", maxWidth: 390 }}>
        <button onClick={() => { setScreen("login"); setErr(""); setFSent(false); setFEmail(""); }}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Sign In
        </button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🔐</div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 28, color: T.amber }}>Forgot Password?</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
            {fSent ? "We've sent a reset link to your email." : "Enter your email and we'll send a reset link."}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
          {fSent ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, color: T.navy, marginBottom: 8 }}>Check Your Email!</div>
              <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6, marginBottom: 20 }}>
                We sent a password reset link to <b>{fEmail}</b>.<br />Click the link in the email to set a new password.
              </div>
              <div style={{ background: T.amberLight, borderRadius: 12, padding: "12px 14px", fontSize: 12, color: T.amberDark, marginBottom: 16, textAlign: "left" }}>
                💡 Didn't receive it? Check your spam/junk folder.
              </div>
              <button onClick={() => { setFSent(false); setFEmail(""); }}
                style={{ width: "100%", padding: "12px", background: T.bg, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Resend Email
              </button>
            </div>
          ) : (
            <>
              {err && <div style={{ background: T.roseLight, color: T.rose, padding: "12px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", gap: 8 }}><span>⚠️</span><span>{err}</span></div>}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>✉️</span>
                  <input className="input" style={{ paddingLeft: 40 }} value={fEmail} onChange={e => setFEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleForgot()} placeholder="your@email.com" type="email" autoFocus />
                </div>
              </div>
              <button onClick={handleForgot} disabled={loading}
                style={{ width: "100%", padding: "14px", background: loading ? "#ccc" : T.amber, color: T.navy, border: "none", borderRadius: 14, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : `0 6px 20px ${T.amber}60` }}>
                {loading
                  ? <><span style={{ width: 18, height: 18, border: `2px solid ${T.navy}40`, borderTop: `2px solid ${T.navy}`, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /><span>Sending…</span></>
                  : "Send Reset Link 📧"
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ── LOGIN / REGISTER ──
  const isLogin = screen === "login";
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.navy} 0%, #1a2a6c 60%, #0d3b6e 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 44, color: T.amber, letterSpacing: -1 }}>V<span style={{ color: "white" }}>Manager</span></div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 4 }}>Vestige Distributor Business App</div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
          {[["📦","Inventory"],["🛒","Sales"],["🎁","Refer"],["⚡","Videos"]].map(([ic,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.35)", fontSize: 11 }}><span>{ic}</span><span>{l}</span></div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 390, background: "white", borderRadius: 28, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", background: T.bg, margin: 20, borderRadius: 16, padding: 4 }}>
          {[["login","👋 Sign In"],["register","✨ Register"]].map(([s,l]) => (
            <button key={s} onClick={() => { setScreen(s); setErr(""); setInfo(""); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 13, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "DM Sans,sans-serif", background: screen === s ? T.navy : "transparent", color: screen === s ? "white" : T.textMid, boxShadow: screen === s ? "0 4px 12px rgba(11,20,55,.2)" : "none", transition: "all .25s" }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 24px 28px" }}>
          {err  && <div style={{ background: T.roseLight, border: `1px solid ${T.rose}40`, color: T.rose, padding: "12px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.5 }}><span>⚠️</span><span>{err}</span></div>}
          {info && <div style={{ background: T.emeraldLight, border: `1px solid ${T.emerald}40`, color: T.emerald, padding: "12px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>✅ {info}</div>}

          {/* Register fields */}
          {!isLogin && (
            <>
              {[["Full Name *","👤",rName,setRName,"text","Your full name"],["Phone Number *","📞",rPhone,setRPhone,"tel","9876543210"]].map(([lbl,ic,val,setter,type,ph]) => (
                <div key={lbl} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>{lbl}</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{ic}</span>
                    <input className="input" style={{ paddingLeft: 40 }} value={val} onChange={e => setter(e.target.value)} placeholder={ph} type={type} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Referral code (register only) */}
          {!isLogin && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                Referral Code <span style={{ color: T.textLight, textTransform: "none", fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🎁</span>
                <input className="input" style={{ paddingLeft: 40, textTransform: "uppercase", letterSpacing: 2 }}
                  value={rCode} onChange={e => setRCode(e.target.value.toUpperCase())} placeholder="Enter referral code" />
              </div>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Email Address *</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>✉️</span>
              <input className="input" style={{ paddingLeft: 40 }} value={isLogin ? lEmail : rEmail} onChange={e => isLogin ? setLEmail(e.target.value) : setREmail(e.target.value)} placeholder="you@gmail.com" type="email" autoComplete="email" onKeyDown={e => e.key === "Enter" && isLogin && handleLogin()} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: isLogin ? 8 : 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Password *</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔑</span>
              <input className="input" style={{ paddingLeft: 40, paddingRight: 44 }}
                value={isLogin ? lPass : rPass}
                onChange={e => isLogin ? setLPass(e.target.value) : setRPass(e.target.value)}
                placeholder={isLogin ? "Your password" : "Min 6 characters"}
                type={(isLogin ? lShowP : rShowP) ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                onKeyDown={e => e.key === "Enter" && isLogin && handleLogin()} />
              <button onClick={() => isLogin ? setLShowP(v => !v) : setRShowP(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.textLight, padding: 4 }}>
                {(isLogin ? lShowP : rShowP) ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Password strength (register) */}
            {!isLogin && rPass.length > 0 && (
              <div style={{ marginTop: 6, display: "flex", gap: 4, alignItems: "center" }}>
                {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: rPass.length >= i * 2 ? (rPass.length < 6 ? T.rose : rPass.length < 10 ? T.amber : T.emerald) : T.border, transition: "background 0.3s" }} />)}
                <span style={{ fontSize: 10, color: rPass.length < 6 ? T.rose : rPass.length < 10 ? T.amberDark : T.emerald, fontWeight: 600, marginLeft: 4, whiteSpace: "nowrap" }}>
                  {rPass.length < 6 ? "Too short" : rPass.length < 10 ? "Good" : "Strong ✓"}
                </span>
              </div>
            )}
          </div>

          {/* Remember me + Forgot password (login only) */}
          {isLogin && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: T.navy, cursor: "pointer" }} />
                <span style={{ fontSize: 13, color: T.textMid, fontWeight: 500 }}>Remember me</span>
              </label>
              <span onClick={() => { setScreen("forgot"); setFEmail(lEmail); setErr(""); }}
                style={{ fontSize: 12, color: T.navy, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                Forgot Password?
              </span>
            </div>
          )}

          {/* Confirm password (register) */}
          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔒</span>
                <input className="input" style={{ paddingLeft: 40, borderColor: rPass2 && rPass2 !== rPass ? T.rose : rPass2 && rPass2 === rPass ? T.emerald : T.border }}
                  value={rPass2} onChange={e => setRPass2(e.target.value)} placeholder="Re-enter password"
                  type={rShowP ? "text" : "password"} autoComplete="new-password"
                  onKeyDown={e => e.key === "Enter" && handleRegister()} />
                {rPass2 && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{rPass2 === rPass ? "✅" : "❌"}</span>}
              </div>
            </div>
          )}

          {/* CTA button */}
          <button onClick={isLogin ? handleLogin : handleRegister} disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#ccc" : T.amber, color: T.navy, border: "none", borderRadius: 14, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", transition: "all .2s", boxShadow: loading ? "none" : `0 6px 20px ${T.amber}60`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading
              ? <><span style={{ width: 18, height: 18, border: `2px solid ${T.navy}40`, borderTop: `2px solid ${T.navy}`, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /><span>Please wait…</span></>
              : isLogin ? "Sign In to VManager →" : "Continue to Plan Selection →"
            }
          </button>

          {/* Switch tab */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: T.textMid }}>
            {isLogin ? "New user? " : "Already have an account? "}
            <span style={{ color: T.navy, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => { setScreen(isLogin ? "register" : "login"); setErr(""); setInfo(""); }}>
              {isLogin ? "Register here" : "Sign In"}
            </span>
          </div>

          {/* Security note */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "10px 14px", background: T.bg, borderRadius: 10 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div style={{ fontSize: 11, color: T.textLight, lineHeight: 1.4 }}>Your account is protected by Supabase Authentication.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "home",      icon: "🏠", label: "Home" },
  { id: "inventory", icon: "📦", label: "Stock" },
  { id: "sales",     icon: "🛒", label: "Sales" },
  { id: "customers", icon: "👥", label: "Clients" },
  { id: "refer",     icon: "🎁", label: "Refer" },
  { id: "profile",   icon: "👤", label: "Profile" },
];

export default function App() {
  const [tab, setTab]               = useState("home");
  const [products, setProductsRaw]  = useState(seedProducts); // start with seed, replace on load
  const [customers, setCustomersRaw]= useState([]);
  const [sales, setSalesRaw]        = useState([]);
  const [toast, setToast]           = useState("");
  const [profile, setProfile]       = useState({ name: "Distributor", vestId: "", phone: "", address: "", upline: "" });
  const [user, setUser]             = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authReady, setAuthReady]   = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [dataReady, setDataReady]   = useState(false);
  const [subStatus, setSubStatus]   = useState(null); // null | active | expired | blocked
  const toastTimer = useRef(null);
  const userIdRef = useRef(null);

  // ── Load all data for this user from Supabase ──
  const loadUserData = useCallback(async (uid) => {
    setSyncing(true);
    try {
      const [prods, custs, sals] = await Promise.all([
        sbLoadAll("products"),
        sbLoadAll("customers"),
        sbLoadAll("sales"),
      ]);
      // Map DB column names → app field names
      // If user has products in Supabase use those, else keep seedProducts
      if (prods.length > 0) {
        setProductsRaw(prods.map(r => ({
          ...r,
          buyPrice: r.buy_price ?? r.buyPrice ?? 0,
        })));
      }
      // else seedProducts already in state from useState(seedProducts)
      setCustomersRaw(custs.map(r => ({
        ...r,
        lastOrder: r.last_order ?? r.lastOrder ?? "",
      })));
      setSalesRaw(sals.map(r => ({
        ...r,
        customerId:    r.customer_id    ?? r.customerId,
        customerName:  r.customer_name  ?? r.customerName,
        paymentStatus: r.payment_status ?? r.paymentStatus,
        paymentMethod: r.payment_method ?? r.paymentMethod,
        date:          r.sale_date      ?? r.date,
        items: typeof r.items === "string" ? JSON.parse(r.items) : (r.items || []),
      })));
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setSyncing(false);
      setDataReady(true); // data is ready — show the app
    }
  }, []);

  // ── Check Supabase session on mount ──
  useEffect(() => {
    const sb = getSB();
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        userIdRef.current = session.user.id;
        const sbPr = await sbGetProfile(session.user.id);
        const pr = getBestProfile(session.user.id, sbPr);
        const sub = checkSubscription(pr);
        setSubStatus(sub.status);
        if (sub.active) {
          setUser(session.user);
          setUserProfile(pr || {});
          if (pr?.name) setProfile(prev => ({
            ...prev,
            name:    pr.name    || prev.name,
            phone:   pr.phone   || prev.phone,
            vestId:  pr.vest_id || pr.vestId || prev.vestId,
            address: pr.address || prev.address,
            upline:  pr.upline  || prev.upline,
          }));
          await loadUserData(session.user.id);
        } else {
          // Subscription expired or blocked — sign out silently
          await getSB().auth.signOut();
          setSubStatus(sub.status); // keep status for showing expired screen
        }
      }
      setAuthReady(true);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_e, session) => {
      if (!session) {
        setUser(null); setUserProfile(null);
        setProductsRaw([]); setCustomersRaw([]); setSalesRaw([]);
        userIdRef.current = null;
      }
    });
    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }, []);

  const handleLogin = useCallback(async (supaUser, pr) => {
    setDataReady(false); // ← reset so loading screen shows until data is fetched
    // If called with null (from install prompt dismiss), get current session
    let actualUser = supaUser;
    if (!actualUser) {
      const { data: { session } } = await getSB().auth.getSession();
      actualUser = session?.user || null;
    }
    if (!actualUser) return;

    // Use the passed profile first (avoids race condition on new registration)
    // For existing sessions, fetch from Supabase then merge with localStorage
    let profileToUse = pr;
    if (!pr || !pr.paid_at) {
      // Fetch from Supabase
      let sbPr = null;
      try { sbPr = await sbGetProfile(actualUser.id); } catch {}
      // Merge with localStorage (localStorage wins for subscription fields)
      profileToUse = getBestProfile(actualUser.id, sbPr);
    }

    // Always retry background sync to Supabase if localStorage has valid data
    const localRaw = localStorage.getItem("vm_pending_profile_" + actualUser.id);
    if (localRaw) {
      try {
        const localPr = JSON.parse(localRaw);
        if (localPr?.paid === true) {
          sbSaveProfile(actualUser.id, localPr).then(() => {
            console.log("✅ Profile synced to Supabase");
          });
        }
      } catch {}
    }

    const sub = checkSubscription(profileToUse);
    setSubStatus(sub.status);

    if (!sub.active) {
      // Only sign out if truly blocked/expired (not new user still saving)
      if (sub.status === "blocked" || sub.status === "expired") {
        await getSB().auth.signOut();
      }
      return;
    }

    userIdRef.current = actualUser.id;
    setUser(actualUser);
    const localPr = profileToUse || {};
    setUserProfile(localPr);
    if (localPr.name) setProfile(prev => ({ ...prev, name: localPr.name, phone: localPr.phone || "" }));

    // Refresh from Supabase after 2 seconds (safe delay after write propagation)
    setTimeout(async () => {
      try {
        const fp2 = await sbGetProfile(actualUser.id);
        if (fp2) {
          setUserProfile(fp2);
          if (fp2.name) setProfile(prev => ({ ...prev, name: fp2.name, phone: fp2.phone || "" }));
        }
      } catch {}
    }, 2000);

    await loadUserData(actualUser.id);
  }, [loadUserData]);

  const handleLogout = async () => {
    if (!window.confirm("Sign out of VManager?")) return;
    await getSB().auth.signOut();
    setUser(null); setUserProfile(null);
    setProductsRaw([]); setCustomersRaw([]); setSalesRaw([]);
    setDataReady(false);
    userIdRef.current = null;
  };

  // ── Cloud-synced setters: update state + Supabase ──
  const uid = userIdRef.current;

  const setProducts = useCallback((updater) => {
    setProductsRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (uid) {
        next.forEach(p => sbUpsertRow("products", {
          id: String(p.id), user_id: uid,
          name: p.name, category: p.category,
          buy_price: p.buyPrice, mrp: p.mrp,
          stock: p.stock, unit: p.unit,
        }));
        const ids = new Set(next.map(p => String(p.id)));
        prev.filter(p => !ids.has(String(p.id))).forEach(p => sbDeleteRow("products", p.id));
      }
      return next;
    });
  }, [uid]);

  const setCustomers = useCallback((updater) => {
    setCustomersRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (uid) {
        next.forEach(c => sbUpsertRow("customers", {
          id: String(c.id), user_id: uid,
          name: c.name, phone: c.phone || "",
          address: c.address || "", notes: c.notes || "",
          last_order: c.lastOrder || "",
        }));
        const ids = new Set(next.map(c => String(c.id)));
        prev.filter(c => !ids.has(String(c.id))).forEach(c => sbDeleteRow("customers", c.id));
      }
      return next;
    });
  }, [uid]);

  const setSales = useCallback((updater) => {
    setSalesRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (uid) {
        next.forEach(s => sbUpsertRow("sales", {
          id: String(s.id), user_id: uid,
          customer_id: String(s.customerId || ""),
          customer_name: s.customerName || "",
          total: s.total,
          payment_status: s.paymentStatus,
          payment_method: s.paymentMethod,
          sale_date: s.date,
          items: JSON.stringify(s.items || []),
        }));
      }
      return next;
    });
  }, [uid]);

  // ── Loading spinner ──
  if (!authReady) return (
    <div style={{ minHeight: "100vh", background: T.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 38, color: T.amber }}>V<span style={{ color: "white" }}>Manager</span></div>
      <div style={{ width: 40, height: 40, border: `3px solid rgba(255,255,255,.15)`, borderTop: `3px solid ${T.amber}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  // ── Data loading screen (logged in but still fetching from Supabase) ──
  if (user && !dataReady) return (
    <div style={{ minHeight: "100vh", background: T.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 38, color: T.amber, animation: "fadeIn 0.4s ease" }}>
        V<span style={{ color: "white" }}>Manager</span>
      </div>
      <div style={{ width: 44, height: 44, border: `3px solid rgba(255,255,255,.1)`, borderTop: `3px solid ${T.amber}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500, animation: "fadeIn 0.8s ease" }}>
        Loading your data…
      </div>
    </div>
  );

  // ── Expired subscription screen ──
  if (!user && subStatus === "expired") return (
    <>
      <style>{css}</style>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.navy}, #1a2a6c)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 380, width: "100%" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏰</div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 28, color: T.amber, marginBottom: 8 }}>Plan Expired!</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 28, lineHeight: 1.6 }}>
            Your VManager subscription has expired. Renew now to continue accessing your business data.
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "16px", marginBottom: 24, textAlign: "left" }}>
            {[
              ["📅 Monthly", "₹200 / month"],
              ["📆 Yearly ⭐", "₹1,000 / year — Save 58%"],
              ["♾️ Lifetime", "₹2,500 — One time, forever"],
            ].map(([p, price]) => (
              <div key={p} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
                <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{p}</span>
                <span style={{ color: T.amber, fontWeight: 700 }}>{price}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setSubStatus(null)} style={{ width: "100%", padding: "15px", background: T.amber, color: T.navy, border: "none", borderRadius: 14, fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", marginBottom: 10, boxShadow: `0 8px 24px ${T.amber}40` }}>
            🔄 Renew Subscription
          </button>
          <button onClick={() => setSubStatus(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}>
            Sign in with different account
          </button>
        </div>
      </div>
    </>
  );

  // ── Blocked screen ──
  if (!user && subStatus === "blocked") return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🚫</div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 24, color: T.rose, marginBottom: 8 }}>Access Blocked</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24 }}>
            Your account has been suspended. Please contact support for assistance.
          </div>
          <button onClick={() => setSubStatus(null)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 12, padding: "12px 28px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
            ← Try Different Account
          </button>
        </div>
      </div>
    </>
  );

  // ── Not logged in → show AuthScreen ──
  if (!user) return (
    <>
      <style>{css}</style>
      <AuthScreen onLogin={handleLogin} />
    </>
  );

  const pendingAlerts = products.filter(p => p.stock < 5).length + sales.filter(s => s.paymentStatus === "pending").length;

  return (
    <>
      <style>{css}</style>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div className="app-wrap">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title syne"><span>V</span>Manager</div>
          <div className="topbar-right">
            <button className="icon-btn" onClick={() => setTab("alerts")} style={{ position: "relative" }}>
              🔔
              {pendingAlerts > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: T.rose, color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pendingAlerts}
                </span>
              )}
            </button>
            <button className="icon-btn" onClick={() => setTab("education")}>🎓</button>
            <button className="icon-btn" onClick={() => setTab("profile")}>👤</button>
            <button
              onClick={handleLogout}
              style={{ background: T.rose, border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Syncing indicator (subtle, only when syncing) */}
        {syncing && (
          <div style={{ background: T.amberLight, padding: "4px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 11, color: T.amberDark, fontWeight: 600 }}>⏳ Syncing data…</span>
          </div>
        )}

        {/* Content */}
        <div className="content">
          {tab === "home"      && <Dashboard products={products} sales={sales} customers={customers} onNavigate={setTab} />}
          {tab === "inventory" && <Inventory products={products} setProducts={setProducts} showToast={showToast} />}
          {tab === "sales"     && <Sales products={products} setProducts={setProducts} customers={customers} sales={sales} setSales={setSales} showToast={showToast} profile={profile} />}
          {tab === "customers" && <Customers customers={customers} setCustomers={setCustomers} sales={sales} showToast={showToast} />}
          {tab === "refer"     && <ReferEarn user={user} showToast={showToast} />}
          {tab === "alerts"    && <Alerts products={products} sales={sales} customers={customers} />}
          {tab === "education" && <Education showToast={showToast} />}
          {tab === "profile"   && <Profile showToast={showToast} profile={profile} setProfile={setProfile} onLogout={handleLogout} userProfile={userProfile} user={user} products={products} customers={customers} sales={sales} setProducts={setProducts} setCustomers={setCustomers} setSales={setSales} />}
          {tab === "help"      && <HelpSupport user={user} showToast={showToast} />}
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </div>

        {toast && <Toast msg={toast} />}
      </div>
    </>
  );
}
