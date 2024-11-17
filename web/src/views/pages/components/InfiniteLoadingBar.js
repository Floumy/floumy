import React from "react";
import "./InfiniteLoadingBar.css";

const InfiniteLoadingBar = () => {
  return (
    <div style={styles.loadingBarContainer}>
      <div className="loadingBar" />
    </div>
  );
};

const styles = {
  loadingBarContainer: {
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
    height: "4px",
    backgroundColor: "#f0f0f0" // Light gray background
  }
};

export default InfiniteLoadingBar;
