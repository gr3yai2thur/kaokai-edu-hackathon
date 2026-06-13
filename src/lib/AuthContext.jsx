import { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            // If the document exists but is missing name or email, enrich it
            if (!data.email || !data.name) {
              const enrichedProfile = {
                ...data,
                name: data.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: data.email || firebaseUser.email || '',
                phone: data.phone || '',
                loyalty_points: data.loyalty_points !== undefined ? data.loyalty_points : 0,
                membership_role: data.membership_role || 'MEMBER',
                role: data.role || 'user',
              };
              await setDoc(docRef, enrichedProfile, { merge: true });
              setRole(enrichedProfile.role);
              setProfile(enrichedProfile);
            } else {
              setRole(data.role || 'user');
              setProfile(data);
            }
          } else {
            // First-time login (e.g. Google) → auto-create profile
            const newProfile = {
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              phone: '',
              loyalty_points: 0,
              membership_role: 'MEMBER',
              role: 'user',
            };
            await setDoc(docRef, newProfile);
            setRole('user');
            setProfile(newProfile);
          }
        } catch (err) {
          console.error("AuthContext error reading/writing Firestore user:", err);
          setRole('user');
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setRole(null);
      }
      setIsLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, isAdmin: role === 'admin', isAuthenticated, isLoadingAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
