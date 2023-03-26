function handle () {
    console.log("Clicked")
}



// EXECUTES WHENEVER CLICKEED 

const Home2 = function () {
    return <button onClick={handle}>Click</button>
}



// EXECUTES ONLY ONCE

// const Home2 = function () {
//     return <button onClick={handle()}>Click</button>
// }

export default Home2;

