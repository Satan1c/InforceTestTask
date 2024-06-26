import "./index.css";
import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Layout from "./layout.jsx";
import Home from "./pages/home.jsx";
import NoPage from "./pages/404.jsx";
import Profile from "./pages/profile.jsx";
import About from "./pages/about.jsx";

const container = document.getElementById("root");
const root = createRoot(container);

function Index() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="*" element={<NoPage/>}/>
				<Route path="/" element={<Layout/>}>
					<Route index element={<Home/>}/>
					<Route path="profile" element={<Profile/>}/>
					<Route path="about" element={<About/>}/>
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

root.render(<Index/>);
