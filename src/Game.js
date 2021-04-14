import React,{ useState , useEffect} from 'react';
import bgimage from './cardsbg.png'
import useJSON_single from './useJSON_single';

export default function Game({database , user ,data ,playerkey , room , players}) {
    const card_img_url_path="https://deckofcardsapi.com/static/img/";
    const [mycards,setmycards]=useState([]);
    const [lastmoved,setlastmoved]=useState(-1);
    const [swamp,setswamp]=useState(false);
    const [hcards,sethcards]=useState([]);
    const [scard]=useJSON_single(database.ref("Rooms/"+room+"/data/showcard"));
    const [lastcard,setlastcard]=useState("");
    const [curcard,setcurcard]=useState("");
    const [updateturn,setupdateturn]=useState(-1);
    const [curplayer,setcurplayer]=useState("");
    const [drawnfromcen,setdrawnfromcen]=useState(false);
    const [threefours,setthreefours]=useState({ threes : 0 , fours : 0 });
    const [go,setgo]=useState(false); // User Go

    useEffect(() => {
        if(mycards.length===0)
            initialcards();
        // eslint-disable-next-line
    },[])
    useEffect(() => {
        if(scard!==null)
            setlastcard(scard);
        setcurplayer(getcurplayer(data.myturn));
        initupdateturn();
        checkwin();
        sethcards(JSON.parse(data.hidden));
        console.log(JSON.parse(data.hidden).length +" len");
        if(data.wins){
            console.log(data.wins);
        }
        // eslint-disable-next-line
    },[lastmoved,scard,data,mycards]);
    function checkwin(){
        var threes=0;
        var fours=0;
        [ threes , fours ] = win_check(mycards); //win logic
        setthreefours({ threes : threes , fours : fours });
        if(threes===1 && fours===1)
            if(!go){
                setgo(true);
                exposetoall();
                if(data.wins)
                    database.ref("Rooms/"+room+"/data/wins/length").set(data.wins.length+1);
                else
                    database.ref("Rooms/"+room+"/data/wins/length").set(1);
                database.ref("Rooms/"+room+"/data/wins/"+playerkey).set(new Date().getTime());
            }
    }
    function initialcards(){
        const cards=JSON.parse(data.cards);
        const _key="ini_"+playerkey.split("_")[1];
        const _mycards=cards[_key];
        var _settingmycards=[];
        for(var i=0;i<_mycards.length;i++)
            _settingmycards.push({key : i,val : _mycards[i]});
        setmycards(_settingmycards);
        const hcards=JSON.parse(data.hidden);
        _settingmycards=[];
        for(i=0;i<hcards.length;i++)
            _settingmycards.push({key : i,val : hcards[i]});
        sethcards(_settingmycards);
    }
    function timer(ms){
        return new Promise(res=>setTimeout(res,ms));
    }
    function getgap(){
        const width=window.innerWidth;
        if(width<450){
            return (width-320)/3;
        }
        return 50;
    }
    function calcwidth(last=false){
        const width=window.innerWidth;
        if(width<700 && !last){
            return (width-120)/7;
        }
        if(width<800){
            return 100;
        }
        return 100+(width-700)/20;
    }
    async function callswamp(index){
        var card_ele;
        card_ele=document.getElementById("player_card"+index);
        if(card_ele===undefined || lastmoved===-1)
            return;
        card_ele.style.transform=`translateY(-40px)`;
        await timer(500);
        var _mycards=mycards;
        var _flag=false;
        var tempcard="nil";
        for(var i=0;i<_mycards.length;i++){
            if(i===index || i===lastmoved){
                if(!_flag){
                    tempcard=_mycards[i];
                    _flag=true;
                    continue;
                }
                var cur_val=_mycards[i].val;
                _mycards[i].val=tempcard.val;
                tempcard.val=cur_val;
            }
        }
        setmycards(_mycards);
        card_ele.style.transform=`translateY(0px)`;
        document.getElementById("player_card"+lastmoved).style.transform=`translateY(0px)`;
        setlastmoved(-1);
    }
    function SwampWC(){
        var card_ele=document.getElementById("player_card"+lastmoved);
        if(card_ele===undefined || lastmoved===-1 || curcard==="")
            return;
        var temp=mycards[lastmoved].val;
        var n_mycard=mycards;
        n_mycard[lastmoved].val=curcard;
        setcurcard(temp);
    }
    function moveup(index){
        if(lastmoved!==-1 && lastmoved!==index){
            console.log(lastmoved,index);
            callswamp(index);
            setswamp(false);
            return;
        }
        if(swamp){
            callswamp(index);
            setswamp(false);
            return;
        }
        var card_ele=document.getElementById("player_card"+index);
        if(index===lastmoved){
            setswamp(false);
            setlastmoved(-1);
            card_ele.style.transform=`translateY(0px)`;
            return;
        }
        for(var i=0;i<7;i++){
            var tran = 0;
            card_ele=document.getElementById("player_card"+i);
            if(i===index)
                tran=40;
            card_ele.style.transform=`translateY(-${tran}px)`;
        }
        setlastmoved(index);
    }
    function UpdateTurn(){
        if(curcard===lastcard  || curcard==="" || updateturn===-1){
            return;
        }
        var iszero=JSON.parse(data.hidden).length;
        var shown_cards=[];
        if(data.shown===undefined || iszero===0){
            shown_cards.push(curcard);
        }
        else{
            shown_cards=JSON.parse(data.shown);
            shown_cards.push(curcard);
        }
        if(iszero===0){
            var hidden=shuffle(JSON.parse(data.shown));
            database.ref("Rooms/"+room+"/data/hidden/").set(JSON.stringify(hidden));
        }
        database.ref("Rooms/"+room+"/data/shown/").set(JSON.stringify(shown_cards));
        database.ref("Rooms/"+room+"/data/myturn/").set(updateturn);
        database.ref("Rooms/"+room+"/data/showcard/").set(curcard);

        setupdateturn(-1);
        setcurcard("");
        setdrawnfromcen(false);
    }
    function SwampWL(){
        if(curcard!=="" || data.myturn!==Number(playerkey.split("_")[1]))
            return;
        setcurcard(lastcard);
    }
    function initupdateturn(){
        if(data.myturn===Number(playerkey.split("_")[1])){
            var newturn=data.myturn+1;
            if(newturn===Number(data.nop))
                newturn=0;
            if(data.wins){
                while(data.wins["client_"+newturn]){
                    if(Number(data.myturn)===newturn)
                        break;
                    newturn++;
                    if(newturn===Number(data.nop))
                        newturn=0;
                }
            }
            if(data.myturn===newturn){
                database.ref("Rooms/"+room+"/data/wins/"+playerkey).set(new Date().getTime());
                database.ref("Rooms/"+room+"/data/status/").set("gameover");
            }
            setupdateturn(newturn);
            if(hcards.length<=0){
                console.log("er");
            }
        }
    }
    function Reveal(){
        if(curcard!=="" && curcard!==lastcard)
            return;
        if(data.myturn===Number(playerkey.split("_")[1])){
            setdrawnfromcen(true);
            var hidden=JSON.parse(data.hidden);
            hidden=JSON.parse(data.hidden);
            var card=hidden.pop();
            setcurcard(card);
            database.ref("Rooms/"+room+"/data/hidden/").set(JSON.stringify(hidden));
        }
    }
    function shuffle(ar){
        for(var i=0;i<100;i++){
            var _f=Math.floor(Math.random()*ar.length);
            var _l=Math.floor(Math.random()*ar.length);
            var temp=ar[_l];
            ar[_l]=ar[_f];
            ar[_f]=temp;
        }
        return ar;
    }
    function getcurplayer(val){
        if(val.toString()===playerkey.split("_")[1])
            return "Your turn";
        for(var i in players){
            const key=Number(players[i].key.split("_")[1]);
            if(key===val){
                return players[i].val.name +"'s turn";
            }
        }
    }
    function cardsortval(char){
        if(char==="J")
            return 11;
        if(char==="Q")
            return 12;
        if(char==="K")
            return 13;
        if(char==="A")
            return 14;
        char=Number(char);
        if(char===0)
            return 10;
        return char;
    }
    function win_check(_mycards){
        var cards=[];
        var i;
        for(i=0;i<_mycards.length;i++){
            cards.push({set : _mycards[i].val[1],value : cardsortval(_mycards[i].val[0]),accessed : false});
        }
        if(i!==7)
            return [0,0];
        var fours=0,threes=0;

        var foursets=cards.slice(0,4);
        var threesets=cards.slice(4,7);

        if(isallsameval(threesets) || checkadjacencyofcards(threesets))
            threes=1;
        if(isallsameval(foursets) || checkadjacencyofcards(foursets))
            fours=1;

        return [ threes , fours ];
    }
    function isallsameval(cards){
        var initial=cards[0].value;
        for(var i=1;i<cards.length;i++){
            if(cards[i].value!==initial)
                return false;
            initial = cards[i].value;
        }
        return true;
    }
    function isallsamesuit(cards){
        var initial=cards[0].set;
        for(var i=1;i<cards.length;i++){
            if(cards[i].set!==initial)
                return false;
            initial = cards[i].set;
        }
        return true;

    }
    function checkadjacencyofcards(cards){
        if(!isallsamesuit(cards))
            return false;
        cards.sort((a,b)=>{return a.value>b.value?1:-1})
        var initial=cards[0].value;
        for(var i=1;i<cards.length;i++){
            if(cards[i].value-initial !== 1)
                return false;
            initial = cards[i].value;
        }
        return true;
    }
    /*
    function bruitwin(_mycards){
        var cards=[];
        var i,j,k,l;
        var values=[];
        for(i=0;i<_mycards.length;i++){
            cards.push({set : _mycards[i].val[1],value : cardsortval(_mycards[i].val[0]),accessed : false});
        }
        var setfourfound=false;
        for(i=0;i<cards.length;i++)
            for(j=i+1;j<cards.length;j++)
                for(k=j+1;k<cards.length;k++)
                    for(l=k+1;l<cards.length;l++){
                        if(cards[i].value===cards[j].value && cards[j].value===cards[k].value && cards[k].value===cards[l].value){
                            setfourfound=true;
                            cards[i].accessed=true;
                            cards[j].accessed=true;
                            cards[k].accessed=true;
                            cards[l].accessed=true;
                        }
                        if(cards[i].set===cards[j].set && cards[j].set===cards[k].set && cards[k].set===cards[l].set){
                            values=[];
                            values.push(cards[i].value);
                            values.push(cards[j].value);
                            values.push(cards[k].value);
                            values.push(cards[l].value);
                            values.sort((a,b)=>{return a>b?1:-1})
                            if(checkadjacency(values)){
                                setfourfound=true;
                                cards[i].accessed=true;
                                cards[j].accessed=true;
                                cards[k].accessed=true;
                                cards[l].accessed=true;
                            }
                        }
                    }
        cards=cards.filter((card)=>{return card.accessed===false});
        var _cards=cards.filter((card)=>{return card.accessed===true});
        var threefound=0;
        if(cards.length===0){
            threefound=1;
        }
        if(cards.length===2){
            var small=_cards[0].value;
            var large=_cards[0].value;
            for(i=0;i<_cards.length;i++){
                if(small>_cards[i].value)
                    small=_cards[i].value;
                if(large<_cards[i].value)
                    large=_cards[i].value;
            }
            if(small===cards[0].value && small===cards[1].value)
                threefound=1;
            if(large===cards[0].value && large===cards[1].value)
                threefound=1;
        }
        for(i=0;i<cards.length;i++)
            for(j=i+1;j<cards.length;j++)
                for(k=j+1;k<cards.length;k++)
                {
                    if(cards[i].accessed || cards[j].accessed || cards[k].accessed)
                        continue;
                    if(cards[i].value===cards[j].value && cards[j].value===cards[k].value){
                        threefound++;
                        cards[i].accessed=true;
                        cards[j].accessed=true;
                        cards[k].accessed=true;
                    }
                    if(cards[i].set===cards[j].set && cards[j].set===cards[k].set){
                        values=[];
                        values.push(cards[i].value);
                        values.push(cards[j].value);
                        values.push(cards[k].value);
                        values.sort((a,b)=>{return a>b?1:-1})
                        if(checkadjacency(values)){
                            threefound++;
                            cards[i].accessed=true;
                            cards[j].accessed=true;
                            cards[k].accessed=true;
                        }
                    }
                }
        cards=cards.filter((card)=>{return card.accessed===false});
        var fourfound=0;
        if(setfourfound){
            fourfound=1;
        }
        return [ threefound , fourfound ];
    }
    function checkadjacency(values){
        var initial=values[0];
        for(var i=1;i<values.length;i++){
            if(values[i]-initial !== 1)
                return false;
            initial = values[i];
        }
        return true;
    }
    */
    function exposetoall(){
        var pos=0;
        if(data.wins)
            pos=data.wins.length;
        pos=getpos(pos);
        database.ref("Rooms/"+room+"/data/showresult/").set({
            name : pos+" : "+user.displayName,
            card : mycards
        });
        setTimeout(()=>{
            database.ref("Rooms/"+room+"/data/showresult/").remove();
        },5000);
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
    function getTopOffset(){
        if(window.innerHeight<700)
            return 20;
        else
            return 20+(700-window.innerHeight)/20;
    }
    return (
        <div style={{Height:"90vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div>
                <h2 style={{fontSize:"1.1rem"}}>{curplayer}</h2>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginTop:getTopOffset()}}>
                    <img src={bgimage} style={{width:"100px",height:"140px",opacity:JSON.parse(data.hidden).length!==0?1:0}} onClick={Reveal} alt="Loading..."/>
                    <img src={curcard!==""?(card_img_url_path+curcard+".png"):bgimage} style={{width:"100px",height:"140px",marginLeft:getgap(),opacity:( curcard==="" || lastcard===curcard || !drawnfromcen)?0:1}}  alt="Loading..."/>
                    <img src={lastcard!==""?(card_img_url_path+(drawnfromcen?lastcard:(curcard===""?lastcard:curcard))+".png"):bgimage} style={{width:"100px",height:"140px",marginLeft:getgap(),opacity:lastcard===""?0:1}} onClick={SwampWL}  alt="Loading..." />
                </div>
                {data.showresult?
                    <div style={{position:"absolute",padding:"20px 0px",background:"black",borderTop:"2px solid white",borderBottom:"2px solid white",top:"50vh",transform:"translateY(-50%)",zIndex:1}}>
                        <h2 style={{marginBottom:"10px"}}>{data.showresult.name}</h2>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {
                                data.showresult.card.map(_card=>{
                                    return(
                                        <div key={_card.key} id={ "player_card"+_card.key } style={{width:calcwidth(_card.key===6),transition:"all 0.5s"}} onClick={()=>{moveup(_card.key)}}>
                                        <img src={card_img_url_path+_card.val+".png"} style={{width:"100px",height:"140px"}}  alt="Loading..." />
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <p style={{padding:"10px 0px"}}> Disappear in few seconds </p>
                    </div>
                :""}
                <button onClick={SwampWC} style={{opacity:curcard===""?0:1,margin:"20px 10px",marginBottom:"50px",borderBlockColor:lastmoved===-1?"#f00":"#0f0"}}>Swamp</button>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {
                        mycards.map(_card=>{
                            return(
                                <div key={_card.key} id={ "player_card"+_card.key } style={{width:calcwidth(_card.key===6),transition:"all 0.5s"}} onClick={()=>{moveup(_card.key)}}>
                                <img src={card_img_url_path+_card.val+".png"} style={{width:"100px",height:"140px"}}  alt="Loading..." />
                                </div>
                            )
                        })
                    }
                </div>
                <button onClick={UpdateTurn} style={{opacity:(updateturn!==-1)?((curcard===lastcard || curcard==="")?0.5:1):0}}>Proceeed</button>
                <h2 style={{fontSize:"1.1rem",color:"#0f0"}}>{threefours.threes} Threes {threefours.fours} Fours</h2>
            </div>
        </div>
    )
}
