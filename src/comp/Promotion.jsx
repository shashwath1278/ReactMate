

const pieces = ['r', 'n', 'q', 'b'];

const Promotion = ({ promotion: { from, to, color }, onSelect }) => {
  const classk = color === 'w' ? 'white-class' : 'dark-class';

  return (
    <div className='chessboard12'>
      {pieces.map((parts, i) => (
        <div key={i} className='promotion-array'>
          
            <div className={classk} onClick={() => {

              onSelect(parts); 
            }}>
              <img
                src={require(`../assets/images/${parts}_${color}.png`)}
                alt=""
                height={55}
              />
            </div>
          
        </div>
      ))}
    </div>
  );
};

export default Promotion;
