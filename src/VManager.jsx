import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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
  // AYURVEDIC PROPRIETARY SUPPLEMENT
  { id: 1,  name: "Vestige Neem 100 tabs",              category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 2,  name: "Vestige Flex Oil (Omega-3) 90 tabs", category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 3,  name: "Vestige Spirulina 100 tabs",         category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 4,  name: "Vestige Noni 90 tabs",               category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 5,  name: "Vestige Aloe Vera 60 tabs",          category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 6,  name: "Vestige Amla (Vitamin-C) 60 tabs",   category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 7,  name: "Vestige Ganoderma 90 tabs",          category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 8,  name: "Vestige Colostrum 60 tabs",          category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 9,  name: "Vestige Glucosamine 60 tabs",        category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 10, name: "Vestige Glucosamine 100 tabs",       category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 11, name: "Vestige Collagen 10 Sachets",        category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 12, name: "Vestige L Arginine 15x10g",          category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 13, name: "Vestige Protein Powder 200g",        category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Jar" },
  { id: 14, name: "Vestige Protein Powder 400g",        category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 15, name: "Vestige Fiber 200g",                 category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 16, name: "Vestige Folic & Iron Plus 60 tabs",  category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 17, name: "Vestige Calcium 100 tabs",           category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 18, name: "Vestige Stevia 100 tabs",            category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 19, name: "Vestige Cranberry 60 tabs",          category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 20, name: "Vestige U-Control 30 tabs",          category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 21, name: "Vestige Pre Glucohealth 60 tabs",    category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 22, name: "Vestige Eye Support 30 tabs",        category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 23, name: "Vestige Hair Skin & Nail 90 tabs",   category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 24, name: "Vestige Curcumin Plus 60 tabs",      category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 25, name: "Vestige Shatavari Max 90 tabs",      category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 26, name: "Vestige Detox Foot Patches 10 pcs",  category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 27, name: "Vestige Coenzyme Q10 30 tabs",       category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 28, name: "Veslim Protein 200g",                category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 29, name: "Veslim Protein 400g",                category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 30, name: "Veslim Shake (Weight Loss) 500g",    category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 31, name: "Veslim Capsules 90 tabs",            category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 32, name: "Veslim Energy Drink Mix 40g",        category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 33, name: "Veslim Tea 150g",                    category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 34, name: "Veslim Shake Mix 500g",              category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 35, name: "Veslim Shaker",                      category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 36, name: "Ayusante Procard 60 tabs",           category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 37, name: "Ayusante Glucohealth 60 tabs",       category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 38, name: "Ayusante Toxclean 60 tabs",          category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 39, name: "Ayusante Vital Complex 60 tabs",     category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 40, name: "Ayusante Kidney Health 60 tabs",     category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 41, name: "Ayusante Liver Health 60 tabs",      category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 42, name: "Ayusante Respocare 60 tabs",         category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 43, name: "Ayusante Prostate Care 60 tabs",     category: "Ayurvedic", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  // VESTIGE PRIME
  { id: 44, name: "Krill Oil 30 tabs",                  category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 45, name: "Combiotics 30 tabs",                 category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 46, name: "Sea Buckthorn 60 tabs",              category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 47, name: "Multivitamin Gummies 60 tabs",       category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 48, name: "Absorvit Spray Multivitamin/B12",    category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 49, name: "Absorvit Spray Vit C / Vit D",       category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 50, name: "Absorvit Spray Melatonin",           category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 51, name: "Absorvit Spray Biotin",              category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 52, name: "Energy Booster 30 tabs",             category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 53, name: "Concentrated Mineral Drops 60ml",   category: "Vestige Prime", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  // HEALTH CARE & HEALTH FOOD
  { id: 54, name: "Invigo Nutri Drink Choco 200g",      category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 55, name: "Invigo Nutri Drink Choco 500g",      category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 56, name: "Invigo Nutri Drink Vanilla 200g",    category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 57, name: "Invigo Fresh-n-Up Drink Orange 200g",category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 58, name: "Enerva Choco Flaxseed Bar 30g",      category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 59, name: "Enerva Break Fast Cereal 350g",      category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 60, name: "Zeta Premium Spice Tea 200g",        category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 61, name: "Zeta Special Tea 200g",              category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 62, name: "Zeta Premium Coffee 50g",            category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 63, name: "Lite House Rice Bran Oil 2 Ltr",     category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 64, name: "Invigo Tulsi Health Drops 30ml",     category: "Health Food", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  // ASSURE NATURAL
  { id: 65, name: "Assure Face Scrub 75g",              category: "Assure Natural", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 66, name: "Assure Charcoal Peel-Off Mask 75g",  category: "Assure Natural", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 67, name: "Assure Sunscreen SPF-40+ 75g",       category: "Assure Natural", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 68, name: "Assure Day Cream 100g",               category: "Assure Natural", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 69, name: "Assure Lightening SPF 15 75g",       category: "Assure Natural", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 70, name: "Assure Hand & Body Cream 100g",       category: "Assure Natural", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 71, name: "Assure Hair Mask 150g",               category: "Assure Natural", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  // PERSONAL CARE
  { id: 72, name: "Assure Neem Soap 100g",              category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bar" },
  { id: 73, name: "Assure Complexion Bar Soap 75g",     category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bar" },
  { id: 74, name: "Assure Creamy Bar Soap 75g",         category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bar" },
  { id: 75, name: "Assure Germ Protection Soap 75g",    category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bar" },
  { id: 76, name: "Dentassure Toothbrush 4 pcs",        category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 77, name: "Dentassure Toothpaste 100g",         category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 78, name: "Dentassure Whitening Toothpaste 90g",category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 79, name: "Dentassure Gano Toothpaste 100g",    category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 80, name: "Assure Active Deo 150ml",            category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 81, name: "Assure Rapture Deo 150ml",           category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 82, name: "Assure Perfume Spray 125ml",         category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 83, name: "Assure Pocket Perfume Spray",        category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 84, name: "Dentassure Mouth Wash 250ml",        category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 85, name: "Assure Talc 100g",                   category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 86, name: "Assure Hair Oil 200ml",              category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 87, name: "Assure Hand Wash 250ml",             category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 88, name: "Assure Hand & Body Lotion 200ml",    category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 89, name: "Assure Foot Cream 50g",              category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 90, name: "Assure BB Cream SPF 30+ 30g",        category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 91, name: "Assure Sun Defense SPF 30+ 60g",     category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 92, name: "Assure Anti-Ageing Night Cream 60g", category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 93, name: "Assure Fairness Cream 50g",          category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 94, name: "Assure Aloe Cucumber Aquagel 100ml", category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 95, name: "Assure Instant Glow Face Pack 60g",  category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 96, name: "Assure Clarifying Face Wash 60g",    category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 97, name: "Assure Facial Kit 5 kits",           category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 98, name: "Assure Purifying Cleanser+Toner 200ml", category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 99, name: "Assure Daily Moisturizer 200ml",     category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 100,name: "Assure Insta Relief Cream 50g",      category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 101,name: "Assure Body Care Set",               category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Set" },
  { id: 102,name: "Assure Hair Conditioner 75g",        category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 103,name: "Assure Shampoo 200ml",               category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 104,name: "Assure Professional Shampoo 150ml",  category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 105,name: "Assure Hair Serum 30ml",             category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 106,name: "Assure Rinse Off Conditioner 100ml", category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 107,name: "Assure Cherry Blossom Body Butter 100g", category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 108,name: "Assure Vitamin C Gel Creme 50g",     category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 109,name: "Assure Vitamin C Facial Foam 100ml", category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 110,name: "Dew Garden Sanitary Napkin 10 nos",  category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 111,name: "Dew Garden Foaming Wash 80ml",       category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 112,name: "Dew Garden Panty Liners 12 nos",     category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 113,name: "Truman Deo 150ml",                   category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 114,name: "Truman Face Wash 75ml",              category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 115,name: "Truman Bathing Bar 125g",            category: "Personal Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bar" },
  // HOME CARE
  { id: 116,name: "Hyvest Ultrawash Laundry Detergent 500ml",  category: "Home Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 117,name: "Hyvest Ultramatic Detergent Powder 500g",   category: "Home Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 118,name: "Hyvest Ultrascrub Dishwash Liquid 500ml",   category: "Home Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 119,name: "Hyvest Ultraswab Floor Cleaner 500ml",      category: "Home Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 120,name: "Hyvest Ultraguard Toilet Cleaner 500ml",    category: "Home Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 121,name: "Hyvest Ultra Shine Glass Cleaner 500ml",    category: "Home Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  // VEHICLE CARE
  { id: 122,name: "MACH-DRIVE 2-Wheeler 30ml",          category: "Vehicle Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 123,name: "MACH-DRIVE 4-Wheeler 30ml",          category: "Vehicle Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  // MISTRAL OF MILAN
  { id: 124,name: "Mistral Loose Powder",               category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 125,name: "Mistral Micro Compact Powder SPF 10",category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 126,name: "Mistral Brushes 3pc",                category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Set" },
  { id: 127,name: "Mistral Foundation 30ml",            category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 128,name: "Mistral Sindoor",                    category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 129,name: "Mistral Ultra-Stay Nail Lacquer",    category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 130,name: "Mistral Creme Matte Lipstick",       category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 131,name: "Mistral 4 in 1 Liquid Lipstick",    category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 132,name: "Mistral Nail Polish Remover",        category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 133,name: "Mistral Eyeliner Pencil",            category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 134,name: "Mistral Deep Define Kajal Black",    category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 135,name: "Mistral Showtime Mascara",           category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 136,name: "Mistral 3 in 1 Face Palette",       category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 137,name: "Vellino Compact Powder SPF 15",      category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 138,name: "Vellino Lipstick",                   category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 139,name: "Vellino Lip Tint & Balm",            category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 140,name: "Vellino Nail Lacquer",               category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  { id: 141,name: "Vellino Liquid Lipstick",            category: "Mistral", buyPrice: 0, mrp: 0, stock: 0, unit: "Piece" },
  // PREMIUM SKIN CARE
  { id: 142,name: "SF-9 Brightening Cream 50g",         category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 143,name: "SF-9 Youth Elixir Lotion 25ml",      category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 144,name: "SF-9 Under Eye Serum 15ml",          category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 145,name: "SF-9 Blemish Gel 15ml",              category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 146,name: "SF-9 Deep Cleansing Oil 25ml",       category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 147,name: "SF-9 Pro-prep & Prime 30ml",         category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 148,name: "SF-9 Glow Sheet Mask 30ml",          category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 149,name: "SF-9 Intense Hydration Cream 50g",   category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 150,name: "SF-9 Gold Peel Off Mask 50g",        category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 151,name: "SF-9 Radiant Glow Face Mist 50ml",   category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 152,name: "SF-9 Perfecting Vitamin C Serum 50ml",category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 153,name: "SF-9 Hydrating Sunscreen Serum 50ml",category: "Premium Skin", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  // AGRI CARE
  { id: 154,name: "Vestige Agri 82 3x100ml",            category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 155,name: "Vestige Agri 82 500ml",              category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 156,name: "Vestige Agri 82 5 Ltr",              category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 157,name: "Vestige Agri 82 Nano 3x100ml",       category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 158,name: "Vestige Agri 82 Nano 500ml",         category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 159,name: "Vestige Agri 82 Nano 5 Ltr",         category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 160,name: "Vestige Agri-Humic 500ml",           category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 161,name: "Vestige Agri-Humic Granules 5kg",    category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 162,name: "Vestige Agri-Moss 500ml",            category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 163,name: "Vestige Agri-Moss 100ml",            category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Bottle" },
  { id: 164,name: "Vestige Agri-Protek 500g",           category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 165,name: "Vestige Agri-Protek 250g",           category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 166,name: "Vestige Agri-Nanotek 500g",          category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 167,name: "Vestige Agri-Nanotek 250g",          category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 168,name: "Vestige Agri-Gold 100g",             category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
  { id: 169,name: "Vestige Agri-Aquagel 1kg",           category: "Agri Care", buyPrice: 0, mrp: 0, stock: 0, unit: "Pack" },
];

const seedCustomers = [];
const seedSales = [];


const monthlyData = [
  { month: "Oct", sales: 28500, profit: 8200 },
  { month: "Nov", sales: 34200, profit: 10100 },
  { month: "Dec", sales: 41800, profit: 12500 },
  { month: "Jan", sales: 32000, profit: 9400 },
  { month: "Feb", sales: 41500, profit: 12800 },
  { month: "Mar", sales: 53200, profit: 16100 },
];
const productData = [
  { name: "Noni", value: 35 },
  { name: "Coffee", value: 22 },
  { name: "Flax Oil", value: 18 },
  { name: "Spirulina", value: 15 },
  { name: "Others", value: 10 },
];
const PIE_COLORS = [T.amber, T.navy, T.emerald, T.rose, T.textLight];

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
  const todaySales = sales.filter(s => s.date === "2025-03-15").reduce((a, s) => a + s.total, 0);
  const totalInventoryValue = products.reduce((a, p) => a + p.mrp * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 5).length;
  const pendingPayments = sales.filter(s => s.paymentStatus === "pending").reduce((a, s) => a + s.total, 0);
  const monthlyProfit = 16100;

  return (
    <div>
      <div className="hero-card">
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginBottom: 4 }}>MARCH 2025 OVERVIEW</div>
        <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: T.amber, lineHeight: 1.1 }}>{fmt(monthlyProfit)}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Monthly Profit · ↑ 25.8% vs Feb</div>
        <div style={{ marginTop: 16, display: "flex", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Total Sales</div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "white", fontSize: 16 }}>{fmt(53200)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Orders</div>
            <div style={{ fontFamily: "Syne", fontWeight: 700, color: "white", fontSize: 16 }}>38</div>
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
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", marginBottom: 12, color: T.text }}>Sales Trend (6 Months)</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={monthlyData} barSize={20}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: T.textLight }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12 }} />
            <Bar dataKey="sales" fill={T.amber} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
  const cats = ["All", "Ayurvedic", "Vestige Prime", "Health Food", "Assure Natural", "Personal Care", "Home Care", "Vehicle Care", "Mistral", "Premium Skin", "Agri Care"];

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
            options={["Ayurvedic", "Vestige Prime", "Health Food", "Assure Natural", "Personal Care", "Home Care", "Vehicle Care", "Mistral", "Premium Skin", "Agri Care"].map(c => ({ value: c, label: c }))} />
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
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setView("list")}>← Back</button>
        <div className="syne" style={{ fontSize: 18, fontWeight: 800 }}>New Sale</div>
      </div>
      <Select label="Customer" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
        options={customers.map(c => ({ value: String(c.id), label: c.name }))} />
      <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "Syne", marginBottom: 8 }}>Select Products</div>
      {products.map(p => {
        const inCart = cartItems.find(i => i.productId === p.id);
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "white", borderRadius: 12, marginBottom: 8, border: `1px solid ${inCart ? T.amber : T.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: T.textLight }}>MRP: {fmt(p.mrp)} · Stock: {p.stock}</div>
            </div>
            {inCart ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: "4px 10px", minWidth: 28 }} onClick={() => updateQty(p.id, inCart.qty - 1)}>−</button>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center" }}>{inCart.qty}</span>
                <button className="btn btn-amber btn-sm" style={{ padding: "4px 10px", minWidth: 28 }} onClick={() => updateQty(p.id, inCart.qty + 1)}>+</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)} disabled={p.stock === 0}>
                {p.stock === 0 ? "Out" : "Add"}
              </button>
            )}
          </div>
        );
      })}
      {cartItems.length > 0 && (
        <div className="card" style={{ marginTop: 12, border: `1px solid ${T.amber}` }}>
          <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 10 }}>Cart Summary</div>
          {cartItems.map(i => (
            <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
              <span>{i.name} × {i.qty}</span>
              <span style={{ fontWeight: 600 }}>{fmt(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Syne", fontWeight: 700, fontSize: 16 }}>
            <span>Total</span><span style={{ color: T.amber }}>{fmt(total)}</span>
          </div>
          <Select label="Payment Method" value={payMethod} onChange={e => setPayMethod(e.target.value)}
            options={["UPI", "Cash", "Bank Transfer", "Credit", "Pending (Pay Later)"].map(m => ({ value: m, label: m }))} />
          {payMethod === "Pending (Pay Later)" && (
            <div style={{ background: T.amberLight, borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>⏳</span>
              <div style={{ fontSize: 12, color: T.amberDark, fontWeight: 600 }}>Sale will be saved as <b>Pending</b>. You'll get weekly reminders until payment is collected.</div>
            </div>
          )}
          <button className="btn btn-amber btn-full" onClick={completeSale}>Complete Sale & Generate Invoice →</button>
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
        <div key={s.id} className="card" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => { setViewInvoice(s); setView("invoice"); }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
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
        </div>
      ))}
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
      <div className="tab-row">
        {[["products", "📚 Products"], ["energy", "⚡ AAJ KI ENERGY"], ["videos", "🎥 Videos"], ["docs", "📄 Documents"]].map(([v, l]) => (
          <button key={v} className={`chip ${tab === v ? "active" : ""}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

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
          {EDU_DATA.products.map(p => (
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
          {EDU_DATA.videos.map(v => (
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
          {EDU_DATA.docs.map(d => (
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
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({ products, sales }) {
  const [period, setPeriod] = useState("monthly");
  const catData = products.reduce((acc, p) => {
    const ex = acc.find(c => c.name === p.category);
    if (ex) ex.value += p.stock * p.mrp;
    else acc.push({ name: p.category, value: p.stock * p.mrp });
    return acc;
  }, []);

  return (
    <div>
      <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Reports & Analytics</div>
      <div className="tab-row">
        {[["monthly", "Monthly"], ["products", "Products"], ["inventory", "Inventory"]].map(([v, l]) => (
          <button key={v} className={`chip ${period === v ? "active" : ""}`} onClick={() => setPeriod(v)}>{l}</button>
        ))}
      </div>

      {period === "monthly" && (
        <div>
          <div className="stat-grid" style={{ marginBottom: 12 }}>
            <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-value">₹53.2K</div><div className="stat-label">This Month</div></div>
            <div className="stat-card"><div className="stat-icon">💹</div><div className="stat-value" style={{ color: T.emerald }}>+28%</div><div className="stat-label">Growth vs Last</div></div>
          </div>
          <div className="card">
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Monthly Sales (₹)</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: T.textLight }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12 }} />
                <Line type="monotone" dataKey="sales" stroke={T.amber} strokeWidth={3} dot={{ fill: T.amber, strokeWidth: 0, r: 4 }} />
                <Line type="monotone" dataKey="profit" stroke={T.emerald} strokeWidth={2} strokeDasharray="4 2" dot={{ fill: T.emerald, strokeWidth: 0, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <div style={{ width: 14, height: 3, background: T.amber, borderRadius: 2 }} /><span style={{ color: T.textMid }}>Sales</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <div style={{ width: 14, height: 3, background: T.emerald, borderRadius: 2 }} /><span style={{ color: T.textMid }}>Profit</span>
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Monthly Breakdown</div>
            {monthlyData.map(m => (
              <div key={m.month} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{m.month}</span>
                  <span style={{ color: T.textMid }}>{fmt(m.sales)} <span style={{ color: T.emerald }}>+{fmt(m.profit)}</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(m.sales / 55000) * 100}%`, background: T.amber }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {period === "products" && (
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Sales by Product</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={productData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {productData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={v => v + "%"} contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
              {productData.map((d, i) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i] }} />
                  <span style={{ color: T.textMid }}>{d.name} {d.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Best Sellers</div>
            {[...products].sort((a, b) => (b.mrp - b.buyPrice) - (a.mrp - a.buyPrice)).map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: i < 3 ? T.amber : T.textLight, width: 24 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.textLight }}>Margin: {fmt(p.mrp - p.buyPrice)}/unit</div>
                </div>
                <span className="badge badge-green">{(((p.mrp - p.buyPrice) / p.mrp) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {period === "inventory" && (
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Inventory Value by Category</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={catData} barSize={24}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: T.textLight }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12 }} />
                <Bar dataKey="value" fill={T.navy} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Stock Summary</div>
            {products.map(p => (
              <div key={p.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: p.stock < 5 ? T.rose : T.textMid, fontWeight: 600 }}>{p.stock} units</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (p.stock / 25) * 100)}%`, background: p.stock < 5 ? T.rose : p.stock < 10 ? T.amber : T.emerald }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function Profile({ showToast, profile, setProfile, onLogout, userProfile, products, customers, sales, setProducts, setCustomers, setSales }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  return (
    <div>
      <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>My Profile</div>
      <div className="profile-header">
        <div className="profile-avatar">{profile.name[0]}</div>
        <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22 }}>{profile.name}</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Vestige ID: {profile.vestId}</div>
        <div style={{ marginTop: 12, display: "inline-flex", gap: 8, background: "rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: 20 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>⭐ Active Distributor</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "Syne", fontWeight: 700 }}>Personal Info</div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...profile }); setEditing(!editing); }}>{editing ? "Cancel" : "✏️ Edit"}</button>
        </div>
        {editing ? (
          <div>
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="Vestige ID" value={form.vestId} onChange={e => setForm({ ...form, vestId: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Input label="Upline Distributor" value={form.upline} onChange={e => setForm({ ...form, upline: e.target.value })} />
            <button className="btn btn-primary btn-full" onClick={() => { setProfile({ ...form }); setEditing(false); showToast("Profile updated ✓"); }}>Save Changes</button>
          </div>
        ) : (
          <div>
            {[["📞", "Phone", profile.phone], ["📍", "Address", profile.address], ["👤", "Upline", profile.upline]].map(([ic, l, v]) => (
              <div key={l} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 16 }}>{ic}</span>
                <div>
                  <div style={{ fontSize: 10, color: T.textLight, fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 500, marginTop: 1 }}>{v}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>Data Management</div>

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
            const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("
");
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
            const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("
");
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

      <div className="card">
        <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12 }}>App Info</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: T.textMid }}>Version</span><span style={{ fontWeight: 600 }}>VManager v1.0.0</span></div>
        <div className="divider" />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: T.textMid }}>Plan</span><span className="badge badge-amber">{userProfile?.plan || "Free"}</span></div>
        <div className="divider" />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: T.textMid }}>Member Since</span><span style={{ fontWeight: 600, fontSize: 12, color: T.textMid }}>{userProfile?.paid_at ? new Date(userProfile.paid_at).toLocaleDateString("en-IN") : "—"}</span></div>
      </div>

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
  await getSB().from("profiles").upsert({ id: uid, ...payload });
}

// ─── AUTH SCREEN (Login + Register + Forgot Password) ───────────────────────
function AuthScreen({ onLogin }) {
  const [screen,  setScreen]  = useState("login"); // login | register | forgot | success
  // Login
  const [lEmail,  setLEmail]  = useState("");
  const [lPass,   setLPass]   = useState("");
  const [lShowP,  setLShowP]  = useState(false);
  // Register
  const [rName,   setRName]   = useState("");
  const [rPhone,  setRPhone]  = useState("");
  const [rEmail,  setREmail]  = useState("");
  const [rPass,   setRPass]   = useState("");
  const [rPass2,  setRPass2]  = useState("");
  const [rShowP,  setRShowP]  = useState(false);
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
      const pr = await sbGetProfile(data.user.id);
      onLogin(data.user, pr || {});
    } catch (e) { setErr(mapErr(e.message)); }
    finally { setLoading(false); }
  };

  // ── REGISTER ──
  const handleRegister = async () => {
    setErr("");
    if (!rName.trim())  return setErr("Please enter your full name.");
    if (!rPhone.trim() || rPhone.trim().replace(/\D/g,"").length < 10) return setErr("Enter a valid 10-digit phone number.");
    if (!rEmail.trim()) return setErr("Please enter your email address.");
    if (!rPass)         return setErr("Please enter a password.");
    if (rPass.length < 6) return setErr("Password must be at least 6 characters.");
    if (rPass !== rPass2)  return setErr("Passwords do not match.");
    setLoading(true);
    try {
      const { data, error } = await getSB().auth.signUp({ email: rEmail.trim(), password: rPass });
      if (error) throw error;
      const user = data.user;
      if (!user) throw new Error("Registration failed. Please try again.");
      const profilePayload = {
        name:     rName.trim(),
        phone:    rPhone.trim(),
        email:    rEmail.trim(),
        paid:     true,
        plan:     "Free",
        paid_at:  new Date().toISOString(),
      };
      await sbSaveProfile(user.id, profilePayload);
      setInfo("✅ Account created! You can now sign in.");
      setScreen("login");
      setLEmail(rEmail.trim());
    } catch (e) { setErr(mapErr(e.message)); }
    finally { setLoading(false); }
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
          {[["📦","Inventory"],["🛒","Sales"],["📊","Reports"],["⚡","Videos"]].map(([ic,l]) => (
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

          {/* Forgot password link (login only) */}
          {isLogin && (
            <div style={{ textAlign: "right", marginBottom: 18 }}>
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
              : isLogin ? "Sign In to VManager →" : "Create Account →"
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
  { id: "reports",   icon: "📊", label: "Reports" },
  { id: "alerts",    icon: "🔔", label: "Alerts" },
];

export default function App() {
  const [tab, setTab]           = useState("home");
  const [products, setProducts] = useState(seedProducts);
  const [customers, setCustomers] = useState(seedCustomers);
  const [sales, setSales]       = useState(seedSales);
  const [toast, setToast]       = useState("");
  const [profile, setProfile]   = useState({ name: "Distributor", vestId: "", phone: "", address: "", upline: "" });
  const [user, setUser]         = useState(null);     // Supabase user object
  const [userProfile, setUserProfile] = useState(null); // profiles row
  const [authReady, setAuthReady] = useState(false);
  const toastTimer = useRef(null);

  // ── Check Supabase session on mount ──
  useEffect(() => {
    const sb = getSB();
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const pr = await sbGetProfile(session.user.id);
        if (pr?.paid) {
          setUser(session.user);
          setUserProfile(pr);
          if (pr.name) setProfile(prev => ({ ...prev, name: pr.name, phone: pr.phone || "" }));
        }
      }
      setAuthReady(true);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_e, session) => {
      if (!session) { setUser(null); setUserProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }, []);

  const handleLogin = (supaUser, pr) => {
    setUser(supaUser);
    setUserProfile(pr);
    if (pr?.name) setProfile(prev => ({ ...prev, name: pr.name, phone: pr.phone || "" }));
  };

  const handleLogout = async () => {
    if (!window.confirm("Sign out of VManager?")) return;
    await getSB().auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  // ── Loading spinner ──
  if (!authReady) return (
    <div style={{ minHeight: "100vh", background: T.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 900, fontSize: 38, color: T.amber }}>V<span style={{ color: "white" }}>Manager</span></div>
      <div style={{ width: 40, height: 40, border: `3px solid rgba(255,255,255,.15)`, borderTop: `3px solid ${T.amber}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
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
            {user && <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name.split(" ")[0]}</div>}
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
          </div>
        </div>

        {/* Sync banner */}
        <div style={{ background: T.emeraldLight, padding: "6px 16px", display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: T.emerald, fontWeight: 600 }}>☁️ {userProfile?.plan || "Premium"} · {user?.email}</span>
          <button onClick={handleLogout} style={{ fontSize: 11, color: T.textMid, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
        </div>

        {/* Content */}
        <div className="content">
          {tab === "home"      && <Dashboard products={products} sales={sales} customers={customers} onNavigate={setTab} />}
          {tab === "inventory" && <Inventory products={products} setProducts={setProducts} showToast={showToast} />}
          {tab === "sales"     && <Sales products={products} setProducts={setProducts} customers={customers} sales={sales} setSales={setSales} showToast={showToast} profile={profile} />}
          {tab === "customers" && <Customers customers={customers} setCustomers={setCustomers} sales={sales} showToast={showToast} />}
          {tab === "reports"   && <Reports products={products} sales={sales} />}
          {tab === "alerts"    && <Alerts products={products} sales={sales} customers={customers} />}
          {tab === "education" && <Education showToast={showToast} />}
          {tab === "profile"   && <Profile showToast={showToast} profile={profile} setProfile={setProfile} onLogout={handleLogout} userProfile={userProfile} products={products} customers={customers} sales={sales} setProducts={setProducts} setCustomers={setCustomers} setSales={setSales} />}
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
