import React, { useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import AuthContext from '../context/AuthContext';
import img from '../../public/awkumimg1.png'
const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${img})` }}
      />

      {/* Soft dark overlay */}
      <div className="absolute inset-0 bg-black/40 -z-10 backdrop-blur-sm" />

      {/* Header */}
      <Header user={user} />

      {/* Main */}
      <main className="grow flex items-center justify-center">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
