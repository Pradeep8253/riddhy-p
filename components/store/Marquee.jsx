import Icon from '@/components/ui/Icon';
import styles from './Marquee.module.css';
const notes=['Verified warranty details','Delivery scheduling you can see','Installation options before payment','Secure checkout','Clear returns and support'];
export default function Marquee(){return <div className={styles.strip} aria-label="Store assurances"><div className={styles.track}>{[...notes,...notes].map((note,index)=><span key={`${note}-${index}`}><Icon name="check" size={14}/>{note}<i>✦</i></span>)}</div></div>}
