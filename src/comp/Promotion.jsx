const pieces = ['r', 'n', 'q', 'b'];

const Promotion = ({ promotion: { from, to, color }, onSelect, flip }) => {
  const classk = color === 'w' ? 'white-class' : 'dark-class';
  
  return (
    <div className={`chessboard12 ${flip ? 'flipped' : ''}`}>
      {pieces.map((parts, i) => (
        <div key={i} className='promotion-array'>
          <div className={classk} onClick={() => onSelect(parts)}>
            <div className="promo1">
              <img
                className="promo-piece"
                src={require(`../assets/images/${parts}_${color}.png`)}
                alt=""
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Promotion;
