import { useState } from "react"
import axios from 'axios'
import { useEffect } from "react";

function App(){

  const [Jokes , setJokes] = useState([]);

  useEffect(() => {
    axios.get('/api/jokes')
    .then((res) => {
      setJokes(res.data);
    })
    .catch((err) => {
      console.log(err);
    })
  });


  return(
    <>
      <h1>Delhi Technological University</h1>
      <p>Jokes : {Jokes.length}</p>

      {
        Jokes.map((joke) => 
          <div key={joke.id}>
            <h3>{joke.title}</h3>
            <p>{joke.desc}</p>
          </div>
        )
      }
    </>
  )
}

export default App