import React from 'react';

export default function Header({ activeTab = 'Planets', onTabChange }) {
  const navItems = ['Planets', 'Trailer', 'Tickets', 'Blog'];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 select-none">
      <div className="w-full px-8 sm:px-14 h-16 flex items-center justify-between">
        {/* Logo / Brand (Matches reference video 'spaceedu') */}
        <div className="flex items-center cursor-pointer">
          <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white">
            space<span className="text-[#4DEEEA]">edu</span>
          </span>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-6 sm:gap-10">
          <nav className="flex items-center gap-6 sm:gap-8 text-xs font-medium tracking-wide">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => onTabChange && onTabChange(item)}
                  className={`relative py-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4DEEEA] shadow-[0_0_8px_#4DEEEA]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Enroll Pill Button (Matches reference video) */}
          <button className="px-6 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#050B18] font-medium text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95">
            Enroll
          </button>
        </div>
      </div>

      {/* Full-width Divider Line */}
      <div className="w-full h-[1px] bg-white/10" />
    </header>
  );
}

