import React,{ useState , useEffect } from 'react'
import './CreateOrJoin.css'
import useJSON from './useJSON';
export default function CreateOrJoin({database,SetRoom,user,setplayerkey}) {
    const [createdata_col,setcreatedata_col]=useState("#fff");
    const [createdata_text,setcreatedata_text]=useState("* A-Z a-z 0-9 _");
    const [join,setjoin]=useState(true);
    const [nop,setnop]=useState();
    const [create_room,setcreate_room]=useState(false);
    const [room_create, setroom_create] = useState()
    const ref=database.ref("RoomNames/");
    const [rooms] = useJSON(ref);

    useEffect(()=>{
        setnop(2);
        setcreate_room(false);
    },[])

    function CheckCreatingRoom(e){
        setcreate_room(false);
        const room_name=e.target.value;
        setcreatedata_col("red");
        if(room_name.length===0){
            setcreatedata_text("RoomName Can't be Empty");
            return;
        }
        if(room_name.length<4){
            setcreatedata_text("Minimum length is 4");
            return;
        }
        var regex=/^[a-zA-Z0-9]+(?:_[A-Za-z0-9]+)*$/;
        if(!room_name.match(regex)){
            setcreatedata_text("Invalid RoomName ( only alpabets and numbers ) ");
            return;
        }
        setcreatedata_col("blue");
        setcreatedata_text("Checking...");
        database.ref("RoomNames/"+room_name).once('value',snap=>{
            const val=snap.val();
            var exists=true;
            if(val===null){
                exists=false;
            }
            if(exists){
                setcreatedata_col("red");
                setcreatedata_text("Roomname Exsists");
            }
            else{
                setcreatedata_col("#0f0");
                setcreatedata_text("Room Available");
                setcreate_room(true);
                SetRoom(room_name);
                setroom_create(room_name)
            }
        })
    }
    async function Create(){
        const json={
            data : {
                nop : Number(nop),
                currentnop : 1,
                status : "queuing",
                myturn : 0
            },
            players : {
                client_0 : {
                    name : user.displayName,
                    img : user.photoURL,
                    ready : false
                }
            }
        }
        setplayerkey("client_0");
        await database.ref("RoomNames/"+room_create).set({
            players : "1/"+nop,
            roomname : room_create,
            status : "queuing"
        });
        await database.ref("Rooms/"+room_create).set(json);
        const _json=get7s(nop);
        await database.ref("Rooms/"+room_create+"/data/cards/").set(JSON.stringify(_json));
        await database.ref("Rooms/"+room_create+"/data/hidden/").set(JSON.stringify(_json.hide));
        SetRoom(room_create);
    }
    function get7s(num){
        const grps=["H","S","D","C"]
        const vals=[0,2,3,4,5,6,7,8,9,"K","J","Q","A"]
        var cards=[]
        for(var i=0;i<grps.length;i++)
            for(var j=0;j<vals.length;j++)
                cards.push(vals[j]+grps[i]);
        for(i=0;i<100;i++){
            var p=Math.floor(Math.random()*52);
            var q=Math.floor(Math.random()*52);
            var card=cards[p];
            cards[p]=cards[q];
            cards[q]=card;
        }
        var json={};
        var _i=0
        for(_i=0;_i<num;_i++){
            json["ini_"+_i]=cards.slice(7*_i,7*(_i+1));
        }
        json["hide"]=cards.slice(7*_i,52);
        return json;
    }
    async function Join(val){
        await database.ref("Rooms/"+val+"/data/").once('value',shot=>{
            const value=shot.val();
            const cur_nop=value.currentnop;
            const new_nop=Number(cur_nop+1);
            console.log(cur_nop +" / "+ new_nop);
            database.ref("Rooms/"+val+"/data/currentnop/").set(new_nop);
            var playerref="client_"+cur_nop;
            database.ref("Rooms/"+val+"/players/"+playerref).set({
                name : user.displayName,
                img : user.photoURL,
                ready : false
            });
            setplayerkey("client_"+(new_nop-1));
            database.ref("RoomNames/"+val+"/players").set(new_nop+"/"+value.nop);
            if(new_nop===Number(value.nop)){
                console.log("Start");
                database.ref("RoomNames/"+val+"/status/").set("started");
                database.ref("Rooms/"+val+"/data/status/").set("isallready");
            }
           })
        const _roomname=val;
        await SetRoom(_roomname);
    }
    function Toogle(){
        setjoin(!join);
    }
    function Change_nop(e){
        const val=e.target.value;
        setnop(val);
    }
    return (
        <div>
            <div className="select">
                <span className={join?"a":""} onClick={Toogle}>CreateRoom</span>
                <span className={join?"":"a"} onClick={Toogle}>JoinRoom</span>
            </div>
            {join?
            <div>
                <h2>Available Game Rooms</h2>
                <div className="rooms">
                    {rooms.map( room =>{
                        console.log(room)
                        if(room.val.status!=="queuing")
                            return (<div key={room.key}></div>);
                        return ( 
                        <div className="room" key={room.key} onClick={()=>Join(room.val.roomname)}>
                            <div className="roomname">{room.val.roomname}</div>
                            <div className="num">{room.val.players}</div>
                        </div>
                        )
                    })
                    }
                </div>
            </div> 
            : 
            <div className="create">
                <div className="qn">Enter RoomName</div>
                <input type="text" placeholder="Valid Roomname" onKeyUp={CheckCreatingRoom}/>
                <div className="error" style={{color:createdata_col}}>{createdata_text}</div>
                <div className="qn">Select Number of Players</div>
                <div className="select" style={{marginTop:"3vh"}}>
                    <input type="radio" name="COR" value="2"  onClick={Change_nop} defaultChecked/>2
                    <input type="radio" name="COR" value="3"  onClick={Change_nop} />3
                    <input type="radio" name="COR" value="4"  onClick={Change_nop} />4
                    <input type="radio" name="COR" value="5"  onClick={Change_nop} />5
                </div>
                <button className="create_btn" style={{opacity:create_room?1:0.5,marginBottom:"50px"}} onClick={Create}>Create Room</button>
            </div> 
            }
        </div>
    )
}
