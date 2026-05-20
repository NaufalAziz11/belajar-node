import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ options = [], value = '', onChange, placeholder = 'Pilih opsi...', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Find the currently selected option
    const selectedOption = options.find(opt => opt.value.toString() === value.toString());

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search query
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div ref={dropdownRef} className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 bg-white flex justify-between items-center cursor-pointer shadow-sm hover:border-indigo-300 transition-all text-sm font-semibold text-gray-700"
            >
                <span className={selectedOption ? 'text-gray-800' : 'text-gray-400 font-medium'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="text-gray-400 text-xs transition-transform duration-200">
                    {isOpen ? '▲' : '▼'}
                </span>
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-scaleUp max-h-64 flex flex-col">
                    {/* Search Input Box */}
                    <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none text-xs transition-all"
                        />
                    </div>

                    {/* Filtered options list */}
                    <div className="overflow-y-auto flex-1 max-h-48 py-1">
                        {filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-4 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                                    value.toString() === opt.value.toString()
                                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                                        : 'text-gray-700 hover:bg-indigo-50/40 hover:text-indigo-600'
                                }`}
                            >
                                {opt.label}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium">
                                Tidak ada opsi cocok.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
