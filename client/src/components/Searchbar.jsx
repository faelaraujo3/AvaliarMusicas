import { Search } from 'lucide-react';

export default function SearchBar({ onSearch }) {
  return (
    <div className="relative group w-full max-w-[364px]">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] group-focus-within:text-white transition-colors">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder="O que você quer ouvir?"
        onChange={(e) => onSearch(e.target.value)}
        className="w-full h-12 rounded-full bg-[#242424] text-sm text-white pl-10 pr-4 placeholder:text-[#b3b3b3] outline-none hover:bg-[#2a2a2a] focus:bg-[#242424] focus:ring-2 focus:ring-white/20 border-none transition-all font-medium"
      />
    </div>
  );
}
