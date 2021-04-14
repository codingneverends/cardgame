import React, { useEffect, useState } from 'react'

export default function GameOver({ data , players , room , playerkey , deleteroom , newgame }) {
    const [plyrs,setplyrs]=useState([]);
    useEffect(()=>{
        getplayers();
        // eslint-disable-next-line
    },[])
    function getplayers(){
        if(!data.wins || !players)
            return;
        var _players=[];
        for(var i in players){
            var player=players[i];
            var json={};
            json["name"]=player.val.name;
            json["img"]=player.val.img;
            json["time"]=data.wins[player.key];
            json["position"]="Last";
            json["key"]=player.key;
            _players.push(json);
        }
        _players.sort((a,b)=>{return a.time>b.time?1:-1});
        for(i=0;i<_players.length-1;i++){
            _players[i].position=getpos(i);
        }
        setplyrs(_players);
    }
    function getpos(index){
        index=Number(index);
        switch(index){
            case 0 : return "First"
            case 1 : return "Second"
            case 2 : return "Thirs"
            case 3 : return "Fourth"
            case 4 : return "Fifth"
            default : return "Last"
        }
    }
    return (
        <div style={{Height:"90vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div>
                <h2 style={{color:"#f00", fontSize:"2.5rem",marginBottom:"6vh"}}>Game Over</h2>
                <h2 style={{marginBottom:"5vh"}}>RoomName : {room}</h2>
                {
                    plyrs.map( _player =>{
                        console.log(_player.key)
                    return ( 
                            <div key={_player.key} style={{display:"flex",width:"100%",maxWidth:"350px",margin:"auto",marginBottom:"20px",alignItems:"center"/*,border:"2px solid #ffffffaf",padding:"5px",borderRadius:"10px"*/}} >
                            <h2 style={{flexGrow:1,color:(_player.key===playerkey)?"#0f0":"#00f"}}>{_player.position}</h2>
                                <h2 style={{flexGrow:1,color:(_player.key===playerkey)?"#0f0":"#00f"}}>{_player.name}</h2>
                            </div>
                        )
                    })
                }
                <div style={{marginTop:"15vh"}}>
                {
                playerkey==="client_0"?
                    <button onClick={deleteroom} style={{padding:"15px",borderBlockColor:"#f0f"}}>Delete Room</button>
                :
                    <button onClick={newgame}style={{padding:"15px",borderBlockColor:"#0ff"}}>New Game</button>
                }
                </div>
            </div>
        </div>
    )
}
