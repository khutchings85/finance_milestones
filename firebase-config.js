// Firebase web app configuration (public identifiers, not admin credentials).
// Firestore security rules enforce write access.
export const firebaseConfig = {
  apiKey: "AIzaSyDXI6Wn1RwZVqTIY6oLyA2xV0uAxWRP3jM",
  authDomain: "finance-milestones.firebaseapp.com",
  projectId: "finance-milestones",
  storageBucket: "finance-milestones.firebasestorage.app",
  messagingSenderId: "885202420797",
  appId: "1:885202420797:web:b6edbb685b5d55ce129654"
};

// Add approved Firebase Authentication UIDs after first sign-in.
// Edit permissions are also enforced separately in deployed firestore.rules.
export const editorUids = [];
