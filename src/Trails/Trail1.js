import React from "react";


// USING A REGULAR FUNCTION

// function Home1 ( props ) {
//     //return <h1>Hello World1</h1>
//     return (
//         <h1>Hello World 1</h1>
//     );
// }



// USING A FUNCTION EXPRESSION

// const Home1 = function (props) {
//     return <h1>Hello World2</h1>
// }



// USING ARROW FUNCTION (we can use both 'const' and 'let')

// const Home1 = () => {
//     return (
//         <h1>Hello World 3</h1>
//     );
// }



// USING EXPLICIT RETURN

// const Home1 = (props) => <h1>Hello World 4</h1>;



// USING A CLASS
class Home1 extends React.Component {
    render () {
        return (
            <div>
                <h1>Hello World</h1>
                { this.props.children }
            </div>
        )
    }
}



export default Home1;