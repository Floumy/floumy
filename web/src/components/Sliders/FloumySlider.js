import React, { useEffect, useRef, useState } from "react";
import Slider from "nouislider";
import { formatProgress } from "../../services/utils/utils";
import { Col, Row } from "reactstrap";

function FloumySlider({ initialValue, onSliderValueChange }) {
  const [sliderValue, setSliderValue] = useState("100.00");
  const sliderRef = useRef(null);
  useEffect(() => {
    if (sliderRef.current.noUiSlider) return;
    Slider.create(sliderRef.current, {
      start: [initialValue],
      connect: [true, false],
      step: 5,
      range: { min: 0, max: 100 }
    }).on("update", function(values) {
      setSliderValue(values[0].toString());
      onSliderValueChange(values[0]);
    });
  });

  return (
    <>
      <div className="input-slider-container">
        <Row>
          <Col xs={3} sm={2}>
            <div className="input-slider-value text-center pt-2 pb-2">{formatProgress(sliderValue)}%</div>
          </Col>
          <Col xs={9} sm={10}>
            <div className="input-slider" ref={sliderRef} />
          </Col>
        </Row>
      </div>
    </>
  );
}

export default FloumySlider;
