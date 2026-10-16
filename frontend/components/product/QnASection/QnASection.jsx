import Accordion from '@/components/common/Accordion/Accordion';
import './QnASection.css';
const qa=[{title:'Is assembly included?', content:'Yes, free installation for all furniture. Our technician will visit within 48 hours of delivery.'},{title:'What is the return window?', content:'7 days for furniture (unused, original packaging), 10 days for appliances if manufacturing defect.'},{title:'Is EMI available?', content:'Yes, No-Cost EMI via Razorpay for orders above ₹7,500. Tenures 3/6/9/12 months.'}];
export default function QnASection(){ return <div className="qna"><Accordion items={qa}/><div className="qna__ask"><input placeholder="Ask a question about this product"/><button>Ask</button></div></div>}
