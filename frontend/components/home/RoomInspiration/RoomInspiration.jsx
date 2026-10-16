import './RoomInspiration.css';
const rooms=[
  { title:'Scandinavian Living', image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', tag:'Shop the look' },
  { title:'Warm Minimal Bedroom', image:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', tag:'Complete the room' },
  { title:'Modern Dining Nook', image:'https://images.unsplash.com/photo-1615066028049-d164a270d6d1?w=800', tag:'Bundle & save 12%' },
];
export default function RoomInspiration(){
  return (
    <section className="rooms">
      <div className="rooms__head"><div className="section-eyebrow">Room Inspiration</div><h2>Shoppable spaces, styled for you</h2></div>
      <div className="rooms__grid">
        {rooms.map(r=>(
          <div key={r.title} className="rooms__card">
            <img src={r.image} alt={r.title}/>
            <div className="rooms__overlay"><span className="rooms__tag">{r.tag}</span><h3>{r.title}</h3><button className="rooms__btn">Shop This Room →</button></div>
            <span className="rooms__hotspot" style={{top:'42%',left:'38%'}}>+</span>
            <span className="rooms__hotspot" style={{top:'68%',left:'62%'}}>+</span>
          </div>
        ))}
      </div>
    </section>
  );
}
