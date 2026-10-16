import { getCampaigns } from '@/lib/catalogue';
import { ok, apiError } from '@/lib/http';
export async function GET(request){try{const zone=new URL(request.url).searchParams.get('zone')||undefined;const campaigns=await getCampaigns(zone);return ok(campaigns.map((campaign)=>({...campaign,_id:String(campaign._id)})))}catch(error){return apiError(error)}}
