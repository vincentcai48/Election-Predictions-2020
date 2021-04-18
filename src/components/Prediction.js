import React from "react"
import { pAuth, pFirestore } from "../services/config";
import Login from "./Login";

class Predictions extends React.Component{
    constructor(props){
        super()
        this.state = {
            rows: [
            ],
            columns: [
            ],
            input: [[]],
            showSaveMessage: '',
            isNotSaved: false,
        }
    }

    componentDidMount(){
        pFirestore.collection("settings").doc("settings").get().then((doc)=>{
            var data = doc.data();
            var candidates = data.candidates;
            var states = data.states;
            this.setState({rows: states, columns: candidates})
            var arr = [];
            for(var i =0; i<states.length;i++){
                var arrOfZeroes = new Array(candidates.length);
                arrOfZeroes.fill(0);
                arr.push(arrOfZeroes)
            }
            console.log(arr);
            this.setState({input: arr});
            if(pAuth.currentUser) this.useUserPredictionData(pAuth.currentUser.uid);
        })
        pAuth.onAuthStateChanged((user)=>{
            this.setState({});
            if(user){
                this.useUserPredictionData(user.uid);
            }else{
                
            }
           
        })
    }

    useUserPredictionData = (userId) => {
        pFirestore.collection('users').doc(userId).get().then((doc)=>{
            if(!doc.data().presidential) return;
            var presidentialPredictions = doc.data().presidential;
            var arr = this.state.input;
            var index = 0;
            presidentialPredictions.forEach((e)=>{
                var innerArray = [];
                Object.values(e).forEach((v)=>{
                    innerArray[v.index] = v.value;
                })
                arr[index]=(innerArray);
                index++;
            })
            this.setState({input: arr});
        })
    }

    changeInput = (e) => {
        const {value, name} = e.target;
        const [row,col] = name.split(",");
        var newInput = this.state.input;
        newInput[row][col] = Number(value);
        this.setState({input: newInput, isNotSaved: true})
    }

    renderOptions = () => {
        var arr = [];
        var row = 0;

        //first row;
        var firstRow = [<div id="grid-tl-corner"></div>];
        this.state.columns.forEach((c)=>{
            firstRow.push(<div className="candidate-name">{c}</div>)
        })
        arr.push(<div className="single-row">
            {firstRow}
        </div>)

        this.state.rows.forEach((e)=>{
            var candidates = [];
            var col = 0;
            this.state.columns.forEach((c)=>{
                candidates.push(
                <div className="single-cell">
                    <input type="number" max="100" min="0" name={row+","+col} onChange={this.changeInput} value={this.state.input[row]?this.state.input[row][col]:""}></input>
                </div>)
                col++;
            })
            arr.push(<div className="single-row">
                <div className="statename">{e}: </div>
                {candidates}
            </div>)
            row++;
        })

        return arr;
    }

    saveChanges = () => {
        //NOTE: nested arrays NOT supported in firestore, so must convert to an array of objects, each property an object with a value and an index.
        var arrOfObjs = [];
        this.state.input.forEach((e)=>{
            var obj = {};
            var index = 0;
            e.forEach((c)=>{
                obj[index] = {
                    value: Number(c),
                    index: index
                }
                index++;
            })
            arrOfObjs.push(obj);
        })

        /**THIS IS TO UPDATE RESULTS -- DO NOT UNCOMMENT UNLESS YOU REALLY NEED TO*/
        //pFirestore.collection("settings").doc("results").update({presidential: arrOfObjs})

        /**USER PREDICTION */
        pFirestore.collection('users').doc(pAuth.currentUser.uid).update({presidential: arrOfObjs}).then(()=>{
            this.setState({isNotSaved: false})
        })
    }

    render(){
        if(!pAuth.currentUser) return <Login/>
        return(<div>
            <div id="prediction-header">
                {this.state.isNotSaved&&<button onClick={this.saveChanges} id="save-updates-button" className="bred">Save Updates</button>}
                <h2>Make Your Predictions Here!</h2>
                <p>Account: {pAuth.currentUser?pAuth.currentUser.displayName:"N/A"}</p>
            </div>
            <div id="input-grid" style={{margin: "3vh 5vw"}}>
            {this.renderOptions()}
            </div>
            
        </div>)
    }
}

export default Predictions