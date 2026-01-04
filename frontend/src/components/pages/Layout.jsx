import React,{useContext} from 'react'
import Header from './Header'
import Footer from './Footer'
import AuthContext from '../context/AuthContext'
const Layout = ({children}) => {
const user = useContext(AuthContext)

 return (
   <div className=" ">
     {/* Header */}
     <header className="">
       <Header user={user} />
     </header>

     {/* Main content */}
     <main className="">{children}</main>

     {/* Footer */}
     <footer className="w-full mt-auto">
       <Footer />
     </footer>
   </div>
 );
}

export default Layout