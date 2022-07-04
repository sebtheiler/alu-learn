// React 17
import App from './App'
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string}>
      <App />
    </GoogleOAuthProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);

// React 18
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )
