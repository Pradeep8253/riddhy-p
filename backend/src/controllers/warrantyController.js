import { computeWarranty } from '../services/warrantyEngine.js';
export async function listWarranties(req,res){
  // mock computed server-side
  const now=new Date();
  const records=[{ product:'Sofa', purchaseDate:'2024-02-10', activationDate:'2024-02-18', expiry:'2027-02-18', totalDays:1095, policy:{manufacturerDays:1095}}];
  const enriched=records.map(r=> ({ ...r, ...computeWarranty({ purchaseDate:new Date(r.purchaseDate), activationDate:new Date(r.activationDate), policy:{manufacturerDays:r.totalDays}, now }) }));
  res.json({ data: enriched });
}
export async function register(req,res){ res.json({ ok:true }); }
export async function createClaim(req,res){ res.json({ ok:true, claimId:'CLM-'+Date.now() }); }
