import React from "react"
import { pAuth, pFirestore } from "../../services/config"
import Login from "../Login"

class RegressionAnalysis extends React.Component{
    constructor(){
        super()
        this.state = {
            indexCandidate: 0, //0: Donald Trump, 1: Joe Biden, 2: Jo Jorgenson, 3: Howie Hawkins
            //indexState: 0, //0: Alabama, 1: Alaska ... (Check firestore DB for all states' indices)
            allCandidates: [],
            allStates: [],
            dataPointsDOM: [],
            dataPoints: [],
            rSquared: 1,
        }
    }

    componentDidMount(){
        pFirestore.collection("settings").doc("settings").get().then((doc)=>{
            var data = doc.data();
            this.setState({
                allCandidates: data.candidates,
                allStates: data.states,
            })
            this.renderDataPoints(this.state.indexCandidate);
        })
        pAuth.onAuthStateChanged(user=>{
            this.setState({})
        })
    }

    // changeState= (e) => {
    //     this.setState({indexState: Number(e.target.name)})
    // }

    changeCandidate = (e) => {
        this.setState({indexCandidate: Number(e.target.name)})
        this.renderDataPoints(Number(e.target.name));
    }


    renderStateOptions = () => {
        var arr = [];
        var index = 0;
        this.state.allStates.forEach((state)=>{
            arr.push(<li className="state-option"><button name={index} onClick={this.changeState}>{state}</button></li>)
            index++;
        })
        return arr;
    }

    renderCandidateOptions = () => {
        var arr = [];
        var index  =0;
        this.state.allCandidates.forEach((c)=>{
            arr.push(<li className="candidate-option"><button name={index} onClick={this.changeCandidate}>{c}</button></li>)
            index++;
        })
        return arr;
    }

    //get the results of every state for a candidate. Input the candidate index, and get an array of the states' vote percent in order (index 0 is alabama, and so on)
    getAllResultsOneCandidate = async (index) => {
        var arr = [];
        var doc = await pFirestore.collection("settings").doc("results").get();
        var data = doc.data();
            data.presidential.forEach((e)=>{
                Object.values(e).forEach((v)=>{
                    if(String(v.index)==String(index)){
                        arr.push(Number(v.value));
                    }
                })
            })
        return arr;
    }

    getAllPredictionsOneCandidate = async (index) => {
        var arr = [];
        if(pAuth.currentUser) {
            var doc = await pFirestore.collection("users").doc(pAuth.currentUser.uid).get();
            if(!doc.data().presidential)  return arr;  
            doc.data().presidential.forEach((e)=>{
                    Object.values(e).forEach((v)=>{
                        if(String(v.index)==String(index)){
                            arr.push(Number(v.value));
                        }
                    })
                })
            return arr;
        }else{
            return arr;
        }
    }

    renderDataPoints = (index) => {
        var arr = [];//html elements for data points
        var dataPoints = [];//objects of {x:, y: }
        var predictions = [];
        var results = [];
        this.getAllPredictionsOneCandidate(index).then((p)=>{
            predictions = p;
            console.log(p);
            this.getAllResultsOneCandidate(index).then((r)=>{
                results = r;
                console.log(predictions,results);
                for(var i =0; i<predictions.length;i++){
                    if(Number(predictions[i])>0){
                        arr.push(<div style={{left: predictions[i]+"%",bottom: results[i]+"%"}} className="data-point">
                        <span className="state-name-data">{this.state.allStates[i]}</span>
                        <div className="tooltip">
                            <div style={{textDecoration: "underline"}}>{this.state.allStates[i]}</div>
                            <div><span>Predicted:</span> {predictions[i]+"%"}</div>
                            <div><span>Result: </span>{results[i]+"%"}</div>
                        </div>
                        </div>)
                        dataPoints.push({x: Number(predictions[i]),y: Number(results[i])});
                    }
                    
                    
                }
                console.log(arr);
                this.setState({dataPointsDOM: arr, dataPoints: dataPoints})
                this.calcR2(index);
            })
        })
    }

    calcR2 = (index) => {
        var sum = 0;
        this.state.dataPoints.forEach(e=>{
            sum += Number(e.y);
        })
        var mean = sum/(this.state.dataPoints.length);
        var residuals1 =0
        var residuals2 = 0;
        this.state.dataPoints.forEach(e=>{
            residuals1 += Math.abs(Number(e.y)-mean);
            residuals2 += Math.abs(Number(e.y)-Number(e.x));
            console.log(e.y,e.x)
        })
        console.log(residuals1,residuals2)
        this.setState({rSquared: 1- residuals2/residuals1})
        


        // this.getAllResultsOneCandidate(index).then(r=>{
        //     var sum =0;
        //     var n =0;
        //     r.forEach(e=>{
        //         n++;
        //         sum += e
        //     })
        //     var mean = sum/n;
        //     var residuals1 = 0;
        //     r.forEach(e=>{
        //         residuals1 += Math.abs(e-mean);
        //     })
        //     this.getAllPredictionsOneCandidate(index).then(p=>{
        //         var residuals2 = 0;
        //         for(var i =0; i<p.length;i++){
        //             residuals2 += Math.abs(p[i]-r[i]);
        //         }
        //         var rSquared = residuals2/residuals1;
        //         this.setState({rSquared: rSquared})
        //     })
        // })
    }



    render(){
        if(!pAuth.currentUser) return <Login/>
        return(<div>
            <div id="prediction-header">
        <div>Prediction Analysis for {pAuth.currentUser.displayName}</div>
            </div>
            <section>
                <ul id="select-candidate">
                    {this.renderCandidateOptions()}
                </ul>
            </section>
            <section>
                <h2 id="candidate-title">{this.state.allCandidates[this.state.indexCandidate]}</h2>
                <h3>{this.state.allStates[this.state.indexState]}</h3>
                <div id="graph">
                    <div id="left-label">Actual Percent Vote</div>
                    <div id="bottom-label">Predicted Percent Vote</div>
                    <div id="one-to-one-line"></div>
                    <div id="line-label">1-1 Correspondence Line</div>
                    <div id="graph-body">
                        {this.state.dataPointsDOM}
                    </div>
                </div>
                <div id="accuracy-rating"> Accuracy Rating: {this.state.rSquared*100}%</div>
            </section>
        </div>)
    }
}

export default RegressionAnalysis