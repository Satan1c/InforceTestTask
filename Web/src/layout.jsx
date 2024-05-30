import React from "react";
import {Outlet} from "react-router-dom";
import Navbar from "./navbar.jsx";

const Layout = () => {
	return (
		<>
			<Navbar/>
			<Outlet/>
		</>
	);
};
export default Layout;
