import { useState , useEffect} from 'react'

export default function useJSON_single(ref) {
    const [value, setvalue] = useState({});
    useEffect(() => {
        //Turning ref off -- memory leak
        return () => {
            ref.off();
        }
        // eslint-disable-next-line
    }, []);
    ref.on('value',(snap)=>{
        if(JSON.stringify(value)!==JSON.stringify(snap.val())){
            setvalue(snap.val())
        }
    })
    return [value];
}
