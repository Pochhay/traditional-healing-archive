"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }) {
  // Always start "en" so the server render and first client render match.
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("herbarium_lang");
    if (saved === "km" || saved === "en") setLangState(saved); // after mount: no hydration mismatch
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  function setLang(next) {
    setLangState(next);
    localStorage.setItem("herbarium_lang", next);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
