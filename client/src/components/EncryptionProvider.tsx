import { createContext, useContext, useState, useEffect } from "react";

interface EncryptionContextType {
  isEnabled: boolean;
  passphrase: string | null;
  hasPassphrase: boolean;
  enableEncryption: (passphrase: string) => void;
  disableEncryption: () => void;
  updatePassphrase: (passphrase: string) => void;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export function EncryptionProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [passphrase, setPassphrase] = useState<string | null>(null);

  useEffect(() => {
    const enabled = localStorage.getItem("encryption_enabled") === "true";
    const stored = sessionStorage.getItem("encryption_passphrase");
    
    setIsEnabled(enabled);
    
    if (stored) {
      setPassphrase(stored);
    }
  }, []);

  const enableEncryption = (newPassphrase: string) => {
    localStorage.setItem("encryption_enabled", "true");
    sessionStorage.setItem("encryption_passphrase", newPassphrase);
    setIsEnabled(true);
    setPassphrase(newPassphrase);
  };

  const disableEncryption = () => {
    localStorage.removeItem("encryption_enabled");
    sessionStorage.removeItem("encryption_passphrase");
    setIsEnabled(false);
    setPassphrase(null);
  };

  const updatePassphrase = (newPassphrase: string) => {
    sessionStorage.setItem("encryption_passphrase", newPassphrase);
    setPassphrase(newPassphrase);
  };

  return (
    <EncryptionContext.Provider
      value={{
        isEnabled,
        passphrase,
        hasPassphrase: passphrase !== null,
        enableEncryption,
        disableEncryption,
        updatePassphrase,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error("useEncryption must be used within an EncryptionProvider");
  }
  return context;
}
