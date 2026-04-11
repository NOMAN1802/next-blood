import { createContext } from 'react';

// Define the context in a separate file to break circular dependencies
// between the Provider, the Hook, and consumers.
export const AuthContext = createContext(undefined);