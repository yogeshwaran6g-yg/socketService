import React from "react";
import { Routes, Route } from "react-router-dom";
import SettingsDashboard from "../pages/SettingsDashboard";

export default function AppRoutes() {
    const myRoutes = [
        { path: "/settings", element: <SettingsDashboard /> },
        { path: "*", element: <h1>Page Not Found</h1> }
    ];





  return (
    <Routes>
      {myRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}