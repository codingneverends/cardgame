import React,{ useState , useEffect} from 'react';
import './App.css';
import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'
import 'firebase/analytics'
import CreateOrJoin from './CreateOrJoin'
import WaitandQueue from './WaitandQueue'
import Game from './Game'
import GameOver from './GameOver'
import IntrotoGame from './IntrotoGame'

import { useAuthState } from 'react-firebase-hooks/auth'
import useJSON from './useJSON';
import useJSON_single from './useJSON_single'

firebase.initializeApp({
    apiKey: "AIzaSyCgVsuJOgDgJn_H7UvtsBtD3SuNDQdsr1Y",
    authDomain: "cardgame-6a34b.firebaseapp.com",
    projectId: "cardgame-6a34b",
    storageBucket: "cardgame-6a34b.appspot.com",
    messagingSenderId: "747454655057",
    appId: "1:747454655057:web:b20006508414ae6ddee670",
    measurementId: "G-83YMQP8R9P"
});
firebase.analytics();
const auth = firebase.auth();
const database=firebase.database();

function App() {
  const [user]=useAuthState(auth);
  return (
    <div className="App">
      <section>
        {user ? <Intro user={user}/> : <SignIn/>}
      </section>
    </div>
  );
}

function Intro({user}){
  const [togame,settogame]=useState(false);

  return (
    <div>
      {togame?
        <GameView user={user} back={()=>{settogame(false)}}/>
      :
        <div>
          <Topbar user={user}/>
          <IntrotoGame play={()=>{settogame(true)}}/>
        </div>
      }
    </div>
  );
}

function SignIn(){
  const SignInWithGoogle=()=>{
    const provider= new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  const googlelogo="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Qtkd_EC4KjMapVmMqlvpVkGQkkqYumPmw8GHla9MKtZIMaIPRZey6dqnHbo3FTMfDBw&usqp=CAU";
  return(
    <div className="SignIn">
      <div>
        <div>
          <h2 className="gname">Set</h2>
          <h1 style={{color:"#0f0"}}>Sign In</h1>
          <br/>
        </div>
        <div className="auth google" onClick={SignInWithGoogle} style={{marginBottom:"100px"}}>
          <img src={googlelogo} alt="Can't be rendered"/>
          <div style={{padding:"0px 10px",fontWeight:"600"}}>Sign in with Google</div>
        </div>
      </div>
    </div>
  )
}
function SignOut(){
  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}>Sign Out</button>
  )
}
function Topbar({user}){
  return(
    <div className="topbar">
      <img src={user.photoURL} alt="Can't be rendered"/>
      <h4>{user.displayName}</h4>
      <SignOut/>
    </div>
  )
}
function GameView({user,back}){
  const [status,setstatus]=useState(" ");
  const [room,setroom]=useState(" ");
  const [isallready,setallready]=useState(0);
  const [players] = useJSON(database.ref("Rooms/"+room+"/players/"));
  const [data] = useJSON_single(database.ref("Rooms/"+room+"/data/"));
  const [playerkey , setplayerkey] = useState(" ");  

  useEffect(()=>{
    setstatus("not entered");
  },[]);
  useEffect(()=>{
    console.log(data);
    if(data?.status){
      const _status=data.status;
      if(status!==_status){
        setstatus(data.status);
        if(_status==="isallready")
          setallready(1);
      }
    }
  },[data,status]);
  function NewGame(){
    setstatus("not entered");
    setroom(" ");
  }
  function DeleteRoom(){
    database.ref("RoomNames/"+room).remove();
    database.ref("Rooms/"+room).remove();
    setstatus("not entered");
  }
  return(
    <div>
      {status==="not entered"?
        <div className="gamebox" style={{display:"block"}}>
          <Topbar user={user}/>
          <CreateOrJoin database={database} SetRoom={setroom} user={user} setplayerkey={setplayerkey}/>
          <button onClick={back}>Home</button>
        </div>
      :
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}} className="gamebox">
          <div>
            {(status==="queuing" || status==="isallready")?
            <WaitandQueue database={ database } playerkey={playerkey} room={room} players={players} data={data} isallready={isallready}/>
            :""}
            {
              status==="started"?
              <Game database={database} user={user} data={data} playerkey={playerkey} room={room} players={players}/>
              :""
              }
            {
              status==="gameover"?
              <GameOver  database={database} data={data} players={players} room={room} playerkey={playerkey} deleteroom={DeleteRoom} newgame={NewGame}/>
              :""
            }
          </div>
        </div>
      } 
      {
        console.log("rerendering")
      }
    </div>
  )
}
export default App;
