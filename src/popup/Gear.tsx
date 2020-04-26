import { h } from 'preact';
import styled from 'styled-components';

import gearImg from '../../static/images/gear.png';

const Gear = () => {
  return <GearIcon src={gearImg} onClick={() => chrome.runtime.openOptionsPage(() => window.close())} />
}

const GearIcon = styled.img`
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  display: block;
  cursor: pointer;
  width: 25px;
  height: 25px;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: rotate(60deg);
  }
`

export default Gear;