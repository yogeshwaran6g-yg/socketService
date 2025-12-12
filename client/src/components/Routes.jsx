import React from "react";
import { Routes, Route } from "react-router-dom";
import SettingsDashboard from "../pages/SettingsDashboard";
import CronDashboard from "../pages/CronDashboard";
import NewDashboard from "./NewDashboard";


export default function AppRoutes() {
  const myRoutes = [
    { path: "/Dashboard", element: <NewDashboard />},
  ];

  return (

      <Routes>
        {myRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>

  );
}
