import React from "react";

const TestButton = () => {
  const handleClick = () => {
    alert("Button clicked!");
    console.log("Test button clicked");
  };

  return (
    <button onClick={handleClick}>
      Test Click Button
    </button>
  );
};

export default TestButton;
