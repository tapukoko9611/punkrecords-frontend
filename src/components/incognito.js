import { useParams } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from "react";

const Incognito = (props) => {
    const [data, setData] = useState();
    let { query } = useParams();

    useEffect(() => {
        (async () => {

            await axios
                .get(`/wtf/ign/${query}`)
                .then((data) => {
                    console.log(data);
                    if (data.data.data) {
                        navigator.clipboard.writeText(data.data.data);
                    }
                    else {
                        navigator.clipboard.writeText("Error has occured");
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                });
        })() //defines a function and calls it then and there itself. // See through that it donesn't return any shit 
            .catch((err) => {
                console.log(err.message);
            });

    }, []);

    return <h1>PAGE NOT FOUND</h1>;

}

export default Incognito;

