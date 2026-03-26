// src/components/common/LocationSelect.tsx
import React from "react";
import Select from "react-select";

export interface SelectOption {
    value: string;
    label: string;
}

interface LocationSelectProps {
    label: string;
    value: string;
    options: SelectOption[];
    placeholder: string;
    onChange: (selected: SelectOption | null) => void;
    disabled?: boolean;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
    label,
    value,
    options,
    placeholder,
    onChange,
    disabled
}) => {

    return (
        <div >
            <label className="block text-gray-700 font-medium mb-1 text-xs md:text-sm">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="text-sm">
                <Select
                    options={options}
                    value={options.find(op => op.value === value) || null}
                    onChange={onChange}
                    placeholder={placeholder}
                    isDisabled={disabled}
                    isClearable={true}
                    classNamePrefix="react-select"
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderRadius: '0.5rem',
                            padding: '0.125rem',
                            fontSize: '0.875rem',
                        }),
                    }}
                />
            </div>
        </div>
    );
};

export default LocationSelect;
