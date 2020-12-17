import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { range } from '../../utils';
import './matching.css';

export function MatchingGame(props) {
  // const {} = props;
  const size = 4;
  const [selectedBox, setSelectedBox] = useState([-1, -1]);
  console.log(selectedBox);

  const handleBoxClick = (rowNum, colNum) => {
    return event => {
      event.preventDefault();
      setSelectedBox([rowNum, colNum]);
    }
  }

  return (<>
    {/* <table id='matching-table'> */}
      {/* <tbody> */}
    {range(0, size).map(i => 
      <Row key={i} className='matching-row'>
        {range(0, size).map(j =>
          <Col
            key={j}
            className={'matching-col' + ((i === selectedBox[0] && j === selectedBox[1]) ? ' selected' : '')}
            onClick={handleBoxClick(i, j)}
          >
            {console.log([i, j], selectedBox)}
            {console.log([i, j] === selectedBox)}
            <p>
              {`${i} - ${j}`}
            </p>
          </Col>
        )}
      </Row>
    )}
      {/* </tbody> */}
    {/* </table> */}
  </>);
}
