import { Navigate } from "react-router-dom";

export function ProtectedRoute({ 
  children, 
  role 
}: { 
  children: React.ReactNode, 
  role: 'reception' | 'director' 
}) {
  const token = localStorage.getItem(`${role}_token`);
  
  if (!token) {
    return <Navigate to={`/${role}`} replace />;
  }
  
  return <>{children}</>;
}
