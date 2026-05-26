import React, { useState, useRef, useEffect } from 'react';

const CATEGORIES = [
  {
    label: 'Smileys',
    icon: '😊',
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  },
  {
    label: 'People',
    icon: '👋',
    emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','👃','👀','👁','👅','🦷','🦴','💋','💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍'],
  },
  {
    label: 'Animals',
    icon: '🐶',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🦔'],
  },
  {
    label: 'Food',
    icon: '🍕',
    emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🌮','🌯','🫔','🥙','🧆','🥚','🍲','🥘','🥗','🫕','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🫘','🍯','🧃','🥤','🧋','☕','🍵','🧉','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾'],
  },
  {
    label: 'Travel',
    icon: '🌍',
    emojis: ['🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣','🛤','🛞','⛽','🚨','🚥','🚦','🚧','⚓','🛟','⛵','🚤','🛥','🛳','⛴','🚢','✈️','🛩','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰','🚀','🛸','🌍','🌎','🌏','🗺','🧭','🗾','🌋','⛰','🏔','🗻','🏕','🏖','🏜','🏝','🏞','🏟','🏛','🏗','🧱','🪨','🪵','🛖','🏘','🏚','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','🕋','⛩','🗾'],
  },
  {
    label: 'Activities',
    icon: '⚽',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🥊','🥋','🎯','🛷','🎿','⛷','🏂','🪂','🏋','🏊','🤽','🧘','🧗','🏇','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖','🏵','🎗','🎫','🎟','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🪗','🎲','♟','🎯','🎳','🎮','🎰','🧩','🧸','🪅','🪩'],
  },
  {
    label: 'Objects',
    icon: '💡',
    emojis: ['💡','🔦','🕯','🪔','🧯','🛢','💰','💴','💵','💶','💷','💸','💳','🪙','💹','💱','💲','✉️','📧','📨','📩','📪','📫','📬','📭','📮','🗳','✏️','✒️','🖋','🖊','📝','📁','📂','🗂','📅','📆','🗒','🗓','📇','📈','📉','📊','📋','📌','📍','🗺','📏','📐','✂️','🗃','🗄','🗑','🔒','🔓','🔏','🔐','🔑','🗝','🔨','🪓','⛏','⚒','🛠','🗡','⚔️','🔧','🪛','🔩','⚙️','🗜','⚖️','🦯','🔗','⛓','🧰','🔮','🪄','🔭','🔬','🩺','💊','🩹','🩻','🩼','🩸','🧬','🦠','🧫','🧪','🌡','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🪥','🪒','🧴','🧷','🧲','🪣','🧽','🪜'],
  },
  {
    label: 'Symbols',
    icon: '❤️',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','⚕','♻️','⚜️','🔰','✔️','❌','❎','➕','➖','➗','✖️','🟰','♾️','‼️','⁉️','❓','❔','❕','❗','〰️','💱','💲','⚜️','🔱','📛','🔰','⭕','✅','☑️','✔️','❎','🔲','🔳','⬛','⬜','◼️','◻️','◾','◽','▪️','▫️','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⚫','⚪','🔴','🟠','🟡','🟢','🔵','🟣','🟤'],
  },
];

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = search.trim()
    ? CATEGORIES.flatMap(c => c.emojis).filter(() => true).filter(e => {
        return true;
      })
    : CATEGORIES[activeTab].emojis;

  const displayEmojis = search.trim()
    ? CATEGORIES.flatMap(c => c.emojis)
    : CATEGORIES[activeTab].emojis;

  return (
    <div ref={ref} style={{
      position:'absolute', bottom:'calc(100% + 8px)', right:0,
      width:340, background:'var(--bg-elevated)', border:'1px solid var(--border)',
      borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.6)',
      zIndex:1000, overflow:'hidden', userSelect:'none',
    }}>
      <div style={{ padding:'10px 12px 0' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search emoji…"
          autoFocus
          style={{
            width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)',
            borderRadius:10, padding:'7px 12px', color:'var(--text-primary)', fontSize:13, outline:'none',
          }}
        />
      </div>

      {!search && (
        <div style={{ display:'flex', overflowX:'auto', padding:'8px 10px 0', gap:2, scrollbarWidth:'none' }}>
          {CATEGORIES.map((cat, i) => (
            <button key={i} onClick={() => setActiveTab(i)} title={cat.label}
              style={{
                background: activeTab === i ? 'rgba(91,94,244,0.25)' : 'transparent',
                border:'none', borderRadius:8, padding:'6px 8px', fontSize:17,
                cursor:'pointer', flexShrink:0, transition:'background 0.15s',
              }}>
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {!search && (
        <div style={{ padding:'4px 12px 6px', fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>
          {CATEGORIES[activeTab].label}
        </div>
      )}

      <div style={{ padding:'0 10px 10px', maxHeight:220, overflowY:'auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:2 }}>
          {displayEmojis.map((emoji, i) => (
            <button key={i} onClick={() => onSelect(emoji)}
              style={{
                background:'transparent', border:'none', borderRadius:8,
                fontSize:22, padding:'4px', cursor:'pointer', lineHeight:1,
                transition:'background 0.1s', textAlign:'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
