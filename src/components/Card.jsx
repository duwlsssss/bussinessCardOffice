import React,{useState} from 'react';
import QRCode from 'qrcode.react';

function Card({ data }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`card ${isFlipped ? "flipped" : ""}`} onClick={handleCardClick}>
      <div className="cardFront">
        {/* 명함 전면 정보 */}
        <div className="info-container">
          <div className="info-item name">{data.name}</div>
          <div className="info-item school">{data.school}</div>
          <div className="info-item studentNum"> {data.studentNum || 'N/A'}</div>
          <div className="info-item major"> {data.major || 'N/A'}</div>
          <div className="info-item email"> {data.email || 'N/A'}</div>
          <div className="info-item session"> {data.session || 'N/A'}</div>
          <div className="info-item MBTI"> {data.MBTI || 'N/A'}</div>
          <div className="info-item IG"> {data.ig || 'N/A'}</div>  
          <div className="info-item engName"> {data.engName || 'N/A'}</div>
        </div>
      </div>
      <div className="cardBack">
        {/* <QRCode value={"https://kimmobile.netlify.app"} /> */}
      </div>
    </div>
  );
}

export default Card;

