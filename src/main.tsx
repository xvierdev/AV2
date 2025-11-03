import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Componentes
import App from './App.tsx';

// Provedores de Contexto
import { AuthProvider } from './context/AuthProvider.tsx';


/**
 * Ponto de entrada da aplicação React.
 *
 * Este arquivo é responsável por renderizar o componente principal (`App`) na
 * div com id 'root' do arquivo `index.html`. Ele envolve a aplicação com os
 * provedores de contexto essenciais, como o `AuthProvider`, para que fiquem
 * disponíveis em toda a árvore de componentes.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);