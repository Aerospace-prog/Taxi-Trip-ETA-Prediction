import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

export default function AddressSearch({ placeholder, bounds, onSelect, externalValue }) {
  const [query, setQuery] = useState(externalValue || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== query) {
      setQuery(externalValue);
    }
  }, [externalValue]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
        if (bounds) {
          // viewbox = left,top,right,bottom -> min_lng, max_lat, max_lng, min_lat
          url += `&viewbox=${bounds.lng_min},${bounds.lat_max},${bounds.lng_max},${bounds.lat_min}&bounded=1`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            // Nominatim requires a user-agent, browsers handle this but we can add a custom header if needed, though usually standard fetch works fine for light usage
          }
        });
        const data = await response.json();
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 800); // 800ms debounce to respect Nominatim limits

    return () => clearTimeout(delayDebounceFn);
  }, [query, bounds]);

  const handleSelect = (result) => {
    setQuery(result.display_name);
    setShowDropdown(false);
    onSelect({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    });
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-[1001]">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          {isSearching ? <Loader2 size={18} className="animate-spin text-primary-500" /> : <Search size={18} />}
        </div>
        <input
          type="text"
          className="w-full py-3.5 pl-12 pr-4 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl text-sm text-slate-800 transition-all duration-200 outline-none placeholder:text-slate-400 shadow-sm focus:bg-white focus:border-primary-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors flex gap-3 items-start"
              onClick={() => handleSelect(result)}
            >
              <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-700 line-clamp-1">{result.name || result.display_name.split(',')[0]}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{result.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
