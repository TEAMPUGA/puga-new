import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Share2, 
  Mic,
  X,
  Info,
  ChevronDown,
  BookOpen,
  Trophy,
  Zap,
  Clock,
  Database,
  Code,
  Keyboard,
  FileText
} from 'lucide-react';

// --- MOCK DATA (SYNCED WITH SQL SEED) ---

const MOCK_ENTRIES = [
  {
    id: '1',
    word: 'Lôn',
    definition: 'Saya (Kata ganti orang pertama tunggal). Digunakan dalam situasi formal atau kepada orang yang dihormati.',
    dialect: 'Semua',
    register: 'Hormat',
    part_of_speech: 'Pronomina',
    votes: 342,
    hasAudio: true,
    userVote: 1, 
    author: 'Teuku Umar'
  },
  {
    id: '2',
    word: 'Gata',
    definition: 'Kamu / Anda (Kata ganti orang kedua). Digunakan untuk lawan bicara yang setara atau lebih muda.',
    dialect: 'Semua',
    register: 'Biasa',
    part_of_speech: 'Pronomina',
    votes: 156,
    hasAudio: true,
    userVote: 0,
    author: 'Cut Nyak Dien'
  },
  {
    id: '3',
    word: 'Gobnyan',
    definition: 'Dia / Beliau. Kata ganti orang ketiga untuk merujuk pada orang yang dihormati atau orang tua.',
    dialect: 'Semua',
    register: 'Hormat',
    part_of_speech: 'Pronomina',
    votes: 89,
    hasAudio: false,
    userVote: 0,
    author: 'Sultan Iskandar'
  },
  {
    id: '4',
    word: 'Pajoh',
    definition: 'Makan. Kata ini bermakna sangat kasar jika digunakan kepada orang tua. Biasanya dipakai antar teman akrab yang sebaya.',
    dialect: 'Aceh Rayeuk',
    register: 'Kasar',
    part_of_speech: 'Verba',
    votes: 567,
    hasAudio: true,
    userVote: -1,
    author: 'Pang Laot'
  },
  {
    id: '5',
    word: 'Seumurat',
    definition: 'Sebuah frasa puitis menggambarkan keindahan alam saat fajar menyingsing (cahaya merekah).',
    dialect: 'Pase',
    register: 'Sastra',
    part_of_speech: 'Adjektiva',
    votes: 210,
    hasAudio: true,
    userVote: 1,
    author: 'Syeikh Mud'
  }
];

// --- COMPONENT HELPERS ---

const getRegisterColor = (reg: string) => {
  switch (reg) {
    case 'Kasar': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'Hormat': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Sastra': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getPosColor = (pos: string) => {
  return 'bg-blue-50 text-blue-700 border-blue-100';
};

// --- COMPONENTS ---

const Header = () => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm pt-4 pb-3 px-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
        P
      </div>
      <h1 className="text-xl font-black text-slate-800 tracking-tight">PUGA</h1>
    </div>
    
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
        placeholder="Cari lema (contoh: 'Pajoh')..."
      />
    </div>
  </header>
);

const DailyQuestWidget = ({ progress, total = 10 }: { progress: number, total?: number }) => {
  const percentage = Math.min((progress / total) * 100, 100);
  
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 transform rotate-12">
        <Trophy size={64} />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Zap size={16} className="text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Misi Uroe Nyoe</h3>
              <p className="text-[10px] text-emerald-100 opacity-90">Vote {total} lema hari ini</p>
            </div>
          </div>
          <div className="text-right">
             <span className="font-black text-xl">{progress}</span>
             <span className="text-xs opacity-70">/{total}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {progress >= total && (
           <div className="mt-2 text-xs font-bold text-yellow-300 bg-black/20 py-1 px-2 rounded-md inline-block animate-pulse">
             🎉 Selesai! Bonus +20 Poin dikirim.
           </div>
        )}
      </div>
    </div>
  );
};

const FeedCard: React.FC<{ entry: any, onVote: (val: number) => void }> = ({ entry, onVote }) => {
  const [voteState, setVoteState] = useState(entry.userVote);
  const [score, setScore] = useState(entry.votes);

  // Anti-Spam Logic: Frontend Throttle
  const lastClickTime = useRef<number>(0);

  const handleVoteClick = (val: number) => {
    const now = Date.now();
    // 500ms Cooldown check
    if (now - lastClickTime.current < 500) {
      onVote(999); // 999 is code for "Spam Detected"
      return;
    }
    lastClickTime.current = now;

    // Normal Vote Logic
    if (voteState === val) {
      setVoteState(0);
      setScore(score - val);
      onVote(0); // Cancel vote
    } else {
      setScore(score - voteState + val);
      setVoteState(val);
      onVote(val); // Valid vote
    }
  };

  return (
    <article className="bg-white border-b border-slate-100 last:border-0 pb-4 pt-4 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header: User Info & Dialect */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
           <div className="relative">
             <img 
               src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${entry.author}&backgroundColor=c0aede`} 
               alt={entry.author}
               className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 object-cover"
             />
             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
           </div>
           
           <div className="flex flex-col">
              <div className="flex items-center gap-1">
                 <span className="text-sm font-bold text-slate-900 leading-tight">@{entry.author}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                 <span>2j yang lalu</span>
                 <span className="w-0.5 h-0.5 rounded-full bg-slate-400"></span>
                 <span className="font-medium text-slate-500">Contributor</span>
              </div>
           </div>
        </div>

        <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200">
          {entry.dialect}
        </span>
      </div>

      <div className="mb-3 pl-[52px]">
        <h2 className="text-2xl font-black text-slate-900 mb-2 font-serif tracking-wide">
          {entry.word}
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${getPosColor(entry.part_of_speech)}`}>
            {entry.part_of_speech}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${getRegisterColor(entry.register)}`}>
            {entry.register}
          </span>
        </div>

        <p className="text-slate-700 leading-relaxed text-[15px]">
          {entry.definition}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 pl-[52px]">
        <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
          <button 
            onClick={() => handleVoteClick(1)}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${voteState === 1 ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-200 text-slate-500'}`}
          >
            <ThumbsUp size={16} fill={voteState === 1 ? "currentColor" : "none"} />
          </button>
          
          <span className={`text-xs font-bold min-w-[20px] text-center ${voteState === 1 ? 'text-emerald-600' : voteState === -1 ? 'text-rose-600' : 'text-slate-600'}`}>
            {score}
          </span>

          <button 
            onClick={() => handleVoteClick(-1)}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${voteState === -1 ? 'bg-rose-100 text-rose-600' : 'hover:bg-slate-200 text-slate-500'}`}
          >
            <ThumbsDown size={16} fill={voteState === -1 ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex gap-2">
          {entry.hasAudio && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Play size={12} fill="currentColor" />
              Audio
            </button>
          )}
          <button className="p-1.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

const SpellingGuideSheet = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute inset-x-0 bottom-0 z-[70] bg-white sm:rounded-b-2xl rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transform transition-transform duration-300 animate-in slide-in-from-bottom border-t border-slate-200 flex flex-col max-h-[80%]">
    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Keyboard size={18} className="text-emerald-600"/> 
        Pedoman Ejaan Baku
      </h3>
      <button onClick={onClose} className="p-1.5 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors text-slate-600">
        <X size={16} />
      </button>
    </div>
    
    <div className="p-5 overflow-y-auto">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-900 flex items-start gap-2">
         <Info size={14} className="mt-0.5 shrink-0 text-amber-600"/>
         <p><strong>Tips:</strong> Tekan & tahan (Long press) tombol huruf di keyboard HP Anda untuk memunculkan karakter khusus.</p>
      </div>

      <table className="w-full text-sm text-left mb-6">
        <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-3 py-2">Huruf</th>
            <th className="px-3 py-2">Bunyi / Contoh</th>
            <th className="px-3 py-2 text-right">Cara Ketik</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 divide-y divide-slate-100">
          {/* E PEPET */}
          <tr>
            <td className="px-3 py-3 font-bold text-xl font-serif text-emerald-700">e</td>
            <td className="px-3 py-3">
               <div className="font-bold text-slate-800">Le (Banyak)</div>
               <div className="text-xs text-slate-500">/ə/ (Pepet) Lemah, seperti "emas".</div>
            </td>
            <td className="px-3 py-3 text-right"><code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">'e' biasa</code></td>
          </tr>
          
          {/* E TALING TERTUTUP */}
          <tr>
            <td className="px-3 py-3 font-bold text-xl font-serif text-emerald-700">é</td>
            <td className="px-3 py-3">
               <div className="font-bold text-slate-800">Lé (Oleh)</div>
               <div className="text-xs text-slate-500">/e/ Tegas, seperti "saté", "lele".</div>
            </td>
            <td className="px-3 py-3 text-right"><code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Tahan 'e'</code></td>
          </tr>
          
          {/* E TALING TERBUKA */}
          <tr>
            <td className="px-3 py-3 font-bold text-xl font-serif text-emerald-700">è</td>
            <td className="px-3 py-3">
               <div className="font-bold text-slate-800">Pèng (Uang)</div>
               <div className="text-xs text-slate-500">/ɛ/ Mulut lebar, seperti "bebek".</div>
            </td>
            <td className="px-3 py-3 text-right"><code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Tahan 'e'</code></td>
          </tr>
          
          {/* EU KHAS ACEH */}
           <tr>
            <td className="px-3 py-3 font-bold text-xl font-serif text-emerald-700">eu</td>
            <td className="px-3 py-3">
               <div className="font-bold text-slate-800">Leubèe (Lebai)</div>
               <div className="text-xs text-slate-500">/ɯ/ Gigi rapat, bibir tidak bulat.</div>
            </td>
            <td className="px-3 py-3 text-right"><code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">'e' + 'u'</code></td>
          </tr>

          {/* O TERBUKA */}
          <tr>
            <td className="px-3 py-3 font-bold text-xl font-serif text-emerald-700">o</td>
            <td className="px-3 py-3">
               <div className="font-bold text-slate-800">Boh (Buah)</div>
               <div className="text-xs text-slate-500">/ɔ/ Mulut lebar, seperti "botol".</div>
            </td>
            <td className="px-3 py-3 text-right"><code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">'o' biasa</code></td>
          </tr>

          {/* O TERTUTUP */}
          <tr>
            <td className="px-3 py-3 font-bold text-xl font-serif text-emerald-700">ô</td>
            <td className="px-3 py-3">
               <div className="font-bold text-slate-800">Bôh (Mengisi)</div>
               <div className="text-xs text-slate-500">/o/ Bibir bulat maju, seperti "soto".</div>
            </td>
            <td className="px-3 py-3 text-right"><code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Tahan 'o'</code></td>
          </tr>

          {/* O KHAS ACEH (Ö) */}
          <tr>
            <td className="px-3 py-3 font-bold text-xl font-serif text-emerald-700">ö</td>
            <td className="px-3 py-3">
               <div className="font-bold text-slate-800">Böh (Buang)</div>
               <div className="text-xs text-slate-500">/ʌ/ Mulut terbuka 'a' tapi bunyi 'o' dalam.</div>
            </td>
            <td className="px-3 py-3 text-right"><code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Tahan 'o'</code></td>
          </tr>
        </tbody>
      </table>

      <button className="w-full py-3.5 border-2 border-slate-100 rounded-xl text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all group">
        <span>Pasang Gboard Bahasa Aceh</span>
        <Share2 size={16} className="text-slate-400 group-hover:text-slate-600"/>
      </button>
    </div>
  </div>
);

const InputModal = ({ onClose }: { onClose: () => void }) => {
  const [showSpelling, setShowSpelling] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Tambah Lema Baru</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-bold text-slate-700">Kata (Lema)</label>
                <button 
                  onClick={() => setShowSpelling(true)}
                  className="text-[10px] font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm"
                >
                  <Info size={12} strokeWidth={2.5}/>
                  Bantuan Ejaan
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Contoh: Gampông, Iték (Gunakan ejaan baku)" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-serif text-lg placeholder:font-sans placeholder:text-slate-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Definisi (Indonesia)</label>
              <textarea placeholder="Jelaskan arti kata ini..." rows={3} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
               <BookOpen size={16} className="text-emerald-600"/>
               <h4 className="font-bold text-slate-800 text-sm">Klasifikasi Linguistik</h4>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Dialek</label>
                  <div className="relative">
                    <select className="w-full appearance-none p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none">
                      <option>Semua (Umum)</option>
                      <option>Aceh Rayeuk</option>
                      <option>Pase</option>
                      <option>Pidie</option>
                      <option>Aceh Barat</option>
                      <option>Aceh Selatan</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kelas Kata</label>
                  <div className="relative">
                    <select className="w-full appearance-none p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none">
                      <option value="">Pilih...</option>
                      <option>Nomina (Benda)</option>
                      <option>Verba (Kerja)</option>
                      <option>Adjektiva (Sifat)</option>
                      <option>Adverbia (Keterangan)</option>
                      <option>Tidak Yakin</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
                  </div>
               </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ragam Bahasa</label>
                <div className="relative">
                  <select className="w-full appearance-none p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none">
                    <option value="">Pilih...</option>
                    <option>Biasa</option>
                    <option>Hormat (Ke orang tua)</option>
                    <option>Kasar (Pantang diucap)</option>
                    <option>Sastra (Puitis)</option>
                    <option>Tidak Yakin</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                  <Info size={12} />
                  <span>Pilih "Tidak Yakin" jika Anda ragu agar diperiksa ahli.</span>
                </div>
             </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Rekam Pengucapan</label>
            <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-emerald-400 hover:bg-emerald-50 transition-colors group">
              <div className="p-3 bg-slate-100 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                <Mic className="text-slate-400 group-hover:text-emerald-500" />
              </div>
              <span className="text-xs font-medium">Tekan untuk merekam</span>
            </button>
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl z-20">
          <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all">
            Kirim Lema
          </button>
        </div>

        {/* SPELLING GUIDE SHEET OVERLAY */}
        {showSpelling && (
           <>
             <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] z-[65]" onClick={() => setShowSpelling(false)} />
             <SpellingGuideSheet onClose={() => setShowSpelling(false)} />
           </>
        )}

      </div>
    </div>
  );
};

// --- TECHNICAL DOCS VIEWER ---

const TechSpecs = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'logic' | 'seed'>('sql');

  const sqlContent = `
-- 1. DAILY QUEST TRACKING
CREATE TABLE user_daily_quests (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    last_active_date DATE DEFAULT CURRENT_DATE,
    votes_count INT DEFAULT 0,
    reward_claimed BOOLEAN DEFAULT FALSE
);

-- 2. NOTIFICATIONS (For Rewards)
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(100),
    message TEXT,
    type VARCHAR(50), -- 'reward', 'system', 'social'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. POINT LOGS (Updated)
-- Ensure we track the SOURCE of points
ALTER TABLE point_logs 
ADD COLUMN source_type VARCHAR(50); 
-- e.g., 'daily_quest', 'retroactive_bonus', 'new_entry'
`;

  const logicContent = `
/* 
  LOGIC: RETROACTIVE ACCURACY BONUS
  Triggered when an Entry status changes to 'Verified'
*/

CREATE OR REPLACE FUNCTION grant_accuracy_bonus()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run if status changed to VERIFIED
    IF NEW.status = 'Verified' AND OLD.status != 'Verified' THEN
        
        -- 1. Insert Points for all Upvoters
        INSERT INTO point_logs (user_id, amount, source_type, description, created_at)
        SELECT 
            user_id, 
            5, -- Bonus Amount
            'retroactive_bonus',
            'Bonus Akurasi: Lema "' || NEW.word || '" telah diverifikasi!',
            NOW()
        FROM votes 
        WHERE entry_id = NEW.id AND vote_value = 1;

        -- 2. Update User Totals
        UPDATE users u
        SET total_points = total_points + 5
        FROM votes v
        WHERE v.entry_id = NEW.id 
          AND v.vote_value = 1 
          AND u.id = v.user_id;

        -- 3. Send Notification
        INSERT INTO notifications (user_id, title, message, type)
        SELECT 
            user_id,
            'Béh That! (Hebat!)',
            'Vote Anda pada kata "' || NEW.word || '" terbukti benar. +5 Poin untuk Anda!',
            'reward'
        FROM votes 
        WHERE entry_id = NEW.id AND vote_value = 1;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;

  const seedContent = `
-- See seed_data.sql for full 250+ inserts.
-- Preview:

INSERT INTO hadih_majas (content, translation, philosophy) VALUES
('Pat ujeuen nyang hana pirang, pat prang nyang hana reda.', 'Di mana hujan...', 'Setiap masalah...'),
('Adat bak Poteu Meureuhôm, Hukôm bak Syiah Kuala.', 'Adat pada Poteu Meureuhom...', 'Pembagian wewenang...'),
...;

INSERT INTO entries (word, definition_id, dialect, part_of_speech, register, status) VALUES
('Lôn', 'Saya', 'Semua', 'Pronomina', 'Hormat', 'Verified'),
('Gata', 'Kamu / Anda', 'Semua', 'Pronomina', 'Biasa', 'Verified'),
('Gobnyan', 'Dia / Beliau', 'Semua', 'Pronomina', 'Hormat', 'Verified'),
('Soe', 'Siapa', 'Semua', 'Pronomina', 'Biasa', 'Verified'),
...;
`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'sql' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Database size={14} /> SQL Schema
        </button>
        <button 
          onClick={() => setActiveTab('logic')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'logic' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Code size={14} /> Logic & Triggers
        </button>
        <button 
          onClick={() => setActiveTab('seed')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'seed' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <FileText size={14} /> Seed Data
        </button>
      </div>

      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-[10px] font-mono text-emerald-300 leading-relaxed">
          {activeTab === 'sql' ? sqlContent : activeTab === 'logic' ? logicContent : seedContent}
        </pre>
      </div>
      
      {activeTab === 'seed' ? (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
           <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
             <Database size={12} /> Data Populated
           </h4>
           <p className="text-[10px] text-emerald-700">
             Generated <code>seed_data.sql</code> with 50 Hadih Maja and 200 Dictionary Entries. Check the file browser to download the full SQL.
           </p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <h4 className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
            <Clock size={12} />
            Anti-Spam Logic (Frontend)
          </h4>
          <p className="text-[10px] text-amber-700">
            Implemented via <code>useRef</code> timestamp tracking. If <code>Date.now() - lastClick &lt; 500ms</code>, the action is blocked and a toast warning "Saba dilee..." is shown.
          </p>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [showInput, setShowInput] = useState(false);
  
  // Gamification State
  const [dailyQuestProgress, setDailyQuestProgress] = useState(3);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAppVote = (val: number) => {
    if (val === 999) {
      // Spam Detected Code
      showToast("⚠️ Saba dilee... (Jangan terlalu cepat!)", "error");
      return;
    }

    if (val !== 0) {
      // Valid Vote
      const newProgress = Math.min(dailyQuestProgress + 1, 10);
      setDailyQuestProgress(newProgress);
      
      if (newProgress === 10) {
        showToast("🎉 Geunaseh! Misi Selesai (+20 Poin)", "success");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile Container Simulator */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        <Header />

        {/* GAMIFICATION WIDGET */}
        <DailyQuestWidget progress={dailyQuestProgress} />

        <main className="flex-1 pb-24">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Feed Terbaru</h2>
            <div className="text-xs font-medium text-emerald-600 cursor-pointer">Filter</div>
          </div>

          <div>
            {MOCK_ENTRIES.map(entry => (
              <FeedCard key={entry.id} entry={entry} onVote={handleAppVote} />
            ))}
          </div>

          <div className="p-8 text-center text-slate-400 text-sm">
            <div className="animate-pulse">...</div>
            <span className="mt-2 block">Memuat lebih banyak</span>
          </div>
        </main>

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[70] px-4 py-3 rounded-full shadow-xl font-bold text-sm animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'error' ? 'bg-rose-500 text-white' : 
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* FAB */}
        <button 
          onClick={() => setShowInput(true)}
          className="fixed bottom-6 right-6 sm:absolute sm:bottom-6 sm:right-6 w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-300 flex items-center justify-center hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all z-40"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>

        {/* Bottom Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 flex justify-around py-3 pb-5 z-30">
          <button className="flex flex-col items-center gap-1 text-emerald-600">
             <div className="p-1 bg-emerald-50 rounded-lg">
                <div className="w-5 h-5 border-2 border-emerald-600 rounded-md" /> 
             </div>
             <span className="text-[10px] font-bold">Feed</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
             <div className="w-5 h-5 border-2 border-current rounded-full" />
             <span className="text-[10px] font-medium">Rank</span>
          </button>
           <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
             <div className="w-5 h-5 bg-slate-200 rounded-full" />
             <span className="text-[10px] font-medium">Profil</span>
          </button>
        </div>

        {/* Modals */}
        {showInput && <InputModal onClose={() => setShowInput(false)} />}
      </div>

      {/* Desktop Description Side Panel (For Context) */}
      <div className="hidden lg:block w-96 ml-8 py-10 overflow-y-auto max-h-screen no-scrollbar">
        <div className="sticky top-10">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={18} /> Backend Logic Specs
          </h3>
          
          <TechSpecs />

          <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-sm text-emerald-700 mb-2">Instructions</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              1. <strong>Test Anti-Spam:</strong> Click the Vote button rapidly.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              2. <strong>Test Quest:</strong> Vote normally to fill the "Misi Uroe Nyoe" bar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);