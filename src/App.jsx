
import { useEffect,useState } from 'react';
import './App.css';
import Chessboard from './comp/Chessboard';
import { gust,repGame } from './hex';



function App() {
  
  const [initial,setBoard]=useState([])
    
  useEffect(()=>{
    repGame()
    const sub = gust.subscribe((prev)=>setBoard(prev.board))
    return()=>
      sub.unsubscribe()
    
  },[])

 


  return (
    <div className="App">
        <div className='new'>
            <Chessboard board={initial} />
       
      </div>
      <div className='button-m'>
      
      </div>
    </div>
  );
}

export default App;
