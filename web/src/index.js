/*!

=========================================================
* Argon Dashboard PRO React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom/client";
// react library for routing
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// plugins styles from node_modules
import "react-notification-alert/dist/animate.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "select2/dist/css/select2.min.css";
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.snow.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
// plugins styles downloaded
import "assets/vendor/nucleo/css/nucleo.css";
import "react-toastify/dist/ReactToastify.css";
// core styles
import "assets/scss/argon-dashboard-pro-react.scss?v1.2.1";
import "@mdxeditor/editor/style.css";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import AuthGuard from "./guards/AuthGuard";
import { ToastContainer } from "react-toastify";
import PublicLayout from "./layouts/Public";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <>
    <ToastContainer theme={"dark"} hideProgressBar={true} />
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        } />
        <Route path="/public/*" element={
          <PublicLayout />
        } />
        <Route path="/auth/*" element={<AuthLayout />} />
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
    </BrowserRouter>
  </>
);
