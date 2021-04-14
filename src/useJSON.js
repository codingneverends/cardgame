import { useState , useEffect } from 'react'

export default function useJSON(ref) {
    const [value, setvalue] = useState({});
    const [data, setdata] = useState([]);
    useEffect(() => {
        //Turning ref off -- memory leak
        return () => {
            ref.off();
        }
        // eslint-disable-next-line
    }, []);
    function UpdateList(json){
        var arr=[];
        for(var i in json){
            var _json={
                key : i,
                val : json[i]
            };
            arr.push(_json);
        }
        setdata(arr);
    }
    ref.on('value',(snap)=>{
        if(JSON.stringify(value)!==JSON.stringify(snap.val())){
            setvalue(snap.val());
            UpdateList(snap.val());
        }
    })
    return [data];
}
