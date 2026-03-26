export type MultilangField = 
    | string
    | { vi?: string; en?: string }
    | { vi: string; en: string };

export const getText = (field: MultilangField | undefined | null, lang: "vi" | "en" = "vi"): string => {
    if (!field) return "";    
    if (typeof field === "string") {
        return field;
    }   
    if (typeof field === "object" && field !== null) {
        const text = field[lang] || field[lang === "vi" ? "en" : "vi"] || "";
        return text;
    }
    
    return "";
};

export const containsText = (field: MultilangField | undefined | null, searchTerm: string): boolean => {
    if (!field || !searchTerm) return false;    
    const term = searchTerm.toLowerCase();    
    if (typeof field === "string") {
        return field.toLowerCase().includes(term);
    }    
    if (typeof field === "object" && field !== null) {
        return Boolean(
            (field.vi && field.vi.toLowerCase().includes(term)) ||
            (field.en && field.en.toLowerCase().includes(term))
        );
    }    
    return false;
};

