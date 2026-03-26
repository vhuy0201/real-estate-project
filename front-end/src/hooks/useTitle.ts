import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function useTitle(titleKey: string) {
    const { t } = useTranslation();
    useEffect(() => {
        document.title = t(titleKey as any);
    }, [titleKey, t]);
}
