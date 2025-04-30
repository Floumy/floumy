import useLayoutHandler from "./useLayoutHandler";
import {Routes} from "react-router-dom";
import {blankRoutes} from "../routes";
import Footer from "../components/Footers/Footer";
import React from "react";

export function BlankLayout() {
    const { mainContentRef, getRoutes } = useLayoutHandler('blank');
    return (
        <>
            <div className="main-content h-100" ref={mainContentRef}>
                <Routes>
                    {getRoutes(blankRoutes)}
                </Routes>
            </div>
            <Footer justifyContent="center" />
        </>
    );
}